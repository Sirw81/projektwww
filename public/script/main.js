import { auth, storage, db } from './firebase-config.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const currSection = sessionStorage.getItem('section')
if (!currSection) sessionStorage.setItem('section', 'home')

//jak niezalogowany przenosi na login
const pagelink = window.location.pathname
if (!pagelink.endsWith('login.html') && !pagelink.endsWith('register.html')) {
  if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
  }
  //przycisk wyloguj
  const logoutBtn = document.getElementById('logoutButton');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('userUID');
      window.location.href = 'login.html';
    });
  }
}

//zakladka profil i glwona
document.addEventListener("DOMContentLoaded", async () => {
  const profileBtn = document.getElementById('profile');
  const homeSection = document.getElementById("homeSection");
  const profileSection = document.getElementById("profileSection");
  const savedSection = document.getElementById("savedSection");
  const profileAvatar = document.getElementById("profileAvatar");
  const searchSection = document.getElementById("searchSection");

  const sectionInStorage = sessionStorage.getItem('section')

  if (!homeSection) return
  if (!profileSection) return
  if (!savedSection) return
  if (!profileSection) return
  if (!searchSection) return

  homeSection.style.display = "none";
  savedSection.style.display = "none"
  profileSection.style.display = "none";
  searchSection.style.display = "none";
  switch (sectionInStorage) {
    case 'home':
      homeSection.style.display = "block";
      break;
    case 'saved':
      savedSection.style.display = "block";
      break;
    case 'profile':
      profileSection.style.display = "block";
      break;
    default:
      break;
  }

  const userUID = sessionStorage.getItem('userUID');

  if (userUID) {
  const docRef = doc(db, "users", userUID);
  try {
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

      if (sectionInStorage != 'profile') profileSection.style.display = "none";

    } else {
      profileSection.style.display = "none";
    }
  } catch (error) {
    console.error("Błąd pobierania dokumentu:", error);
    alert("Błąd połączenia z firebase lub brak internetu. Spróbuj ponownie później.");
  }
} else {
  profileSection.style.display = "none";
}


  if (profileBtn && homeSection && profileSection && savedSection) {
    profileBtn.addEventListener("click", () => {
      homeSection.style.display = "none";
      savedSection.style.display = "none"
      profileSection.style.display = "block";
      searchSection.style.display = "none";

      sessionStorage.setItem('section', 'profile')
    });
  }

  const homeBtn = document.getElementById('homepage');
  if (homeBtn && homeSection && profileSection && savedSection) {
    homeBtn.addEventListener("click", () => {
      history.pushState({}, '', location.origin);
      profileSection.style.display = "none";
      savedSection.style.display = "none";
      homeSection.style.display = "block";
      searchSection.style.display = "none";

      sessionStorage.setItem('section', 'home')
    });
  }
  const savedBtn = document.getElementById("saved");
  if (savedBtn && homeSection && profileSection && savedSection) {
    savedBtn.addEventListener("click", () => {
      profileSection.style.display = "none";
      savedSection.style.display = "block";
      homeSection.style.display = "none";
      searchSection.style.display = "none";

      sessionStorage.setItem('section', 'saved')
    })
  }
});

//reklamy randomizer
document.addEventListener("DOMContentLoaded", function () {
  const images = [
    "img/ad/01jowisz.png",
    "img/ad/02oguh.png",
    "img/ad/03dokop.png",
    "img/ad/04traf.png",
    "img/ad/05kujawski.png",
    "img/ad/06tis.png",
    "img/ad/07nigdy.png"
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
      if (!navigator.onLine) {
    alert('Brak połączenia z internetem. Sprawdź swoje połączenie i spróbuj ponownie.');
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




const imgdialog = document.getElementById('img_dialog')
if (imgdialog) imgdialog.onsubmit = (event) => {
  let contentinput = document.getElementById('contentInput')

  let img = document.getElementById('img_input')
  if (img.length < 1) {
    event.preventDefault()
    alert('Wpisz coś!')
  } else {
    contentinput.value = contentinput.value+"\nimg\|"+img.value+"\|img\n"
  }

  let imginput = document.getElementById('img_input')
  input.value = "";
}

const closeSearch = document.getElementById('closeSearch')
if (closeSearch) closeSearch.onclick = () => {
  let input = document.getElementById('search_input')
  input.value = "";
  document.getElementById('search_dialog').close()

}

const closeImg = document.getElementById('closeImg')
if (closeImg) closeImg.onclick = () => {
  let input = document.getElementById('img_input')
  input.value = "";
  document.getElementById('img_dialog').close()

}

window.ondragstart = (event) => {
  if (event.target.tagName == 'IMG') return false
}