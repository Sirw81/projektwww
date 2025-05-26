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