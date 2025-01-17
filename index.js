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

// Handle initial registration
document.getElementById('initialRegistrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const studentId = generateStudentId();
    const generatedEmail = `${studentId}@icct.com`;
    const generatedPassword = generatePassword();

    const studentData = {
        studentId: document.getElementById('regstudentID').value,
        name: document.getElementById('regName').value,
        course: document.getElementById('regCourse').value,
        section: document.getElementById('regSection').value,
        personalEmail: document.getElementById('regPersonalEmail').value,
        institutionalEmail: generatedEmail,
        registeredAt: new Date().toISOString()
    };

    try {
        // Create Firebase Auth user
        await createUserWithEmailAndPassword(auth, generatedEmail, generatedPassword);
        
        // Save the student data to the Firebase Realtime Database
        await set(ref(database, 'students/' + studentData.studentId), studentData);
        
        // Send welcome email
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

                <p>Please keep these and also update your section every end of semester in <a style="color:#6b018b; text-decoration: none; font-weight: 800;" href="https://time-keeper-track-student.netlify.app/">TIME KEEPER</a> </p>

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
                to: studentData.personalEmail, // Send to personal email
                subject: 'Registration Successful! - TIME-KEEPER',
                html: emailContent
            })
        });
        
        alert(`Registration successful!\n\nYour institutional email: ${generatedEmail}\nYour password: ${generatedPassword}\n\nPlease check your personal email for registration details!`);
        e.target.reset();
    } catch (error) {
        console.error('Error:', error);
        alert('Registration failed: ' + error.message);
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
        alert('Update failed: ' + error.message);
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
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // The auth state observer will handle the UI update
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
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
                    document.getElementById('qrcode').innerHTML = '';
                    document.getElementById('qrStudentId').textContent = '';

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
        document.getElementById('qrcode').innerHTML = '';
        document.getElementById('qrStudentId').textContent = '';
    }
});

// Make switchTab function available globally
window.switchTab = function(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if (tab === 'login') {
        document.getElementById('loginContainer').classList.remove('hidden');
        document.getElementById('initialRegistrationContainer').classList.add('hidden');
        document.querySelector('.tab:first-child').classList.add('active');
    } else {
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('initialRegistrationContainer').classList.remove('hidden');
        document.querySelector('.tab:last-child').classList.add('active');
    }
}
