// File: js/auth.js
import {
    auth,
    GoogleAuthProvider,
    signInWithPopup,
    signInAnonymously,
    onAuthStateChanged,
    signOut
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
  
  export function setupAuthEvents(showView) {
    const loginGoogleBtn = document.getElementById('login-google');
    const loginAnonBtn = document.getElementById('login-anon');
    const logoutBtn = document.getElementById('logout');
  
    loginGoogleBtn?.addEventListener('click', async () => {
      try {
        await signInWithPopup(auth, new GoogleAuthProvider());
      } catch (err) {
        console.error('Google login error:', err);
      }
    });
  
    loginAnonBtn?.addEventListener('click', async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error('Anon login error:', err);
      }
    });
  
    logoutBtn?.addEventListener('click', async () => {
      try {
        await signOut(auth);
        showView('login-view');
      } catch (err) {
        console.error('Logout error:', err);
      }
    });
  }
  
  export function onUserStateChange(callback) {
    onAuthStateChanged(auth, callback);
  }
  