const displayQuote = document.getElementById(`quoteDisplay`);
const displayQuoteBtn = document.getElementById(`newQuote`);
const quoteValue = document.getElementById(`newQuoteText`);
const categoryValue = document.getElementById(`newQuoteCategory`);
const categoryDisplay = document.getElementById("categoryDisplay");
const textDisplay = document.getElementById("textDisplay");
const authorDisplay = document.getElementById("authorDisplay");

const quotesArr = [];

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

  const randomIndex = Math.floor(Math.random() * quotesArr.length);
  return quotesArr[randomIndex];
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
    text: `${quote}`,
  });

  appendToDom(category, quote);
}
function addQuote() {
  createAddQuoteForm();
}

displayQuoteBtn.addEventListener("click", async () => {
  const waitRandomQuote = await getRandom();
  showRandomQuote(waitRandomQuote);
});
