const displayQuote = document.getElementById("quoteDisplay");
const displayQuoteBtn = document.getElementById("newQuote");
const quoteValue = document.getElementById("newQuoteText");
const categoryValue = document.getElementById("newQuoteCategory");
const downloadQuotes = document.getElementById("downloadQuotes");

let quotesArr = JSON.parse(localStorage.getItem("QUOTES")) || [];

quotesArr.forEach((q) => appendToDom(q.category, q.quote));

const fetchQuote = async () => {
  const response = await fetch("https://api.api-ninjas.com/v1/quotes", {
    method: "GET",
    headers: { "X-Api-Key": "bg8PPHI0HV/Lkj2TvkyRDw==nKrDLr62blt9K3eE" },
  });
  const jsonData = await response.json();
  return jsonData[0];
};

async function getRandom() {
  const quote = await fetchQuote();
  quotesArr.push(quote);
  localStorage.setItem("QUOTES", JSON.stringify(quotesArr));

  const randomIndex = Math.floor(Math.random() * quotesArr.length); // ✅ Math.random
  return quotesArr[randomIndex];
}

function appendToDom(category, quote) {
  displayQuote.innerHTML = "";
  const categoryPara = document.createElement("p");
  const quotePara = document.createElement("p");
  categoryPara.innerHTML = `Category: ${category}`;
  quotePara.innerHTML = `Quote: ${quote}`;
  displayQuote.appendChild(categoryPara);
  displayQuote.appendChild(quotePara);
}

function showRandomQuote({ category, quote }) {
  appendToDom(category, quote);
}

function createAddQuoteForm() {
  const quote = quoteValue.value.trim();
  const category = categoryValue.value.trim();
  if (!quote || !category)
    return alert("Please enter both quote and category.");

  quotesArr.push({ category, quote });
  localStorage.setItem("QUOTES", JSON.stringify(quotesArr));

  populateCategories();
  appendToDom(category, quote);
  quoteValue.value = "";
  categoryValue.value = "";
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      quotesArr.push(...importedQuotes);
      localStorage.setItem("QUOTES", JSON.stringify(quotesArr));
      alert("Quotes imported successfully!");
      populateCategories();
    } catch (e) {
      alert("Invalid JSON file!");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

downloadQuotes.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(quotesArr, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
});

function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  if (!categoryFilter) return;

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  const categories = [
    ...new Set(quotesArr.map((q) => q.category).filter(Boolean)),
  ];
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  const lastCategory = localStorage.getItem("SELECTED_CATEGORY");
  if (lastCategory && categories.includes(lastCategory)) {
    categoryFilter.value = lastCategory;
    filterQuote();
  }
}

function filterQuote() {
  const categoryFilter = document.getElementById("categoryFilter");
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("SELECTED_CATEGORY", selectedCategory); // ✅ save filter

  displayQuote.innerHTML = "";
  const filtered =
    selectedCategory === "all"
      ? quotesArr
      : quotesArr.filter((q) => q.category === selectedCategory);

  if (filtered.length === 0) {
    displayQuote.textContent = "No quotes available for this category.";
    return;
  }

  filtered.forEach((q) => {
    const div = document.createElement("div");
    div.className = "quote-item";
    div.innerHTML = `<p><strong>${q.category}</strong>: ${q.quote}</p>`;
    displayQuote.appendChild(div);
  });
}

displayQuoteBtn.addEventListener("click", async () => {
  const randomQuote = await getRandom();
  showRandomQuote(randomQuote);
});

function addQuote() {
  createAddQuoteForm();
}

populateCategories();

const SERVER_BASE = "https://jsonplaceholder.typicode.com"; // mock API
const SYNC_EVERY_MS = 15_000; // periodic pull
const LS_QUOTES_KEY = "QUOTES";
const LS_CONFLICTS_KEY = "QUOTE_CONFLICTS";
const LS_LAST_SYNC_KEY = "LAST_SYNC_AT";

const $ = (id) => document.getElementById(id);
const banner = $("syncBanner");
const bannerMsg = $("syncMessage");
const resolveBtn = $("syncResolveBtn");

function ensureShape(q) {
  if (!q.id) q.id = crypto.randomUUID();
  if (!q.updatedAt) q.updatedAt = Date.now();
  return q;
}

quotesArr = (quotesArr || []).map(ensureShape);
localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotesArr));

function postToQuote(p) {
  return ensureShape({
    id: String(p.id ?? crypto.randomUUID()),
    quote: p.title ?? "(no title)",
    category: (p.body || "general").slice(0, 60),
    author: p.userId ? `user-${p.userId}` : "server",
    updatedAt: Number(p.updatedAt) || Date.now(),
  });
}
function quoteToPost(q) {
  return {
    id: Number.isFinite(Number(q.id)) ? Number(q.id) : undefined,
    title: q.quote,
    body: q.category,
    userId: q.author?.replace("user-", "") || 1,
    updatedAt: q.updatedAt,
  };
}

function showBanner(msg, hasResolve = false) {
  bannerMsg.textContent = msg;
  banner.style.display = "block";
  resolveBtn.style.display = hasResolve ? "inline-block" : "none";
}
function hideBanner() {
  banner.style.display = "none";
}

async function fetchServerQuotes() {
  const res = await fetch(`${SERVER_BASE}/posts?_limit=25`);
  const data = await res.json();
  return data.map(postToQuote);
}

async function pushLocalChanges(changed) {
  await Promise.all(
    changed.map(async (q) => {
      await fetch(`${SERVER_BASE}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quoteToPost(q)),
      });
    })
  );
}

function mergeQuotes(serverQuotes, localQuotes) {
  const localById = new Map(localQuotes.map((q) => [q.id, q]));
  const merged = [...localQuotes];
  const conflicts = [];

  for (const s of serverQuotes) {
    const local = localById.get(s.id);
    if (!local) {
      merged.push(s);
      continue;
    }
    if (s.updatedAt > local.updatedAt) {
      const idx = merged.findIndex((q) => q.id === s.id);
      if (idx !== -1) merged[idx] = s;
      else merged.push(s);
      conflicts.push({ id: s.id, local, server: s });
    }
  }

  return { merged, conflicts };
}

let syncing = false;
async function syncWithServer({ showUI = true } = {}) {
  if (syncing) return;
  syncing = true;
  try {
    if (showUI) showBanner("Syncing…");

    const serverQuotes = await fetchServerQuotes();

    const { merged, conflicts } = mergeQuotes(serverQuotes, quotesArr);

    const toPush = merged.filter((q) => !/^\d+$/.test(String(q.id)));
    if (toPush.length) await pushLocalChanges(toPush);

    quotesArr = merged.map(ensureShape);
    localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotesArr));
    localStorage.setItem(LS_LAST_SYNC_KEY, String(Date.now()));

    if (typeof filterQuote === "function") {
      filterQuote();
    } else if (quotesArr.length) {
      const last = quotesArr[quotesArr.length - 1];
      appendToDom(last.category, last.quote);
    }

    if (conflicts.length) {
      localStorage.setItem(LS_CONFLICTS_KEY, JSON.stringify(conflicts));
      showBanner(
        `Server updates applied. ${conflicts.length} conflict(s) detected (server version used).`,
        true
      );
    } else if (showUI) {
      showBanner("Sync complete. No conflicts.");
      setTimeout(hideBanner, 1500);
    }
  } catch (e) {
    console.error(e);
    if (showUI) showBanner("Sync failed. Check console for details.");
  } finally {
    syncing = false;
  }
}

function resolveConflict(id, strategy = "keepServer") {
  const conflicts = JSON.parse(localStorage.getItem(LS_CONFLICTS_KEY) || "[]");
  const conflict = conflicts.find((c) => c.id === id);
  if (!conflict) return;

  const idx = quotesArr.findIndex((q) => q.id === id);
  if (idx === -1) return;

  if (strategy === "keepLocal") {
    quotesArr[idx] = { ...conflict.local, updatedAt: Date.now() };
  } else {
    quotesArr[idx] = { ...conflict.server, updatedAt: Date.now() };
  }

  localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotesArr));

  const remaining = conflicts.filter((c) => c.id !== id);
  localStorage.setItem(LS_CONFLICTS_KEY, JSON.stringify(remaining));

  if (typeof filterQuote === "function") filterQuote();

  if (!remaining.length) hideBanner();
}

resolveBtn?.addEventListener("click", () => {
  const conflicts = JSON.parse(localStorage.getItem(LS_CONFLICTS_KEY) || "[]");
  if (!conflicts.length) return hideBanner();
  conflicts.forEach((c) => resolveConflict(c.id, "keepServer"));
  showBanner("Conflicts resolved (server kept).");
  setTimeout(hideBanner, 1200);
});

$("syncNow")?.addEventListener("click", () => syncWithServer({ showUI: true }));

syncWithServer({ showUI: false });
const syncTimer = setInterval(
  () => syncWithServer({ showUI: false }),
  SYNC_EVERY_MS
);

function touchAndSaveAll() {
  quotesArr = quotesArr.map((q) => ({ ...q, updatedAt: Date.now() }));
  localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotesArr));
}

const _origCreateAddQuoteForm = createAddQuoteForm;
if (typeof _origCreateAddQuoteForm === "function") {
  window.createAddQuoteForm = function () {
    _origCreateAddQuoteForm();

    const last = quotesArr[quotesArr.length - 1];
    if (last && !last.updatedAt) last.updatedAt = Date.now();
    localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotesArr));

    setTimeout(() => syncWithServer({ showUI: false }), 1500);
  };
}
