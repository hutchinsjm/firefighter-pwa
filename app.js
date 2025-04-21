// app.js (Complete gear tracking with camera scanning and custom gear support)

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
    updateDoc
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
  
  const db = getFirestore();
  
  if (Platform.isMobile) {
    document.body.classList.add('mobile-ui');
  } else {
    document.body.classList.add('desktop-ui');
  }
  
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
  
  let currentStream;
  
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
    const docRef = await addDoc(collection(db, 'gearSets'), {
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
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    scannerPreview.srcObject = stream;
    currentStream = stream;
  });
  
  function stopCamera() {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      currentStream = null;
      scannerContainer.style.display = 'none';
    }
  }
  
  scannerPreview.addEventListener('click', async () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = scannerPreview.videoWidth;
    canvas.height = scannerPreview.videoHeight;
    context.drawImage(scannerPreview, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL();
  
    const serial = prompt('Scanned serial number (simulate with manual input):');
    const component = prompt('Which component is this? (e.g., coat, pants, helmet, boots, gloves, hood, or custom label)');
    const selectedSetId = gearSetSelector.value;
  
    if (selectedSetId && component && serial) {
      const ref = doc(db, 'gearSets', selectedSetId);
      const snap = await getDocs(collection(db, 'gearSets'));
      const target = snap.docs.find(d => d.id === selectedSetId);
      const data = target.data();
  
      if (["coat", "pants", "helmet", "boots", "gloves", "hood"].includes(component)) {
        await updateDoc(ref, { [component]: serial });
      } else {
        const updatedExtras = Array.isArray(data.extras) ? [...data.extras, { label: component, serial }] : [{ label: component, serial }];
        await updateDoc(ref, { extras: updatedExtras });
      }
      loadGearSets();
    }
  });
  