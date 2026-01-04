import { db } from './app.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Signature Pad
    const canvas = document.getElementById('signaturePad');
    
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    // Set canvas size properly
    function resizeCanvas() {
        const container = canvas.parentElement;
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        
        // Set display size (css pixels)
        canvas.style.width = '100%';
        canvas.style.height = '200px';
        
        // Set actual size in memory (scaled to account for extra pixel density)
        canvas.width = container.offsetWidth * ratio;
        canvas.height = 200 * ratio;
        
        // Normalize coordinate system to use css pixels
        const ctx = canvas.getContext("2d");
        ctx.scale(ratio, ratio);
    }

    resizeCanvas();

    // Check if SignaturePad is available
    if (typeof SignaturePad === 'undefined') {
        console.error('SignaturePad library not loaded');
        return;
    }

    const signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
        minWidth: 1,
        maxWidth: 2.5,
        velocityFilterWeight: 0.7
    });

    // Prevent scrolling when touching the canvas
    function preventScroll(event) {
        event.preventDefault();
    }

    canvas.addEventListener("touchstart", preventScroll, { passive: false });
    canvas.addEventListener("touchmove", preventScroll, { passive: false });

    window.addEventListener("resize", () => {
        resizeCanvas();
        signaturePad.clear();
    });

    // Clear signature button
    document.getElementById('clearSignature').addEventListener('click', () => {
        signaturePad.clear();
    });

    // File preview
    document.getElementById('attachments').addEventListener('change', (e) => {
        const files = e.target.files;
        const preview = document.getElementById('filePreview');
        preview.innerHTML = '';
        
        Array.from(files).forEach(file => {
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between bg-gray-100 p-3 rounded-lg';
            div.innerHTML = `
                <div class="flex items-center space-x-2">
                    <i class="fas fa-file text-blue-500"></i>
                    <span class="text-sm text-gray-700">${file.name}</span>
                    <span class="text-xs text-gray-500">(${(file.size / 1024).toFixed(2)} KB)</span>
                </div>
            `;
            preview.appendChild(div);
        });
    });

    // Helper function to convert file to base64
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Form submission
    document.getElementById('registrationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate signature
        if (signaturePad.isEmpty()) {
            alert('Please provide your signature');
            return;
        }
        
        const loading = document.getElementById('loadingOverlay');
        loading.classList.add('active');
        
        try {
            // Get form data
            const formData = {
                surname: document.getElementById('surname').value,
                firstname: document.getElementById('firstname').value,
                midname: document.getElementById('midname').value,
                contact: document.getElementById('contact').value,
                whatsapp: document.getElementById('whatsapp').value,
                email: document.getElementById('email').value,
                university: document.getElementById('university').value,
                degree: document.getElementById('degree').value,
                category: document.getElementById('category').value,
                type: '',
                remarks: '',
                createdAt: serverTimestamp(),
                status: 'pending'
            };
            
            // Convert signature to base64 (NO STORAGE NEEDED!)
            console.log('Converting signature to base64...');
            formData.signatureData = canvas.toDataURL('image/png');
            console.log('Signature converted successfully!');
            
            // Convert attachments to base64 (NO STORAGE NEEDED!)
            const files = document.getElementById('attachments').files;
            const attachments = [];
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                console.log(`Converting ${file.name} to base64...`);
                
                const base64Data = await fileToBase64(file);
                
                attachments.push({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: base64Data
                });
                console.log(`${file.name} converted successfully!`);
            }
            
            formData.attachments = attachments;
            
            // Save everything to Firestore (NO STORAGE CORS ISSUES!)
            console.log('Saving to Firestore...');
            const docRef = await addDoc(collection(db, 'registrations'), formData);
            console.log('Registration saved with ID:', docRef.id);
            
            // Send confirmation email
            await sendConfirmationEmail(formData);
            
            // Show success message
            loading.classList.remove('active');
            document.getElementById('registrationSection').classList.add('hidden');
            document.getElementById('successMessage').classList.remove('hidden');
            
        } catch (error) {
            loading.classList.remove('active');
            console.error('Error submitting registration:', error);
            
            // More detailed error message
            let errorMessage = 'There was an error submitting your registration. ';
            if (error.code === 'permission-denied') {
                errorMessage += 'Permission denied. Please contact administrator.';
            } else {
                errorMessage += error.message || 'Please try again.';
            }
            
            alert(errorMessage);
        }
    });

    // Send confirmation email function
    async function sendConfirmationEmail(data) {
        const emailData = {
            to: data.email,
            subject: 'SPLE Kuwait Registration - Confirmation',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">TSOK</h1>
                        <p style="color: #bfdbfe; margin: 5px 0;">Teachers Specialists Organization Kuwait</p>
                    </div>
                    
                    <div style="padding: 30px; background: #f9fafb;">
                        <h2 style="color: #1f2937;">Registration Received!</h2>
                        
                        <p style="color: #4b5563;">Dear ${data.firstname} ${data.surname},</p>
                        
                        <p style="color: #4b5563;">
                            Thank you for registering for SPLE Kuwait. We have received your information and 
                            will verify it shortly.
                        </p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #1f2937; margin-top: 0;">Registration Details:</h3>
                            <p style="color: #4b5563; margin: 5px 0;"><strong>Name:</strong> ${data.firstname} ${data.midname} ${data.surname}</p>
                            <p style="color: #4b5563; margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
                            <p style="color: #4b5563; margin: 5px 0;"><strong>Contact:</strong> ${data.contact}</p>
                            <p style="color: #4b5563; margin: 5px 0;"><strong>University:</strong> ${data.university}</p>
                            <p style="color: #4b5563; margin: 5px 0;"><strong>Degree:</strong> ${data.degree}</p>
                            <p style="color: #4b5563; margin: 5px 0;"><strong>Category:</strong> ${data.category}</p>
                        </div>
                        
                        <p style="color: #4b5563;">
                            We will contact you via email or WhatsApp once your registration has been verified.
                        </p>
                        
                        <p style="color: #4b5563;">
                            If you have any questions, please don't hesitate to contact us.
                        </p>
                    </div>
                    
                    <div style="background: #1e3a8a; padding: 20px; text-align: center;">
                        <p style="color: #bfdbfe; margin: 0;">© 2025 TSOK - Developed by Godmisoft</p>
                    </div>
                </div>
            `
        };
        
        console.log('Email would be sent:', emailData);
    }

    // New registration button
    document.getElementById('newRegistration').addEventListener('click', () => {
        document.getElementById('successMessage').classList.add('hidden');
        document.getElementById('registrationSection').classList.remove('hidden');
        document.getElementById('registrationForm').reset();
        signaturePad.clear();
        document.getElementById('filePreview').innerHTML = '';
    });
});

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Signature Pad
    const canvas = document.getElementById('signaturePad');
    
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    // Set canvas size properly
    function resizeCanvas() {
        const container = canvas.parentElement;
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        
        // Set display size (css pixels)
        canvas.style.width = '100%';
        canvas.style.height = '200px';
        
        // Set actual size in memory (scaled to account for extra pixel density)
        canvas.width = container.offsetWidth * ratio;
        canvas.height = 200 * ratio;
        
        // Normalize coordinate system to use css pixels
        const ctx = canvas.getContext("2d");
        ctx.scale(ratio, ratio);
    }

    resizeCanvas();

    // Check if SignaturePad is available
    if (typeof SignaturePad === 'undefined') {
        console.error('SignaturePad library not loaded');
        return;
    }

    const signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
        minWidth: 1,
        maxWidth: 2.5,
        velocityFilterWeight: 0.7
    });

    // Prevent scrolling when touching the canvas
    function preventScroll(event) {
        event.preventDefault();
    }

    canvas.addEventListener("touchstart", preventScroll, { passive: false });
    canvas.addEventListener("touchmove", preventScroll, { passive: false });

    window.addEventListener("resize", () => {
        resizeCanvas();
        signaturePad.clear();
    });

    // Clear signature button
    document.getElementById('clearSignature').addEventListener('click', () => {
        signaturePad.clear();
    });

    // File preview
    document.getElementById('attachments').addEventListener('change', (e) => {
        const files = e.target.files;
        const preview = document.getElementById('filePreview');
        preview.innerHTML = '';
        
        Array.from(files).forEach(file => {
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between bg-gray-100 p-3 rounded-lg';
            div.innerHTML = `
                <div class="flex items-center space-x-2">
                    <i class="fas fa-file text-blue-500"></i>
                    <span class="text-sm text-gray-700">${file.name}</span>
                    <span class="text-xs text-gray-500">(${(file.size / 1024).toFixed(2)} KB)</span>
                </div>
            `;
            preview.appendChild(div);
        });
    });

    // Helper function to upload file with progress
    async function uploadFileWithProgress(file, path) {
        return new Promise((resolve, reject) => {
            const storageRef = ref(storage, path);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    // Progress monitoring (optional)
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                },
                (error) => {
                    // Handle errors
                    console.error('Upload error:', error);
                    reject(error);
                },
                async () => {
                    // Upload completed successfully
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(downloadURL);
                    } catch (error) {
                        reject(error);
                    }
                }
            );
        });
    }

    // Form submission
    document.getElementById('registrationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate signature
        if (signaturePad.isEmpty()) {
            alert('Please provide your signature');
            return;
        }
        
        const loading = document.getElementById('loadingOverlay');
        loading.classList.add('active');
        
        try {
            // Get form data
            const formData = {
                surname: document.getElementById('surname').value,
                firstname: document.getElementById('firstname').value,
                midname: document.getElementById('midname').value,
                contact: document.getElementById('contact').value,
                whatsapp: document.getElementById('whatsapp').value,
                email: document.getElementById('email').value,
                university: document.getElementById('university').value,
                degree: document.getElementById('degree').value,
                category: document.getElementById('category').value,
                type: '',
                remarks: '',
                createdAt: serverTimestamp(),
                status: 'pending'
            };
            
            // Upload signature using Firebase SDK
            const signatureBlob = await new Promise(resolve => {
                canvas.toBlob(resolve);
            });
            
            const signaturePath = `signatures/${Date.now()}_signature.png`;
            console.log('Uploading signature...');
            formData.signatureUrl = await uploadFileWithProgress(signatureBlob, signaturePath);
            console.log('Signature uploaded successfully!');
            
            // Upload attachments using Firebase SDK
            const files = document.getElementById('attachments').files;
            const attachmentUrls = [];
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const attachmentPath = `attachments/${Date.now()}_${file.name}`;
                console.log(`Uploading ${file.name}...`);
                
                const url = await uploadFileWithProgress(file, attachmentPath);
                
                attachmentUrls.push({
                    name: file.name,
                    url: url,
                    type: file.type
                });
                console.log(`${file.name} uploaded successfully!`);
            }
            
            formData.attachments = attachmentUrls;
            
            // Save to Firestore
            console.log('Saving to Firestore...');
            const docRef = await addDoc(collection(db, 'registrations'), formData);
            console.log('Registration saved with ID:', docRef.id);
            
            // Send confirmation email (using a cloud function or email service)
            await sendConfirmationEmail(formData);
            
            // Show success message
            loading.classList.remove('active');
            document.getElementById('registrationSection').classList.add('hidden');
            document.getElementById('successMessage').classList.remove('hidden');
            
        } catch (error) {
            loading.classList.remove('active');
            console.error('Error submitting registration:', error);
            
            // More detailed error message
            let errorMessage = 'There was an error submitting your registration. ';
            if (error.code === 'storage/unauthorized') {
                errorMessage += 'Storage permission denied. Please contact administrator.';
            } else if (error.code === 'storage/canceled') {
                errorMessage += 'Upload was canceled.';
            } else if (error.code === 'storage/unknown') {
                errorMessage += 'An unknown error occurred. Please try again.';
            } else {
                errorMessage += error.message || 'Please try again.';
            }
            
            alert(errorMessage);
        }
    });

    // Send confirmation email function
    async function sendConfirmationEmail(data) {
        // This would typically call a Cloud Function or email service
        // For now, we'll use a simple API endpoint
        
        const emailData = {
            to: data.email,
            subject: 'SPLE Kuwait Registration - Confirmation',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">TSOK</h1>
                        <p style="color: #bfdbfe; margin: 5px 0;">Teachers Specialists Organization Kuwait</p>
                    </div>
                    
                    <div style="padding: 30px; background: #f9fafb;">
                        <h2 style="color: #1f2937;">Registration Received!</h2>
                        
                        <p style="color: #4b5563;">Dear ${data.firstname} ${data.surname},</p>
                        
                        <p style="color: #4b5563;">
                            Thank you for registering for SPLE Kuwait. We have received your information and 
                            will verify it shortly.
                        </p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #1f2937; margin-top: 0;">Registration Details:</h3>
                            <p style="color: #4b5563; margin: 5px 0;"><strong>Name:</strong> ${data.firstname} ${data.midname} ${data.surname}</p>
                            <p style="color: #4b5563; margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
                            <p style="color: #4b5563; margin: 5px 0;"><strong>Contact:</strong> ${data.contact}</p>
                            <p style="color: #4b5563; margin: 5px 0;"><strong>University:</strong> ${data.university}</p>
                            <p style="color: #4b5563; margin: 5px 0;"><strong>Degree:</strong> ${data.degree}</p>
                            <p style="color: #4b5563; margin: 5px 0;"><strong>Category:</strong> ${data.category}</p>
                        </div>
                        
                        <p style="color: #4b5563;">
                            We will contact you via email or WhatsApp once your registration has been verified.
                        </p>
                        
                        <p style="color: #4b5563;">
                            If you have any questions, please don't hesitate to contact us.
                        </p>
                    </div>
                    
                    <div style="background: #1e3a8a; padding: 20px; text-align: center;">
                        <p style="color: #bfdbfe; margin: 0;">© 2025 TSOK - Developed by Godmisoft</p>
                    </div>
                </div>
            `
        };
        
        // You can integrate with SendGrid, Mailgun, or your email service here
        // For Firebase, you can use Cloud Functions to send emails
        console.log('Email would be sent:', emailData);
    }

    // New registration button
    document.getElementById('newRegistration').addEventListener('click', () => {
        document.getElementById('successMessage').classList.add('hidden');
        document.getElementById('registrationSection').classList.remove('hidden');
        document.getElementById('registrationForm').reset();
        signaturePad.clear();
        document.getElementById('filePreview').innerHTML = '';
    });
});
