import { db } from './firebase-config.js';
import { doc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const postHTML = `<div class="post">
  <div class="post-header">
      <img src="{AWATAR}" alt="Avatar" class="post-avatar">
      <div class="post-userinfo">
          <span class="post-author">{AUTOR}</span>
          <span class="post-date">{DATA}</span>
      </div>
  </div>
  <div class="post-content">
      <p class="post-text">{KONTENT}</br>ID postu: {ID}</p>
  </div>
  <div class="post-actions">
      <button class="btn-like" type="button" id="{ID}"><i class="fas fa-thumbs-up"> {LAJKI}</i>
</button>
      <button class="btn-save"><i class="fas fa-bookmark"></i></button>
  </div>
</div>`

// <p class="post-text">{KONTENT}</p>
// <img src="img/placeholder.png" alt="Post image" class="post-image">

async function zaladujPosty() {
  const posts = await fetch('http://localhost:3000/posts')
    .then(resp => resp.json())
  await Promise.all(posts.map(post => dodajPost(post)));

  const lajki = document.getElementsByClassName('btn-like')
  if (!lajki) return
  Array.from(lajki).forEach(lajk => {
    lajk.onclick = () => {
      polajkuj(lajk)
    }
  })
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

async function dodajPost(post) {
  let authorObject = await getAuthor(post.author_id)
  let avatar = authorObject.avatar
  let autor = authorObject.username
  let data = new Date(post.date).toLocaleDateString()
  let kontent = post.content
  let lajkujacy = []
  const kod = postHTML
    .replace('{AWATAR}', avatar)
    .replace('{AUTOR}', autor)
    .replace('{DATA}', data)
    .replace('{KONTENT}', kontent)
    .replace('{ID}', post.id)
    .replace('{LAJKI}', post.lajkujacy.length)
  document.getElementById('PostList').insertAdjacentHTML('afterbegin', kod)
}

zaladujPosty()

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
    author_id: localStorage.getItem('userUID'),
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

async function polajkuj(post) {

    console.log("lajk");
  if (!post.lajkujacy.includes(authorObject.username)){
    post.lajkujacy.push(authorObject.username);
  }
  else
  {
    post.lajkujacy.splice(post.lajkujacy.indexOf(userUID));
  }

  fetch('http://localhost:3000/posts/' + postID, { method: 'PUT', body: JSON.stringify(post) })
    .then(response => {
      if (!response.ok) throw new Error("Błąd podczas aktualizacji posta")
      return response.json()
    })
    .then(() => {
    })
    .catch(error => alert('Błąd: ' + error.message))
}

document.getElementById('postForm').onsubmit = (event) => {
  event.preventDefault()
  wyslijPosta()
}

//jak to ogarnac???
document.getElementById('lajk').onsubmit = (event) => {
  event.preventDefault()
  polajkuj(postid)
}

document.getElementById('postForm').oninput = () => {
  const count = document.getElementById('contentInput').value.length
  document.getElementById('wordCount').textContent = count + '/301'
}

// const autorzyny = ['Lech Wałęsa', 'Andrzej Duda', 'Jarosław Kaczyński', 'Donald Tusk', 'Radosław Sikorski', 'Sławomir Mentzen', 'Maciej Maciak']
// function dodajPost(post) {
//   const autorzyna = autorzyny[Math.floor(Math.random() * autorzyny.length)]
//   const data = new Date(Date.now() - Math.round((Math.random() * 100000000000))).toLocaleString('fr-FR')
//   const kod = kodHTML.replace('{AUTOR}', autorzyna).replace('{DATA}', data).replace('{KONTENT}', post.body)
//   document.getElementById('PostList').insertAdjacentHTML('afterbegin', kod)
// }

// async function wygenerujPosty() {
//   const ids = new Set()
//   const posts = []
//   while (ids.size < 10) {
//     const random = Math.round(Math.random() * 99 + 1)
//     ids.add(random)
//   }

//   const promises = Array.from(ids).map(id =>
//     fetch("https://jsonplaceholder.typicode.com/posts/" + id)
//       .then(response => response.json())
//   )
//   const results = await Promise.all(promises)
//   posts.push(...results)
//   posts.forEach(post => {
//     dodajPost(post)
//   });

//   // po dodaniu losowych postów, wsparcie dla zapisanych postów
//   const saveButtons = document.getElementsByClassName('btn-save')
//   Array.from(saveButtons).forEach(element => {
//     element.onclick = (event) => {
//       const post = event.srcElement.parentNode.parentNode
//       const author = post.querySelector('.post-author').textContent
//       const date = post.querySelector('.post-date').textContent
//       const text = post.querySelector('.post-text').textContent
//       const avatar = post.querySelector('.post-avatar').src



//       const jsonObject = [author, date, text]
//       const savedPosts = JSON.parse(localStorage.getItem('saved_posts'))
//       let zawiera = false
//       if (savedPosts) {
//         const strCurrPost = JSON.stringify(jsonObject)

//         // sprawdz czy stringified savedposts zawiera stringified posta
//         Array.from(savedPosts).forEach(savedPost => {
//           if (JSON.stringify(savedPost) == strCurrPost) {
//             zawiera = true
//           }
//         })

//         // nie zawiera, dodaj do listy

//         if (!zawiera) {
//           const newStorage = savedPosts
//           newStorage.push(jsonObject)
//           localStorage.setItem('saved_posts', JSON.stringify(newStorage))
//         }

//       // zrob nowa liste
//       } else {
//         localStorage.setItem('saved_posts', JSON.stringify([jsonObject]))
//       }

//     }
//   });
// }

//wygenerujPosty()