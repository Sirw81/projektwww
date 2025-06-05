import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword }
from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js'
import { handleShowPassword } from './auth.js';

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("loginForm");
  const showPassword = document.getElementById("showPassword");
  const isDevMode = false //zmienic na true by ominąć firebase email dev@user.com hasło:dev123

  showPassword.onclick = (event) => {
    event.preventDefault()
    handleShowPassword(showPassword, 'password')
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (isDevMode) {

      if (email === "dev@user.com" && password === "dev123") {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userUID', 'dev-uid-123');
        window.location.href = 'index.html';
      } else {
        alert("Nieprawidłowe dane (dev mode)");
      }
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userUID', user.uid);
        window.location.href = 'index.html';
      } catch (error) {
        if (error.message.includes('invalid-login-credentials')) {
          alert('Podałeś nieprawidłowe dane logowania.')
        } else {
          alert('Nie można się zalogować. Błąd serwera: ' + error.message)
        }
      }
    }
  });
});