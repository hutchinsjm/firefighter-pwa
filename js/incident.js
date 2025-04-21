// incident.js - manages preloading incidents and duplicate checks

import {
    getFirestore,
    collection,
    getDocs,
    query,
    where
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
  
  import { showFloatingNotice } from './ui-utils.js';
  
  const db = getFirestore();
  
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
      const incidentInput = document.getElementById('incident-input');
      if (addressInput && selected.dataset.address) {
        addressInput.value = selected.dataset.address;
      }
      if (incidentInput) {
        incidentInput.value = selected.value;
      }
    });
  }
  
  export async function warnOnDuplicateIncident(uid) {
    const incidentInput = document.getElementById('incident-input');
    if (!incidentInput) return;
  
    const exposuresSnap = await getDocs(query(collection(db, 'exposures'), where('userId', '==', uid)));
    const logged = new Set();
    exposuresSnap.forEach(doc => logged.add(doc.data().incidentNumber));
  
    incidentInput.addEventListener('input', () => {
      const val = incidentInput.value.trim();
      if (logged.has(val)) {
        showFloatingNotice('You have already logged this incident.', 'orangered');
      }
    });
  }
  