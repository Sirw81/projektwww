import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const showPassword = document.getElementById("showPassword");

  showPassword.onclick = (event) => {
    event.preventDefault()
    const showing = document.getElementById('password').type == 'text'
    if (showing) {
      showPassword.style.background = 'url("/public/img/showpassword.png") bottom/cover';
      document.getElementById('password').type = 'password'
    }
    else {
      showPassword.style.background = 'url("/public/img/hidepassword.png") bottom/cover';
      document.getElementById('password').type = 'text'
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userUID', user.uid);

      window.location.href = 'index.html';
    } catch (error) {
      alert("Błąd logowania: " + error.message);
    }
  });
});
