import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";


  const firebaseConfig = {
    apiKey: "AIzaSyBLcjROtEuBGMfmE5ZTwtBnsTUWPiDMHro",
    authDomain: "projekt-17306.firebaseapp.com",
    projectId: "projekt-17306",
    storageBucket: "projekt-17306.firebasestorage.app",
    messagingSenderId: "569354663637",
    appId: "1:569354663637:web:25100afaabe5748e61945c"
  };

const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


