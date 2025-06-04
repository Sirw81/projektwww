import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { db } from "./firebase-config.js";

const postTemplate = document.querySelector('.post').outerHTML
document.querySelector('.post').remove()

export function wyczyscPosty(sekcja) {
  const postWall = document.getElementById(sekcja)
  if (postWall) postWall.innerHTML = ''
}

function sortujPosty(posty, sort, order) {
    switch (sort) {
      case 'Relewacja':
        return posty.sort((a, b) => (b.date / b.lajkujacy.length - a.date / a.lajkujacy.length) * order)
      case 'Lajki':
        return posty.sort((a, b) => (a.lajkujacy.length - b.lajkujacy.length) * order)
      case 'Data':
        return posty.sort((a, b) => (a.date - b.date) * order)
      default:
        return posty
    }
}

export async function zaladujPosty(sort, order, query = null, sekcja = null) {
  try {
    const response = await fetch('http://localhost:3000/posts')
    if(!response.ok) throw new Error("Błąd serwera przy ładowaniu postów")
    let posts = await response.json()

    posts = sortujPosty(posts, sort, order)

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
      const header = document.getElementById('resultsHeader')
      if (index == 0) {
        header.textContent = `Ups! Nie znaleźliśmy żadnych wyników.`
      } else {
        header.textContent = `Znalezione wyniki (${index}):`
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
  try {
    const userRef = doc(db, 'users', authorId)
    const user = await getDoc(userRef)
    if (user.exists()) {
      const userData = user.data()
      return {username: userData.username, avatar: userData.photoURL}
    }
  } catch (error) {
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

  if (!post.lajkujacy.includes(userUID)) blue = ""
  else blue = "-blue"
  const isSaved = localStorage.getItem('saved_posts')?.includes(post.id) ?? false

  const kod = postTemplate
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
    .replace('style="visibility: hidden;"', '')

  document.getElementById(klasa).insertAdjacentHTML('afterbegin', kod)
}

const sort = sessionStorage.getItem('sort') ?? 'Relewacja'
const sortWay = sessionStorage.getItem('sortWay') ?? -1
zaladujPosty(sort, sortWay)

async function wygenerujUUIDPosta() {
  try {
    const response = await fetch('http://localhost:3000/posts')
    const posts = await response.json()
    const uuidPostow = new Set()
    posts.forEach(post => { uuidPostow.add(post.id) })
    const len = uuidPostow.size + 1

    let uuid
    while (uuidPostow.size < len) {
      uuid = self.crypto.randomUUID()
      uuidPostow.add(uuid)
    }
    return uuid

  } catch(error) {
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

  try {
    const response = await fetch('http://localhost:3000/posts', {method: 'POST', body: JSON.stringify(post)})
    if (!response.ok) throw new Error

    await response.json().then(() => {
      alert('Dodano post!')
      wyczyscPosty('PostList')
      const order = sessionStorage.getItem('sortWay') ?? 1
      const sort = sessionStorage.getItem('sort') ?? 'Relewacja'
      zaladujPosty(sort, order)
    })

  } catch (error) {
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

  if (!post.lajkujacy.includes(userUID)) post.lajkujacy.push(userUID);
  else post.lajkujacy.splice(post.lajkujacy.indexOf(userUID));

  fetch('http://localhost:3000/posts/' + postID, { method: 'PUT', body: JSON.stringify(post) })
    .then(response => {
      if (!response.ok) throw new Error("Błąd podczas aktualizacji posta")
      return response.json()
    })
    .catch(error => alert('Błąd: ' + error.message))

  sessionStorage.setItem('just_liked', true)
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

          if (post.parentNode.id == 'SavedPostList') post.remove()
          const sort = sessionStorage.getItem('sort') ?? 'Relewacja'
          const order = sessionStorage.getItem('sortWay') ?? 1
          zaladujPosty(sort, order)
          zaladujZapisanePosty()
        } else {
          newTable.push(postId)
          localStorage.setItem('saved_posts', JSON.stringify(newTable))
          button.innerHTML = '<i class="fas fa-trash" aria-label="Unsave"></i>'
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
  try {
    const response = await fetch('http://localhost:3000/posts')
    if (!response) throw new Error('Błąd połączenia z serwerem.')
    const posts = await response.json()
    wyczyscPosty('SavedPostList')
    for (const saved of savedPosts) {
      for (const post of posts) {
        if (saved != post.id) continue
        dodajPost(post, 'SavedPostList', await getAuthor(post.author_id))
      }
    }
    const lajki = document.querySelectorAll('.btn-like, .btn-like-blue')
    if (!lajki) return
    Array.from(lajki).forEach(lajk => { lajk.onclick = () => polajkuj(lajk) })
    zapisywaniePostow()
  } catch (error) {
    console.error('Wystąpił błąd przy wyświetlaniu zapisanych postów', error)
    document.getElementById('SavedPostList').innerHTML = '<h2>Błąd połączenia z serwerem.</h2>'
  }
}

zaladujZapisanePosty()

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

const closeImg = document.getElementById('closeImg')
if (closeImg) closeImg.onclick = () => {
  let input = document.getElementById('img_input')
  input.value = "";
  document.getElementById('img_dialog').close()
}