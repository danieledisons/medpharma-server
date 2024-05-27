const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { signInWithEmailAndPassword } = require("firebase/auth");
const {
  uploadProcessedData,
  initializeFirebaseApp,
  searchConsultations,
} = require("../firebase");
require("dotenv").config();
const cookieParser = require("cookie-parser");

// Create an Express application
const app = express();

const ACCESS_TOKEN_SECRET = "donkeyking";

// Enable CORS for all routes
const corsOptions = {
  origin: "*", // Allow any origin for now. Change this to specific origin in production.
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions)); // Apply CORS middleware

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

// Initialize Firebase app
initializeFirebaseApp();

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Authorization middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("Token: ", token);
  // const token = req.cookies.access_token;

  console.log("Token: ", token);
  if (!token) {
    return res.status(401).send({ message: "Access Token Required" });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send({ message: "Invalid Access Token" });
    }
    req.user = user;
    next();
  });
  // next();
};

// Route to handle sign-up
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: "Email and password are required" });
  }

  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });
    res.status(201).send({
      message: "User created successfully",
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
      },
    });
  } catch (error) {
    console.error("Error during sign-up: ", error);
    res.status(500).send({ message: "Sign-up failed", error: error.message });
  }
});

// Route to handle login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: "Email and password are required" });
  }

  try {
    // Authenticate the user with Firebase Authentication
    const userRecord = await admin.auth().getUserByEmail(email);
    const user = await admin.auth().createCustomToken(userRecord.uid);
    const userToken = jwt.sign(
      { email: userRecord.email },
      ACCESS_TOKEN_SECRET
    );

    res.cookie("access_token", userToken, { httpOnly: true });
    res.status(200).send({
      message: "Login successful",
      token: userToken,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        role: "Medical Officer",
      },
    });
  } catch (error) {
    console.error("Error during login: ", error);
    res.status(500).send({ message: "Login failed", error: error.message });
  }
});

// Route to add a new patient
app.post("/add-patient", authenticateToken, async (req, res) => {
  try {
    const { patientFirstName, patientLastName, gender, email, weight } =
      req.body;
    const patientData = req.body;

    if (!patientLastName || !patientFirstName || !gender || !email || !weight) {
      return res.status(400).json({
        error:
          "Invalid Request, Make sure to add patientLastName, patientFirstName, gender, email, weight",
      });
    }

    await uploadProcessedData(
      "patients",
      generateRandomString(12),
      patientData
    );
    res.status(200).send({ message: "Patient data added successfully" });
  } catch (error) {
    console.error("Error adding patient data: ", error);
    res.status(500).send({ error: "Error adding patient data" });
  }
});

// Route to create a new consultation
app.post("/add-consultation", authenticateToken, async (req, res) => {
  try {
    const {
      patientFirstName,
      patientLastName,
      consultationDate,
      consultationNotes,
      medicalCondition,
    } = req.body;

    if (
      !patientFirstName ||
      !patientLastName ||
      !consultationDate ||
      !consultationNotes ||
      !medicalCondition
    ) {
      return res.status(400).send({
        message:
          "Fill all forms using this format: patientFirstName, patientLastName, consultationDate, consultationNotes, medicalCondition",
      });
    }

    const consultationData = {
      ...req.body,
      dateAdded: new Date().toISOString(), // Add dateAdded field
    };
    const patientsRef = admin.firestore().collection("patients");
    const consultationsRef = admin.firestore().collection("consultations");

    // Search for an existing patient by first and last name
    const patientSnapshot = await patientsRef
      .where("patientFirstName", "==", patientFirstName)
      .where("patientLastName", "==", patientLastName)
      .get();

    let patientId;

    if (!patientSnapshot.empty) {
      // Patient exists, append the consultation to the patient's data
      patientId = patientSnapshot.docs[0].id;
      const patientDoc = patientSnapshot.docs[0];
      const patientData = patientDoc.data();

      const updatedConsultations = patientData.consultations || [];
      updatedConsultations.push(consultationData);

      await patientsRef.doc(patientId).update({
        consultations: updatedConsultations,
      });
    } else {
      // Patient does not exist, create a new patient and add the consultation
      const newPatientId = generateRandomString(12);
      patientId = newPatientId;

      const newPatientData = {
        patientFirstName,
        patientLastName,
        consultations: [consultationData],
      };

      await patientsRef.doc(newPatientId).set(newPatientData);
    }

    // Create a new consultation document
    const consultationId = consultationsRef.doc().id;
    await uploadProcessedData("consultations", consultationId, {
      ...consultationData,
      patientId,
    });

    res.status(201).send({ message: "Consultation created successfully" });
  } catch (error) {
    console.error("Error creating consultation: ", error);
    res.status(500).send({ error: "Error creating consultation" });
  }
});

// Route to filter consultations based on different criteria
app.get("/filter-consultations", authenticateToken, async (req, res) => {
  try {
    const { patientFirstName, patientLastName, consultationDate } = req.query;

    const filteredConsultations = await searchConsultations({
      patientFirstName,
      patientLastName,
      consultationDate,
    });

    const results = filteredConsultations.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));

    res.status(200).send(results);
  } catch (error) {
    console.error("Error filtering consultations: ", error);
    res.status(500).send({ error: "Error filtering consultations" });
  }
});

// Route to get all consultations with simple pagination
app.get("/view-all-consultations", authenticateToken, async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * pageSize;

    const consultationsSnapshot = await admin
      .firestore()
      .collection("consultations")
      .orderBy("consultationDate")
      .offset(offset)
      .limit(pageSize)
      .get();

    const consultations = consultationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));

    res.status(200).send({ consultations });
  } catch (error) {
    console.error("Error fetching consultations: ", error);
    res.status(500).send({ error: "Error fetching consultations" });
  }
});

app.get("/searchconsultations", authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).send({ message: "Query parameter is required" });
    }

    const consultationsRef = admin.firestore().collection("consultations");

    // Create search promises for each field
    const searchPromises = [
      consultationsRef.where("patientFirstName", "==", query).get(),
      consultationsRef.where("patientLastName", "==", query).get(),
      consultationsRef.where("medicalCondition", "==", query).get(),
      consultationsRef.where("healthcareProvider", "==", query).get(),
      consultationsRef.where("consultationType", "==", query).get(),
      consultationsRef
        .where("consultationNotes", "array-contains", query)
        .get(),
      consultationsRef.where("consultationDate", "==", query).get(),
    ];

    // Wait for all search promises to resolve
    const [
      firstNameSnapshot,
      lastNameSnapshot,
      medicalConditionSnapshot,
      healthcareProviderSnapshot,
      consultationTypeSnapshot,
      consultationNotesSnapshot,
      consultationDateSnapshot,
    ] = await Promise.all(searchPromises);

    // Combine all results, removing duplicates
    const consultations = [
      ...firstNameSnapshot.docs,
      ...lastNameSnapshot.docs,
      ...medicalConditionSnapshot.docs,
      ...healthcareProviderSnapshot.docs,
      ...consultationTypeSnapshot.docs,
      ...consultationNotesSnapshot.docs,
      ...consultationDateSnapshot.docs,
    ].reduce((acc, doc) => {
      if (!acc.some((d) => d.id === doc.id)) {
        acc.push({ id: doc.id, data: doc.data() });
      }
      return acc;
    }, []);

    if (consultations.length === 0) {
      return res.status(404).send({ message: "No consultations found" });
    }

    res.status(200).send(consultations);
  } catch (error) {
    console.error("Error filtering consultations: ", error);
    res.status(500).send({ error: "Error filtering consultations" });
  }
});

// Route to get patient details by first name and last name
app.get("/get-patient-details", authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName } = req.query;

    if (!firstName || !lastName) {
      return res
        .status(400)
        .send({ message: "First name and last name are required" });
    }

    const patientsRef = admin.firestore().collection("patients");
    const patientSnapshot = await patientsRef
      .where("patientFirstName", "==", firstName)
      .where("patientLastName", "==", lastName)
      .get();

    if (patientSnapshot.empty) {
      return res.status(404).send({ message: "Patient not found" });
    }

    const patientData = patientSnapshot.docs[0].data();
    res.status(200).send({ patient: patientData });
  } catch (error) {
    console.error("Error fetching patient details: ", error);
    res.status(500).send({ error: "Error fetching patient details" });
  }
});

app.get("/search-consultations", authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).send({ message: "Query parameter is required" });
    }

    const consultationsRef = admin.firestore().collection("consultations");
    const searchPromises = [
      consultationsRef.where("patientFirstName", "==", query).get(),
      consultationsRef.where("patientLastName", "==", query).get(),
      consultationsRef.where("medicalCondition", "==", query).get(),
    ];

    const [firstNameSnapshot, lastNameSnapshot, medicalConditionSnapshot] =
      await Promise.all(searchPromises);

    const consultations = [
      ...firstNameSnapshot.docs,
      ...lastNameSnapshot.docs,
      ...medicalConditionSnapshot.docs,
    ].map((doc) => ({ id: doc.id, data: doc.data() }));

    res.status(200).send(consultations);
  } catch (error) {
    console.error("Error searching consultations: ", error);
    res.status(500).send({ error: "Error searching consultations" });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
