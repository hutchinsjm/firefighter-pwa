// exposure.js - handles exposure logging logic
import { populateGearSets } from "./gear.js";
import {
    getFirestore,
    collection,
    addDoc
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
  
  import { showView, showFloatingNotice } from './ui-utils.js';
  
  const db = getFirestore();
  
  export function setupExposureForm(userId) {
    populateGearSets(userId);
    const submitBtn = document.getElementById('submit-exposure');
    const cancelBtn = document.getElementById('cancel-exposure');
  
    cancelBtn?.addEventListener('click', () => showView('main-menu'));
  
    submitBtn?.addEventListener('click', async () => {
      const incidentNumber = document.getElementById('incident-input')?.value.trim();
      const datetime = document.getElementById('datetime-input')?.value;
      const address = document.getElementById('incident-address')?.value.trim();
      const department = document.getElementById('incident-department')?.value.trim();
      const incidentType = document.getElementById('incident-type')?.value;
      const notes = document.getElementById('incident-notes')?.value.trim();
      const gearSetRef = document.getElementById('gearSetDropdown')?.value;
      const asleep = document.querySelector('input[name="asleep"]:checked')?.value || 'No';
      const exposureCheckboxes = document.querySelectorAll('input[name="exposureType"]:checked');
      const exposureType = Array.from(exposureCheckboxes).map(cb => cb.value);
  
      if (!incidentNumber || !datetime || !incidentType || !gearSetRef) {
        showFloatingNotice('Please fill in all required fields.', 'red');
        return;
      }
  
      try {
        await addDoc(collection(db, 'exposures'), {
          userId,
          incidentNumber,
          datetime,
          address,
          department,
          incidentType,
          exposureType,
          asleep,
          notes,
          gearSetRef
        });
  
        showFloatingNotice('Exposure successfully logged!', 'green');
        showView('main-menu');
      } catch (err) {
        console.error('Error submitting exposure:', err);
        showFloatingNotice('Error submitting exposure.', 'red');
      }
    });
  } 