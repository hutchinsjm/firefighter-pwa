// app.js - Entry point that connects all modules and initializes event handlers

import {
  auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  onAuthStateChanged,
  signOut
} from './firebase-config.js';

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

import {
  prefillDatetime,
  showView,
  showFloatingNotice
} from './js/ui-utils.js';

import {
  populateGearSets,
  createGearSet,
  loadGearSets,
  populateGearDropdown
} from './js/gear.js';

import {
  setupExposureForm
} from './js/exposure.js';

import {
  populateAvailableIncidents,
  warnOnDuplicateIncident
} from './js/incident.js';

import {
  initializeScanner,
  setupScannerHandlers
} from './js/scanner.js';

import {
  saveProfile,
  loadUserProfile
} from './js/profile.js';

// Global Firestore instance
const db = getFirestore();
const userId = auth.currentUser?.uid;
let currentUser;

// Wait for DOM content before wiring event listeners
window.addEventListener('DOMContentLoaded', () => {

  // Google Sign-In
  document.getElementById('login-google')?.addEventListener('click', async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      console.log('✅ Google sign-in successful');
    } catch (err) {
      console.error('❌ Google login error:', err);
    }
  });

  // Anonymous Login
  document.getElementById('login-anon')?.addEventListener('click', async () => {
    try {
      await signInAnonymously(auth);
      console.log('✅ Anonymous login successful');
    } catch (err) {
      console.error('❌ Anonymous login error:', err);
    }
  });

  // Logout
  document.getElementById('logout')?.addEventListener('click', async () => {
    try {
      await signOut(auth);
      console.log('👋 User logged out');
      showView('login-view');
    } catch (err) {
      console.error('❌ Logout error:', err);
    }
  });

  //Exposures
  //Exposures
  //Exposures
  document.getElementById('log-exposure-btn')?.addEventListener('click', async () => {
    prefillDatetime();
    const userId = auth.currentUser?.uid;
    if (userId) {
      await populateGearDropdown(userId, 'exposure-gear-set-selector');
      await populateAvailableIncidents(userId);
      await warnOnDuplicateIncident(userId);
      setupExposureForm(userId);
      showView('exposure-logging');
    } else {
      console.error('⚠️ Cannot proceed to exposure logging: user not logged in');
    }
  });

  // Navigate to Gear Tracking
  // Navigate to Gear Tracking
  // Navigate to Gear Tracking
  document.getElementById('gear-tracking-btn')?.addEventListener('click', () => {
    showView('gear-tracking');
    if (currentUser) {
      console.log('🔧 Showing gear tracking for:', currentUser.uid);
      populateGearSets(currentUser.uid, db);
    } else {
      console.warn('⚠️ Cannot load gear sets: user not authenticated');
    }
  });

  // Return to Home
  document.getElementById('back-home')?.addEventListener('click', () => {
    console.log('🏠 Returning to main menu');
    showView('main-menu');
  });

  // Firebase Auth Listener - sets up UI after login
  onAuthStateChanged(auth, async user => {
    if (user) {
      currentUser = user;
      const userId = user.uid;
      console.log('👤 User authenticated:', user.uid);
      document.getElementById('login-view').style.display = 'none';
      document.getElementById('logout').style.display = 'inline-block';
      document.getElementById('profile-btn').style.display = 'inline-block';
      // 🔽 Pull first name from Firestore
      try {
        const profileRef = doc(getFirestore(), 'profiles', userId);
        const profileSnap = await getDoc(profileRef);
        const firstName = profileSnap.exists() ? profileSnap.data().firstName : 'User';
        document.getElementById('welcome-banner').innerText = `Welcome, ${firstName}!`;
      } catch (err) {
        console.warn('⚠️ Failed to load profile name:', err);
        document.getElementById('welcome-banner').innerText = `Welcome!`;
      } showView('main-menu');

      initializeScanner();
      setupScannerHandlers(user.uid, db);

      try {
        await loadGearSets(user.uid);
        console.log('✅ Gear sets loaded');
      } catch (e) {
        console.error('❌ Error loading gear sets:', e);
      }
    } else {
      console.log('🚪 No user signed in — returning to login screen');
      showView('login-view');
    }
  });

  // Gear Set Creation
  document.getElementById('create-gear-set')?.addEventListener('click', async () => {
    const name = document.getElementById('gear-set-name')?.value.trim();
    const user = auth.currentUser;

    if (!user) {
      return console.error('⚠️ Cannot create gear set: user not logged in');
    }

    if (!name) {
      return console.warn('⚠️ Gear set name required');
    }

    try {
      await createGearSet(user.uid, name);
      console.log(`➕ Gear set "${name}" created for user ${user.uid}`);
      document.getElementById('gear-set-name').value = '';
    } catch (err) {
      console.error('❌ Error creating gear set:', err);
    }
  });

  document.getElementById('profile-btn')?.addEventListener('click', async () => {
    showView('profile-view');
    await loadUserProfile(auth.currentUser.uid); // Load existing profile if any
  });
  document.getElementById('profile-cancel')?.addEventListener('click', () => {
    showView('main-menu');
  });

  document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = auth.currentUser.uid;
    const data = {
      firstName: document.getElementById('profile-first-name').value,
      lastName: document.getElementById('profile-last-name').value,
      email: document.getElementById('profile-email').value,
      ssn: document.getElementById('profile-ssn').value,
      iaff: document.getElementById('profile-iaff').value,
      dob: document.getElementById('profile-dob').value,
      gender: document.getElementById('profile-gender').value,
      ethnicity: document.getElementById('profile-ethnicity').value,
      careerStart: document.getElementById('profile-career-start').value,
      shift: document.getElementById('profile-shift').value,
      tobacco: document.getElementById('profile-tobacco').value,
      research: document.getElementById('profile-research').value,
      emailNotify: document.getElementById('profile-email-notify').value
    };

    await saveProfile(userId, data);
    showFloatingNotice('✅ Profile saved');
    showView('main-menu');
  });

});
