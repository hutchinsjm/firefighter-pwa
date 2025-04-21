// app.js - entry point that connects all modules

import {
auth,
GoogleAuthProvider,
signInWithPopup,
signInAnonymously,
onAuthStateChanged,
signOut
} from './firebase-config.js';

import { 
getFirestore
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

import { 
prefillDatetime, 
showView 
} from './js/ui-utils.js';
import { 
populateGearSets,
createGearSet,
loadGearSets 
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
  
  const db = getFirestore();
  let currentUser;
  
  window.addEventListener('DOMContentLoaded', () => {
    // Auth buttons
    document.getElementById('login-google')?.addEventListener('click', async () => {
      try {
        await signInWithPopup(auth, new GoogleAuthProvider());
      } catch (err) {
        console.error('Google login error:', err);
      }
    });
  
    document.getElementById('login-anon')?.addEventListener('click', async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error('Anon login error:', err);
      }
    });
  
    document.getElementById('logout')?.addEventListener('click', async () => {
      try {
        await signOut(auth);
        showView('login-view');
      } catch (err) {
        console.error('Logout error:', err);
      }
    });
  
    // Main menu navigation
    document.getElementById('log-exposure-btn')?.addEventListener('click', () => showView('exposure-logging'));
    document.getElementById('gear-tracking-btn')?.addEventListener('click', () => {
      showView('gear-tracking');
      if (currentUser) populateGearSets(currentUser.uid, db);
    });
    document.getElementById('back-home')?.addEventListener('click', () => showView('main-menu'));
  
    // Auth state listener
    onAuthStateChanged(auth, async user => {
      if (user) {
        currentUser = user;
        document.getElementById('login-view').style.display = 'none';
        document.getElementById('logout').style.display = 'inline-block';
        showView('main-menu');
  
        prefillDatetime();
        await populateGearSets(user.uid);
        await populateAvailableIncidents(user.uid);
        await warnOnDuplicateIncident(user.uid);
        setupExposureForm(user.uid);
        initializeScanner();
        setupScannerHandlers(user.uid, db);
        await loadGearSets(auth.currentUser.uid);
      } else {
        showView('login-view');
      }
    });

    // Gear set creation
    document.getElementById('create-gear-set')?.addEventListener('click', async () => {
        const name = document.getElementById('gear-set-name').value;
        const user = auth.currentUser;
        if (user && name) {
          await createGearSet(user.uid, name);
          document.getElementById('gear-set-name').value = '';
        }
      });
  });