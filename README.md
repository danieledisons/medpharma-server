---

# MedPharma Server

This server manages consultations in a health facility, providing endpoints to add patients, handle login, create consultations, and filter consultations based on various criteria.

## Routes and Endpoints

### Add a New Patient

- **Endpoint**: `POST /add-patient`
- **Description**: Adds a new patient to the system.
- **Request Body**: JSON object containing patient data.
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "age": 35,
    "gender": "Male",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    ... // Additional patient details
  }
  ```
- **Response**: 
  - Status: 200 OK
  - Content: 
    ```json
    {
      "message": "Patient data added successfully"
    }
    ```

### Handle Login

- **Endpoint**: `POST /login`
- **Description**: Handles user login and authentication.
- **Request Body**: JSON object containing username, password, and role.
  ```json
  {
    "username": "john_doe",
    "password": "password123",
    "role": "Officer"
  }
  ```
- **Response**: 
  - Status: 
    - 200 OK if login successful
    - 403 Forbidden if credentials are invalid
  - Content: 
    - `{ message: "Username & Password are required" }` if username or password is missing.
    - `{ message: "Role is required, choose between Officer or Patient" }` if role is missing.

### Create a New Consultation

- **Endpoint**: `POST /add-consultation`
- **Description**: Creates a new consultation record.
- **Request Body**: JSON object containing consultation details.
  ```json
  {
    "patientFirstName": "John",
    "patientLastName": "Doe",
    "consultationDate": "2024-05-25",
    "consultationNotes": "Patient complains of headaches.",
    "medicalCondition": "Migraine"
  }
  ```
- **Response**: 
  - Status: 
    - 201 Created if consultation created successfully
    - 403 Forbidden if required fields are missing
  - Content: 
    - `{ message: "Consultation created successfully" }` if successful.

### Filter Consultations

- **Endpoint**: `GET /filter-consultations`
- **Description**: Filters consultations based on various criteria.
- **Query Parameters**:
  - `patientFirstName`: First name of the patient
  - `patientLastName`: Last name of the patient
  - `consultationDate`: Date of consultation
- **Response**: 
  - Status: 200 OK
  - Content: Array of consultation records matching the criteria.
    ```json
    [
      {
        "id": "12345",
        "data": {
          "patientFirstName": "John",
          "patientLastName": "Doe",
          "consultationDate": "2024-05-25",
          "consultationNotes": "Patient complains of headaches.",
          "medicalCondition": "Migraine"
        }
      },
      ... // Additional consultation records
    ]
    ```
    # Consultation Search and Patient Details API

This repository contains code for two API endpoints: consultation search and patient details retrieval. These endpoints are designed to be integrated into a larger system for managing consultations and patient information in a healthcare facility.

## Consultation Search

- **Endpoint**: `GET /searchconsultations`
- **Description**: Searches for consultations based on various criteria such as patient name, medical condition, healthcare provider, consultation type, consultation notes, and consultation date.
- **Query Parameters**:
  - `query`: The search query to filter consultations.
- **Response**:
  - Status: 
    - 200 OK if consultations are found
    - 404 Not Found if no consultations match the query
    - 500 Internal Server Error if there's an error processing the request
  - Content:
    - Array of consultation records matching the search query.
    ```json
    [
      {
        "id": "12345",
        "data": {
          "patientFirstName": "John",
          "patientLastName": "Doe",
          "consultationDate": "2024-05-25",
          "consultationNotes": "Patient complains of headaches.",
          "medicalCondition": "Migraine"
        }
      },
      ... // Additional consultation records
    ]
    ```

## Patient Details Retrieval

- **Endpoint**: `GET /get-patient-details`
- **Description**: Retrieves patient details based on first name and last name.
- **Query Parameters**:
  - `firstName`: First name of the patient.
  - `lastName`: Last name of the patient.
- **Response**:
  - Status:
    - 200 OK if patient details are found
    - 404 Not Found if no patient matches the provided name
    - 400 Bad Request if first name or last name is missing in the query parameters
    - 500 Internal Server Error if there's an error processing the request
  - Content:
    - Patient details object containing information such as patient first name, last name, age, gender, contact details, etc.
    ```json
    {
      "patientFirstName": "John",
      "patientLastName": "Doe",
      "age": 35,
      "gender": "Male",
      "email": "john.doe@example.com",
      "phone": "1234567890",
      ... // Additional patient details
    }
    ```

## Installation and Setup

1. Clone the repository.
   ```bash
   git clone https://github.com/your-username/medpharma-server.git
   ```

2. Install dependencies.
   ```bash
   cd medpharma-server
   npm install
   ```

3. Set up environment variables.
   - Create a `.env` file in the root directory.
   - Add environment variables as needed.

4. Start the server.
   ```bash
   npm start
   ```

## Dependencies

- express
- body-parser
- dotenv

---
