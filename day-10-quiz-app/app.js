// Quiz Questions
const questions = [
    {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correct: 2
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correct: 1
    },
    {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correct: 3
    },
    {
        question: "In which year did the Titanic sink?",
        options: ["1912", "1920", "1905", "1915"],
        correct: 0
    },
    {
        question: "What is the smallest prime number?",
        options: ["0", "1", "2", "3"],
        correct: 2
    }
];

// Quiz State
let currentQuestion = 0;
let score = 0;
let selectedAnswers = [];

// DOM Elements
const quizSection = document.getElementById('quizSection');
const resultsSection = document.getElementById('resultsSection');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');
const currentQuestionSpan = document.getElementById('currentQuestion');
const totalQuestionsSpan = document.getElementById('totalQuestions');
const progressFill = document.getElementById('progressFill');
const scoreValue = document.getElementById('scoreValue');
const percentageSpan = document.getElementById('percentage');
const resultMessage = document.getElementById('resultMessage');

// Initialize Quiz
function initQuiz() {
    currentQuestion = 0;
    score = 0;
    selectedAnswers = [];
    quizSection.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    loadQuestion();
}

// Load Current Question
function loadQuestion() {
    const question = questions[currentQuestion];
    questionText.textContent = question.question;
    
    // Update progress
    currentQuestionSpan.textContent = currentQuestion + 1;
    totalQuestionsSpan.textContent = questions.length;
    updateProgressBar();
    
    // Clear options
    optionsContainer.innerHTML = '';
    
    // Create option buttons
    question.options.forEach((option, index) => {
        const optionLabel = document.createElement('label');
        optionLabel.className = 'option-label';
        
        const optionInput = document.createElement('input');
        optionInput.type = 'radio';
        optionInput.name = 'answer';
        optionInput.value = index;
        
        // Check if this option was previously selected
        if (selectedAnswers[currentQuestion] === index) {
            optionInput.checked = true;
            optionLabel.classList.add('selected');
        }
        
        const optionText = document.createElement('span');
        optionText.textContent = option;
        
        optionLabel.appendChild(optionInput);
        optionLabel.appendChild(optionText);
        optionsContainer.appendChild(optionLabel);
        
        // Add event listener
        optionInput.addEventListener('change', () => {
            handleOptionSelect(index);
        });
    });
    
    // Reset next button
    nextBtn.disabled = selectedAnswers[currentQuestion] === undefined;
}

// Handle Option Selection
function handleOptionSelect(index) {
    selectedAnswers[currentQuestion] = index;
    nextBtn.disabled = false;
    
    // Update UI
    const labels = document.querySelectorAll('.option-label');
    labels.forEach(label => label.classList.remove('selected'));
    labels[index].classList.add('selected');
}

// Update Progress Bar
function updateProgressBar() {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    progressFill.style.width = progress + '%';
}

// Next Question
nextBtn.addEventListener('click', () => {
    currentQuestion++;
    
    if (currentQuestion < questions.length) {
        loadQuestion();
    } else {
        showResults();
    }
});

// Show Results
function showResults() {
    // Calculate score
    score = 0;
    selectedAnswers.forEach((answer, index) => {
        if (answer === questions[index].correct) {
            score++;
        }
    });
    
    // Update results display
    scoreValue.textContent = score;
    const percentage = Math.round((score / questions.length) * 100);
    percentageSpan.textContent = percentage + '%';
    
    // Set result message
    if (percentage === 100) {
        resultMessage.textContent = '🎉 Perfect Score! Excellent work!';
    } else if (percentage >= 80) {
        resultMessage.textContent = '😊 Great job! You did very well!';
    } else if (percentage >= 60) {
        resultMessage.textContent = '👍 Good effort! Keep practicing!';
    } else if (percentage >= 40) {
        resultMessage.textContent = '📚 Not bad, but there\'s room for improvement!';
    } else {
        resultMessage.textContent = '💪 Keep learning and try again!';
    }
    
    // Show results section
    quizSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
}

// Restart Quiz
restartBtn.addEventListener('click', () => {
    initQuiz();
});

// Initialize on page load
initQuiz();
