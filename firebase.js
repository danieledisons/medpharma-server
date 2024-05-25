const admin = require("firebase-admin");
const { collection, where } = require("firebase-admin/firestore");

// Your service account key JSON file
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin with your service account key
const initializeFirebaseApp = () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase app initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase app: ", error);
  }
};

const uploadProcessedData = async (collectionName, id, data) => {
  if (data) {
    console.log(`Collection: ${collectionName}, ID: ${id}, Data: ${data}`);
    console.log("Data Received");
  }
  try {
    const db = admin.firestore();
    const res = await db.collection(collectionName).doc(id).set(data);
    console.log("Document successfully written!");
  } catch (error) {
    console.error("Error writing document: ", error);
  }
};

const searchConsultations = async (criteria) => {
  try {
    const db = admin.firestore();
    // Create a reference to the consultations collection
    const consultationsRef = db.collection("consultations");

    if (criteria.patientFirstName) {
      const snapshot = await consultationsRef
        .where("patientFirstName", "==", criteria.patientFirstName)
        .get();
      if (snapshot.empty) {
        console.log("No matching documents.");
        return;
      }
      snapshot.forEach((doc) => {
        console.log(doc.id, "=>", doc.data());
      });

      return snapshot;
    } else if (criteria.patientLastName) {
      console.log("LAST NAME SEARCH");
      const snapshot = await consultationsRef
        .where("patientLastName", "==", criteria.patientLastName)
        .get();
      if (snapshot.empty) {
        console.log("No matching documents.");
        return;
      }
      snapshot.forEach((doc) => {
        console.log(doc.id, "=>", doc.data());
      });

      return snapshot;
    } else if (criteria.consultationDate) {
      const snapshot = await consultationsRef
        .where("consultationDate", "==", criteria.consultationDate)
        .get();
      if (snapshot.empty) {
        console.log("No matching documents.");
        return;
      }
      snapshot.forEach((doc) => {
        console.log(doc.id, "=>", doc.data());
      });

      return snapshot;
    }
  } catch (error) {
    console.error("Error filtering consultations: ", error);
    throw new Error("Error filtering consultations");
  }
};

const getFirebaseApp = () => admin.app();

module.exports = {
  initializeFirebaseApp,
  getFirebaseApp,
  uploadProcessedData,
  searchConsultations,
};
