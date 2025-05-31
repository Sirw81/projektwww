document.addEventListener("DOMContentLoaded", function () {
  const body = document.body;
  const toggleBtn = document.getElementById("theme-toggle");
  const logo = document.getElementById("logo");
  if (!logo || !toggleBtn) return

  const savedTheme = localStorage.getItem("theme");
  const isLight = savedTheme === "light";

  if (isLight) {
    body.classList.add("light-mode");
    logo.src = "img/logo_lightmode.svg";
  } else {
    logo.src = "img/logo_darkmode.svg";
  }

  toggleBtn.textContent = "MOTYW: " + (isLight ? "JASNY" : "CIEMNY");
  toggleBtn.addEventListener("click", () => {
    const isNowLight = body.classList.toggle("light-mode");
    logo.src = isNowLight ? "img/logo_lightmode.svg" : "img/logo_darkmode.svg";
    toggleBtn.textContent = "MOTYW: " + (isNowLight ? "JASNY" : "CIEMNY");
    localStorage.setItem("theme", isNowLight ? "light" : "dark");
  });
});