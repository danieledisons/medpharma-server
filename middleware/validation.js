// Middleware function to validate request body
const validateRequestBody = (requiredFields) => (req, res, next) => {
  const missingFields = requiredFields.filter(
    (field) => !req.body.hasOwnProperty(field)
  );
  if (missingFields.length > 0) {
    return res
      .status(400)
      .json({ error: `Missing required fields: ${missingFields.join(", ")}` });
  }

  // You can add additional validation logic here if needed

  next();
};

// Define the required fields for each endpoint
const addPatientRequiredFields = [
  "patientFirstName",
  "patientLastName",
  "otherRequiredFields",
];
const addConsultationRequiredFields = [
  "patientFirstName",
  "patientLastName",
  "consultationDate",
  "otherRequiredFields",
];

// Middleware for add-patient route
app.post(
  "/add-patient",
  validateRequestBody(addPatientRequiredFields),
  async (req, res) => {
    // Handle add-patient logic
  }
);

// Middleware for add-consultation route
app.post(
  "/add-consultation",
  validateRequestBody(addConsultationRequiredFields),
  async (req, res) => {
    // Handle add-consultation logic
  }
);

// Middleware for filter-consultations route (not required for GET requests)
app.use(
  "/filter-consultations",
  validateRequestBody([
    "patientFirstName",
    "patientLastName",
    "consultationDate",
  ])
);

// Route to filter consultations based on different criteria
app.get("/filter-consultations", async (req, res) => {
  // Handle filter-consultations logic
});
