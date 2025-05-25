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
      <button class="btn-like">👍</button>
      <button class="btn-save">🔖</button>
  </div>
</div>`

const autorzyny = ['Lech Wałęsa', 'Andrzej Duda', 'Jarosław Kaczyński', 'Donald Tusk', 'Radosław Sikorski', 'Sławomir Mentzen', 'Maciej Maciak']
function dodajPost(post) {
  const autorzyna = autorzyny[Math.floor(Math.random() * autorzyny.length)]
  const data = new Date(Date.now() - Math.round((Math.random() * 100000000000))).toLocaleString('fr-FR')
  const kod = kodHTML.replace('{AUTOR}', autorzyna).replace('{DATA}', data).replace('{KONTENT}', post.body)
  document.getElementById('PostList').insertAdjacentHTML('afterbegin', kod)
}

async function wygenerujPosty() {
  const ids = new Set()
  const posts = []
  while (ids.size < 10) {
    const random = Math.round(Math.random() * 99 + 1)
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

  // po dodaniu losowych postów, wsparcie dla zapisanych postów
  const saveButtons = document.getElementsByClassName('btn-save')
  Array.from(saveButtons).forEach(element => {
    element.onclick = (event) => {
      const post = event.srcElement.parentNode.parentNode
      const author = post.querySelector('.post-author').textContent
      const date = post.querySelector('.post-date').textContent
      const text = post.querySelector('.post-text').textContent
      const avatar = post.querySelector('.post-avatar').src



      const jsonObject = [author, date, text]
      const savedPosts = JSON.parse(localStorage.getItem('saved_posts'))
      let zawiera = false
      if (savedPosts) {
        const strCurrPost = JSON.stringify(jsonObject)

        // sprawdz czy stringified savedposts zawiera stringified posta
        Array.from(savedPosts).forEach(savedPost => {
          if (JSON.stringify(savedPost) == strCurrPost) {
            zawiera = true
          }
        })

        // nie zawiera, dodaj do listy

        if (!zawiera) {
          const newStorage = savedPosts
          newStorage.push(jsonObject)
          localStorage.setItem('saved_posts', JSON.stringify(newStorage))
        }

      // zrob nowa liste
      } else {
        localStorage.setItem('saved_posts', JSON.stringify([jsonObject]))
      }

    }
  });
}

wygenerujPosty()