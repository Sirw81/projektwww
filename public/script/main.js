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

document.addEventListener("DOMContentLoaded", () => {
    const profileBtn = document.getElementById('profile');
    const homeSection = document.getElementById("homeSection");
    const profileSection = document.getElementById("profileSection");

    profileBtn.addEventListener("click", () => {
        homeSection.style.display = "none";
        profileSection.style.display = "block";
    });

    const homeBtn = document.getElementById('homepage');
    homeBtn.addEventListener("click", () => {
        profileSection.style.display = "none";
        homeSection.style.display = "block";
    });
});
