// scanner.js - Handles barcode scanning with ZXing (modular version, unified with manual logic)
import { loadGearSets } from './gear.js';
import { showFloatingNotice } from './ui-utils.js';
import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

let codeReader;
let currentStream;

export function initializeScanner() {
  if (typeof ZXing !== 'undefined') {
    codeReader = new ZXing.BrowserMultiFormatReader();
  } else {
    console.error('ZXing not loaded');
  }
}

export function setupScannerHandlers(userId, db) {
  const startScanBtn = document.getElementById('start-scan');
  const scannerContainer = document.getElementById('scanner-container');
  const scannerPreview = document.getElementById('scanner-preview');
  const gearSetSelector = document.getElementById('gear-set-selector');
  const manualBtn = document.getElementById('manual-entry');

  if (!startScanBtn || !scannerContainer || !scannerPreview || !gearSetSelector) return;

  startScanBtn.addEventListener('click', async () => {
    if (!codeReader) return showFloatingNotice('Scanner not ready.', 'red');

    scannerContainer.style.display = 'block';
    try {
      codeReader.decodeFromVideoDevice(null, scannerPreview, async (result, err) => {
        if (result) {
          const serial = result.getText();
          stopCamera();
          showAssignmentButtons(serial, db, gearSetSelector, userId);
        }
      });
    } catch (err) {
      console.error('Error starting scanner:', err);
      showFloatingNotice('Failed to start scanner.', 'red');
    }
  });

  if (manualBtn) {
    manualBtn.addEventListener('click', () => {
      const container = document.createElement('div');
      container.id = 'manual-entry-container';
      container.innerHTML = `
        <p>Enter Serial Number:</p>
        <input type="text" id="manual-serial-input" placeholder="Serial number" />
        <button id="manual-submit">Continue</button>
      `;
      Object.assign(container.style, {
        position: 'fixed',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#fff',
        padding: '1rem',
        border: '1px solid #ccc',
        borderRadius: '8px',
        zIndex: 9999,
        boxShadow: '0 0 15px rgba(0,0,0,0.2)'
      });
      document.body.appendChild(container);
  
      document.getElementById('manual-submit').addEventListener('click', () => {
        const serial = document.getElementById('manual-serial-input').value.trim();
        if (serial) {
          document.body.removeChild(container);
          showAssignmentButtons(serial, db, gearSetSelector, userId);
        }
      });
    });
  }
  
}

function showAssignmentButtons(serial, db, gearSetSelector, userId) {
    const container = document.createElement('div');
    container.id = 'gear-type-buttons';
    container.innerHTML = `
      <p>Assign item (${serial}) to:</p>
      <button data-type="coat">Coat</button>
      <button data-type="pants">Pants</button>
      <button data-type="helmet">Helmet</button>
      <button data-type="boots">Boots</button>
      <button data-type="gloves">Gloves</button>
      <button data-type="hood">Hood</button>
      <button data-type="custom">Custom</button>
    `;
    document.body.appendChild(container);
  
    container.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', async () => {
        const component = button.dataset.type;
        const selectedSetId = gearSetSelector.value;
        const ref = doc(db, 'gearSets', selectedSetId);
        const snap = await getDoc(ref);
        const data = snap.data();
  
        if (["coat", "pants", "helmet", "boots", "gloves", "hood"].includes(component)) {
          await updateDoc(ref, { [component]: serial });
        } else {
          const updatedExtras = Array.isArray(data.extras)
            ? [...data.extras, { label: 'custom', serial }]
            : [{ label: 'custom', serial }];
          await updateDoc(ref, { extras: updatedExtras });
        }
  
        container.remove();
        showFloatingNotice(`Assigned ${serial} to ${component}`, 'green');
  
        // ✅ Refresh gear sets visually
        const gearSetsList = document.getElementById('gear-sets-list');
        if (gearSetsList && typeof loadGearSets === 'function') {
          loadGearSets(userId);  // dynamically re-render gear info
        }
      });
    });
  }
  

export function stopCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
  if (codeReader) codeReader.reset();
  const scannerContainer = document.getElementById('scanner-container');
  if (scannerContainer) scannerContainer.style.display = 'none';
}
