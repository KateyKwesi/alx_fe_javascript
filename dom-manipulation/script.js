const displayQuote = document.getElementById(`quoteDisplay`);
const displayQuoteBtn = document.getElementById(`newQuote`);
const quoteValue = document.getElementById(`newQuoteText`);
const categoryValue = document.getElementById(`newQuoteCategory`);
const categoryDisplay = document.getElementById("categoryDisplay");
const textDisplay = document.getElementById("textDisplay");
const authorDisplay = document.getElementById("authorDisplay");
const downloadQuotes = document.getElementById(`downloadQuotes`);

//
const savedQuotes = JSON.parse(localStorage.getItem(`QUOTES`)) || [];
savedQuotes.forEach((savedquote) => {
  const category = savedquote.category;
  const quote = savedquote.quote;
  appendToDom(category, quote);
});
const quotesArr = [...savedQuotes];

const fetchQuote = async () => {
  const response = await fetch(
    `https://api.api-ninjas.com/v1/quotes
`,
    {
      method: `GET`,
      headers: { "X-Api-Key": "bg8PPHI0HV/Lkj2TvkyRDw==nKrDLr62blt9K3eE" },
    }
  );
  const jsonData = await response.json();
  return jsonData[0];
};

async function getRandom() {
  const quote = await fetchQuote();
  quotesArr.push(quote);
  localStorage.setItem("QUOTES", JSON.stringify(quotesArr));
  return quote;
}

function appendToDom(category, quote) {
  displayQuote.innerHTML = ``;
  let categoryPara = document.createElement(`p`);
  let quotePara = document.createElement(`p`);
  categoryPara.innerHTML = `Category:  ${category}`;
  quotePara.innerHTML = `quote:  ${quote}`;
  displayQuote.appendChild(categoryPara);
  displayQuote.appendChild(quotePara);
}

function showRandomQuote({ category, quote, author }) {
  appendToDom(category, quote);
}

function createAddQuoteForm() {
  let quote = quoteValue.value;
  let category = categoryValue.value;

  quotesArr.push({
    category: `${category}`,
    quote: `${quote}`,
  });
  localStorage.setItem("QUOTES", JSON.stringify(quotesArr));

  appendToDom(category, quote);
}
function addQuote() {
  createAddQuoteForm();
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();

  fileReader.onload = function (event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotesArr.push(...importedQuotes);
    localStorage.setItem("QUOTES", JSON.stringify(quotesArr));
    alert("Quotes imported successfully!");
  };

  fileReader.readAsText(event.target.files[0]);
}

displayQuoteBtn.addEventListener("click", async () => {
  const waitRandomQuote = await getRandom();
  showRandomQuote(waitRandomQuote);
});

downloadQuotes.addEventListener(`click`, () => {
  const blob = new Blob([JSON.stringify(savedQuotes, null, 2)], {
    type: `application/json`,
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
});
