// ===================== CONFIG =====================
const BASE_PATH = "./";

const SECTION_FILES = {
  "Word Knowledge": "word_knowledge.json",
  "Arithmetic Reasoning": "arithmetic_reasoning.json",
  "Math Knowledge": "math_knowledge.json",
  "Verbal Analogies": "verbal_analogies.json",
  "Aviation Information": "aviation_information.json",
  "Physical Science": "physical_science.json"
};

const SECTION_TIME = {
  "Word Knowledge": 300,
  "Arithmetic Reasoning": 1800,
  "Math Knowledge": 1320,
  "Verbal Analogies": 480,
  "Aviation Information": 480,
  "Physical Science": 600
};

// ===================== STATE =====================
let currentSection = "";
let questions = [];
let currentQuestionIndex = 0;
let answers = [];
let timer = null;
let timeLeft = 0;

// ===================== ELEMENTS =====================
const home = document.getElementById("home");
const test = document.getElementById("test");
const results = document.getElementById("results");

const sectionTitle = document.getElementById("sectionTitle");
const timerDiv = document.getElementById("timer");
const questionDiv = document.getElementById("question");
const optionsDiv = document.getElementById("options");
const resultsContent = document.getElementById("resultsContent");
const resultTitle = document.getElementById("resultTitle");

// ===================== START SECTION =====================
async function startSingleSection(sectionName) {
  try {
    const res = await fetch(BASE_PATH + SECTION_FILES[sectionName]);
    if (!res.ok) throw new Error("File not found");

    const data = await res.json();

    currentSection = data.section;
    questions = data.questions;
    currentQuestionIndex = 0;
    answers = new Array(questions.length).fill(null);

    timeLeft = SECTION_TIME[currentSection];
    startTimer();

    home.classList.add("hidden");
    results.classList.add("hidden");
    test.classList.remove("hidden");

    sectionTitle.innerText = currentSection;
    renderQuestion();
  } catch (err) {
    alert("❌ Error loading questions. Check file name.");
    console.error(err);
  }
}

// ===================== TIMER =====================
function startTimer() {
  clearInterval(timer);
  updateTimer();

  timer = setInterval(() => {
    timeLeft--;
    updateTimer();

    if (timeLeft <= 0) {
      clearInterval(timer);
      finishSection();
    }
  }, 1000);
}

function updateTimer() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  timerDiv.innerText = `Time: ${m}:${s.toString().padStart(2, "0")}`;
}

// ===================== RENDER QUESTION =====================
function renderQuestion() {
  const q = questions[currentQuestionIndex];

  questionDiv.innerText = `Q${currentQuestionIndex + 1}. ${q.q}`;
  optionsDiv.innerHTML = "";

  q.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.innerText = opt;

    if (answers[currentQuestionIndex] === idx) {
      btn.classList.add("selected");
    }

    btn.onclick = () => {
      answers[currentQuestionIndex] = idx;
      renderQuestion();
    };

    optionsDiv.appendChild(btn);
  });
}

// ===================== NAV =====================
function nextQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  } else {
    finishSection();
  }
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
  }
}

// ===================== FINISH SECTION =====================
function finishSection() {
  clearInterval(timer);

  let correctCount = 0;
  let reviewHTML = "";

  questions.forEach((q, i) => {
    const userIndex = answers[i];
    const userAnswer = userIndex !== null ? q.options[userIndex] : "Not Answered";
    const isCorrect = userAnswer === q.correct;

    if (isCorrect) correctCount++;

    reviewHTML += `
      <div style="
        border: 1px solid ${isCorrect ? '#4CAF50' : '#F44336'};
        padding: 12px;
        margin: 12px 0;
        border-radius: 6px;
        background: ${isCorrect ? '#e8f5e9' : '#fdecea'};
      ">
        <p><strong>Q${i + 1}.</strong> ${q.q}</p>
        <p><strong>Your Answer:</strong> ${userAnswer}</p>
        <p><strong>Correct Answer:</strong> ${q.correct}</p>
        <p style="font-weight:bold; color:${isCorrect ? 'green' : 'red'}">
          ${isCorrect ? '✅ Correct' : '❌ Wrong'}
        </p>
      </div>
    `;
  });

  const total = questions.length;
  const percent = Math.round((correctCount / total) * 100);

  test.classList.add("hidden");
  results.classList.remove("hidden");

  resultTitle.innerText = `${currentSection} Results`;

  resultsContent.innerHTML = `
    <h3>Score Summary</h3>
    <p><strong>Score:</strong> ${correctCount} / ${total}</p>
    <p><strong>Percentage:</strong> ${percent}%</p>
    <hr />
    <h3>Question Review</h3>
    ${reviewHTML}
  `;
}


// ===================== HOME =====================
function goHome() {
  results.classList.add("hidden");
  test.classList.add("hidden");
  home.classList.remove("hidden");
}
