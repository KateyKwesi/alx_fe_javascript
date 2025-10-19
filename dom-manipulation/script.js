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
