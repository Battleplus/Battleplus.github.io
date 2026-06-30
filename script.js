const root = document.documentElement;
const themeButton = document.querySelector(".theme-toggle");
const searchInput = document.querySelector("#search-input");
const results = document.querySelector("#results-container");
const posts = Array.from(document.querySelectorAll(".post"));

const savedTheme = localStorage.getItem("battleplus-theme");
if (savedTheme) {
  root.dataset.theme = savedTheme;
  themeButton.textContent = savedTheme === "dark" ? "日间模式" : "夜间模式";
}

themeButton?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = nextTheme;
  localStorage.setItem("battleplus-theme", nextTheme);
  themeButton.textContent = nextTheme === "dark" ? "日间模式" : "夜间模式";
});

function updateSearch(query) {
  const keyword = query.trim().toLowerCase();
  results.innerHTML = "";

  posts.forEach((post) => {
    const haystack = `${post.dataset.title || ""} ${post.dataset.tags || ""} ${post.textContent}`.toLowerCase();
    const matched = !keyword || haystack.includes(keyword);
    post.classList.toggle("is-hidden", !matched);

    if (keyword && matched) {
      const title = post.querySelector("h2")?.innerText || "Untitled";
      const link = post.querySelector("h2 a")?.getAttribute("href") || "#";
      const item = document.createElement("li");
      item.innerHTML = `<a href="${link}">${title}</a>`;
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
