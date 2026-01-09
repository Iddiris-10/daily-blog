const STORAGE_KEY = "mu_daily_blog_posts";
const TEAM = "Manchester United";

const searchInput = document.getElementById("search");
const datePicker = document.getElementById("datePicker");
const postForm = document.getElementById("postForm");
const titleInput = document.getElementById("title");
const categorySelect = document.getElementById("category");
const contentInput = document.getElementById("content");
const postsHeading = document.getElementById("postsHeading");
const postsList = document.getElementById("postsList");
const countEl = document.getElementById("count");

const todayStr = () => new Date().toISOString().slice(0, 10);
const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function loadPosts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function setDatePickerDefaults() {
  datePicker.value = todayStr();
  datePicker.max = todayStr();
}

function postCard(p) {
  const el = document.createElement("article");
  el.className = "post";

  const header = document.createElement("div");
  header.className = "post-header";

  const badge = document.createElement("span");
  badge.className = `badge ${p.category}`;
  badge.textContent = p.category;

  const actions = document.createElement("div");
  actions.className = "post-actions";

  const delBtn = document.createElement("button");
  delBtn.className = "icon-btn";
  delBtn.textContent = "Delete";
  delBtn.addEventListener("click", () => deletePost(p.id));

  actions.appendChild(delBtn);
  header.appendChild(badge);
  header.appendChild(actions);

  const title = document.createElement("h3");
  title.className = "post-title";
  title.textContent = p.title;

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = `${TEAM} • ${p.date} • ${formatTime(p.createdAt)}`;

  const body = document.createElement("p");
  body.textContent = p.content;

  el.appendChild(header);
  el.appendChild(title);
  el.appendChild(meta);
  el.appendChild(body);
  return el;
}

function render() {
  const posts = loadPosts();
  const q = (searchInput.value || "").toLowerCase().trim();
  const date = datePicker.value || todayStr();
  const filtered = posts
    .filter(p => p.date === date)
    .filter(p => !q || `${p.title} ${p.content} ${p.category}`.toLowerCase().includes(q))
    .sort((a, b) => b.createdAt - a.createdAt);

  postsHeading.textContent = `Posts for ${date}`;
  countEl.textContent = `${filtered.length} item${filtered.length === 1 ? "" : "s"}`;
  postsList.innerHTML = "";
  filtered.forEach(p => postsList.appendChild(postCard(p)));
}

function deletePost(id) {
  const posts = loadPosts().filter(p => p.id !== id);
  savePosts(posts);
  render();
}

function addPost({ title, category, content }) {
  const posts = loadPosts();
  const now = Date.now();
  const date = datePicker.value || todayStr();
  posts.push({ id: now, title, category, content, date, createdAt: now });
  savePosts(posts);
}

postForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const category = categorySelect.value;
  if (!title || !content) return;
  addPost({ title, category, content });
  titleInput.value = "";
  contentInput.value = "";
  categorySelect.value = "News";
  render();
});

searchInput.addEventListener("input", render);
datePicker.addEventListener("change", render);

function seedIfEmpty() {
  const posts = loadPosts();
  if (posts.length) return;
  const d = todayStr();
  const samples = [
    {
      title: "BREAKING: Ruben Amorim sacked after 1-1 draw to leeds",
      category: "News",
      content: "Manchester United have parted ways with manager Ruben Amorim following Sunday’s 1-1 Premier League draw with leeds. Under 18's-team coach Darren Fletcher will take charge.",
      date: d,
      createdAt: Date.now() - 1000 * 60 * 60
    },
    {
      title: "Match report: leeds 1-1 United – lack of results costs Amorim",
      category: "Match",
      content: "cunh's equalizer was not enough to save Amorim",
      date: d,
      createdAt: Date.now() - 1000* 60* 30
    },
    {
      title: "Training focus ahead of weekend fixture",
      category: "Training",
      content: "High-intensity drills and set-piece routines as the team prepares for the upcoming match.",
      date: d,
      createdAt: Date.now() - 1000 * 60 * 60
    }
  ];
  savePosts(samples.map(s => ({ id: s.createdAt, ...s })));
}

setDatePickerDefaults();
seedIfEmpty();
render();