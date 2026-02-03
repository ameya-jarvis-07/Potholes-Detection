// Firebase Admin SDK Configuration
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let db = null;

try {
  // Try to read the service account key file
  const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });

    // Firestore database instance
    db = admin.firestore();
    console.log('Firebase initialized successfully using serviceAccountKey.json');
  } else {
    throw new Error('serviceAccountKey.json not found in project root');
  }
} catch (error) {
  console.error('Firebase initialization failed:', error.message);
  console.error('Please ensure serviceAccountKey.json is in the project root directory.');
  process.exit(1);
}

// Export the admin and db instances
module.exports = { admin, db };
