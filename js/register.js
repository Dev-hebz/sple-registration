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
            
            const files = document.getElementById('attachments').files;
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
            const docRef = await addDoc(collection(db, 'registrations'), formData);
            console.log('Registration saved with ID:', docRef.id);
            
            loading.classList.remove('active');
            document.getElementById('registrationSection').classList.add('hidden');
            document.getElementById('successMessage').classList.remove('hidden');
            
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
