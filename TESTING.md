# Testing Guide - SPLE Kuwait Registration

## Test Scenarios

### 1. User Registration Flow

**Scenario: New user completes registration**

1. Navigate to the home page
2. Fill in all required fields:
   - Surname: Dela Cruz
   - First Name: Juan
   - Middle Name: Santos
   - Contact: +965 9876 5432
   - WhatsApp: +965 9876 5432
   - Email: juan.delacruz@example.com
   - University: University of the Philippines
   - Degree: Bachelor of Secondary Education - Major in English
   - Category: SPLE First-Taker
3. Upload test documents:
   - Upload a sample PDF (diploma/transcript)
   - Upload a sample PNG/JPG (ID photo)
4. Sign in the signature pad
5. Click "Submit Registration"

**Expected Results:**
- ✅ Loading overlay appears
- ✅ Form is submitted successfully
- ✅ Success message is displayed
- ✅ Email confirmation is sent (if configured)
- ✅ Data is saved in Firestore
- ✅ Files are uploaded to Firebase Storage
- ✅ Can start a new registration

**Verification:**
```
Firebase Console → Firestore Database → registrations
- Check if new document exists
- Verify all fields are populated
- Check signatureUrl and attachments array

Firebase Console → Storage
- Check /signatures folder for new signature
- Check /attachments folder for uploaded files
```

---

### 2. Admin Login

**Scenario: Admin logs into dashboard**

1. Navigate to `/admin.html`
2. Enter admin credentials:
   - Email: admin@tsok.org
   - Password: (your admin password)
3. Click "Login"

**Expected Results:**
- ✅ Login successful
- ✅ Dashboard displays
- ✅ Statistics cards show correct counts
- ✅ Registrations table populated
- ✅ All controls visible and functional

---

### 3. Admin - View Registration

**Scenario: Admin views full registration details**

1. Login to admin dashboard
2. Find a registration in the table
3. Click the blue "View" button (eye icon)

**Expected Results:**
- ✅ Modal/popup displays with full details
- ✅ All personal information visible
- ✅ Contact information displayed
- ✅ Educational background shown
- ✅ Category and Type displayed
- ✅ Remarks shown (if any)
- ✅ Attachments listed with download links
- ✅ Signature image displayed
- ✅ Can close the modal

---

### 4. Admin - Edit Registration

**Scenario: Admin updates registration and assigns type**

1. Login to admin dashboard
2. Click yellow "Edit" button on a registration
3. Update fields:
   - Change Contact Number
   - Update Email
   - Select Type: "Member"
   - Add Remarks: "Verified and approved for membership"
4. Upload additional attachment (optional)
5. Click "Save Changes"

**Expected Results:**
- ✅ Edit modal opens with current data
- ✅ All fields are editable
- ✅ Can upload new attachments
- ✅ Can delete existing attachments
- ✅ Changes saved successfully
- ✅ Table updated with new information
- ✅ Type badge updated in table

**Verification:**
```
Firebase Console → Firestore Database
- Check updated document
- Verify type field is set
- Verify remarks field contains text
- Check attachments array for new files
```

---

### 5. Admin - Delete Attachment

**Scenario: Admin removes an attachment from registration**

1. Login to admin dashboard
2. Click "Edit" on a registration
3. In the "Current Attachments" section
4. Click red trash icon on an attachment
5. Confirm deletion

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Attachment removed from list
- ✅ File deleted from Firebase Storage
- ✅ Document updated in Firestore
- ✅ Other attachments remain intact

---

### 6. Admin - Delete Registration

**Scenario: Admin removes entire registration**

1. Login to admin dashboard
2. Click red "Delete" button on a registration
3. Confirm deletion

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Registration removed from table
- ✅ Document deleted from Firestore
- ✅ All attachments deleted from Storage
- ✅ Signature deleted from Storage
- ✅ Statistics updated

---

### 7. Admin - Export to Excel

**Scenario: Admin exports all registrations**

1. Login to admin dashboard
2. Click "Export to Excel" button

**Expected Results:**
- ✅ Excel file downloads automatically
- ✅ Filename includes current date
- ✅ All registrations included
- ✅ All columns present:
  - Surname, First Name, Middle Name
  - Email, Contact, WhatsApp
  - University, Degree
  - Category, Type
  - Remarks, Date
- ✅ Data formatted properly
- ✅ Can open in Excel/Google Sheets

---

### 8. Admin - Search and Filter

**Scenario: Admin searches for specific registrations**

1. Login to admin dashboard
2. Test search:
   - Enter "Juan" in search box
   - Verify results filtered
3. Test category filter:
   - Select "SPLE First-Taker"
   - Verify only first-takers shown
4. Test type filter:
   - Select "Member"
   - Verify only members shown
5. Combine filters:
   - Enter name + select category + select type
   - Verify all filters apply together

**Expected Results:**
- ✅ Search updates results in real-time
- ✅ Filters work independently
- ✅ Filters work in combination
- ✅ "No results" message when nothing matches
- ✅ Can clear filters

---

### 9. PWA Installation - Mobile

**Scenario: User installs PWA on mobile device**

**Android (Chrome):**
1. Visit site on Chrome mobile
2. Tap menu (three dots)
3. Tap "Add to Home Screen"
4. Confirm installation
5. Open app from home screen

**iOS (Safari):**
1. Visit site on Safari mobile
2. Tap Share button
3. Tap "Add to Home Screen"
4. Confirm installation
5. Open app from home screen

**Expected Results:**
- ✅ Install prompt appears
- ✅ App icon added to home screen
- ✅ TSOK logo displays as app icon
- ✅ App opens in standalone mode (no browser UI)
- ✅ App name displays correctly
- ✅ Splash screen shows TSOK branding

---

### 10. PWA Installation - Desktop

**Scenario: User installs PWA on desktop**

**Chrome/Edge:**
1. Visit site
2. Click install icon in address bar
3. Click "Install"
4. App opens in new window

**Expected Results:**
- ✅ Install icon visible in address bar
- ✅ Installation dialog appears
- ✅ App installs successfully
- ✅ App opens in standalone window
- ✅ No browser UI visible
- ✅ App listed in installed apps

---

### 11. Offline Functionality

**Scenario: User accesses app offline**

1. Visit site while online
2. Close tab/app
3. Disconnect internet
4. Reopen app

**Expected Results:**
- ✅ App loads from cache
- ✅ UI displays correctly
- ✅ Basic navigation works
- ✅ Cached content visible
- ✅ Form still accessible
- ✅ Error message on submit (expected - needs connection)

---

### 12. Real-time Updates

**Scenario: Admin sees real-time data changes**

1. Open admin dashboard in browser tab 1
2. Submit new registration in browser tab 2
3. Switch back to admin dashboard (tab 1)

**Expected Results:**
- ✅ New registration appears automatically
- ✅ Statistics update without refresh
- ✅ No page reload needed
- ✅ Data syncs instantly

---

### 13. Responsive Design

**Scenario: UI adapts to different screen sizes**

Test on:
- Mobile (320px - 480px)
- Tablet (768px - 1024px)
- Desktop (1280px+)

**Expected Results:**
- ✅ Forms readable on all sizes
- ✅ Tables scroll horizontally on mobile
- ✅ Buttons accessible
- ✅ Text doesn't overflow
- ✅ Images scale properly
- ✅ No horizontal scrolling (except tables)
- ✅ Touch targets large enough on mobile

---

### 14. Form Validation

**Scenario: User attempts invalid submissions**

Test cases:
1. Submit with empty required fields
2. Submit with invalid email format
3. Submit without signature
4. Submit without attachments
5. Submit with files over size limit

**Expected Results:**
- ✅ Validation messages appear
- ✅ Form doesn't submit
- ✅ Error messages clear and helpful
- ✅ User can correct errors
- ✅ Form resets after successful submit

---

### 15. Security Tests

**Scenario: Unauthorized access attempts**

1. Try accessing admin dashboard without login
2. Try accessing Firebase directly
3. Try uploading large files
4. Try XSS in form fields

**Expected Results:**
- ✅ Admin page redirects to login
- ✅ Firebase rules prevent unauthorized access
- ✅ File size limits enforced
- ✅ Input sanitized
- ✅ No security vulnerabilities

---

## Performance Tests

### Load Time
- ✅ Initial load < 3 seconds
- ✅ Subsequent loads < 1 second (cached)

### File Upload
- ✅ 5MB file uploads successfully
- ✅ Progress indicator visible
- ✅ Error on files > 10MB

### Excel Export
- ✅ 100+ records export in < 5 seconds
- ✅ File size reasonable
- ✅ Data integrity maintained

---

## Browser Compatibility

Test on:
- ✅ Chrome (desktop & mobile)
- ✅ Firefox (desktop & mobile)
- ✅ Safari (desktop & mobile)
- ✅ Edge (desktop)

---

## Test Data

### Sample Registration Data

**Test User 1:**
```
Surname: Dela Cruz
First Name: Maria
Middle Name: Santos
Contact: +965 9876 5432
WhatsApp: +965 9876 5432
Email: maria.delacruz@example.com
University: University of Santo Tomas
Degree: Bachelor of Elementary Education
Category: SPLE First-Taker
```

**Test User 2:**
```
Surname: Reyes
First Name: Jose
Middle Name: Garcia
Contact: +965 5555 1234
WhatsApp: +965 5555 1234
Email: jose.reyes@example.com
University: De La Salle University
Degree: Bachelor of Secondary Education - Major in Mathematics
Category: Board Passer
```

**Test User 3:**
```
Surname: Santos
First Name: Anna
Middle Name: Cruz
Contact: +965 7777 9999
WhatsApp: +965 7777 9999
Email: anna.santos@example.com
University: Ateneo de Manila University
Degree: Bachelor of Secondary Education - Major in Science
Category: SPLE Retaker
```

---

## Bug Report Template

If you find issues during testing:

```
**Bug Title:** Brief description

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Result:**
What should happen

**Actual Result:**
What actually happened

**Environment:**
- Browser: Chrome 120
- Device: iPhone 14
- OS: iOS 17
- Date: 2025-01-04

**Screenshots:**
(attach if applicable)

**Priority:** High/Medium/Low
```

---

## Testing Checklist

Before going live:

- [ ] All user registration scenarios pass
- [ ] All admin scenarios pass
- [ ] PWA installs on mobile and desktop
- [ ] Email confirmations working (if enabled)
- [ ] Excel export functioning
- [ ] Search and filters working
- [ ] Real-time updates working
- [ ] Offline mode functional
- [ ] Responsive on all devices
- [ ] Form validation working
- [ ] Security tests pass
- [ ] Performance acceptable
- [ ] All browsers compatible
- [ ] Firebase rules deployed
- [ ] Admin user created

---

**Developed by Godmisoft for TSOK**
