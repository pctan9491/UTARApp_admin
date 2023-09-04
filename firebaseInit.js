import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtSdg0XwU3cePNEn-HVlof8vj_imx0guA",
  authDomain: "utarapp-9f3db.firebaseapp.com",
  projectId: "utarapp-9f3db",
  storageBucket: "utarapp-9f3db.appspot.com",
  messagingSenderId: "331019317153",
  appId: "1:331019317153:web:79d3d098d6d5c3759da5e0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
window.db = getFirestore(app);
