import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

import { showView } from "./ui-utils.js";

const db = getFirestore();

document.getElementById('profile-research')?.addEventListener('change', (e) => {
  const wrapper = document.getElementById('consent-date-wrapper');
  const dateField = document.getElementById('consent-date');

  if (e.target.value === 'Yes') {
    const today = new Date().toISOString().split('T')[0];
    dateField.value = today;
    wrapper.style.display = 'block';
  } else {
    dateField.value = '';
    wrapper.style.display = 'none';
  }
});

document.getElementById('profile-cancel')?.addEventListener('click', () => {
  console.log('Cancel button clicked. Redirecting to main menu.');
  showView('main-menu');
});

export async function loadUserProfile(userId) {
  console.log('Loading user profile for:', userId);
  const profileRef = doc(db, 'profiles', userId);
  console.log('Profile reference:', profileRef.path);
  const profileSnap = await getDoc(profileRef);
  console.log('Profile snapshot:', profileSnap.exists() ? 'exists' : 'does not exist');

  if (profileSnap.exists()) {
    const data = profileSnap.data();
    document.getElementById('profile-first-name').value = data.firstName || '';
    document.getElementById('profile-last-name').value = data.lastName || '';
    document.getElementById('profile-email').value = data.profileEmail || '';
    document.getElementById('profile-ssn').value = data.profileSsn || '';
    document.getElementById('profile-iaff').value = data.profileIaff || '';
    document.getElementById('profile-dob').value = data.profileDob || '';
    document.getElementById('profile-ethnicity').value = data.profileRaceEthnicity || '';
    document.getElementById('profile-career-start').value = data.profileCareerStart || '';
    document.getElementById('profile-shift').value = data.profileShiftSchedule || '';
    document.getElementById('consent-date').value = data.consentDate || '';
    document.getElementById('profile-gender').value = data.gender || '';
    document.getElementById('profile-tobacco').value = data.tobaccoUse || '';
    document.getElementById('profile-research').value = data.profileResearchConsent || '';
    document.getElementById('profile-email-notify').value = data.emailNotify || '';

    const initials = (data.firstName?.[0] || '') + (data.lastName?.[0] || '');
    document.getElementById('avatar-placeholder').textContent = initials.toUpperCase();
  
    const avatar = document.getElementById('avatar-placeholder');
    if (initials.trim()) {
      avatar.style.display = 'flex';
    } else {
      avatar.style.display = 'none';
    }
  }
}

export async function saveProfile(userId) {
  const profileRef = doc(db, 'profiles', userId);

  const data = {
    firstName: document.getElementById('profile-first-name').value.trim(),
    lastName: document.getElementById('profile-last-name').value.trim(),
    profileEmail: document.getElementById('profile-email').value.trim(),
    profileSsn: document.getElementById('profile-ssn').value.trim(),
    profileIaff: document.getElementById('profile-iaff').value.trim(),
    profileDob: document.getElementById('profile-dob').value.trim(),
    gender: document.getElementById('profile-gender')?.value || '',
    profileRaceEthnicity: document.getElementById('profile-ethnicity').value.trim(),
    profileCareerStart: document.getElementById('profile-career-start').value.trim(),
    profileShiftSchedule: document.getElementById('profile-shift').value.trim(),
    tobaccoUse: document.getElementById('profile-tobacco')?.value || '',
    profileResearchConsent: document.getElementById('profile-research')?.value || '',
    profileResearchConsentDate: document.getElementById('consent-date').value.trim(),
    consentDate: document.getElementById('consent-date').value || null,
    emailNotify: document.getElementById('profile-email-notify')?.value || ''
  };

  try {
    await setDoc(profileRef, data, { merge: true });
    console.log('✅ Profile saved.');
    showView('main-menu');
  } catch (err) {
    console.error('❌ Error saving profile:', err);
  }
}