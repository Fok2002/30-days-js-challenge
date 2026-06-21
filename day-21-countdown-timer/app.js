// Day 21 - Countdown Timer JavaScript

// DOM Elements
const timerCard = document.querySelector('.timer-card');
const timerDisplay = document.getElementById('timerDisplay');
const timerStatus = document.getElementById('timerStatus');
const minutesInput = document.getElementById('minutesInput');
const startPauseBtn = document.getElementById('startPauseBtn');
const resetBtn = document.getElementById('resetBtn');
const presetBtns = document.querySelectorAll('.preset-btn');
const alarmModal = document.getElementById('alarmModal');
const dismissAlarmBtn = document.getElementById('dismissAlarmBtn');
const progressCircle = document.querySelector('.progress-ring__circle');

// Timer State Variables
let totalSeconds = 0;
let secondsLeft = 0;
let timerId = null;
let isTimerRunning = false;

// Audio Synth State
let audioCtx = null;
let alarmIntervalId = null;

// Initialize SVG Circle Dash Array
function updateProgress(percent) {
    const radius = progressCircle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    
    // Percent represents the remaining ratio (0 to 100)
    const offset = circumference - (percent / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
}

// Format seconds into MM:SS format
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    const displayMins = mins.toString().padStart(2, '0');
    const displaySecs = secs.toString().padStart(2, '0');
    
    return `${displayMins}:${displaySecs}`;
}

// Update digital display and document title
function updateDisplay(seconds) {
    const formatted = formatTime(seconds);
    timerDisplay.textContent = formatted;
    
    if (isTimerRunning) {
        document.title = `(${formatted}) Countdown Timer`;
    } else {
        document.title = 'Countdown Timer | Day 21';
    }
}

// Synthesis of Alarm Beep using Web Audio API
function playSynthesizedBeep() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        
        // Volume envelope: rapid attack, linear decay
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
        console.error('Audio synthesizer error:', e);
    }
}

// Start repeating audio alarm
function startAudioAlarm() {
    playSynthesizedBeep();
    alarmIntervalId = setInterval(playSynthesizedBeep, 800);
}

// Stop audio alarm
function stopAudioAlarm() {
    if (alarmIntervalId) {
        clearInterval(alarmIntervalId);
        alarmIntervalId = null;
    }
}

// Set up timer values based on inputs
function setupTimer() {
    const minsValue = parseInt(minutesInput.value) || 0;
    if (minsValue <= 0) {
        totalSeconds = 0;
        secondsLeft = 0;
    } else {
        totalSeconds = minsValue * 60;
        secondsLeft = totalSeconds;
    }
    updateDisplay(secondsLeft);
    updateProgress(100);
}

// Main Tick Function run every second
function tick() {
    if (secondsLeft > 0) {
        secondsLeft--;
        updateDisplay(secondsLeft);
        
        const percentLeft = (secondsLeft / totalSeconds) * 100;
        updateProgress(percentLeft);
    }
    
    if (secondsLeft <= 0) {
        timerFinished();
    }
}

// Triggered when countdown hits zero
function timerFinished() {
    stopTimer();
    
    // Add visual feedback
    timerCard.classList.add('shake');
    timerStatus.textContent = "Time's up!";
    
    // Show custom modal
    alarmModal.classList.remove('hidden');
    
    // Play sound alarm
    startAudioAlarm();
    
    // Browser alert fallback
    setTimeout(() => {
        alert("⏰ Time's up! Your countdown has finished.");
    }, 100);
}

// Start timer execution
function startTimer() {
    if (secondsLeft === 0) {
        setupTimer();
    }
    
    if (secondsLeft <= 0) {
        // If still 0 (e.g. invalid input), don't start
        return;
    }
    
    isTimerRunning = true;
    timerId = setInterval(tick, 1000);
    
    // UI state updates
    timerCard.classList.remove('paused');
    timerCard.classList.add('running');
    timerStatus.textContent = 'Running';
    startPauseBtn.textContent = 'Pause';
    startPauseBtn.classList.remove('btn-primary');
    startPauseBtn.classList.add('btn-secondary');
    resetBtn.disabled = false;
    minutesInput.disabled = true;
    
    // Disable presets
    presetBtns.forEach(btn => btn.disabled = true);
}

// Stop/Pause timer execution
function stopTimer() {
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
    
    isTimerRunning = false;
    timerCard.classList.remove('running');
    
    if (secondsLeft > 0) {
        timerCard.classList.add('paused');
        timerStatus.textContent = 'Paused';
        startPauseBtn.textContent = 'Resume';
        startPauseBtn.classList.add('btn-primary');
        startPauseBtn.classList.remove('btn-secondary');
    } else {
        startPauseBtn.textContent = 'Start';
        startPauseBtn.classList.add('btn-primary');
        startPauseBtn.classList.remove('btn-secondary');
    }
}

// Reset timer to original clean state
function resetTimer() {
    stopTimer();
    
    timerCard.classList.remove('paused', 'shake');
    timerStatus.textContent = 'Set time to begin';
    
    // Explicitly reset the button state
    startPauseBtn.textContent = 'Start';
    startPauseBtn.classList.add('btn-primary');
    startPauseBtn.classList.remove('btn-secondary');
    
    minutesInput.disabled = false;
    presetBtns.forEach(btn => {
        btn.disabled = false;
    });
    
    setupTimer();
    resetBtn.disabled = true;
}

// Event Listeners
startPauseBtn.addEventListener('click', () => {
    if (isTimerRunning) {
        stopTimer();
    } else {
        startTimer();
    }
});

resetBtn.addEventListener('click', () => {
    resetTimer();
});

minutesInput.addEventListener('input', () => {
    // Only update if not currently running or paused
    if (!isTimerRunning && resetBtn.disabled) {
        setupTimer();
        
        // Remove active presets when manually editing
        presetBtns.forEach(btn => btn.classList.remove('active'));
    }
});

// Preset button handlers
presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Clear active class from all
        presetBtns.forEach(p => p.classList.remove('active'));
        
        // Add to active
        btn.classList.add('active');
        
        // Set input value and setup
        minutesInput.value = btn.dataset.time;
        setupTimer();
    });
});

// Dismiss alarm handler
dismissAlarmBtn.addEventListener('click', () => {
    alarmModal.classList.add('hidden');
    stopAudioAlarm();
    resetTimer();
});

// Initialize on page load
setupTimer();
// Set progress ring to full initially
updateProgress(100);
// Ensure correct title
document.title = 'Countdown Timer | Day 21';
