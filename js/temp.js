import { db } from './app.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Cloudinary Configuration - UPDATE THESE WITH YOUR CLOUDINARY CREDENTIALS
const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUD_NAME'; // Get from cloudinary.com dashboard
const CLOUDINARY_UPLOAD_PRESET = 'YOUR_UPLOAD_PRESET'; // Create unsigned upload preset

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
        
        canvas.style.width = '100%';
        canvas.style.height = '200px';
        canvas.width = container.offsetWidth * ratio;
        canvas.height = 200 * ratio;
        
        const ctx = canvas.getContext("2d");
        ctx.scale(ratio, ratio);
    }

    resizeCanvas();

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

    function preventScroll(event) {
        event.preventDefault();
    }

    canvas.addEventListener("touchstart", preventScroll, { passive: false });
    canvas.addEventListener("touchmove", preventScroll, { passive: false });

    window.addEventListener("resize", () => {
        resizeCanvas();
        signaturePad.clear();
    });

    document.getElementById('clearSignature').addEventListener('click', () => {
        signaturePad.clear();
    });

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
                    <span class="text-xs text-gray-500">(${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
            `;
            preview.appendChild(div);
        });
    });

    // Upload file to Cloudinary
    async function uploadToCloudinary(file, folder = 'sple-attachments') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', folder);
        
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
            {
                method: 'POST',
                body: formData
            }
        );
        
        if (!response.ok) {
            throw new Error(`Cloudinary upload failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        return {
            url: data.secure_url,
            publicId: data.public_id,
            format: data.format,
            size: data.bytes
        };
    }

    // Convert signature canvas to blob
    function canvasToBlob(canvas) {
        return new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/png');
        });
    }

    document.getElementById('registrationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (signaturePad.isEmpty()) {
            alert('Please provide your signature');
            return;
        }
        
        const loading = document.getElementById('loadingOverlay');
        loading.classList.add('active');
        
        try {
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
            
            // Upload signature to Cloudinary
            console.log('Uploading signature to Cloudinary...');
            const signatureBlob = await canvasToBlob(canvas);
            const signatureFile = new File([signatureBlob], 'signature.png', { type: 'image/png' });
            const signatureData = await uploadToCloudinary(signatureFile, 'sple-signatures');
            formData.signature = signatureData;
            console.log('✅ Signature uploaded!');
            
            // Upload attachments to Cloudinary
            const files = document.getElementById('attachments').files;
            const attachments = [];
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                console.log(`Uploading ${file.name} to Cloudinary...`);
                
                const uploadedFile = await uploadToCloudinary(file, 'sple-attachments');
                
                attachments.push({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: uploadedFile.url,
                    publicId: uploadedFile.publicId
                });
                console.log(`✅ ${file.name} uploaded!`);
            }
            
            formData.attachments = attachments;
            
            console.log('Saving to Firestore...');
            
            // Add timeout to prevent hanging
            const savePromise = addDoc(collection(db, 'registrations'), formData);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout - please check your internet connection')), 30000)
            );
            
            const docRef = await Promise.race([savePromise, timeoutPromise]);
            console.log('✅ Registration saved with ID:', docRef.id);
            
            loading.classList.remove('active');
            document.getElementById('registrationSection').classList.add('hidden');
            document.getElementById('successMessage').classList.remove('hidden');
            
        } catch (error) {
            loading.classList.remove('active');
            console.error('❌ Error:', error);
            
            let errorMessage = 'There was an error submitting your registration. ';
            
            if (error.message.includes('Cloudinary')) {
                errorMessage = 'File upload failed. Please check your internet connection and try again.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Request timeout. Please check your internet connection.';
            } else if (error.code === 'permission-denied') {
                errorMessage = 'Permission denied. Please contact administrator.';
            } else {
                errorMessage += error.message || 'Please try again.';
            }
            
            alert(errorMessage);
        }
    });

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
        
        canvas.style.width = '100%';
        canvas.style.height = '200px';
        canvas.width = container.offsetWidth * ratio;
        canvas.height = 200 * ratio;
        
        const ctx = canvas.getContext("2d");
        ctx.scale(ratio, ratio);
    }

    resizeCanvas();

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

    function preventScroll(event) {
        event.preventDefault();
    }

    canvas.addEventListener("touchstart", preventScroll, { passive: false });
    canvas.addEventListener("touchmove", preventScroll, { passive: false });

    window.addEventListener("resize", () => {
        resizeCanvas();
        signaturePad.clear();
    });

    document.getElementById('clearSignature').addEventListener('click', () => {
        signaturePad.clear();
    });

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

