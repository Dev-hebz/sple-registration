# 🌟 Cloudinary Setup Guide

## Step 1: Create Free Cloudinary Account

1. **Go to Cloudinary:**
   - Visit: https://cloudinary.com/users/register_free
   
2. **Sign up for free:**
   - Enter your email
   - Create password
   - Click "Sign Up"
   - Verify your email

3. **Free tier includes:**
   - ✅ 25GB storage
   - ✅ 25GB bandwidth/month
   - ✅ Unlimited file uploads
   - ✅ Image transformations
   - ✅ No credit card required!

---

## Step 2: Get Your Credentials

After logging in to Cloudinary Dashboard:

1. **Find your Cloud Name:**
   - Look at the dashboard
   - You'll see: **Cloud name:** `your_cloud_name`
   - Copy this value

2. **Example:**
   ```
   Cloud name: hebz-tsok
   ```

---

## Step 3: Create Upload Preset

1. **Go to Settings:**
   - Click the ⚙️ gear icon (top right)
   - Click **Upload** tab

2. **Scroll to "Upload presets":**
   - Click **Add upload preset**

3. **Configure preset:**
   - **Upload preset name:** `sple_uploads` (or any name you like)
   - **Signing Mode:** Select **"Unsigned"** ⚠️ IMPORTANT!
   - **Folder:** Leave empty or use `sple-registration`
   - Click **Save**

4. **Copy the preset name:**
   - After saving, you'll see the preset name
   - Example: `sple_uploads`

---

## Step 4: Update Your Code

Open `js/register.js` and update these lines at the top:

```javascript
// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = 'hebz-tsok';  // ← Your cloud name here
const CLOUDINARY_UPLOAD_PRESET = 'sple_uploads';  // ← Your upload preset here
```

**Example with real values:**

```javascript
// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = 'hebz-tsok';
const CLOUDINARY_UPLOAD_PRESET = 'sple_uploads';
```

---

## Step 5: Deploy and Test

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add Cloudinary file upload"
   git push
   ```

2. **Vercel auto-deploys** (wait 1-2 minutes)

3. **Test the form:**
   - Upload any size PDF
   - Upload any size images
   - Submit form
   - Check Cloudinary dashboard to see uploaded files!

---

## How to View Uploaded Files in Cloudinary

1. **Go to Cloudinary Dashboard:**
   - https://cloudinary.com/console

2. **Click "Media Library"** (left sidebar)

3. **View folders:**
   - `sple-signatures/` - All signature images
   - `sple-attachments/` - All uploaded documents

4. **Each file shows:**
   - Preview
   - Download link
   - File size
   - Upload date

---

## File Organization

Your files will be organized like this in Cloudinary:

```
Cloudinary Media Library
├── sple-signatures/
│   ├── signature_1704567890123.png
│   ├── signature_1704567890456.png
│   └── ...
└── sple-attachments/
    ├── curriculum_vitae.pdf
    ├── diploma.pdf
    ├── certificate.jpg
    └── ...
```

---

## Benefits of Cloudinary

✅ **No file size limits** (within 25GB storage)
✅ **Fast CDN delivery** - Files load quickly worldwide
✅ **Automatic image optimization** - Reduces file sizes
✅ **Secure HTTPS links** - All files served securely
✅ **Easy file management** - Browse/delete files in dashboard
✅ **Free forever** - No credit card needed for free tier

---

## Troubleshooting

### Upload fails with "Invalid upload preset"
- Make sure upload preset is set to **"Unsigned"**
- Check that preset name matches exactly

### Upload fails with "Cloud name not found"
- Double-check your cloud name spelling
- Make sure you're using your actual cloud name

### Files not showing in Media Library
- Refresh the page
- Check correct folder
- Wait a few seconds for upload to complete

---

## Quick Reference

**Cloudinary Dashboard:** https://cloudinary.com/console

**Media Library:** https://cloudinary.com/console/media_library

**Upload Settings:** https://cloudinary.com/console/settings/upload

**Documentation:** https://cloudinary.com/documentation

---

## Summary - What You Need

1. ✅ Cloud Name (from dashboard)
2. ✅ Upload Preset (create in settings, set to "Unsigned")
3. ✅ Update `js/register.js` with these values
4. ✅ Deploy to Vercel
5. ✅ Test!

**That's it! No CORS issues, no file size limits, just works!** 🚀

---

**Developed by Godmisoft for TSOK**
