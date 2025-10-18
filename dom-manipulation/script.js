const displayQuote = document.getElementById(`quoteDisplay`);
const displayQuoteBtn = document.getElementById(`newQuote`);
const quote = document.getElementById(`newQuoteText`);
const category = document.getElementById(`newQuoteCategory`);
const categoryDisplay = document.getElementById("categoryDisplay");
const textDisplay = document.getElementById("textDisplay");
const authorDisplay = document.getElementById("authorDisplay");

const quotesArr = [
  {
    category: "Philosophy",
    text: "I think, therefore I am.",
    author: "René Descartes",
  },
  {
    category: "Politics/History",
    text: "I may disagree with what you say, but I will defend to death your right to say it.",
    author: "Voltaire",
  },
  {
    category: "Self-Improvement",
    text: "It is never too late to be what you might have been.",
    author: "George Eliot",
  },
  {
    category: "Life",
    text: "Life is like riding a bicycle. To keep your balance, you must keep moving.",
    author: "Albert Einstein",
  },
  {
    category: "Motivation",
    text: "You miss 100% of the shots you don't take.",
    author: "Wayne Gretzky",
  },
  {
    category: "Deep/Philosophical",
    text: "The only thing we have to fear is fear itself.",
    author: "Franklin D. Roosevelt",
  },
  {
    category: "Friendship",
    text: "If men were perfectly virtuous, they wouldn't have friends.",
    author: "Friedrich Nietzsche",
  },
  {
    category: "Success",
    text: "Do the best you can. No one can do more than that.",
    author: "John Wooden",
  },
  {
    category: "Character",
    text: "To thine own self, be true.",
    author: "William Shakespeare",
  },
  {
    category: "Human Nature",
    text: "The truth will set you free.",
    author: "Jesus Christ",
  },
];

function getRandom() {
  const randomIndex = Math.floor(Math.random() * quotesArr.length);
  return quotesArr[randomIndex];
}

function showRandomQuote({ category, text, author }) {
  categoryDisplay.textContent = `Category:  ${category}`;
  textDisplay.textContent = `quote:  ${text}`;
  authorDisplay.textContent = `author : ${author}`;
}

function createAddQuoteForm() {
  let newQuote = quote.value;
  let quoteCategory = category.value;

  quotesArr.push({
    category: `${quoteCategory}`,
    text: `${newQuote}`,
  });

  categoryDisplay.textContent = `Category:  ${quoteCategory}`;
  textDisplay.textContent = `quote:  ${newQuote}`;
}
function addQuote() {
  createAddQuoteForm();
}

displayQuoteBtn.addEventListener("click", () => {
  showRandomQuote(getRandom());
});
