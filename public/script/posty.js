import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { toggleSection } from "./glowna.js"

const newSavedPosts = localStorage.getItem('saved_posts')
const localUserUID = sessionStorage.getItem('userUID')
// inicjalizacja strony
let authors
loadPosts(post => newSavedPosts?.includes(post?.id), 'SavedPostList')
loadPosts(post => post, 'PostList')

const postTemplate = document.querySelector('.post').innerHTML
document.querySelector('.post').remove()

// linki zawierające ?search, inicjalizacja sekcji wyszukiwania
if (location.search) {
  clearSection('SearchPostList')
  const query = location.search.replace('?search=', '')
  loadPosts(post => post?.content.includes(query), 'SearchPostList')
}

// mapowanie autorów oddzielnie od generacji postów, optymalizacja
async function getAuthors() {
  const posts = await getPosts(post => post)
  if (!posts) return
  const authors = {}
  await Promise.all(posts.map(async post => {
    authors[post.author_id] = await getAuthor(post.author_id)
  }))
  return authors
}

async function getPosts(predicate = () => true) {
  const response = await fetch('http://localhost:3000/posts').catch(() => {return null})
  if (!response) return null
  const posts = await response.json()
  return posts.filter(predicate)
}

export function getSort() {
  return sessionStorage.getItem('sort') ?? 'Relewacja'
}

// 1 = rosnąco
export function getSortOrder() {
  return sessionStorage.getItem('sortOrder') ?? 1
}

function sortPosts(posts, sort, sortOrder) {
  posts = posts.shuffle() // randomizacja kolejności postów przed sortowaniem
  switch (sort) {
    case 'Relewacja':
      return posts.sort((a, b) => (a.date * a.lajkujacy.length - b.date * b.lajkujacy.length) * sortOrder)
    case 'Lajki':
      return posts.sort((a, b) => (a.lajkujacy.length - b.lajkujacy.length) * sortOrder)
    case 'Data':
      return posts.sort((a, b) => (a.date - b.date) * sortOrder)
    default:
      return posts
  }
}

export async function loadPosts(predicate, section) {
  if (!authors) authors = await getAuthors()
  let posts = await getPosts(predicate)
  const header = document.getElementById(section).querySelector('h2')
  if (!posts && section != 'SearchPostList') {
    header.textContent = 'Nie mogliśmy załadować postów, spróbuj później.'
    return
  }
  if (header) header.style.display = 'none'
  posts = sortPosts(posts, getSort(), getSortOrder())
  for (const post of posts) await addPost(post, section)

  if (section == 'SearchPostList') {
    const wiadomosc = posts.length == 0 ? `Nie znaleziono wyników.`
      : `Znalezionych wyników (${posts.length}):`
    document.getElementById('resultsHeader').textContent = wiadomosc
  }
}

async function getAuthor(authorId) {
  try {
    const userRef = doc(db, 'users', authorId)
    const user = await getDoc(userRef)
    return {
      username: user.data()?.username ?? 'Nieznany użytkownik',
      avatar: user.data()?.photoURL ?? 'img/placeholder.png'
    }
  } catch (error) {
    console.warn('Błąd pobierania autora z Firebase, używam danych domyślnych:', error)
    return {username: 'Nieznany użytkownik', avatar: 'img/placeholder.png'}
  }
}

async function addPost(post, section, createdNow = false) {
  const container = document.getElementById(section)
  const author = authors[post.author_id]
  const isLikeBlue = post.lajkujacy.includes(localUserUID) ? '-blue' : ''
  const savedIcon = localStorage.getItem('saved_posts')?.includes(post.id) ? 'trash' : 'bookmark'
  document.getElementById('wordCount').textContent = '0/301'

  const newPost = document.createElement('article')
  newPost.className = 'post'
  // toLocateString(undefined) - przeglądarka używa swego języka
  const data = new Date(post.date).toLocaleString(undefined,
    {dateStyle: 'short', timeStyle: 'short'}
  )
  const postContent = postTemplate
    .replace('{AWATAR}', author.avatar)
    .replace('{AUTOR}', author.username)
    .replace('{DATA}', data)
    .replace('{KONTENT}', post.content)
    .replace('{LAJKI}', post.lajkujacy.length)
    .replace('img|', '</br><img class="post-image" alt="Obrazek posta - nie załadował się." src="')
    .replace('|img', '"></img>')
    .replace('{B}', isLikeBlue)
    .replace('{EMOJI}', savedIcon)
    .replace('{ID}', post.id)
  newPost.innerHTML = postContent

  const likeButton = newPost.querySelector('.btn-like-blue, .btn-like')
  const saveButton = newPost.querySelector('.btn-save')
  likeButton.onclick = () => likePost(section, post)
  saveButton.onclick = () => savePost(section, post)

  // dla nowych postów
  if (!createdNow) container.appendChild(newPost)
  else {
    newPost.classList.add('nowyPost')
    container.insertAdjacentElement('afterbegin', newPost)
    setTimeout(() => newPost.classList.remove('nowyPost'), 1000)
  }
}


function updateLikeButton(section, post) {
  // obecna sekcja
  const postObject = document.getElementById(section).querySelector(`[id='${post.id}']`)
  const likeButton = postObject.querySelector('.btn-like-blue, .btn-like')
  const isLiked = post.lajkujacy.includes(localUserUID)
  const className = likeButton.className
  if (isLiked) likeButton.className = className.replace('btn-like', 'btn-like-blue')
  else likeButton.className = className.replace('btn-like-blue', 'btn-like')
  likeButton.querySelector('i').textContent = ' ' + post.lajkujacy.length

  updateOtherSections(section)
}

function updateOtherSections(section) {
  if (section != 'SavedPostList') {
    clearSection('SavedPostList')
    const newSavedPosts = localStorage.getItem('saved_posts')
    loadPosts(post => newSavedPosts?.includes(post?.id), 'SavedPostList')
  }
  if (section != 'PostList') {
    clearSection('PostList')
    loadPosts(post => post, 'PostList')
  }
}

function updateSaveButton(section, post) {
  // obecna sekcja
  const postObject = document.getElementById(section).querySelector(`[id='${post.id}']`).parentElement
  const saveButton = postObject.querySelector('.btn-save')
  const isSaved = localStorage.getItem('saved_posts')?.includes(post.id)
  let toReplace
  if (saveButton.querySelector('i').classList.contains('fa-trash')) toReplace = 'fa-trash'
  else toReplace = 'fa-bookmark'
  saveButton.querySelector('i').classList.replace(toReplace, isSaved ? 'fa-trash' : 'fa-bookmark')

  // usuń post jeśli przeglądasz zapisane
  if (section == 'SavedPostList') postObject.remove()

  updateOtherSections(section)
}

function likePost(section, post) {
  if (post.lajkujacy.includes(localUserUID)) post.lajkujacy.splice(post.lajkujacy.indexOf(localUserUID))
  else post.lajkujacy.push(localUserUID)

  fetch('http://localhost:3000/posts/' + post.id, { method: 'PUT', body: JSON.stringify(post) })
    .then(response => {
      if (!response.ok) throw new Error("Błąd podczas aktualizacji posta")
      return response.json()
    })
    .then(() => updateLikeButton(section, post))
    .catch(error => alert('Błąd: ' + error.message))
}

function savePost(section, post) {
  const savedPosts = localStorage.getItem('saved_posts')
  if (!savedPosts) return localStorage.setItem('saved_posts', JSON.stringify([post.id]))
  const newTable = JSON.parse(savedPosts)
  if (newTable.includes(post.id)) {
    newTable.splice(newTable.indexOf(post.id), 1)
    localStorage.setItem('saved_posts', JSON.stringify(newTable))
  } else {
    newTable.push(post.id)
    localStorage.setItem('saved_posts', JSON.stringify(newTable))
  }
  updateSaveButton(section, post)
}

export function clearSection(section) {
  const postWall = document.getElementById(section)
  if (postWall) postWall.innerHTML = ''
}

// wyszukiwarka postów
document.getElementById('search_dialog').onsubmit = (event) => {
  const query = document.getElementById('search_input').value
  if (query.length < 1) {
    event.preventDefault()
    alert('Wyszukaj coś!')
  } else {
    history.pushState({}, '', '?search=' + encodeURIComponent(query));
    toggleSection('search')
    clearSection('SearchPostList')
    loadPosts(post => post?.content.includes(query), 'SearchPostList')
  }
  let input = document.getElementById('search_input')
  input.value = "";
}

// dodawanie obrazu do posta
document.getElementById('addImage').onclick = (event) => {
  event.preventDefault()
  dialogObrazka()
  let input = document.getElementById('img_input')
  input.value = "";
}

async function dialogObrazka() {
  document.getElementById('img_dialog').show()
  document.getElementById('img_input').focus()
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
    document.getElementById('wordCount').textContent = contentinput.value.length + '/301'
  }
}

const closeImg = document.getElementById('closeImg')
if (closeImg) closeImg.onclick = () => {
  let input = document.getElementById('img_input')
  input.value = "";
  document.getElementById('img_dialog').close()
}

// dodawanie postów
document.getElementById('postForm').onsubmit = (event) => {
  event.preventDefault()
  sendPost()
  let input = document.getElementById('contentInput')
  input.value = "";
}

document.getElementById('postForm').oninput = () => {
  const count = document.getElementById('contentInput').value.length
  document.getElementById('wordCount').textContent = count + '/301'
}

async function sendPost() {
  const content = document.getElementById('contentInput').value
  if (content.length < 1) return alert('Post nie może być pusty!')
  if (content.length > 301) return alert('Post nie może przekraczać 301 znaków!')

  const uuid = await generatePostUUID()
  const post = {
    id: uuid,
    author_id: localUserUID,
    date: Date.now(),
    content: content,
    lajkujacy: []
  }

  try {
    const response = await fetch('http://localhost:3000/posts', {method: 'POST', body: JSON.stringify(post)})
    if (!response.ok) throw new Error

    await response.json().then(() => {
      addPost(post, 'PostList', true)
    })

  } catch (error) {
    console.error('Wystąpił błąd przy wysyłaniu posta:', error)
    alert('Nie udało się wysłać posta. Sprawdź połączenie z serwerem lub spróbuj ponownie później.')
  }
}

// randomizacja tablicy
Array.prototype.shuffle = function () {
  return this.sort(() => Math.random() - 0.5)
}

// deterministyczne uuid, brak duplikatów
async function generatePostUUID() {
  try {
    const response = await fetch('http://localhost:3000/posts')
    const posts = await response.json()
    const length = posts.length
    const bytes = new TextEncoder().encode(length)
    const uuid = await crypto.subtle.digest("SHA-256", bytes)
    const tablica = Array.from(new Uint8Array(uuid))
    const hex = tablica.map(b => b.toString(16)).join('')
    return hex
  } catch(error) {
    console.log("błąd generowania UUID posta")
  }
}