# 🔧 Firebase Storage CORS Fix

## Problem
Your app is getting CORS errors when trying to upload files to Firebase Storage from Vercel.

**Error Message:**
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' 
has been blocked by CORS policy
```

## Solution

You need to configure CORS (Cross-Origin Resource Sharing) for your Firebase Storage bucket.

---

## Method 1: Using Google Cloud Console (RECOMMENDED - Easiest)

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com/
2. Select your project
3. Go to **Storage** → **Files**

### Step 2: Note Your Bucket Name
- Look at the top, you'll see something like: `gs://your-project-id.appspot.com`
- Copy this bucket name

### Step 3: Configure CORS in Google Cloud
1. Go to https://console.cloud.google.com/storage
2. Make sure you're in the correct project
3. Find your storage bucket (same name as above)
4. Click on the bucket name
5. Click on **Configuration** tab
6. Scroll to **CORS** section
7. Click **Edit CORS configuration**
8. Paste this:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"]
  }
]
```

9. Click **Save**

### Step 4: Wait 2-5 Minutes
CORS changes take a few minutes to propagate.

### Step 5: Test
Refresh your Vercel app and try submitting the registration form again.

---

## Method 2: Using gsutil Command Line

### Step 1: Install Google Cloud SDK
Download from: https://cloud.google.com/sdk/docs/install

### Step 2: Authenticate
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### Step 3: Create cors.json File
Create a file named `cors.json` with:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"]
  }
]
```

### Step 4: Apply CORS Configuration
```bash
gsutil cors set cors.json gs://YOUR_BUCKET_NAME.appspot.com
```

Replace `YOUR_BUCKET_NAME` with your actual bucket name.

### Step 5: Verify
```bash
gsutil cors get gs://YOUR_BUCKET_NAME.appspot.com
```

---

## Method 3: Temporary Fix - Update Firebase Rules

### Step 1: Update Storage Rules
In Firebase Console → Storage → Rules, temporarily use:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ WARNING:** This allows anyone to upload files. Only use for testing!

### Step 2: Deploy Rules
Click **Publish** in the Firebase Console

### Step 3: Test
Try your form again

### Step 4: Revert to Secure Rules
Once CORS is configured, change back to:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /signatures/{signatureId} {
      allow write: if request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
      allow read: if request.auth != null;
    }
    
    match /attachments/{attachmentId} {
      allow write: if request.resource.size < 10 * 1024 * 1024
                   && (request.resource.contentType.matches('application/pdf')
                       || request.resource.contentType.matches('image/.*'));
      allow read: if request.auth != null;
    }
  }
}
```

---

## Method 4: More Specific CORS (Production-Ready)

If you want to only allow your Vercel domain:

```json
[
  {
    "origin": ["https://splereg2.vercel.app", "http://localhost:5173"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"]
  }
]
```

Replace `https://splereg2.vercel.app` with your actual Vercel URL.

---

## Troubleshooting

### CORS Still Not Working?

1. **Clear Browser Cache**
   - Press Ctrl+Shift+Delete
   - Clear cached images and files
   - Try again

2. **Wait Longer**
   - CORS changes can take up to 10 minutes
   - Be patient

3. **Check Bucket Name**
   - Make sure you're applying CORS to the correct bucket
   - Verify in Firebase Console → Storage

4. **Check Firebase Plan**
   - Free Spark plan has limitations
   - Upgrade to Blaze if needed

5. **Try Incognito Mode**
   - Test in a private/incognito window
   - This eliminates cache issues

### Still Getting Errors?

Check browser console (F12) for specific error messages and send screenshot.

---

## Verification

After applying CORS, you should see:
1. ✅ No CORS errors in browser console
2. ✅ Files uploading to Firebase Storage
3. ✅ Form submission working
4. ✅ Success message appearing

---

## Quick Checklist

- [ ] Identified your storage bucket name
- [ ] Applied CORS configuration (Method 1, 2, 3, or 4)
- [ ] Waited 5 minutes for propagation
- [ ] Cleared browser cache
- [ ] Tested form submission
- [ ] Verified files in Firebase Storage console
- [ ] Reverted to secure rules (if using Method 3)

---

**Need Help?**
Contact: hebz@godmisoft.com

---

**Developed by Godmisoft for TSOK**
