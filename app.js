import { auth, GoogleAuthProvider, signInWithPopup, signInAnonymously, onAuthStateChanged } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

document.getElementById('login-google').addEventListener('click', async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error('Google login error:', err);
  }
});

document.getElementById('login-anon').addEventListener('click', async () => {
  try {
    await signInAnonymously(auth);
  } catch (err) {
    console.error('Anon login error:', err);
  }
});

onAuthStateChanged(auth, user => {
    const status = document.getElementById('status');
    const logoutBtn = document.getElementById('logout');
  
    if (user) {
      status.innerText = `Logged in as: ${user.isAnonymous ? 'Anonymous' : user.email}`;
      logoutBtn.style.display = 'inline-block'; // show logout button
    } else {
      status.innerText = 'Not logged in';
      logoutBtn.style.display = 'none'; // hide logout button
    }
  });
  
document.getElementById('logout').addEventListener('click', async () => {
  try {
    await signOut(auth);
    document.getElementById('status').innerText = 'Logged out.';
    document.getElementById('logout').style.display = 'none';
  } catch (err) {
    console.error('Logout error:', err);
  }
});

