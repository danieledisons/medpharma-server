const express = require("express");
const bodyParser = require("body-parser");
const {
  uploadProcessedData,
  initializeFirebaseApp,

  searchConsultations,
} = require("../firebase");
require("dotenv").config();

// Create an Express application
const app = express();
app.use(bodyParser.json());

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

// Generate a random string of 12 characters
const randomString = generateRandomString(12);

// Route to add a new patient
app.post("/add-patient", async (req, res) => {
  try {
    const patientData = req.body;
    await uploadProcessedData("patients", randomString.toString(), patientData);
    res.status(200).send({ message: "Patient data added successfully" });
  } catch (error) {
    console.error("Error adding patient data: ", error);
    res.status(500).send({ error: "Error adding patient data" });
  }
});

// Route to handle login (You can customize this according to your authentication logic)
app.post("/login", async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) {
    res.status(403).send({ message: "Username & Password are required" });
  }
  if (!role) {
    res
      .status(403)
      .send({ message: "Role is required, choose between Officer or Patient" });
  }
});

// Route to create a new consultation
app.post("/add-consultation", async (req, res) => {
  try {
    if (
      !req.body.patientLastName ||
      !req.body.patientFirstName ||
      !req.body.consultationDate ||
      !req.body.consultationNotes ||
      !req.body.medicalCondition
    ) {
      res.status(403).send({
        message:
          "Fill all forms using this format: patientFirstName, patientLastName, consultationDate,consultationNotes, medicalCondition",
      });
    }
    const consultationData = req.body;
    const {
      patientFirstName,
      patientLastName,
      consultationDate,
      consultationType = "General",
      consultationNotes,
      medicalCondition,
    } = consultationData;

    // Generate a unique ID for the consultation document
    const consultationId = admin
      .firestore()
      .collection("consultations")
      .doc().id;

    // Upload consultation data to Firestore with the generated ID
    await uploadProcessedData(
      "consultations",
      consultationId,
      consultationData
    );
    res.status(201).send({ message: "Consultation created successfully" });
  } catch (error) {
    console.error("Error creating consultation: ", error);
    res.status(500).send({ error: "Error creating consultation" });
  }
});

// Route to filter consultations based on different criteria
app.get("/filter-consultations", async (req, res) => {
  try {
    // Extract filter criteria from query parameters
    const { patientFirstName, patientLastName, consultationDate } = req.query;
    console.log(req.query);

    // Call the filterConsultations function with the extracted criteria
    const filteredConsultations = await searchConsultations({
      patientFirstName,
      patientLastName,
      consultationDate,
    });
    const results = filteredConsultations.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));
    // console.log(results);
    res.status(200).send(results);
  } catch (error) {
    console.error("Error filtering consultations: ", error);
    res.status(500).send({ error: "Error filtering consultations" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
