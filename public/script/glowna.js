import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { auth, storage, db } from './firebase-config.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { wyczyscPosty, zaladujPosty } from "./posty.js";

const homeSection = document.getElementById("homeSection");
const profileSection = document.getElementById("profileSection");
const savedSection = document.getElementById("savedSection");
const searchSection = document.getElementById("searchSection");

const sorter = document.getElementById('sorting')
const sort = sessionStorage.getItem('sort') ?? 'Relewacja'
const sortWay = sessionStorage.getItem('sortWay') ?? -1

if (location.search) {
  toggleSection('search')
  zaladujPosty(sort, sortWay, location.search.replace('?search=', ''), 'searchPostList')
}

sorter.value = sort
if (sorter) sorter.onchange = (event) => {
  const value = event.target.value
  sessionStorage.setItem('sort', value)
  wyczyscPosty('PostList')
  const order = sessionStorage.getItem('sortWay') ?? 1
  zaladujPosty(value, order)
}

const sortingWay = document.getElementById('sortingWay')
if (sortWay == -1) sortingWay.innerHTML = '<i class="fas fa-arrow-up"></i>'
if (sortingWay) sortingWay.onclick = (event) => {
  let target = event.target.closest('button')
  const isAscending = target.innerHTML.includes('arrow-up')
  sessionStorage.setItem('sortWay', isAscending ? 1 : -1)
  wyczyscPosty('PostList')
  const sortType = sessionStorage.getItem('sort') ?? 'Relewacja'
  if (isAscending) {
    target.innerHTML = '<i class="fas fa-arrow-down"></i>'
    zaladujPosty(sortType, 1)
  } else {
    target.innerHTML = '<i class="fas fa-arrow-up"></i>'
    zaladujPosty(sortType, -1)
  }
}

// dialog wyszukiwania
document.getElementById('search').onclick = () => {
  document.getElementById('search_dialog').show()
  document.getElementById('search_input').focus()
}

document.getElementById('search_dialog').onsubmit = (event) => {
  const search = document.getElementById('search_input').value
  if (search.length < 1) {
    event.preventDefault()
    alert('Wyszukaj coś!')
  } else {
    history.pushState({}, '', '?search=' + encodeURIComponent(search));
    toggleSection('search')
    document.getElementById('searchPostList').innerHTML = '';

    const sort = sessionStorage.getItem('sort') ?? 'Relewacja'
    const sortWay = sessionStorage.getItem('sortWay') ?? 1
    zaladujPosty(sort, sortWay, search, 'searchPostList');
  }

  let input = document.getElementById('search_input')
  input.value = "";
}

const closeSearch = document.getElementById('closeSearch')
if (closeSearch) closeSearch.onclick = () => {
  let input = document.getElementById('search_input')
  input.value = "";
  document.getElementById('search_dialog').close()

}

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

const currSection = sessionStorage.getItem('section')
if (!currSection) sessionStorage.setItem('section', 'home')

function toggleSection(section) {
  if (profileSection) profileSection.style.display = (section == 'profile') ? "block" : "none";
  if (savedSection) savedSection.style.display = (section == 'saved') ? "block" : "none";
  if (homeSection) homeSection.style.display = (section == 'home') ? "block" : "none";
  if (searchSection) searchSection.style.display = (section == 'search') ? "block" : "none";
  sessionStorage.setItem('section', section)
}

// zarządzanie sekcjami strony
document.addEventListener("DOMContentLoaded", async () => {
  const profileBtn = document.getElementById('profile');
  const profileAvatar = document.getElementById("profileAvatar");
  const sectionInStorage = sessionStorage.getItem('section');

  toggleSection(sectionInStorage)

  // sekcja profilu
  const userUID = sessionStorage.getItem('userUID');
  if (userUID) {
    try {
      const docRef = doc(db, "users", userUID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        profileAvatar.src = userData.photoURL || "img/placeholder.png";
        const avatar = document.getElementById('avatar');
        if (avatar) avatar.src = userData.photoURL || "img/placeholder.png";
        profileSection.querySelector('p:nth-of-type(1)').textContent = `Nazwa: ${userData.username || 'Brak nazwy'}`;
        profileSection.querySelector('p:nth-of-type(2)').textContent = `Email: ${userData.email || 'Brak email'}`;
      } else {
        profileSection.style.display = "none";
      }
    } catch (error) {
      console.error("Błąd pobierania dokumentu:", error);
      alert("Błąd połączenia z firebase lub brak internetu. Spróbuj ponownie później.");
    }
  }

  // przyciski menu głównego
  const savedBtn = document.getElementById("saved");
  const homeBtn = document.getElementById('homepage');
  profileBtn.addEventListener("click", () => {
    location.search = ''
    toggleSection('profile')
  })
  homeBtn.addEventListener("click", () => {
    location.search = ''
    toggleSection('home')
  })
  savedBtn.addEventListener("click", () => {
    location.search = ''
    toggleSection('saved')
  })

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
  if (adImage) adImage.src = selected;
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
      avatarElems.forEach(img => { if (img) img.src = downloadURL; });

      alert('Avatar został zaktualizowany!');
    } catch (error) {
      alert('Błąd podczas uploadu avatara: ' + error.message);
    }
  });
});

window.ondragstart = (event) => {
  if (event.target.tagName == 'IMG') return false
}