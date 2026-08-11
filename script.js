const root = document.documentElement;
const themeButton = document.querySelector(".theme-toggle");
const themeLabel = document.querySelector(".theme-label");

const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
const savedTheme = localStorage.getItem("battleplus-theme");
const initialTheme = savedTheme || (systemPrefersLight ? "light" : "dark");

function setTheme(theme) {
  root.dataset.theme = theme;
  if (themeLabel) themeLabel.textContent = theme === "dark" ? "浅色" : "深色";
  themeButton?.setAttribute("aria-label", `切换到${theme === "dark" ? "浅色" : "深色"}主题`);
}

setTheme(initialTheme);

themeButton?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
  localStorage.setItem("battleplus-theme", nextTheme);
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 3, 2) * 80}ms`;
  observer.observe(element);
});
