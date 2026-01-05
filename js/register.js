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

    function compressImage(file, maxSizeKB = 400) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/') || file.size <= maxSizeKB * 1024) {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    const maxDimension = 1500;
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = (height / width) * maxDimension;
                            width = maxDimension;
                        } else {
                            width = (width / height) * maxDimension;
                            height = maxDimension;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    let quality = 0.7;
                    let base64 = canvas.toDataURL('image/jpeg', quality);
                    
                    while (base64.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) {
                        quality -= 0.1;
                        base64 = canvas.toDataURL('image/jpeg', quality);
                    }
                    
                    resolve(base64);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function compressPDF(file) {
        return new Promise((resolve, reject) => {
            if (file.size > 2 * 1024 * 1024) {
                reject(new Error(`PDF file "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Please use a file smaller than 2MB.`));
                return;
            }
            
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function fileToBase64Compressed(file) {
        console.log(`Processing ${file.name} (${(file.size / 1024).toFixed(2)} KB)...`);
        
        if (file.size > 2 * 1024 * 1024) {
            throw new Error(`File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum file size is 2MB.`);
        }
        
        if (file.type.startsWith('image/')) {
            return await compressImage(file, 400);
        } else if (file.type === 'application/pdf') {
            return await compressPDF(file);
        } else {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
    }

    document.getElementById('registrationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (signaturePad.isEmpty()) {
            alert('Please provide your signature');
            return;
        }
        
        // Pre-check file sizes before processing
        const files = document.getElementById('attachments').files;
        let estimatedTotalSize = 0;
        const fileSizeWarnings = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            // Base64 encoding increases size by ~37%
            const estimatedBase64Size = file.size * 1.37;
            estimatedTotalSize += estimatedBase64Size;
            
            if (file.size > 2 * 1024 * 1024) {
                fileSizeWarnings.push(`"${file.name}" is ${(file.size / 1024 / 1024).toFixed(2)}MB (max 2MB per file)`);
            }
        }
        
        // Add signature size estimate (small, ~50KB)
        estimatedTotalSize += 50 * 1024;
        
        // Check if estimated total exceeds 1MB Firestore limit
        if (estimatedTotalSize > 1048576) {
            const totalMB = (estimatedTotalSize / 1024 / 1024).toFixed(2);
            alert(`Files are too large! Estimated total: ${totalMB}MB (max 1MB).\n\nPlease:\n1. Compress PDFs at https://www.ilovepdf.com/compress_pdf\n2. Use smaller images\n3. Upload fewer files`);
            return;
        }
        
        if (fileSizeWarnings.length > 0) {
            alert('File size issues:\n\n' + fileSizeWarnings.join('\n'));
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
            
            console.log('Converting signature...');
            formData.signatureData = canvas.toDataURL('image/png', 0.7);
            console.log('Signature converted!');
            
            const attachments = [];
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const base64Data = await fileToBase64Compressed(file);
                
                attachments.push({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: base64Data
                });
                console.log(`${file.name} processed successfully!`);
            }
            
            formData.attachments = attachments;
            
            const jsonString = JSON.stringify(formData);
            const totalSizeBytes = new Blob([jsonString]).size;
            const totalSizeMB = totalSizeBytes / (1024 * 1024);
            
            console.log(`Total data size: ${totalSizeMB.toFixed(2)} MB`);
            
            if (totalSizeBytes > 1048576) {
                throw new Error(`Total file size is ${totalSizeMB.toFixed(2)}MB. Please reduce file sizes or upload fewer files. Maximum total size is 1MB.`);
            }
            
            console.log('Saving to Firestore...');
            
            // Add timeout to prevent hanging
            const savePromise = addDoc(collection(db, 'registrations'), formData);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout - please check your internet connection and Firebase configuration')), 15000)
            );
            
            try {
                const docRef = await Promise.race([savePromise, timeoutPromise]);
                console.log('✅ Registration saved with ID:', docRef.id);
                
                loading.classList.remove('active');
                document.getElementById('registrationSection').classList.add('hidden');
                document.getElementById('successMessage').classList.remove('hidden');
            } catch (firestoreError) {
                console.error('❌ Firestore Error:', firestoreError);
                throw new Error(`Database error: ${firestoreError.message}. Please check Firebase configuration.`);
            }
            
        } catch (error) {
            loading.classList.remove('active');
            console.error('Error submitting registration:', error);
            
            let errorMessage = 'There was an error submitting your registration. ';
            if (error.message.includes('file size') || error.message.includes('too large')) {
                errorMessage = error.message;
            } else if (error.code === 'permission-denied') {
                errorMessage += 'Permission denied. Please contact administrator.';
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
