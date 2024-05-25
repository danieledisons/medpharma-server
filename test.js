// const datatoUpload = {
  //   name: data?.name || "John Doe",
  //   contactInfo: {
  //     phone: data?.contactInfo?.phone || "+1234567890",
  //     email: data?.contactInfo.email || "john.doe@example.com",
  //   },
  //   dateOfBirth: Timestamp.fromDate(
  //     new Date(data?.dateOfBirth || "1985-10-10")
  //   ), // Convert to Timestamp
  //   gender: data?.gender || "Male",
  //   address: {
  //     street: data?.address.street || "123 Main St",
  //     city: data?.address.state || "CA",
  //     zip: data?.address.zip || "12345",
  //   },
  //   medicalHistory: data?.medicalHistory.map((history) => ({
  //     condition: history?.condition,
  //     diagnosedDate: Timestamp.fromDate(new Date(history?.diagnosedDate)), // Convert to Timestamp
  //     treatment: history?.treatment,
  //   })) || [
  //     {
  //       condition: "Diabetes",
  //       diagnosedDate: Timestamp.fromDate(new Date("2010-01-15")),
  //       treatment: "Insulin therapy",
  //     },
  //     {
  //       condition: "Hypertension",
  //       diagnosedDate: Timestamp.fromDate(new Date("2015-03-20")),
  //       treatment: "Beta blockers",
  //     },
  //   ],
  //   currentMedications: data?.currentMedications || ["Metformin", "Lisinopril"],
  //   emergencyContact: {
  //     name: data?.emergencyContact.name || "Jane Doe",
  //     relationship: data?.emergencyContact.relationship || "Spouse",
  //     // phone: data?.emergencyContact?.phone || "+0987654321",
  //     email: data?.emergencyContact.email || "jane.doe@example.com",
  //   },
  // };