import { db } from './firebase-config.js';
import { doc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const postHTML = `<div class="post">
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
</div>`

function wyczyscPosty() {
  const postWall = document.getElementById('PostList')
  if (!postWall) return
  postWall.innerHTML = ''
}

async function zaladujPosty(sort, order) {
  let posts = await fetch('http://localhost:3000/posts')
    .then(resp => resp.json())

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


  const lajki = document.querySelectorAll('.btn-like, .btn-like-blue')
  if (!lajki) return
  Array.from(lajki).forEach(lajk => {
    lajk.onclick = () => {
      polajkuj(lajk)
    }
  })
  zapisywaniePostow()
}

async function getAuthor(authorId) {
  const userRef = doc(db, 'users', authorId)
  const user = await getDoc(userRef)
  if (user.exists()) {
    const userData = user.data()
    return {username: userData.username, avatar: userData.photoURL}
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
    .replace('{EMOJI}', (klasa == 'PostList') ? 'bookmark' : 'trash')
    .replace('bookmark', (isSaved) ? 'trash' : 'bookmark')
    .replace('{ARIA}', (klasa == 'PostList') ? 'Save' : 'Unsave')
    .replace('{KONTENT}', kontent)
    .replace('img|', '</br><img class="post-image" src="')
    .replace('|img', '"></img>')


  document.getElementById(klasa).insertAdjacentHTML('afterbegin', kod)
}
const sort = sessionStorage.getItem('sort') ?? 'Rewelacja'
const sortWay = sessionStorage.getItem('sortWay') ?? -1
zaladujPosty(sort, sortWay)

async function wygenerujUUIDPosta() {
  const posts = await fetch('http://localhost:3000/posts')
    .then(resp => resp.json())
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

  fetch('http://localhost:3000/posts', {method: 'POST', body: JSON.stringify(post)})
    .then(response => response.json())
    .then(() => {
      alert('Dodano post!')
      location.reload()
    })
    .catch(error => alert('Błąd:', error))
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
if (sort) sorter.value = sort
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
  const sortType = sessionStorage.getItem('sort') ?? 'Rewelacja'
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
        location.reload()
        localStorage.setItem('saved_posts', JSON.stringify([postId]))
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
          location.reload()
        } else {
          newTable.push(postId)
          localStorage.setItem('saved_posts', JSON.stringify(newTable))
          button.innerHTML = '<i class="fas fa-trash" aria-label="Unsave"></i>'
          alert('Dodano do zapisanych!')
          location.reload()
        }
      }

    }

  })
}

async function zaladujZapisanePosty() {
  const storage = localStorage.getItem('saved_posts')
  if (!storage) return
  const savedPosts = JSON.parse(storage)

  const posts = await fetch('http://localhost:3000/posts')
    .then(resp => resp.json())
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
}

zaladujZapisanePosty()