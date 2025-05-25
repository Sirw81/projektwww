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
      <button class="btn-like">👍</button>
      <button class="btn-unsave">🔖⃠</button>
  </div>
</div>`

function dodajPost(post) {
  const kod = kodHTML.replace('{AUTOR}', post[0]).replace('{DATA}', post[1]).replace('{KONTENT}', post[2])
  document.getElementById('PostList').insertAdjacentHTML('afterbegin', kod)
}

function wygenerujPosty() {
    let savedPosts = localStorage.getItem('saved_posts')
    if (!savedPosts) return
    savedPosts = Array.from(JSON.parse(savedPosts))

    savedPosts.forEach(post => {
        dodajPost(post)
    })
}

wygenerujPosty()

Array.from(document.querySelectorAll('.btn-unsave')).forEach(button => {
    button.onclick = () => {
        let savedPosts = localStorage.getItem('saved_posts')
        if (!savedPosts) return
        savedPosts = Array.from(JSON.parse(savedPosts))

        alert('coming soon')
    }
})