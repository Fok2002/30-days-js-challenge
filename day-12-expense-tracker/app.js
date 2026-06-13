const balance = document.getElementById('balance')
const money_plus = document.getElementById('money-plus')
const money_minus = document.getElementById('money-minus')
const list = document.getElementById('list')
const form = document.getElementById('form')
const text = document.getElementById('text')
const amount = document.getElementById('amount')

const localStorageKey = 'day12_transactions'

let transactions = JSON.parse(localStorage.getItem(localStorageKey)) || []

function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+'
  const item = document.createElement('li')
  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus')
  item.innerHTML = `${transaction.text} <span>${sign}$${Math.abs(transaction.amount).toFixed(2)}</span> <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>`
  list.appendChild(item)
}

function updateValues() {
  const amounts = transactions.map(t => t.amount)
  const total = amounts.reduce((a,b)=>a+b,0)
  const income = amounts.filter(a=>a>0).reduce((a,b)=>a+b,0)
  const expense = amounts.filter(a=>a<0).reduce((a,b)=>a+b,0)

  balance.innerText = `$${total.toFixed(2)}`
  money_plus.innerText = `$${income.toFixed(2)}`
  money_minus.innerText = `$${Math.abs(expense).toFixed(2)}`
}

function init() {
  list.innerHTML = ''
  transactions.forEach(addTransactionDOM)
  updateValues()
}

function generateID() {
  return Math.floor(Math.random()*1000000)
}

function addTransaction(e){
  e.preventDefault()
  if(text.value.trim() === '' || amount.value.trim() === '') return
  const transaction = {
    id: generateID(),
    text: text.value.trim(),
    amount: +parseFloat(amount.value)
  }
  transactions.push(transaction)
  localStorage.setItem(localStorageKey, JSON.stringify(transactions))
  addTransactionDOM(transaction)
  updateValues()
  text.value = ''
  amount.value = ''
}

function removeTransaction(id){
  transactions = transactions.filter(t=>t.id !== id)
  localStorage.setItem(localStorageKey, JSON.stringify(transactions))
  init()
}

form.addEventListener('submit', addTransaction)

init()
