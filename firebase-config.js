import { FIREBASE_API_KEY } from './config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "hello-firey-world.firebaseapp.com",
  projectId: "hello-firey-world",
  storageBucket: "hello-firey-world.appspot.com",
  messagingSenderId: "715346269159",
  appId: "1:715346269159:web:0277309faf6c2ef1506342"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();

export {
  auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  onAuthStateChanged
};
