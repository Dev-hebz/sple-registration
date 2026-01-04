import { db, storage } from './app.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Initialize Signature Pad
const canvas = document.getElementById('signaturePad');
const signaturePad = new SignaturePad(canvas, {
    backgroundColor: 'rgb(255, 255, 255)',
    penColor: 'rgb(0, 0, 0)'
});

// Resize canvas
function resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    signaturePad.clear();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

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
        
        // Upload signature
        const signatureBlob = await new Promise(resolve => {
            canvas.toBlob(resolve);
        });
        
        const signatureRef = ref(storage, `signatures/${Date.now()}_signature.png`);
        await uploadBytes(signatureRef, signatureBlob);
        formData.signatureUrl = await getDownloadURL(signatureRef);
        
        // Upload attachments
        const files = document.getElementById('attachments').files;
        const attachmentUrls = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileRef = ref(storage, `attachments/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            attachmentUrls.push({
                name: file.name,
                url: url,
                type: file.type
            });
        }
        
        formData.attachments = attachmentUrls;
        
        // Save to Firestore
        const docRef = await addDoc(collection(db, 'registrations'), formData);
        
        // Send confirmation email (using a cloud function or email service)
        await sendConfirmationEmail(formData);
        
        // Show success message
        loading.classList.remove('active');
        document.getElementById('registrationSection').classList.add('hidden');
        document.getElementById('successMessage').classList.remove('hidden');
        
    } catch (error) {
        loading.classList.remove('active');
        console.error('Error submitting registration:', error);
        alert('There was an error submitting your registration. Please try again.');
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
