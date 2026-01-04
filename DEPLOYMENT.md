# Deployment Guide - SPLE Kuwait Registration

## Pre-requisites

- Node.js installed (v18 or higher)
- Git installed
- GitHub account
- Vercel account
- Firebase account

## Step-by-Step Deployment

### Step 1: Firebase Setup

1. **Create Firebase Project**
   ```
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Name it "SPLE Kuwait" or similar
   - Disable Google Analytics (optional)
   - Click "Create project"
   ```

2. **Enable Firestore Database**
   ```
   - In Firebase Console, go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in production mode"
   - Select location: asia-southeast1 (Singapore) - closest to Kuwait
   - Click "Enable"
   ```

3. **Deploy Firestore Rules**
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize Firebase in your project
   cd sple-registration
   firebase init
   
   # Select:
   # - Firestore
   # - Storage
   # Choose existing project (SPLE Kuwait)
   # Use default file names
   
   # Deploy rules
   firebase deploy --only firestore:rules
   firebase deploy --only storage:rules
   ```

4. **Enable Firebase Storage**
   ```
   - In Firebase Console, go to "Storage"
   - Click "Get started"
   - Choose "Start in production mode"
   - Click "Done"
   ```

5. **Enable Authentication**
   ```
   - In Firebase Console, go to "Authentication"
   - Click "Get started"
   - Click "Email/Password"
   - Enable "Email/Password"
   - Click "Save"
   ```

6. **Create Admin User**
   ```
   - In Authentication → Users
   - Click "Add user"
   - Email: admin@tsok.org (or your preferred email)
   - Password: (create a strong password)
   - Click "Add user"
   ```

7. **Get Firebase Configuration**
   ```
   - In Firebase Console, go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click "</>" (Web icon)
   - Register app name: "SPLE Kuwait Web"
   - Copy the firebaseConfig object
   ```

8. **Update Firebase Config in Code**
   ```
   Edit: js/app.js
   
   Replace the firebaseConfig with your actual config:
   
   const firebaseConfig = {
       apiKey: "AIza...your-api-key",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "1:123456789:web:abc123"
   };
   ```

### Step 2: GitHub Setup

1. **Create GitHub Repository**
   ```bash
   # Initialize git
   git init
   
   # Add all files
   git add .
   
   # Create initial commit
   git commit -m "Initial commit: SPLE Kuwait Registration System"
   
   # Create repo on GitHub (via web interface)
   # Then connect:
   git remote add origin https://github.com/YOUR_USERNAME/sple-kuwait.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Vercel Deployment

1. **Connect to Vercel**
   ```
   - Go to https://vercel.com
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect settings
   ```

2. **Configure Project**
   ```
   Project Name: sple-kuwait-registration
   Framework Preset: Other
   Root Directory: ./
   Build Command: (leave empty or use: npm run build)
   Output Directory: (leave empty)
   Install Command: npm install
   ```

3. **Deploy**
   ```
   - Click "Deploy"
   - Wait for deployment (1-2 minutes)
   - Your app will be live at: https://your-project.vercel.app
   ```

4. **Custom Domain (Optional)**
   ```
   - In Vercel project settings → Domains
   - Add your custom domain (e.g., sple.tsok.org)
   - Update DNS records as instructed
   ```

### Step 4: Testing

1. **Test Registration Form**
   ```
   - Visit your Vercel URL
   - Fill out a test registration
   - Check Firebase Console → Firestore → registrations
   - Verify data is saved
   - Check Firebase Storage for signature and attachments
   ```

2. **Test Admin Dashboard**
   ```
   - Visit https://your-project.vercel.app/admin.html
   - Login with admin credentials
   - Verify you can see the test registration
   - Test editing, deleting, and Excel export
   ```

3. **Test PWA Installation**
   ```
   Mobile:
   - Visit on Chrome/Safari
   - Click "Add to Home Screen"
   - Open the installed app
   
   Desktop:
   - Visit on Chrome/Edge
   - Click install icon in address bar
   - Verify app opens in standalone window
   ```

### Step 5: Email Configuration (Optional)

**Option A: Using Firebase Cloud Functions + SendGrid**

1. Install Firebase Functions:
   ```bash
   firebase init functions
   cd functions
   npm install @sendgrid/mail
   ```

2. Create email function in `functions/index.js`:
   ```javascript
   const functions = require('firebase-functions');
   const sgMail = require('@sendgrid/mail');
   
   sgMail.setApiKey(functions.config().sendgrid.key);
   
   exports.sendConfirmationEmail = functions.firestore
       .document('registrations/{regId}')
       .onCreate(async (snap, context) => {
           const data = snap.data();
           
           const msg = {
               to: data.email,
               from: 'noreply@tsok.org',
               subject: 'SPLE Kuwait Registration Confirmed',
               html: `
                   <h2>Registration Received</h2>
                   <p>Dear ${data.firstname},</p>
                   <p>Thank you for registering!</p>
               `
           };
           
           await sgMail.send(msg);
       });
   ```

3. Set SendGrid API key:
   ```bash
   firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
   ```

4. Deploy:
   ```bash
   firebase deploy --only functions
   ```

**Option B: Using EmailJS (Client-side)**

1. Sign up at https://www.emailjs.com
2. Create email service
3. Create email template
4. Add EmailJS to `js/register.js`:
   ```javascript
   // Add EmailJS SDK
   <script src="https://cdn.emailjs.com/dist/email.min.js"></script>
   
   // In sendConfirmationEmail function:
   emailjs.init("YOUR_USER_ID");
   await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
       to_email: data.email,
       to_name: data.firstname,
       // ... other template variables
   });
   ```

## Post-Deployment Checklist

- [ ] Firebase project created and configured
- [ ] Firestore database enabled with rules deployed
- [ ] Storage enabled with rules deployed
- [ ] Authentication enabled with admin user created
- [ ] Firebase config updated in code
- [ ] GitHub repository created and code pushed
- [ ] Vercel deployment successful
- [ ] Registration form tested and working
- [ ] Admin dashboard tested and working
- [ ] PWA installation tested on mobile and desktop
- [ ] Email confirmation configured (if enabled)
- [ ] Custom domain configured (if applicable)

## Updating the App

To update the app after making changes:

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push

# Vercel will automatically redeploy
```

## Monitoring and Maintenance

1. **Firebase Console**
   - Monitor database usage
   - Check storage usage
   - Review authentication logs

2. **Vercel Dashboard**
   - Monitor deployments
   - Check analytics
   - Review logs

3. **Regular Backups**
   ```bash
   # Export Firestore data
   gcloud firestore export gs://your-bucket/backups
   ```

## Troubleshooting

**Issue: Firebase not connecting**
- Verify firebaseConfig in js/app.js is correct
- Check Firebase project is active
- Verify API keys are correct

**Issue: Images not loading**
- Check Storage rules are deployed
- Verify image paths are correct
- Check CORS settings in Storage

**Issue: Admin login not working**
- Verify Authentication is enabled
- Check admin user exists in Authentication
- Verify email/password are correct

**Issue: PWA not installing**
- Check manifest.json is accessible
- Verify sw.js is loading
- Check HTTPS is enabled (required for PWA)

## Support

For technical support:
- GitHub Issues: https://github.com/YOUR_USERNAME/sple-kuwait/issues
- Email: hebz@godmisoft.com

---

**Developed by Godmisoft for TSOK**
