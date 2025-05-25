import { auth, storage, db } from './firebase-config.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

//jak niezalogowany przenosi na login
if (window.location.pathname.endsWith('index.html')) {
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

//zmiana dark/light
document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("theme-toggle");
  const body = document.body;
  const logo = document.getElementById("logo");

  const savedTheme = localStorage.getItem("theme");
  const isLight = savedTheme === "light";

  if (isLight) {
    body.classList.add("light-mode");
    if (logo) logo.src = "img/logo_lightmode.svg";
  } else {
    if (logo) logo.src = "img/logo_darkmode.svg";
  }

  if (toggleBtn) {
    toggleBtn.textContent = isLight ? "MOTYW: JASNY" : "MOTYW: CIEMNY";

    toggleBtn.addEventListener("click", () => {
      const isNowLight = body.classList.toggle("light-mode");

      if (logo) {
        logo.src = isNowLight ? "img/logo_lightmode.svg" : "img/logo_darkmode.svg";
      }

      toggleBtn.textContent = isNowLight
        ? "MOTYW: JASNY"
        : "MOTYW: CIEMNY";

      localStorage.setItem("theme", isNowLight ? "light" : "dark");
    });
  }
});

const sharePostBtn = document.getElementById('sharePost');
if (sharePostBtn) {
  sharePostBtn.onclick = (event) => {

  }
}

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

// posty z jsonplaceholder.com, fetch API

const kodHTML = `<div class="post">
  <div class="post-header">
      <img src="img/placeholder.png" alt="Avatar" class="post-avatar">
      <div class="post-userinfo">
          <span class="post-author">{AUTOR}</span>
          <span class="post-date">{DATA}</span>
      </div>
  </div>
  <div class="post-content">
      <p class="post-text">{KONTENT}</p>
      <img src="img/placeholder.png" alt="Post image" class="post-image">
  </div>
  <div class="post-actions">
      <button class="btn-like">Like</button>
      <button class="btn-save">Zapisz</button>
  </div>
</div>`

const autorzyny = ['Lech Wałęsa', 'Andrzej Duda', 'Jarosław Kaczyński', 'Donald Tusk', 'Radosław Sikorski', 'Sławomir Mentzen', 'Maciej Maciak']
function dodajPost(post) {
  const autorzyna = autorzyny[Math.floor(Math.random() * autorzyny.length)]
  const data = new Date(Date.now() - Math.round((Math.random() * 100000000000))).toLocaleString('fr-FR')
  const kod = kodHTML.replace('{AUTOR}', autorzyna).replace('{DATA}', data).replace('{KONTENT}', post.body)
  document.getElementById('PostList').insertAdjacentHTML('afterbegin', kod)
}

async function znajdzPosty() {
  const ids = new Set()
  const posts = []
  while (ids.size < 10) {
    const random = Math.round(Math.random() * 100)
    ids.add(random)
  }

  const promises = Array.from(ids).map(id =>
    fetch("https://jsonplaceholder.typicode.com/posts/" + id)
      .then(response => response.json())
  )
  const results = await Promise.all(promises)
  posts.push(...results)
  posts.forEach(post => {
    dodajPost(post)
  });
}

znajdzPosty()