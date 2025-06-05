import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, updateProfile }
from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js'
import { doc, getDoc, setDoc }
from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js'
import { handleShowPassword } from './auth.js'

document.addEventListener("DOMContentLoaded",() =>{

  const form = document.getElementById("registerForm");
  const showPassword = document.getElementById("showPassword");
  const showConfirmPassword = document.getElementById("showConfirmPassword");

  showPassword.onclick = (event) => {
    event.preventDefault()
    handleShowPassword(showPassword, 'password')
  }
  showConfirmPassword.onclick = (event) => {
    event.preventDefault()
    handleShowPassword(showConfirmPassword, 'confirmPassword')
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) return alert("Hasła się nie zgadzają!");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth,email,password);
      const user = userCredential.user;
      const placeholderPhotoURL = "https://firebasestorage.googleapis.com/v0/b/projekt-17306.firebasestorage.app/o/placeholder.png?alt=media&token=09239260-343a-4847-bb33-8174c271cf6d"

      await updateProfile(user, {
        displayName: username,
        photoURL: placeholderPhotoURL
      });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username: username,
        email: email,
        photoURL: placeholderPhotoURL,
        createdAt: new Date()
      });

      alert("Rejestracja zakończona sukcesem!");
      window.location.href = 'login.html';
    } catch(error) {
      if (error.message.includes('invalid-email')) {
        alert('Podałeś nieprawidłowy email.')
      } else if (error.message.includes('weak-password')) {
        alert('Hasło powinno mieć co najmniej 6 znaków.')
      } else {
        alert('Nie można się zarejestrować. Błąd serwera: ' + error.message)
      }
    }
  })
})