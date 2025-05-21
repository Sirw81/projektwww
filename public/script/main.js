//jak niezalogowany przenosi na login
if (window.location.pathname.endsWith('index.html')) {
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
  }
//przycisk wyloguj
  const logoutBtn = document.getElementById('logoutButton');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('isLoggedIn');
      window.location.href = 'login.html';
    });
  }
}

//zakladka profil i glwona
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
//reklamy randomizer
document.addEventListener("DOMContentLoaded", function () {
  const images = [
    "img/ad/01jowisz.png",
    "img/ad/02oguh.png",
    "img/ad/03dokop.png",
    "img/ad/04traf.png",
  ];
  const random = Math.floor(Math.random() * images.length);
  const selected = images[random];
  const adImage = document.getElementById("ad");
  if (adImage) {
    adImage.src = selected;
  }
});

//zmiana dark/light
document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("theme-toggle");
  const body = document.body;
  const logo = document.getElementById("logo");

  const savedTheme = localStorage.getItem("theme");
  const isLight = savedTheme === "light";

  if (isLight) {
    body.classList.add("light-mode");
    if (logo) logo.src = "img/logo_lightmode.svg";
  } else {
    if (logo) logo.src = "img/logo_darkmode.svg";
  }

  if (toggleBtn) {
    toggleBtn.textContent = isLight ? "MOTYW: JASNY" : "MOTYW: CIEMNY";

    toggleBtn.addEventListener("click", () => {
      const isNowLight = body.classList.toggle("light-mode");

      if (logo) {
        logo.src = isNowLight ? "img/logo_lightmode.svg" : "img/logo_darkmode.svg";
      }

      toggleBtn.textContent = isNowLight
        ? "MOTYW: JASNY"
        : "MOTYW: CIEMNY";

      localStorage.setItem("theme", isNowLight ? "light" : "dark");
    });
  }
});


document.getElementById('sharePost').onclick = (event) => {

}

