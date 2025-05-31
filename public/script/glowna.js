import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { auth, storage, db } from './firebase-config.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const postHTML = `<article class="post">
  <div class="post-header">
      <img src="{AWATAR}" alt="Avatar" class="post-avatar">
      <div class="post-userinfo" id="{UID}">
          <span class="post-author">{AUTOR}</span>
          <span class="post-date">{DATA}</span>
      </div>
  </div>
  <div class="post-content">
      <p class="post-text">{KONTENT}</p>
  </div>
  <div class="post-actions">
      <button class="btn-like{B}" type="button" id="{ID}" aria-label="Like"><i class="fas fa-thumbs-up"> {LAJKI}</i>
</button>
      <button class="btn-save"><i class="fas fa-{EMOJI}"aria-label="{ARIA}"></i></button>
  </div>
</article>`

function wyczyscPosty() {
  const postWall = document.getElementById('PostList')
  if (!postWall) return
  postWall.innerHTML = ''
}

async function zaladujPosty(sort, order, query = null, sekcja = null) {
  try {
    const response = await fetch('http://localhost:3000/posts')
    if(!response.ok) throw new Error("Błąd serwera przy ładowaniu postów")
    let posts = await response.json()

    switch (sort) {
      case 'Relewacja':
        posts = posts.sort((a, b) => (b.date / b.lajkujacy.length - a.date / a.lajkujacy.length) * order)
        break;
      case 'Lajki':
        posts = posts.sort((a, b) => (a.lajkujacy.length - b.lajkujacy.length) * order)
        break;
      case 'Data':
        posts = posts.sort((a, b) => (a.date - b.date) * order)
        break;
      default:
        break;
    }

    const autorzy = {}
    await Promise.all(posts.map(async post => {
      autorzy[post.author_id] = await getAuthor(post.author_id)
    }))

    for (const post of posts) {
      await dodajPost(post, 'PostList', autorzy[post.author_id])
    }

    if (query) {
      let index = 0
      posts.forEach(post => {
        if (post.content.includes(query)) {
            index++
            dodajPost(post, sekcja, autorzy[post.author_id])
        }
      });
      if (index == 0) {
        document.getElementById('resultsHeader').textContent = `Ups! Nie znaleźliśmy żadnych wyników.`
      } else {
        document.getElementById('resultsHeader').textContent = `Znalezione wyniki (${index}):`
      }
    }

    const lajki = document.querySelectorAll('.btn-like, .btn-like-blue')
    if (!lajki) return
    Array.from(lajki).forEach(lajk => {
      lajk.onclick = () => {
        polajkuj(lajk)
      }
    })
    zapisywaniePostow()
  } catch(error) {
    console.error('Błąd ładowania postów:')
    document.getElementById('PostList').innerHTML = '<h2>Błąd połączenia z serwerem.</h2>'
  }
}

async function getAuthor(authorId) {
  try{
  const userRef = doc(db, 'users', authorId)
  const user = await getDoc(userRef)
  if (user.exists()) {
    const userData = user.data()
    return {username: userData.username, avatar: userData.photoURL}
  }}catch(error){
    console.warn('Błąd pobierania autora z Firebase, używam danych domyślnych:', error)
  }
  return {username: 'Nieznany użytkownik', avatar: 'img/placeholder.png'}

}

async function dodajPost(post, klasa, autorObj) {
  let avatar = autorObj.avatar
  let autor = autorObj.username
  let data = new Date(post.date).toLocaleDateString()
  let kontent = post.content
  let lajkujacy = []
  const userUID = sessionStorage.getItem('userUID')
  let blue = ""

    if (!post.lajkujacy.includes(userUID)){
      blue=""
    }
    else
    {
      blue="-blue"
    }

  const isSaved = localStorage.getItem('saved_posts')?.includes(post.id) ?? false

  const kod = postHTML
    .replace('{AWATAR}', avatar)
    .replace('{AUTOR}', autor)
    .replace('{DATA}', data)
    .replace('{ID}', post.id)
    .replace('{UID}', post.author_id)
    .replace('{LAJKI}', post.lajkujacy.length)
    .replace('{B}', blue)
    .replace('{EMOJI}', (klasa != 'SavedPostList') ? 'bookmark' : 'trash')
    .replace('bookmark', (isSaved) ? 'trash' : 'bookmark')
    .replace('{ARIA}', (klasa != 'SavedPostList') ? 'Save' : 'Unsave')
    .replace('{KONTENT}', kontent)
    .replace('img|', '</br><img class="post-image" alt="post-image" src="')
    .replace('|img', '"></img>')


  document.getElementById(klasa).insertAdjacentHTML('afterbegin', kod)
}
const sort = sessionStorage.getItem('sort') ?? 'Relewacja'
const sortWay = sessionStorage.getItem('sortWay') ?? -1
zaladujPosty(sort, sortWay)

async function wygenerujUUIDPosta() {
try{
  const response = await fetch('http://localhost:3000/posts')
  const posts = await response.json()
  const uuidPostow = new Set()
  posts.forEach(post => {
    uuidPostow.add(post.id)
  })
  const len = uuidPostow.size + 1
  let uuid
  while (uuidPostow.size < len) {
    uuid = self.crypto.randomUUID()
    uuidPostow.add(uuid)
  }
  return uuid
}catch(error){
    console.log("błąd generowania UUID posta")
  }
}

async function wyslijPosta() {
  const content = document.getElementById('contentInput').value
  if (content.length < 1) return alert('Post nie może być pusty!')
  if (content.length > 301) return alert('Post nie może przekraczać 301 znaków!')

  const uuid = await wygenerujUUIDPosta()
  const post = {
    id: uuid,
    author_id: sessionStorage.getItem('userUID'),
    date: Date.now(),
    content: content,
    lajkujacy: []
  }

try{  const response = await fetch('http://localhost:3000/posts', {method: 'POST', body: JSON.stringify(post)})
  if (!response.ok) {
    throw new Error
  }

  await response.json()
      alert('Dodano post!')
      wyczyscPosty()
      const order = sessionStorage.getItem('sortWay') ?? 1
      const sort = sessionStorage.getItem('sort') ?? 'Relewacja'
      zaladujPosty(sort, order)
    }
    catch(error){
  console.error('Wystąpił błąd przy wysyłaniu posta:', error)
  alert('Nie udało się wysłać posta. Sprawdź połączenie z serwerem lub spróbuj ponownie później.')
    }
}

async function polajkuj(button) {

  const userUID = sessionStorage.getItem('userUID')
  const postID = button.id

  const posts = await fetch('http://localhost:3000/posts')
    .then(resp => resp.json())
  const post = posts.filter(post => post.id == postID)[0]
  if (!post) return alert('Nie udało się zalajkować posta :(')
  let liked = false

  if (!post.lajkujacy.includes(userUID)){
    post.lajkujacy.push(userUID);
    liked = true
  }
  else
  {
    post.lajkujacy.splice(post.lajkujacy.indexOf(userUID));
    liked = false
  }

  fetch('http://localhost:3000/posts/' + postID, { method: 'PUT', body: JSON.stringify(post) })
    .then(response => {
      if (!response.ok) throw new Error("Błąd podczas aktualizacji posta")
      return response.json()
    })
    .catch(error => alert('Błąd: ' + error.message))
}

async function dialogObrazka() {
  document.getElementById('img_dialog').show()
  document.getElementById('img_input').focus()
}

document.getElementById('postForm').onsubmit = (event) => {
  event.preventDefault()
  wyslijPosta()
  let input = document.getElementById('contentInput')
  input.value = "";
}

document.getElementById('addImage').onclick = (event) => {
  event.preventDefault()
  dialogObrazka()
  let input = document.getElementById('img_input')
  input.value = "";
}

document.getElementById('postForm').oninput = () => {
  const count = document.getElementById('contentInput').value.length
  document.getElementById('wordCount').textContent = count + '/301'
}

const sorter = document.getElementById('sorting')

sorter.value = sort
if (sorter) sorter.onchange = (event) => {
  const value = event.target.value
  sessionStorage.setItem('sort', value)
  wyczyscPosty()
  const order = sessionStorage.getItem('sortWay') ?? 1
  zaladujPosty(value, order)
}

const sortingWay = document.getElementById('sortingWay')
if (sortWay == -1) sortingWay.innerHTML = '<i class="fas fa-arrow-up"></i>'
if (sortingWay) sortingWay.onclick = (event) => {
  let target = event.target.closest('button')
  const isAscending = target.innerHTML.includes('arrow-up')
  sessionStorage.setItem('sortWay', isAscending ? 1 : -1)
  wyczyscPosty()
  const sortType = sessionStorage.getItem('sort') ?? 'Relewacja'
  if (isAscending) {
    target.innerHTML = '<i class="fas fa-arrow-down"></i>'
    zaladujPosty(sortType, 1)
  } else {
    target.innerHTML = '<i class="fas fa-arrow-up"></i>'
    zaladujPosty(sortType, -1)
  }
}

function zapisywaniePostow() {
  const saveBtn = document.getElementsByClassName('btn-save')
  if (!saveBtn) return
  Array.from(saveBtn).forEach(btn => {

    btn.onclick = (event) => {
      const post = event.target.closest('.post')
      const button = event.target.closest('.btn-save')
      const postId = Array.from(post.querySelectorAll('.btn-like, .btn-like-blue'))[0].id

      const savedPosts = localStorage.getItem('saved_posts')
      if (!savedPosts) {
        alert('Dodano do zapisanych!')
        localStorage.setItem('saved_posts', JSON.stringify([postId]))
        zaladujZapisanePosty()
      }
      else {
        const newTable = JSON.parse(savedPosts)
        if (newTable.includes(postId)) {
          newTable.splice(newTable.indexOf(postId), 1)
          localStorage.setItem('saved_posts', JSON.stringify(newTable))
          button.innerHTML = '<i class="fas fa-bookmark" aria-label="Save"></i>'

          if (post.parentNode.id == 'SavedPostList') {
            post.remove()
          }

          alert('Usunięto z zapisanych!')
          const sort = sessionStorage.getItem('sort') ?? 'Relewacja'
          const order = sessionStorage.getItem('sortWay') ?? 1
          zaladujPosty(sort, order)
          zaladujZapisanePosty()
        } else {
          newTable.push(postId)
          localStorage.setItem('saved_posts', JSON.stringify(newTable))
          button.innerHTML = '<i class="fas fa-trash" aria-label="Unsave"></i>'
          alert('Dodano do zapisanych!')
          zaladujZapisanePosty()
        }
      }

    }

  })
}

async function zaladujZapisanePosty() {
  const storage = localStorage.getItem('saved_posts')
  if (!storage) return
  const savedPosts = JSON.parse(storage)

  try{const response = await fetch('http://localhost:3000/posts')
  if(!response) throw new Error('Błąd połączenia z serwerem.')
  const posts= await response.json()
  for (const saved of savedPosts) {
    for (const post of posts) {
      if (saved != post.id) continue
      dodajPost(post, 'SavedPostList', await getAuthor(post.author_id))
    }
  }

  const lajki = document.querySelectorAll('.btn-like, .btn-like-blue')
  if (!lajki) return
  Array.from(lajki).forEach(lajk => {
    lajk.onclick = () => {
      polajkuj(lajk)
    }
  })
  zapisywaniePostow()
}catch(error){
    console.error('Wystąpił błąd przy wyświetlaniu zapisanych postów', error)
    document.getElementById('SavedPostList').innerHTML = '<h2>Błąd połączenia z serwerem.</h2>'
}
}

zaladujZapisanePosty()

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
    homeSection.style.display = "none";
    savedSection.style.display = "none"
    profileSection.style.display = "none";
    searchSection.style.display = "block";
    document.getElementById('searchPostList').innerHTML = '';

    const sort = sessionStorage.getItem('sort') ?? 'Relewacja'
    const sortWay = sessionStorage.getItem('sortWay') ?? 1
    zaladujPosty(sort, sortWay, search, 'searchPostList');
  }

  let input = document.getElementById('search_input')
  input.value = "";
}

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

// zarządzanie sekcjami strony
document.addEventListener("DOMContentLoaded", async () => {
  const profileBtn = document.getElementById('profile');
  const homeSection = document.getElementById("homeSection");
  const profileSection = document.getElementById("profileSection");
  const savedSection = document.getElementById("savedSection");
  const profileAvatar = document.getElementById("profileAvatar");
  const searchSection = document.getElementById("searchSection");
  const sectionInStorage = sessionStorage.getItem('section');

  if (!homeSection) return
  if (!profileSection) return
  if (!savedSection) return
  if (!profileSection) return
  if (!searchSection) return

  const currSection = sessionStorage.getItem('section')
  if (!currSection) sessionStorage.setItem('section', 'home')

  function toggleSection(section) {
    profileSection.style.display = (section == 'profile') ? "block" : "none";
    savedSection.style.display = (section == 'saved') ? "block" : "none";
    homeSection.style.display = (section == 'home') ? "block" : "none";
    searchSection.style.display = (section == 'search') ? "block" : "none";
    sessionStorage.setItem('section', section)
  }

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
  profileBtn.addEventListener("click", () => toggleSection('profile'))
  homeBtn.addEventListener("click", () => toggleSection('home'))
  savedBtn.addEventListener("click", () => toggleSection('saved'))

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

window.ondragstart = (event) => {
  if (event.target.tagName == 'IMG') return false
}