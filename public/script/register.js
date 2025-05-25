import {auth,db} from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

function handleShowPassword(element, inputId) {
    const showing = document.getElementById(inputId).type == 'text'
    if (showing) {
        element.style.background = 'url("/public/img/showpassword.png") bottom/cover';
        document.getElementById(inputId).type = 'password'
    }
    else {
        element.style.background = 'url("/public/img/hidepassword.png") bottom/cover';
        document.getElementById(inputId).type = 'text'
    }
}

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
        handleShowPassword(showConfirmPassword, 'confirmpassword')
    }

    form.addEventListener("submit",async (e)=>{
        e.preventDefault();
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if(password !== confirmPassword){
            alert("Hasła się nie zgadzają!");
            return;
        }
        try{
            const userCredential = await createUserWithEmailAndPassword(auth,email,password);
            const user = userCredential.user;

            const placeholderPhotoURL = "https://firebasestorage.googleapis.com/v0/b/projekt-17306.firebasestorage.app/o/placeholder.png?alt=media&token=09239260-343a-4847-bb33-8174c271cf6d"

            await updateProfile(user,{
                displayName: username,
                photoURL:placeholderPhotoURL
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
        }catch(error){
            alert("Błąd:" + error.message);
        }

    })


})