let questions = [];

const start_Btn       = document.getElementById("startBtn");
const start           = document.getElementById("start");
const quiz            = document.getElementById("quiz");
const question        = document.getElementById("question");
const options_Ele     = document.getElementById("options");
const categorySelect  = document.getElementById("categorySelect");
const difficultySelect= document.getElementById("difficultySelect");
const progressEle     = document.getElementById("progress");
const progressBar     = document.getElementById("progress-bar");
const timerEle        = document.getElementById("timer");
const prevBtn         = document.getElementById("prevBtn");
const nextBtn         = document.getElementById("nextBtn");
const resultEle       = document.getElementById("result");
const bearEmoji       = document.getElementById("bear-emoji");
const feedbackEle     = document.getElementById("feedback");
const darkToggle      = document.getElementById("darkToggle");

darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  darkToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

const BEAR = { easy: "🐻", medium: "🐻❄️", hard: "🐻🔥", "": "🧸" };


function fetchCategories() {
  fetch("https://opentdb.com/api_category.php")
    .then(res => res.json())
    .then(data => {
      categorySelect.innerHTML = '<option value="">-- Any Category --</option>';
      data.trivia_categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat.id;
        opt.textContent = cat.name;
        categorySelect.appendChild(opt);
      });
    });
}
fetchCategories();


start_Btn.addEventListener("click", () => {
  start.style.display = "none";
  quiz.style.display  = "block";
  fetchQ();
});


function decode(str) {
  const t = document.createElement("textarea");
  t.innerHTML = str;
  return t.value;
}


function fetchQ() {
  question.textContent  = "Loading...";
  bearEmoji.textContent = "🐻";
  options_Ele.innerHTML = "";
  feedbackEle.textContent = "";

  const cat  = categorySelect.value;
  const diff = difficultySelect.value;
  let url = `https://opentdb.com/api.php?amount=10&type=multiple`;
  if (cat)  url += `&category=${cat}`;
  if (diff) url += `&difficulty=${diff}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      questions = data.results.map(q => {
        const opts = [...q.incorrect_answers.map(decode), decode(q.correct_answer)];
        opts.sort(() => Math.random() - 0.5);
        return {
          text:          decode(q.question),
          correctAnswer: decode(q.correct_answer),
          difficulty:    q.difficulty,
          options:       opts
        };
      });
      idx         = 0;
      score       = 0;
      userAnswers = new Array(questions.length).fill(null);
      displayQ();
    });
}

let idx = 0, score = 0;
let userAnswers  = [];
let timerInterval = null, timeLeft = 0;


function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 15;
  updateTimerUI();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      if (idx < questions.length - 1) { idx++; displayQ(); }
      else showResult();
    }
  }, 1000);
}

function updateTimerUI() {
  timerEle.textContent = `⏱ ${timeLeft}s`;

  timerEle.className = timeLeft > 7 ? "safe" : "";
}

function displayQ() {
  const q = questions[idx];

  progressEle.textContent = `Question ${idx + 1} / ${questions.length}`;
  progressBar.style.width = `${((idx + 1) / questions.length) * 100}%`;

  bearEmoji.textContent = BEAR[q.difficulty] ?? "🐻";

  question.textContent  = q.text;
  options_Ele.innerHTML = "";
  feedbackEle.textContent = "";
  feedbackEle.className   = "";

  const labels = ["A", "B", "C", "D"];

  q.options.forEach((option, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerHTML = `<span class="opt-label">${labels[i]}</span>${option}`;
    btn.dataset.value = option; 

    if (userAnswers[idx] !== null) {
      if (option === q.correctAnswer)    btn.classList.add("correct");
      else if (option === userAnswers[idx]) btn.classList.add("wrong");
      btn.disabled = true;
      if (userAnswers[idx] === q.correctAnswer) {
        feedbackEle.textContent = "🐼 Correct!";
        feedbackEle.className   = "correct-fb";
      } else {
        feedbackEle.textContent = "🐾 Wrong!";
        feedbackEle.className   = "wrong-fb";
      }
    }

    btn.addEventListener("click", () => check(btn, option, q.correctAnswer));
    options_Ele.appendChild(btn);
  });

  prevBtn.style.visibility = idx === 0 ? "hidden" : "visible";
  nextBtn.textContent = idx === questions.length - 1 ? "Finish ✅" : "Next ➡";

  startTimer();
}

function check(button, selected, correct) {
  if (userAnswers[idx] !== null) return; 

  userAnswers[idx] = selected;

  options_Ele.querySelectorAll(".option-btn").forEach(btn => {
    const val = btn.dataset.value;
    if (val === correct)  btn.classList.add("correct");
    else if (val === selected) btn.classList.add("wrong");
    btn.disabled = true;
  });

  if (selected === correct) {
    feedbackEle.textContent = "🐼 Correct!";
    feedbackEle.className   = "correct-fb";
  } else {
    feedbackEle.textContent = "🐾 Wrong!";
    feedbackEle.className   = "wrong-fb";
  }
}

prevBtn.addEventListener("click", () => { if (idx > 0) { idx--; displayQ(); } });
nextBtn.addEventListener("click", () => {
  if (idx < questions.length - 1) { idx++; displayQ(); }
  else showResult();
});

function showResult() {
  clearInterval(timerInterval);
  quiz.style.display   = "none";
  resultEle.style.display = "block";

  score = userAnswers.filter((ans, i) => ans === questions[i].correctAnswer).length;
  const pct  = (score / questions.length) * 100;
  const hero = pct >= 70 ? "🐼" : "🧸";

  let reviewHTML = "";
  questions.forEach((q, i) => {
    const sel       = userAnswers[i];
    const isCorrect = sel === q.correctAnswer;
    const tagClass  = sel === null ? "skipped" : isCorrect ? "correct" : "wrong";
    const tagEmoji  = sel === null ? "⏭" : isCorrect ? "🐼" : "🐾";

    reviewHTML += `
      <li class="review-item">
        <p class="q-text">${BEAR[q.difficulty] ?? "🐻"} ${q.text}</p>
        <div class="ans-row">
          <span class="ans-tag ${tagClass}">${tagEmoji} ${sel ?? "Skipped"}</span>
          ${!isCorrect && sel !== null
            ? `<span class="ans-tag correct">✅ ${q.correctAnswer}</span>`
            : ""}
        </div>
      </li>`;
  });

  resultEle.innerHTML = `
    <div class="result-hero">${hero}</div>
    <h2>${pct >= 70 ? "Great job!" : "Keep practising!"}</h2>
    <div class="score-badge">${score}<span> / ${questions.length}</span></div>
    <ul class="review-list">${reviewHTML}</ul>
    <button class="btn btn-retry" id="retryBtn">🔄 Try Again</button>
  `;

  document.getElementById("retryBtn").addEventListener("click", () => {
    resultEle.style.display = "none";
    resultEle.innerHTML     = "";
    start.style.display     = "block";
    questions = []; userAnswers = []; idx = 0; score = 0;
  });
}
