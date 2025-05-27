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
      <p class="post-text">{KONTENT}</p>
  </div>
  <div class="post-actions">
      <button class="btn-like"><i class="fas fa-thumbs-up"></i></button>
      <button class="btn-save"><i class="fas fa-bookmark"></i></button>
  </div>
</div>`

// <p class="post-text">{KONTENT}</p>
// <img src="img/placeholder.png" alt="Post image" class="post-image">

async function zaladujPosty() {
  const posts = await fetch('http://localhost:3000/posts')
    .then(resp => resp.json())
  const query = location.search.split('?search=')[1]
  let index = 0
  posts.forEach(post => {
    if (post.content.includes(query)) {
        index++
        dodajPost(post)
    }
  });
  if (index == 0) {
    document.getElementById('resultsHeader').textContent = `Ups! Nie znaleźliśmy żadnych wyników.`
  } else {
    document.getElementById('resultsHeader').textContent = `Znalezione wyniki (${index}):`
  }
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
  const kod = postHTML
    .replace('{AWATAR}', avatar)
    .replace('{AUTOR}', autor)
    .replace('{DATA}', data)
    .replace('{KONTENT}', kontent)
  document.getElementById('searchPostList').insertAdjacentHTML('afterbegin', kod)
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
          homeSection.style.display = "none";
      savedSection.style.display = "none"
      profileSection.style.display = "none";
      searchSection.style.display = "block";
      zaladujPosty();
  }
}