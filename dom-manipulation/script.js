const displayQuote = document.getElementById("quoteDisplay");
const displayQuoteBtn = document.getElementById("newQuote");
const quoteValue = document.getElementById("newQuoteText");
const categoryValue = document.getElementById("newQuoteCategory");
const downloadQuotes = document.getElementById("downloadQuotes");

let quotesArr = JSON.parse(localStorage.getItem("QUOTES")) || [];
quotesArr.forEach((q) => appendToDom(q.category, q.quote));

const fetchQuote = async () => {
  const r = await fetch("https://api.api-ninjas.com/v1/quotes", {
    method: "GET",
    headers: { "X-Api-Key": "bg8PPHI0HV/Lkj2TvkyRDw==nKrDLr62blt9K3eE" },
  });
  const j = await r.json();
  return j[0];
};

async function getRandom() {
  const q = await fetchQuote();
  quotesArr.push(q);
  localStorage.setItem("QUOTES", JSON.stringify(quotesArr));
  const i = Math.floor(Math.random() * quotesArr.length);
  return quotesArr[i];
}

function appendToDom(c, q) {
  displayQuote.innerHTML = "";
  const cP = document.createElement("p");
  const qP = document.createElement("p");
  cP.textContent = `Category: ${c}`;
  qP.textContent = `Quote: ${q}`;
  displayQuote.appendChild(cP);
  displayQuote.appendChild(qP);
}

function showRandomQuote({ category, quote }) {
  appendToDom(category, quote);
}

function createAddQuoteForm() {
  const q = quoteValue.value.trim();
  const c = categoryValue.value.trim();
  if (!q || !c) return alert("Please enter both quote and category.");
  quotesArr.push({ category: c, quote: q });
  localStorage.setItem("QUOTES", JSON.stringify(quotesArr));
  populateCategories();
  appendToDom(c, q);
  quoteValue.value = "";
  categoryValue.value = "";
}

function importFromJsonFile(e) {
  const f = new FileReader();
  f.onload = function (e) {
    try {
      const i = JSON.parse(e.target.result);
      quotesArr.push(...i);
      localStorage.setItem("QUOTES", JSON.stringify(quotesArr));
      alert("Quotes imported successfully!");
      populateCategories();
    } catch (a) {
      alert("Invalid JSON file!");
    }
  };
  f.readAsText(e.target.files[0]);
}

downloadQuotes.addEventListener("click", () => {
  const b = new Blob([JSON.stringify(quotesArr, null, 2)], {
    type: "application/json",
  });
  const u = URL.createObjectURL(b);
  const a = document.createElement("a");
  a.href = u;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(u);
});

function populateCategories() {
  const f = document.getElementById("categoryFilter");
  if (!f) return;
  f.innerHTML = `<option value="all">All Categories</option>`;
  const c = [...new Set(quotesArr.map((q) => q.category).filter(Boolean))];
  c.forEach((cat) => {
    const o = document.createElement("option");
    o.value = cat;
    o.textContent = cat;
    f.appendChild(o);
  });
  const l = localStorage.getItem("SELECTED_CATEGORY");
  if (l && c.includes(l)) {
    f.value = l;
    filterQuote();
  }
}

function filterQuote() {
  const f = document.getElementById("categoryFilter");
  const s = f.value;
  localStorage.setItem("SELECTED_CATEGORY", s);
  displayQuote.innerHTML = "";
  const fl =
    s === "all" ? quotesArr : quotesArr.filter((q) => q.category === s);
  if (fl.length === 0) {
    displayQuote.textContent = "No quotes available for this category.";
    return;
  }
  fl.forEach((q) => {
    const d = document.createElement("div");
    d.className = "quote-item";
    d.innerHTML = `<p><strong>${q.category}</strong>: ${q.quote}</p>`;
    displayQuote.appendChild(d);
  });
}

async function fetchQuotesFromServer() {
  const r = await fetch("https://jsonplaceholder.typicode.com/posts");
  const d = await r.json();
  return d.map((p) => ({
    id: String(p.id),
    quote: p.title,
    category: p.body || "General",
    author: `user-${p.userId}`,
    updatedAt: Date.now(),
  }));
}

async function syncQuotes() {
  try {
    const s = await fetchQuotesFromServer();
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quotesArr),
    });
    quotesArr = s;
    localStorage.setItem("QUOTES", JSON.stringify(quotesArr));
    populateCategories();
    filterQuote();
  } catch (e) {
    console.error("Sync failed:", e);
  }
}

setInterval(() => {
  syncQuotes();
}, 30000);

displayQuoteBtn.addEventListener("click", async () => {
  const r = await getRandom();
  showRandomQuote(r);
});

function addQuote() {
  createAddQuoteForm();
}
populateCategories();
