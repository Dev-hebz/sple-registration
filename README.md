# SPLE Kuwait Registration System

A Progressive Web App (PWA) for SPLE Kuwait registration by Teachers Specialists Organization Kuwait (TSOK).

## Features

### User Registration
- ✅ Comprehensive registration form with personal and educational information
- ✅ Digital signature capture
- ✅ File attachments (PDF, PNG, JPG)
- ✅ Email confirmation on submission
- ✅ Category selection (SPLE First-Taker, SPLE Retaker, Board Passer)

### Admin Dashboard
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Type assignment (Member / Associate Member)
- ✅ Remarks and notes management
- ✅ Attachment management (upload, view, delete)
- ✅ Excel export functionality
- ✅ Real-time data updates
- ✅ Search and filter capabilities
- ✅ Statistics dashboard

### PWA Features
- ✅ Installable on mobile and desktop
- ✅ Offline support with Service Worker
- ✅ TSOK branding with logo and favicon
- ✅ Responsive design
- ✅ Fast loading with caching

## Technology Stack

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Backend**: Firebase (Firestore, Storage, Authentication)
- **PWA**: Service Worker, Web App Manifest
- **Deployment**: Vercel
- **Libraries**: 
  - Signature Pad for digital signatures
  - SheetJS (XLSX) for Excel export
  - Font Awesome for icons

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable the following services:
   - **Firestore Database** (Start in production mode)
   - **Storage** (Start in production mode)
   - **Authentication** (Enable Email/Password)

4. Create Firestore security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read for registrations (for users to submit)
    match /registrations/{document=**} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

5. Create Storage security rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }
  }
}
```

6. Get your Firebase config:
   - Go to Project Settings → General
   - Scroll down to "Your apps" → Web app
   - Copy the firebaseConfig object

7. Update `js/app.js` with your Firebase configuration:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

8. Create an admin user in Firebase Authentication:
   - Go to Authentication → Users
   - Click "Add user"
   - Enter email and password for admin access

### 2. Local Development

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Open in browser:
```
http://localhost:5173
```

### 3. GitHub Setup

1. Initialize git repository:
```bash
git init
git add .
git commit -m "Initial commit: SPLE Kuwait Registration System"
```

2. Create a new repository on GitHub

3. Push to GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 4. Vercel Deployment

1. Go to [Vercel](https://vercel.com)
2. Click "Import Project"
3. Import your GitHub repository
4. Vercel will auto-detect settings
5. Click "Deploy"

Your app will be live at: `https://your-project.vercel.app`

## Email Configuration (Optional)

To enable email confirmations, you can use:

### Option 1: Firebase Cloud Functions + SendGrid

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Cloud Functions:
```bash
firebase init functions
```

3. Create a Cloud Function to send emails:
```javascript
// functions/index.js
const functions = require('firebase-functions');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(functions.config().sendgrid.key);

exports.sendConfirmationEmail = functions.firestore
    .document('registrations/{regId}')
    .onCreate(async (snap, context) => {
        const data = snap.data();
        
        const msg = {
            to: data.email,
            from: 'your-email@tsok.org',
            subject: 'SPLE Kuwait Registration - Confirmation',
            html: `...` // Your email template
        };
        
        await sgMail.send(msg);
    });
```

4. Set SendGrid API key:
```bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
```

5. Deploy:
```bash
firebase deploy --only functions
```

### Option 2: Third-party Email Service

You can also use:
- **EmailJS** - Client-side email sending
- **Mailgun** - API-based email service
- **Amazon SES** - AWS email service

## File Structure

```
sple-registration/
├── index.html              # Registration form
├── admin.html             # Admin dashboard
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker
├── tsok-logo.png          # TSOK logo
├── js/
│   ├── app.js            # Firebase configuration
│   ├── register.js       # Registration logic
│   └── admin.js          # Admin dashboard logic
├── package.json          # Dependencies
├── vercel.json           # Vercel configuration
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## Usage

### For Users (Registration)

1. Visit the registration page
2. Fill in all required information:
   - Personal information (name, contact)
   - Educational background (university, degree)
   - Category (First-Taker, Retaker, or Board Passer)
3. Upload required documents (PDF, PNG, JPG)
4. Sign the form using the signature pad
5. Submit the form
6. Receive email confirmation

### For Admins

1. Visit `/admin.html`
2. Login with admin credentials
3. View all registrations in the dashboard
4. Manage registrations:
   - View full details
   - Edit information
   - Assign type (Member/Associate Member)
   - Add remarks
   - Delete registrations
5. Export data to Excel
6. Filter and search registrations

## PWA Installation

### On Mobile (Android/iOS)
1. Visit the website in Chrome/Safari
2. Tap the "Add to Home Screen" button
3. The app will be installed and can be launched like a native app

### On Desktop
1. Visit the website in Chrome/Edge
2. Click the install icon in the address bar
3. Click "Install"
4. The app will open in its own window

## Support

For issues or questions:
- Email: support@tsok.org
- Developer: Godmisoft

## License

© 2025 Teachers Specialists Organization Kuwait (TSOK)
Developed by **Godmisoft**

---

Made with ❤️ for TSOK
