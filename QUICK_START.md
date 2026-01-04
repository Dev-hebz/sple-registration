# 🚀 QUICK START GUIDE

## ⚡ 5-Minute Setup

### 1. Firebase Setup (2 minutes)

```bash
# 1. Create project at https://console.firebase.google.com/
# 2. Enable Firestore, Storage, Authentication
# 3. Copy config from Project Settings → Web App

# Update js/app.js with your config:
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 2. Deploy Security Rules (1 minute)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy rules
firebase init  # Select Firestore and Storage
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### 3. Create Admin User (30 seconds)

```
Firebase Console → Authentication → Add User
Email: admin@tsok.org
Password: [Your secure password]
```

### 4. Deploy to Vercel (1.5 minutes)

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main

# Deploy on Vercel
# 1. Go to vercel.com
# 2. Import GitHub repo
# 3. Click Deploy
# Done! 🎉
```

---

## 📱 Access Points

### User Registration
```
https://your-app.vercel.app/
```

### Admin Dashboard
```
https://your-app.vercel.app/admin.html
Login: admin@tsok.org
```

---

## 🔑 Key Features

### Users Can:
✅ Register with complete information  
✅ Upload documents (PDF, PNG, JPG)  
✅ Sign digitally  
✅ Receive email confirmation  

### Admins Can:
✅ View all registrations  
✅ Edit information  
✅ Assign type (Member/Associate)  
✅ Add remarks  
✅ Manage attachments  
✅ Export to Excel  
✅ Search & filter  

---

## 🔧 Common Tasks

### View Registrations
```
Admin → Dashboard → View table
```

### Edit Registration
```
Click Edit (yellow) → Update → Save
```

### Assign Member Type
```
Edit → Type dropdown → Select Member/Associate → Save
```

### Export Data
```
Click "Export to Excel" button
```

### Delete Registration
```
Click Delete (red) → Confirm
```

---

## 📊 File Limits

- Attachments: **10MB max per file**
- Signatures: **5MB max**
- Supported: **PDF, PNG, JPG**

---

## 🔐 Security

### Firestore Rules
- Users can CREATE registrations
- Admins can READ, UPDATE, DELETE

### Storage Rules
- Users can UPLOAD files (with limits)
- Admins can VIEW files

---

## 🆘 Troubleshooting

### Can't login to admin?
- Check email/password in Firebase Authentication
- Verify admin user was created

### Files not uploading?
- Check file size < 10MB
- Check file type (PDF, PNG, JPG only)
- Verify Storage is enabled

### Data not saving?
- Check Firebase config in js/app.js
- Verify Firestore is enabled
- Check browser console for errors

### PWA not installing?
- Must use HTTPS (Vercel provides this)
- Check manifest.json is accessible
- Clear browser cache and retry

---

## 📞 Support

**Developer:** Godmisoft (Hebz)  
**Email:** hebz@godmisoft.com

---

## 📚 Full Documentation

- **README.md** - Complete overview
- **DEPLOYMENT.md** - Detailed deployment steps
- **TESTING.md** - Testing scenarios
- **PROJECT_SUMMARY.md** - Technical details

---

## ✅ Checklist

Before going live:

- [ ] Firebase config updated in js/app.js
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Admin user created
- [ ] Pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Test registration works
- [ ] Test admin login works
- [ ] Test PWA installation

---

**🎉 You're ready to launch!**

Access your app:
```
Registration: https://your-app.vercel.app/
Admin: https://your-app.vercel.app/admin.html
```

---

**Made with ❤️ by Godmisoft for TSOK**
