// app.js (scanner auto-stops, buttons for gear type, manual entry option)

import {
    auth,
    GoogleAuthProvider,
    signInWithPopup,
    signInAnonymously,
    onAuthStateChanged
  } from './firebase-config.js';
  
  import { signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
  import { Platform } from './platform.js';
  import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    getDoc
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
  
  let codeReader;
  let currentStream;
  
  window.addEventListener('DOMContentLoaded', () => {
    if (typeof ZXing !== 'undefined') {
      codeReader = new ZXing.BrowserMultiFormatReader();
    } else {
      console.error('ZXing not loaded');
    }
  
    const manualEntryBtn = document.createElement('button');
    manualEntryBtn.textContent = 'Enter Manually';
    manualEntryBtn.id = 'manual-entry';
    manualEntryBtn.style.marginLeft = '10px';
    startScanBtn.parentNode.insertBefore(manualEntryBtn, startScanBtn.nextSibling);
  
    manualEntryBtn.addEventListener('click', async () => {
      const serial = prompt("Enter gear serial number manually:");
      if (!serial) return;
      const selectedSetId = gearSetSelector.value;
      const component = await showComponentSelector();
  
      if (selectedSetId && component) {
        const ref = doc(db, 'gearSets', selectedSetId);
        const snap = await getDoc(ref);
        const data = snap.data();
  
        if (["coat", "pants", "helmet", "boots", "gloves", "hood"].includes(component)) {
          await updateDoc(ref, { [component]: serial });
        } else {
          const updatedExtras = Array.isArray(data.extras) ? [...data.extras, { label: component, serial }] : [{ label: component, serial }];
          await updateDoc(ref, { extras: updatedExtras });
        }
        loadGearSets();
      }
    });
  });
  
  const db = getFirestore();
  
  if (Platform.isMobile) {
    document.body.classList.add('mobile-ui');
  } else {
    document.body.classList.add('desktop-ui');
  }
  
  // [ ... everything else stays unchanged below ... ]
  
  
  const loginGoogleBtn = document.getElementById('login-google');
  const loginAnonBtn = document.getElementById('login-anon');
  const logoutBtn = document.getElementById('logout');
  const statusDiv = document.getElementById('status');
  
  const gearTracking = document.getElementById('gear-tracking');
  const mainMenu = document.getElementById('main-menu');
  const gearSetNameInput = document.getElementById('gear-set-name');
  const gearSetsList = document.getElementById('gear-sets-list');
  const startScanBtn = document.getElementById('start-scan');
  const scannerContainer = document.getElementById('scanner-container');
  const scannerPreview = document.getElementById('scanner-preview');
  const gearItemsList = document.getElementById('gear-items-list');
  const gearSetSelector = document.getElementById('gear-set-selector');
  
  function showView(id) {
    document.querySelectorAll('#app > section').forEach(sec => sec.style.display = 'none');
    document.getElementById(id).style.display = 'block';
  }
  
  loginGoogleBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google login error:', err);
    }
  });
  
  loginAnonBtn.addEventListener('click', async () => {
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.error('Anon login error:', err);
    }
  });
  
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      statusDiv.innerText = 'Logged out.';
      logoutBtn.style.display = 'none';
      showView('login-view');
    } catch (err) {
      console.error('Logout error:', err);
    }
  });
  
  onAuthStateChanged(auth, user => {
    if (user) {
      loginGoogleBtn.style.display = 'none';
      loginAnonBtn.style.display = 'none';
      logoutBtn.style.display = 'inline-block';
      statusDiv.textContent = `Logged in as: ${user.email || '(anonymous)'}`;
      showView('main-menu');
      loadGearSets();
    } else {
      loginGoogleBtn.style.display = 'inline-block';
      loginAnonBtn.style.display = 'inline-block';
      logoutBtn.style.display = 'none';
      statusDiv.textContent = '';
      showView('login-view');
    }
  });
  
  document.getElementById('gear-tracking-btn').addEventListener('click', () => {
    showView('gear-tracking');
  });
  
  document.getElementById('back-home').addEventListener('click', () => {
    stopCamera();
    showView('main-menu');
  });
  
  document.getElementById('create-gear-set').addEventListener('click', async () => {
    const name = gearSetNameInput.value.trim();
    if (!name) return;
    await addDoc(collection(db, 'gearSets'), {
      name,
      coat: '',
      pants: '',
      helmet: '',
      boots: '',
      gloves: '',
      hood: '',
      extras: [],
      isPrimary: false
    });
    gearSetNameInput.value = '';
    loadGearSets();
  });
  
  async function loadGearSets() {
    const querySnapshot = await getDocs(collection(db, 'gearSets'));
    gearSetsList.innerHTML = '';
    gearSetSelector.innerHTML = '';
    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      const div = document.createElement('div');
      const option = document.createElement('option');
      option.value = docSnap.id;
      option.textContent = data.name;
      gearSetSelector.appendChild(option);
  
      div.innerHTML = `
        <label>
          <input type="radio" name="primarySet" ${data.isPrimary ? 'checked' : ''} data-id="${docSnap.id}" />
          <strong>${data.name}</strong>
          <div>Coat: ${data.coat || '—'}, Pants: ${data.pants || '—'}, Helmet: ${data.helmet || '—'}</div>
        </label>
        <button data-delete-id="${docSnap.id}">🗑️</button>
      `;
      gearSetsList.appendChild(div);
  
      div.querySelector('input[type="radio"]').addEventListener('change', async () => {
        const allSets = await getDocs(collection(db, 'gearSets'));
        allSets.forEach(async d => {
          await updateDoc(doc(db, 'gearSets', d.id), { isPrimary: d.id === docSnap.id });
        });
        loadGearSets();
      });
  
      div.querySelector('button').addEventListener('click', async () => {
        await deleteDoc(doc(db, 'gearSets', docSnap.id));
        loadGearSets();
      });
    });
  }
  
  startScanBtn.addEventListener('click', async () => {
    scannerContainer.style.display = 'block';
    codeReader.decodeFromVideoDevice(null, scannerPreview, async (result, err) => {
      if (result) {
        const serial = result.getText();
        stopCamera();
        const selectedSetId = gearSetSelector.value;
        const component = await showComponentSelector();
  
        if (selectedSetId && component) {
          const ref = doc(db, 'gearSets', selectedSetId);
          const snap = await getDoc(ref);
          const data = snap.data();
  
          if (["coat", "pants", "helmet", "boots", "gloves", "hood"].includes(component)) {
            await updateDoc(ref, { [component]: serial });
          } else {
            const updatedExtras = Array.isArray(data.extras) ? [...data.extras, { label: component, serial }] : [{ label: component, serial }];
            await updateDoc(ref, { extras: updatedExtras });
          }
          loadGearSets();
        }
      }
    }, { delayBetweenScanAttempts: 150 });
  });
  
  async function showComponentSelector() {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
      overlay.style.display = 'flex';
      overlay.style.flexDirection = 'column';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.zIndex = '9999';
  
      const label = document.createElement('p');
      label.textContent = 'Select component type:';
      label.style.color = 'white';
      label.style.fontSize = '20px';
      label.style.marginBottom = '1rem';
      overlay.appendChild(label);
  
      const components = ["coat", "pants", "helmet", "boots", "gloves", "hood", "custom"];
      components.forEach(type => {
        const btn = document.createElement('button');
        btn.textContent = type;
        btn.style.margin = '6px';
        btn.style.padding = '10px 20px';
        btn.style.fontSize = '16px';
        btn.onclick = () => {
          document.body.removeChild(overlay);
          resolve(type);
        };
        overlay.appendChild(btn);
      });
  
      document.body.appendChild(overlay);
    });
  }
  
  function stopCamera() {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      currentStream = null;
    }
    if (codeReader) codeReader.reset();
    scannerContainer.style.display = 'none';
  }
  