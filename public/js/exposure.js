// exposure.js - handles exposure logging logic
import { populateGearSets } from "./gear.js";
import { populateGearDropdown } from './gear.js';
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where  
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
  
  import { showView, showFloatingNotice } from './ui-utils.js';
  
  const db = getFirestore();
  
  export async function countUnreportedIncidents(userId) {
    const reportedSnap = await getDocs(query(collection(db, 'exposures'), where('userId', '==', userId)));
    const reportedIncidentNumbers = new Set();
    reportedSnap.forEach(doc => reportedIncidentNumbers.add(doc.data().incidentNumber));
  
    const allIncidentsSnap = await getDocs(collection(db, 'incidents'));
    let unreportedCount = 0;
  
    allIncidentsSnap.forEach(doc => {
      const incident = doc.data();
      if (!reportedIncidentNumbers.has(incident.incidentNumber)) {
        unreportedCount++;
      }
    });
  
    return unreportedCount;
  }

  export async function setupExposureForm(userId) {
    const submitBtn = document.getElementById('submit-exposure');
    const cancelBtn = document.getElementById('cancel-exposure');
    const allIncidentsSnap = await getDocs(collection(db, 'incidents'));

    cancelBtn?.addEventListener('click', () => showView('main-menu'));
  
    // Populate Known Incidents dropdown for user
    const incidentDropdown = document.getElementById('incidentDropdown');
    if (incidentDropdown) {
    incidentDropdown.innerHTML = '<option value="">-- Choose Incident --</option>'; // clear old entries
    console.log('🔍 Looking for incidents for user:', userId);
    const reportedSnap = await getDocs(query(collection(db, 'exposures'), where('userId', '==', userId)));
    const reportedIncidentNumbers = new Set();
    reportedSnap.forEach(doc => reportedIncidentNumbers.add(doc.data().incidentNumber));

    const allIncidentsSnap = await getDocs(collection(db, 'incidents'));
    console.log('🗂️ All incidents count:', allIncidentsSnap.docs.length);

    allIncidentsSnap.forEach(docSnap => {
    const data = docSnap.data();
    if (!reportedIncidentNumbers.has(data.incidentNumber)) {
        const option = document.createElement('option');
        option.value = data.incidentNumber;
        option.textContent = `${data.incidentNumber} - ${data.address || 'Unknown Location'}`;
        option.dataset.address = data.address || '';
        incidentDropdown.appendChild(option);
    }
    });

    // When user selects an incident, prefill the input box
    incidentDropdown.addEventListener('change', () => {
        const val = incidentDropdown.value;
        if (val) {
            document.getElementById('incident-input').value = val;
            document.getElementById('incident-address').value = incidentDropdown.options[incidentDropdown.selectedIndex].dataset.address || '';
        }
    });
    }


    submitBtn?.addEventListener('click', async () => {
      const incidentNumber = document.getElementById('incident-input')?.value.trim();
      const datetime = document.getElementById('datetime-input')?.value;
      const address = document.getElementById('incident-address')?.value.trim();
      const department = document.getElementById('incident-department')?.value.trim();
      const incidentType = document.getElementById('incidentType')?.value;
      const rawNotes = document.getElementById('incident-notes')?.value;
      console.log('📝 Raw notes value:', rawNotes);
      const notes = rawNotes.trim() || 'none';const gearSetRef = document.getElementById('exposure-gear-set-selector')?.value;
      const asleep = document.querySelector('input[name="asleep"]:checked')?.value || 'No';
      const exposureCheckboxes = document.querySelectorAll('input[name="exposureType"]:checked');
      const exposureType = Array.from(exposureCheckboxes).map(cb => cb.value);
  
      if (!incidentNumber || !datetime || !incidentType || !gearSetRef) {
        showFloatingNotice('Please fill in all required fields.', 'red');
        console.log(incidentNumber, datetime, incidentType, gearSetRef)
        return;
      }

      console.log('🚀 Payload to Firestore:', {
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
      
      try {
        const docRef = await addDoc(collection(db, 'exposures'), {
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
        console.log('✅ Exposure logged with ID:', docRef.id);
        showFloatingNotice('Exposure successfully logged!', 'green');
        resetExposureForm();
        showView('main-menu');
      } catch (err) {
        console.error('🔥 Firestore addDoc error:', err);
        showFloatingNotice('Error submitting exposure.', 'red');
      }
    });

    function resetExposureForm() {
        document.getElementById('incident-input').value = '';
        document.getElementById('datetime-input').value = '';
        document.getElementById('incident-address').value = '';
        document.getElementById('incident-department').value = '';
        document.getElementById('incidentType').value = '';
        document.getElementById('incident-notes').value = '';
        document.getElementById('exposure-gear-set-selector').value = '';
        document.querySelectorAll('input[name="asleep"]').forEach(el => el.checked = false);
        document.querySelectorAll('input[name="exposureType"]').forEach(el => el.checked = false);
      }
  } 