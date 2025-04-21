// firestore.js - database utilities
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    addDoc
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
  
  const db = getFirestore();
  
  export async function populateGearSets(uid) {
    const gearSetDropdown = document.getElementById('gearSetDropdown');
    if (!gearSetDropdown) return;
    gearSetDropdown.innerHTML = '';
    const snap = await getDocs(query(collection(db, 'gearSets'), where('userId', '==', uid)));
    snap.forEach(doc => {
      const opt = document.createElement('option');
      opt.value = doc.id;
      opt.textContent = doc.data().name;
      gearSetDropdown.appendChild(opt);
    });
  }
  
  export async function populateAvailableIncidents(uid) {
    const dropdown = document.getElementById('known-incidents');
    if (!dropdown) return;
    dropdown.innerHTML = '';
  
    const exposuresSnap = await getDocs(query(collection(db, 'exposures'), where('userId', '==', uid)));
    const submittedIncidentNumbers = new Set();
    exposuresSnap.forEach(doc => submittedIncidentNumbers.add(doc.data().incidentNumber));
  
    const incidentsSnap = await getDocs(collection(db, 'incidents'));
    const placeholder = document.createElement('option');
    placeholder.textContent = '-- Choose Incident --';
    placeholder.value = '';
    dropdown.appendChild(placeholder);
  
    incidentsSnap.forEach(doc => {
      const incident = doc.data();
      if (!submittedIncidentNumbers.has(incident.incidentNumber)) {
        const opt = document.createElement('option');
        opt.value = incident.incidentNumber;
        opt.textContent = incident.incidentNumber;
        opt.dataset.address = incident.address || '';
        dropdown.appendChild(opt);
      }
    });
  
    dropdown.addEventListener('change', () => {
      const selected = dropdown.options[dropdown.selectedIndex];
      const addressInput = document.getElementById('incident-address');
      if (addressInput && selected.dataset.address) {
        addressInput.value = selected.dataset.address;
        document.getElementById('incident-input').value = selected.value;
      }
    });
  }