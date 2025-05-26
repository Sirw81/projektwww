import { auth, storage, db } from './firebase-config.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

//jak niezalogowany przenosi na login
const pagelink = window.location.pathname
if (!pagelink.endsWith('login.html') && !pagelink.endsWith('register.html')) {
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
  }
  //przycisk wyloguj
  const logoutBtn = document.getElementById('logoutButton');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('isLoggedIn');
      window.location.href = 'login.html';
    });
  }
}

//zakladka profil i glwona
document.addEventListener("DOMContentLoaded", async () => {
  const profileBtn = document.getElementById('profile');
  const homeSection = document.getElementById("homeSection");
  const profileSection = document.getElementById("profileSection");
  const profileAvatar = document.getElementById("profileAvatar");

  const userUID = localStorage.getItem('userUID');

  if (userUID) {
    const docRef = doc(db, "users", userUID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();

      profileAvatar.src = userData.photoURL || "img/placeholder.png";
      const avatar = document.getElementById('avatar');
if (avatar) {
  avatar.src = userData.photoURL || "img/placeholder.png";
}
      profileSection.querySelector('p:nth-of-type(1)').textContent = `Nazwa: ${userData.username || 'Brak nazwy'}`;
      profileSection.querySelector('p:nth-of-type(2)').textContent = `Email: ${userData.email || 'Brak email'}`;

      profileSection.style.display = "none";
    } else {
      profileSection.style.display = "none";
    }
  } else {
    profileSection.style.display = "none";
  }

  if (profileBtn && homeSection && profileSection) {
    profileBtn.addEventListener("click", () => {
      homeSection.style.display = "none";
      profileSection.style.display = "block";
    });
  }

  const homeBtn = document.getElementById('homepage');
  if (homeBtn && homeSection && profileSection) {
    homeBtn.addEventListener("click", () => {
      profileSection.style.display = "none";
      homeSection.style.display = "block";
    });
  }
});

//reklamy randomizer
document.addEventListener("DOMContentLoaded", function () {
  const images = [
    "img/ad/01jowisz.png",
    "img/ad/02oguh.png",
    "img/ad/03dokop.png",
    "img/ad/04traf.png",
  ];
  const random = Math.floor(Math.random() * images.length);
  const selected = images[random];
  const adImage = document.getElementById("ad");
  if (adImage) {
    adImage.src = selected;
  }
});

//upload avatara
document.addEventListener("DOMContentLoaded", () => {
  const uploadBtn = document.getElementById('uploadAvatarBtn');
  const fileInput = document.getElementById('avatarUpload');

  if (!uploadBtn || !fileInput) return;

  uploadBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
      alert('Wybierz plik avatara!');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert('Musisz być zalogowany, aby zmienić avatar.');
      return;
    }

    try {
      const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);

      const downloadURL = await getDownloadURL(storageRef);

      await updateProfile(user, { photoURL: downloadURL });

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { photoURL: downloadURL });

      const avatarElems = [document.getElementById('avatar'), document.getElementById('profileAvatar')];
      avatarElems.forEach(img => {
        if (img) img.src = downloadURL;
      });

      alert('Avatar został zaktualizowany!');
    } catch (error) {
      alert('Błąd podczas uploadu avatara: ' + error.message);
    }
  });
});





// przyciski nawigacyjne
document.getElementById('saved').onclick = () => location.href = location.origin + '/saved.html'
document.getElementById('homepage').onclick = () => location.href = location.origin

// dialog wyszukiwania
document.getElementById('search').onclick = () => {
  document.getElementById('search_dialog').show()
}

document.getElementById('search_dialog').onsubmit = (event) => {
  const search = document.getElementById('search_input').value
  if (search.length < 1) {
    event.preventDefault()
    alert('Wyszukaj coś!')
  } else {
    location.href = location.origin + '/results.html?search=' + search
  }
}

document.getElementById('closeSearch').onclick = () => {
  document.getElementById('search_dialog').close()
}