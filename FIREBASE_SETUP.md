# Firebase Database Setup Guide

This guide will help you set up Firebase Firestore database for the Pothole Detection System.

## Prerequisites

1. A Google account
2. Node.js installed on your system
3. Firebase CLI (optional, for advanced features)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "pothole-detection-system")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In your Firebase project console, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (you can change security rules later)
4. Select a location for your database (choose the one closest to your users)
5. Click "Done"

## Step 3: Generate Service Account Key

1. In Firebase Console, click on the gear icon (Settings) → "Project settings"
2. Go to the "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file (this contains your service account credentials)
5. **IMPORTANT**: Rename the downloaded file to `serviceAccountKey.json` and place it in your project root directory

## Step 4: Update Firebase Configuration

1. Open `firebase-config.js` in your project
2. Replace `'https://your-project-id.firebaseio.com'` with your actual Firebase project URL
   - You can find this in Firebase Console → Project settings → General → "Project ID"
   - The URL should be: `https://YOUR_PROJECT_ID.firebaseio.com`

## Step 5: Set Up Security Rules (Optional but Recommended)

In Firebase Console → Firestore Database → Rules, you can set up security rules like this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Reports - users can read/write their own, admins can read all
    match /reports/{reportId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // For development/testing - allow all operations
    // Remove this in production!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Step 6: Test the Setup

1. Start your server: `npm start`
2. Try registering a new user
3. Try logging in
4. Try submitting a pothole report
5. Check Firebase Console → Firestore Database to see if data is being stored

## Step 7: Migrate Existing Data (Optional)

If you have existing data in `data.json`, you can migrate it to Firebase using a migration script. Create a file called `migrate.js`:

```javascript
const fs = require('fs');
const { db } = require('./firebase-config');

async function migrateData() {
  try {
    const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

    // Migrate users
    for (const user of data.users) {
      await db.collection('users').doc(user.id.toString()).set(user);
    }

    // Migrate reports
    for (const report of data.reports) {
      await db.collection('reports').doc(report.id.toString()).set(report);
    }

    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

migrateData();
```

Run it with: `node migrate.js`

## Troubleshooting

### Common Issues:

1. **"Firebase: No Firebase App '[DEFAULT]' has been created"**
   - Make sure `serviceAccountKey.json` is in the project root
   - Check that the file path in `firebase-config.js` is correct

2. **"Invalid service account"**
   - Verify the `serviceAccountKey.json` file is not corrupted
   - Make sure you're using the correct project ID

3. **Permission denied**
   - Check your Firestore security rules
   - For development, you can use the permissive rules provided above

4. **Connection timeout**
   - Check your internet connection
   - Verify Firebase project is active

## Security Notes

- **Never commit `serviceAccountKey.json` to version control**
- Add it to your `.gitignore` file
- Use environment variables for sensitive configuration in production
- Set up proper security rules before deploying to production

## Next Steps

Once Firebase is set up, your application will:
- Store all user data in Firestore
- Store all pothole reports in Firestore
- Provide real-time data synchronization
- Scale automatically with your user base

For production deployment, consider:
- Setting up Firebase Authentication
- Implementing proper security rules
- Using Firebase Hosting for the frontend
- Setting up Firebase Functions for serverless backend operations
