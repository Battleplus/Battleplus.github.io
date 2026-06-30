const root = document.documentElement;
const themeButton = document.querySelector(".theme-toggle");
const searchInput = document.querySelector("#search-input");
const results = document.querySelector("#results-container");
const cards = Array.from(document.querySelectorAll(".project-card"));

const savedTheme = localStorage.getItem("battleplus-theme");
if (savedTheme) {
  root.dataset.theme = savedTheme;
}

function syncThemeButton() {
  if (!themeButton) return;
  themeButton.textContent = root.dataset.theme === "dark" ? "Light" : "Dark";
}

syncThemeButton();

themeButton?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = nextTheme;
  localStorage.setItem("battleplus-theme", nextTheme);
  syncThemeButton();
});

function updateSearch(query) {
  const keyword = query.trim().toLowerCase();
  results.innerHTML = "";

  cards.forEach((card) => {
    const haystack = `${card.dataset.title || ""} ${card.dataset.tags || ""} ${card.textContent}`.toLowerCase();
    const matched = !keyword || haystack.includes(keyword);
    card.classList.toggle("is-hidden", !matched);

    if (keyword && matched) {
      const title = card.querySelector("h3")?.innerText || "Untitled";
      const link = card.querySelector(".text-link")?.getAttribute("href") || "#";
      const item = document.createElement("li");
      item.innerHTML = `<a href="${link}" target="_blank" rel="noreferrer">${title}</a>`;
      results.appendChild(item);
    }
  });

  if (keyword && !results.children.length) {
    const item = document.createElement("li");
    item.textContent = "No results found";
    results.appendChild(item);
  }
}

searchInput?.addEventListener("input", (event) => {
  updateSearch(event.target.value);
});
