const quoteEl = document.getElementById('quote')
const authorEl = document.getElementById('author')
const messageEl = document.getElementById('message')
const newQuoteBtn = document.getElementById('newQuote')
const copyQuoteBtn = document.getElementById('copyQuote')

const quotes = [
  { text: 'The best way to predict the future is to create it.', author: 'Peter Drucker' },
  { text: 'Do not wait to strike till the iron is hot; but make it hot by striking.', author: 'William Butler Yeats' },
  { text: 'It always seems impossible until it’s done.', author: 'Nelson Mandela' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
  { text: 'The only limit to our realization of tomorrow is our doubts of today.', author: 'Franklin D. Roosevelt' },
  { text: 'You miss 100% of the shots you don’t take.', author: 'Wayne Gretzky' },
  { text: 'Quality is not an act, it is a habit.', author: 'Aristotle' },
  { text: 'Small deeds done are better than great deeds planned.', author: 'Peter Marshall' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' }
]

let activeQuote = null
let messageTimer = null

function getRandomIndex(array) {
  return Math.floor(Math.random() * array.length)
}

function renderQuote({ text, author }) {
  quoteEl.textContent = text
  authorEl.textContent = `— ${author}`
}

function showMessage(message, duration = 1800) {
  messageEl.textContent = message
  clearTimeout(messageTimer)
  if (duration > 0) {
    messageTimer = setTimeout(() => {
      messageEl.textContent = ''
    }, duration)
  }
}

function loadQuote() {
  activeQuote = quotes[getRandomIndex(quotes)]
  renderQuote(activeQuote)
  showMessage('A new quote is ready. Copy it or get another!')
}

async function copyQuote() {
  const textToCopy = `${activeQuote.text} — ${activeQuote.author}`
  try {
    await navigator.clipboard.writeText(textToCopy)
    showMessage('Quote copied to clipboard!')
  } catch (error) {
    showMessage('Unable to copy automatically. Please select and copy manually.', 4000)
  }
}

newQuoteBtn.addEventListener('click', loadQuote)
copyQuoteBtn.addEventListener('click', copyQuote)

loadQuote()
