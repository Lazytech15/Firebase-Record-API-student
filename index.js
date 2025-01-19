// student.js

// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCBowFGoC4DtkSqzOoEhTxzkdcx6JD4tW4",
    authDomain: "attendance-record-1133c.firebaseapp.com",
    projectId: "attendance-record-1133c",
    storageBucket: "attendance-record-1133c.firebasestorage.app",
    messagingSenderId: "484541514364",
    appId: "1:484541514364:web:6547ec4cbee07f4c8abff9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

let html5QrcodeScanner = null;
let scannerLocked = false;
let isScanning = false;
let isLoading = false;
const scannerModal = document.getElementById('scannerModal');
const closeScannerModal = document.querySelector('.close-scanner-modal');
const closeScannerBtn = document.getElementById('closeScannerBtn');
const cameraPermissionDiv = document.getElementById('camera-permission');
const requestPermissionBtn = document.getElementById('requestPermissionBtn');
const readerDiv = document.getElementById('reader');

// Generate random student ID (5 characters)
function generateStudentId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Generate random password (8 characters)
function generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function toggleLoading(show) {
    isLoading = show;
    const buttons = document.querySelectorAll('button[type="submit"]');
    buttons.forEach(button => {
        button.disabled = show;
        button.innerHTML = show ? '<div class="spinner"></div>' : button.getAttribute('data-original-text');
    });
}

// Save original button text when page loads
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('button[type="submit"]');
    buttons.forEach(button => {
        button.setAttribute('data-original-text', button.innerHTML);
    });
});

// Handle initial registration
document.getElementById('initialRegistrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isLoading) return;

    toggleLoading(true);
    
    const studentId = generateStudentId();
    const generatedEmail = `${studentId}@icct.com`;
    const generatedPassword = generatePassword();

    // Combine the name fields
    const firstName = document.getElementById('regFirstName').value.trim();
    const middleName = document.getElementById('regMiddleName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    
    // Create full name with optional middle name
    const fullName = middleName 
        ? `${firstName} ${middleName} ${lastName}`
        : `${firstName} ${lastName}`;

    const studentData = {
        studentId: document.getElementById('regstudentID').value,
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        name: fullName,
        course: document.getElementById('regCourse').value,
        section: document.getElementById('regSection').value,
        personalEmail: document.getElementById('regPersonalEmail').value,
        institutionalEmail: generatedEmail,
        upass: generatedPassword,
        registeredAt: new Date().toISOString()
    };

    try {
        // Create Firebase Auth user
        await createUserWithEmailAndPassword(auth, generatedEmail, generatedPassword);
        
        // Save the student data to the Firebase Realtime Database
        await set(ref(database, 'students/' + studentData.studentId), studentData);
        
        // Update the email template to use the new name fields
        const emailContent = `
        <div style="font-family: Courier, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #38005e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="font-family: Verdana, sans-serif;">Welcome to Our Online TIME-KEEPER!</h1>
            </div>
            
            <div style="padding: 20px; background-color: #ffffff; border: 1px solid #dddddd;">
                <div style="font-family: Trebuchet MS, sans-serif; font-size: 24px; margin-bottom: 20px; color: #6b018b;">
                    Dear ${studentData.name},
                </div>
                
                <p>Congratulations on successfully registering as a student! We're excited to have you join our easy access database.</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h2>Your Registration Details</h2>
                    <div style="margin: 10px 0;">
                        <strong>Student ID:</strong> <span style="font-family: Helvetica, sans-serif;">${studentData.studentId}</span>
                    </div>
                    <div style="margin: 10px 0;">
                        <strong>Full Name:</strong> <span style="font-family: Helvetica, sans-serif;">${studentData.name}</span>
                    </div>
                    <div style="margin: 10px 0;">
                        <strong>Email:</strong> <span style="font-family: Helvetica, sans-serif; color:#6b018b;">${generatedEmail}</span>
                    </div>
                    <div style="margin: 10px 0;">
                        <strong>Password:</strong> <span style="font-family: Helvetica, sans-serif; color:#6b018b;">${generatedPassword}</span>
                    </div>
                    <div style="margin: 10px 0;">
                        <strong>Course:</strong> <span style="font-family: Helvetica, sans-serif;">${studentData.course}</span>
                    </div>
                    <div style="margin: 10px 0;">
                        <strong>Section:</strong> <span style="font-family: Helvetica, sans-serif;">${studentData.section}</span>
                    </div>
                </div>

                <p>Please keep this and also update your section every end of semester by clicking this link to login <a style="color:#6b018b; text-decoration: none; font-weight: 800;" href="https://time-keeper-track-student.netlify.app">TIME KEEPER</a>.</p>

                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>

                <div style="text-align: center; margin-top: 20px; color: #666666;">
                    <p>Best regards,<br>Group07 Project</p>
                </div>
            </div>
        </div>`;

        // Send the welcome email
        await fetch('/.netlify/functions/sendEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: studentData.personalEmail,
                subject: 'Registration Successful! - TIME-KEEPER',
                html: emailContent
            })
        });
        
        Swal.fire({
            title: 'Registration successful!',
            html: `Your institutional email: ${generatedEmail}<br>Your password: ${generatedPassword}<br><br>Please check your personal email for registration details!`,
            icon: 'success',
            confirmButtonText: 'OK'
          });
          
        e.target.reset();
    } catch (error) {
        console.error('Error:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: error.message
        });
    } finally {
        toggleLoading(false);
    }
});

// Handle QR Code modal
const modal = document.getElementById('qrModal');
const closeModal = document.querySelector('.close-modal');
const downloadBtn = document.getElementById('downloadQR');

// Show modal and generate QR code
document.getElementById('generateQRBtn').addEventListener('click', () => {
    const studentId = document.getElementById('studentId').value;
    const qrcodeContainer = document.getElementById('qrcode');
    const qrStudentId = document.getElementById('qrStudentId');
    
    // Clear previous QR code
    qrcodeContainer.innerHTML = '';
    
    // Generate new QR code
    new QRCode(qrcodeContainer, {
        text: studentId,
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // Update student ID text
    qrStudentId.textContent = `Student ID: ${studentId}`;
    
    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('show');
});

// Close modal when clicking the close button
closeModal.addEventListener('click', () => {
    modal.classList.remove('show');
    modal.classList.add('hidden');
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
        modal.classList.add('hidden');
    }
});

// Handle QR code download
downloadBtn.addEventListener('click', () => {
    const qrCanvas = document.querySelector('#qrcode canvas');
    if (qrCanvas) {
        const link = document.createElement('a');
        link.download = 'student-qr-code.png';
        link.href = qrCanvas.toDataURL();
        link.click();
    }
});

// Handle registration form (after login)
document.getElementById('registrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isLoading) return;

    toggleLoading(true);

    const studentData = {
        studentId: document.getElementById('studentId').value,
        name: document.getElementById('name').value,
        course: document.getElementById('course').value,
        section: document.getElementById('section').value,
        personalEmail: document.getElementById('personalEmail').value,
        updatedAt: new Date().toISOString()
    };

    try {
        await set(ref(database, 'students/' + studentData.studentId), studentData);
        alert('Registration updated successfully!');
    } catch (error) {
        console.error('Error:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: error.message
        });
    } finally {
        toggleLoading(false);
    }
});

// Handle sign out
document.getElementById('signOutBtn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        document.getElementById('loginForm').reset();
        document.getElementById('loginContainer').classList.remove('hidden');
        document.getElementById('tab-container').classList.remove('hidden');
    } catch (error) {
        console.error('Sign out error:', error);
        alert('Sign out failed: ' + error.message);
    }
});

// Handle login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isLoading) return;

    toggleLoading(true);
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error('Login error:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Data Not Found!',
            text: 'Please check youre username and password'
        });
    } finally {
        toggleLoading(false);
    }
});

// Auth state observer
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        modal.classList.remove('show');
        modal.classList.add('hidden');
    }

    if (user) {
        // Get all students data
        try {
            const snapshot = await get(ref(database, 'students'));
            if (snapshot.exists()) {
                const studentsData = snapshot.val();
                let studentData = null;

                // Find the student data that matches the user's email
                for (const id in studentsData) {
                    if (studentsData[id].institutionalEmail.toLowerCase() === user.email.toLowerCase()) {
                        studentData = studentsData[id];
                        break;
                    }
                }

                if (studentData) {
                    // Fill the form with student data
                    document.getElementById('studentId').value = studentData.studentId;
                    document.getElementById('name').value = studentData.name;
                    document.getElementById('course').value = studentData.course;
                    document.getElementById('section').value = studentData.section;
                    document.getElementById('personalEmail').value = studentData.personalEmail;

                    // Clear any existing QR code
                    // document.getElementById('qrcode').innerHTML = '';
                    // document.getElementById('qrStudentId').textContent = '';

                    document.getElementById('loginContainer').classList.add('hidden');
                    document.getElementById('tab-container').classList.add('hidden');
                    document.getElementById('initialRegistrationContainer').classList.add('hidden');
                    document.getElementById('registrationContainer').classList.remove('hidden');
                } else {
                    console.error('No matching student data found.');
                }
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
        }
    } else {
        document.getElementById('loginContainer').classList.remove('hidden');
        document.getElementById('initialRegistrationContainer').classList.add('hidden');
        document.getElementById('registrationContainer').classList.add('hidden');
        // Clear QR code when logging out
        // document.getElementById('qrcode').innerHTML = '';
        // document.getElementById('qrStudentId').textContent = '';
    }
});
    

async function requestCameraPermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Stop the stream immediately after getting permission
        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch (error) {
        console.error('Camera permission denied', error);
        return false;
    }
}

async function startScanner() {
    cameraPermissionDiv.classList.add('hidden');
    readerDiv.classList.remove('hidden');
    
    if (html5QrcodeScanner === null) {
        html5QrcodeScanner = new Html5QrcodeScanner(
            "reader",
            { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                showTorchButtonIfSupported: true
            }
        );

        html5QrcodeScanner.render(async (decodedText) => {
            // If scanner is locked, return immediately
            if (scannerLocked) {
                return;
            }
            
            // Lock the scanner
            scannerLocked = true;
            isScanning = true;
            
            try {
                const qrData = JSON.parse(decodedText);
                
                // Check if this is an attendance QR code
                if (qrData.type !== 'attendance') {
                    throw new Error('Invalid QR code type');
                }

                // Get current user's data
                const studentId = document.getElementById('studentId').value;
                const name = document.getElementById('name').value;
                const course = document.getElementById('course').value;
                const section = document.getElementById('section').value;

                // Split both the student's sections and QR code sections
                const studentSections = section.split(',').map(s => s.trim());
                const qrSections = Array.isArray(qrData.section) 
                    ? qrData.section 
                    : [qrData.section].map(s => s.trim());

                // Check if there's any matching section
                const matchingSection = qrSections.find(qrSection => 
                    studentSections.includes(qrSection)
                );

                if (!matchingSection) {
                    throw new Error('You are not enrolled in this section');
                }

                // Check for existing attendance
                const today = new Date().toISOString().split('T')[0];
                const attendanceRef = ref(database, 'attendance');
                const snapshot = await get(attendanceRef);
                
                if (snapshot.exists()) {
                    const attendanceData = snapshot.val();
                    const existingEntry = Object.values(attendanceData).find(entry => 
                        entry.studentId === studentId &&
                        entry.subject === qrData.subject &&
                        entry.timeIn.startsWith(today)
                    );

                    if (existingEntry) {
                        throw new Error('You have already recorded attendance for this subject today');
                    }
                }
                
                // Create attendance entry with matching section
                const attendanceEntry = {
                    studentId,
                    name,
                    course,
                    section: matchingSection, // Use the matching section
                    timeIn: new Date().toISOString(),
                    subject: qrData.subject
                };

                // Safely pause scanner
                if (html5QrcodeScanner && isScanning) {
                    try {
                        await html5QrcodeScanner.pause(true);
                        isScanning = false;
                    } catch (error) {
                        console.warn('Failed to pause scanner:', error);
                    }
                }

                // Send attendance to server
                const response = await fetch('https://project-to-ipt01.netlify.app/.netlify/functions/api/attendance', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(attendanceEntry)
                });

                if (!response.ok) {
                    throw new Error('Failed to record attendance');
                }

                // Close scanner and modal after successful scan
                closeScanner();

                await Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Attendance recorded successfully!',
                    timer: 1500,
                    showConfirmButton: false
                });

            } catch (error) {
                console.error('Error:', error);
                
                // Safely pause scanner
                if (html5QrcodeScanner && isScanning) {
                    try {
                        await html5QrcodeScanner.pause(true);
                        isScanning = false;
                    } catch (pauseError) {
                        console.warn('Failed to pause scanner:', pauseError);
                    }
                }
                
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message,
                    timer: 1500,
                    showConfirmButton: false
                });
                
                // Safely resume scanner
                if (html5QrcodeScanner && !isScanning) {
                    try {
                        await html5QrcodeScanner.resume();
                        isScanning = true;
                    } catch (resumeError) {
                        console.warn('Failed to resume scanner:', resumeError);
                    }
                }
            } finally {
                // Unlock the scanner after processing is complete
                setTimeout(() => {
                    scannerLocked = false;
                }, 2000); // 2 second delay before allowing new scans
            }
        });
    }
}

// Initialize modal with permission request
async function initializeScanner() {
    cameraPermissionDiv.classList.remove('hidden');
    readerDiv.classList.add('hidden');
    
    // Check if we already have permission
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
        startScanner();
    }
}

// Handle permission button click
requestPermissionBtn.addEventListener('click', async () => {
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
        startScanner();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Camera Access Denied',
            text: 'Please allow camera access in your browser settings to scan QR codes.'
        });
    }
});

// Update the scan button click handler
document.getElementById('scanQRBtn').addEventListener('click', () => {
    scannerModal.classList.remove('hidden');
    scannerModal.classList.add('show');
    initializeScanner();
});

// Close modal and cleanup
async function closeScanner() {
    if (html5QrcodeScanner) {
        try {
            if (isScanning) {
                await html5QrcodeScanner.pause(true);
                isScanning = false;
            }
            await html5QrcodeScanner.clear();
            html5QrcodeScanner = null;
        } catch (error) {
            console.warn('Error while closing scanner:', error);
        }
    }
    scannerModal.classList.remove('show');
    scannerModal.classList.add('hidden');
}

// Close modal handlers
closeScannerModal.addEventListener('click', closeScanner);
closeScannerBtn.addEventListener('click', closeScanner);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === scannerModal) {
        closeScanner();
    }
});

// Add delete account handler
document.getElementById('deleteAccountBtn').addEventListener('click', async () => {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete my account'
    });

    if (result.isConfirmed) {
        try {
            toggleLoading(true);
            const user = auth.currentUser;
            const studentId = document.getElementById('studentId').value;

            // Delete from database
            await set(ref(database, 'students/' + studentId), null);
            
            // Delete user account
            await user.delete();
            
            await Swal.fire(
                'Deleted!',
                'Your account has been deleted.',
                'success'
            );
            
            // Redirect to login
            document.getElementById('loginContainer').classList.remove('hidden');
            document.getElementById('registrationContainer').classList.add('hidden');
        } catch (error) {
            console.error('Error deleting account:', error);
            Swal.fire(
                'Error!',
                'Failed to delete account: ' + error.message,
                'error'
            );
        } finally {
            toggleLoading(false);
        }
    }
});

// Make switchTab function available globally
window.switchTab = function(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if (tab === 'login') {
        document.getElementById('loginContainer').classList.remove('hidden');
        // document.getElementById('logindescription').classList.remove('hidden');
        document.getElementById('initialRegistrationContainer').classList.add('hidden');
        document.querySelector('.tab:first-child').classList.add('active');
    } else {
        // document.getElementById('logindescription').classList.add('hidden');
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('initialRegistrationContainer').classList.remove('hidden');
        document.querySelector('.tab:last-child').classList.add('active');
    }
}