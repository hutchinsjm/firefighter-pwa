import { auth, GoogleAuthProvider, signInWithPopup, signInAnonymously, onAuthStateChanged } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Declare buttons and status elements
const loginGoogleBtn = document.getElementById('login-google');
const loginAnonBtn = document.getElementById('login-anon');
const logoutBtn = document.getElementById('logout');
const statusDiv = document.getElementById('status');

// Handle Google sign-in
loginGoogleBtn.addEventListener('click', async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error('Google login error:', err);
  }
});

// Handle anonymous sign-in
loginAnonBtn.addEventListener('click', async () => {
  try {
    await signInAnonymously(auth);
  } catch (err) {
    console.error('Anon login error:', err);
  }
});

// Handle logout
logoutBtn.addEventListener('click', async () => {
  try {
    await signOut(auth);
    statusDiv.innerText = 'Logged out.';
    logoutBtn.style.display = 'none';
  } catch (err) {
    console.error('Logout error:', err);
  }
});

// React to login state changes
onAuthStateChanged(auth, user => {
  if (user) {
    loginGoogleBtn.style.display = 'none';
    loginAnonBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    statusDiv.textContent = `Logged in as: ${user.email || '(anonymous)'}`;
  } else {
    loginGoogleBtn.style.display = 'inline-block';
    loginAnonBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    statusDiv.textContent = '';
  }
});
