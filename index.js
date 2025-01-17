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
        
        // Log the generated credentials
        console.log('Generated Email:', generatedEmail);
        console.log('Generated Password:', generatedPassword);
        
        alert(`Registration successful!\n\nYour institutional email: ${generatedEmail}\nYour password: ${generatedPassword}\n\nPlease save these credentials!`);
        e.target.reset();
        // switchTab('login');
    } catch (error) {
        console.error('Error:', error);
        alert('Registration failed: ' + error.message);
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