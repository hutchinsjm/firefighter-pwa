// gear.js
import { showFloatingNotice } from './ui-utils.js';
import {
    getFirestore,
    collection,
    getDoc,
    getDocs,
    query,
    where,
    addDoc,
    deleteDoc,
    doc,
    updateDoc
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
  
  const db = getFirestore();
  
  // ⬇️ List gear sets with delete & primary set radio
  export async function loadGearSets(userId) {
    const gearSetsList = document.getElementById('gear-sets-list');
    const gearSetSelector = document.getElementById('gear-set-selector');

    if (!gearSetSelector) return;
  
    gearSetsList.innerHTML = '';
    gearSetSelector.innerHTML = '';
  
    const snap = await getDocs(query(collection(db, 'gearSets'), where('userId', '==', userId)));
  
    snap.forEach(docSnap => {
      const data = docSnap.data();
      const gearSetId = docSnap.id;
  
      // Dropdown option
      const option = document.createElement('option');
      option.value = gearSetId;
      option.textContent = data.name;
      gearSetSelector.appendChild(option);
  
      // List item
      const div = document.createElement('div');
      div.classList.add('gear-set-entry');
      div.innerHTML = `
        <label>
          <input type="radio" name="primarySet" ${data.isPrimary ? 'checked' : ''} data-id="${gearSetId}" />
          <strong>${data.name}</strong>
          <div>Coat: ${data.coat || '—'}, Pants: ${data.pants || '—'}, Helmet: ${data.helmet || '—'}</div>
        </label>
        <button class="delete-gear-set" data-delete-id="${gearSetId}">🗑️ Delete</button>
      `;
      gearSetsList.appendChild(div);
  
      // Handle primary set selection
      div.querySelector('input[type="radio"]').addEventListener('change', async () => {
        const allSets = await getDocs(query(collection(db, 'gearSets'), where('userId', '==', userId)));
        allSets.forEach(async otherSnap => {
          const isPrimary = (otherSnap.id === gearSetId);
          await updateDoc(doc(db, 'gearSets', otherSnap.id), { isPrimary });
        });
        loadGearSets(userId); // Refresh UI
      });
  
      // Handle deletion
      div.querySelector('.delete-gear-set').addEventListener('click', async () => {
        await deleteDoc(doc(db, 'gearSets', gearSetId));
        loadGearSets(userId); // Refresh UI
      });
    });
  }
  
  // ⬇️ Add new gear set with default empty fields
  export async function createGearSet(userId, name) {
    if (!userId || !name.trim()) return;
  
    await addDoc(collection(db, 'gearSets'), {
      userId,
      name: name.trim(),
      coat: '',
      pants: '',
      helmet: '',
      boots: '',
      gloves: '',
      hood: '',
      extras: [],
      isPrimary: false
    });
  
    await loadGearSets(userId);
  }
  
  // ⬇️ Minimal version for exposure form dropdown (if needed)
  export async function populateGearSets(userId) {
    const gearSetSelector = document.getElementById('gear-set-selector');
    if (!gearSetSelector) return;
  
    const snap = await getDocs(query(collection(db, 'gearSets'), where('userId', '==', userId)));
  
    gearSetSelector.innerHTML = '';
    snap.forEach(docSnap => {
      const option = document.createElement('option');
      option.value = docSnap.id;
      option.textContent = docSnap.data().name;
      gearSetSelector.appendChild(option);
    });
  }
  
  export async function populateGearDropdown(userId, selectorId = 'gear-set-selector') {
    const selector = document.getElementById(selectorId);
    if (!selector) {
      console.warn(`⚠️ Dropdown element with ID '${selectorId}' not found.`);
      return;
    }
  
    const db = getFirestore();
    const q = query(collection(db, 'gearSets'), where('userId', '==', userId));
    const snap = await getDocs(q);
  
    selector.innerHTML = '';
    snap.forEach(doc => {
      const opt = document.createElement('option');
      opt.value = doc.id;
      opt.textContent = doc.data().name;
      selector.appendChild(opt);
    });
  }
  