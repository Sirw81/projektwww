if (window.location.pathname.endsWith('index.html')) {
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
  }

  const logoutBtn = document.getElementById('logoutButton');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('isLoggedIn');
      window.location.href = 'login.html';
    });
  }
}

if (window.location.pathname.endsWith('login.html')) {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;

      if (
        (username === 'user' && password === 'password') ||
        (username === 'example@test.com' && password === 'password')
      ) {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'index.html';
      } else {
        alert('Błędna nazwa użytkownika lub hasło.');
      }
    });
  }
}
