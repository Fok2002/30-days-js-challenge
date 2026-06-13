const form = document.getElementById('form')
const guessInput = document.getElementById('guess')
const messageEl = document.getElementById('message')
const attemptsEl = document.getElementById('attempts')
const bestEl = document.getElementById('best')
const historyEl = document.getElementById('history')
const resetBtn = document.getElementById('reset')

const BEST_KEY = 'day13_best'

let secret = null
let attempts = 0

function randInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function loadBest(){
  const v = localStorage.getItem(BEST_KEY)
  return v ? parseInt(v,10) : null
}

function saveBest(n){
  localStorage.setItem(BEST_KEY, String(n))
}

function setMessage(text, cls){
  messageEl.textContent = text
  messageEl.className = 'message' + (cls ? ' ' + cls : '')
}

function addHistory(guess, hint){
  const li = document.createElement('li')
  li.textContent = `${guess} — ${hint}`
  if(hint === 'Correct') li.classList.add('success')
  historyEl.insertBefore(li, historyEl.firstChild)
}

function updateUI(){
  attemptsEl.textContent = attempts
  const best = loadBest()
  bestEl.textContent = best === null ? '—' : best
}

function newGame(){
  secret = randInt(1,1000)
  attempts = 0
  historyEl.innerHTML = ''
  guessInput.value = ''
  guessInput.disabled = false
  setMessage('New game started — make a guess!')
  updateUI()
}

function handleGuess(e){
  e.preventDefault()
  const val = parseInt(guessInput.value, 10)
  if(Number.isNaN(val) || val < 1 || val > 1000){
    setMessage('Please enter a number between 1 and 1000')
    return
  }
  attempts += 1
  if(val === secret){
    setMessage(`Correct! The number was ${secret}. Attempts: ${attempts}`, 'success')
    addHistory(val, 'Correct')
    const best = loadBest()
    if(best === null || attempts < best){
      saveBest(attempts)
      setMessage(`Correct! New best: ${attempts} attempts`, 'success')
    }
    guessInput.disabled = true
  } else if(val < secret){
    setMessage('Higher')
    addHistory(val, 'Higher')
  } else {
    setMessage('Lower')
    addHistory(val, 'Lower')
  }
  updateUI()
  guessInput.value = ''
  guessInput.focus()
}

form.addEventListener('submit', handleGuess)
resetBtn.addEventListener('click', newGame)

// initialize
const currentBest = loadBest()
if(currentBest !== null) bestEl.textContent = currentBest
newGame()
