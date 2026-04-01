let questions = [];

const start_Btn = document.getElementById("startBtn")
const start = document.getElementById("start")
const quiz = document.getElementById("quiz")

const question = document.getElementById("question")
const options_Ele = document.getElementById("options")


start_Btn.addEventListener("click", () => {
  start.style.display = "none";
  quiz.style.display = "block";

  fetchQ();
})


function fetchQ() {
  question.textContent = "🐻 Loading..." ;

  fetch('https://the-trivia-api.com/v2/questions')
  .then(response => response.json())
  .then(data => {
    questions = data;
    
    displayQ();
  });
}


let idx = 0;
let score = 0;

function displayQ(){
  const q = questions[idx]

  if (idx >= questions.length) {
  question.textContent = "🐻 Quiz Finished!";
  options_Ele.innerHTML = "";
  return;
}

  question.textContent = q.question.text;

  let options = [...q.incorrectAnswers, q.correctAnswer]
  options.sort(() => Math.random() - 0.5);
  options_Ele.innerHTML = ""
  options.forEach(option => {
    const optionBtn = document.createElement("button");
    optionBtn.textContent = option;
    optionBtn.style.display = "block";
    optionBtn.style.margin = "10px auto";
    optionBtn.style.padding = "10px";
 
  optionBtn.addEventListener("click",() =>  check(optionBtn, option, q.correctAnswer));
  
  options_Ele.appendChild(optionBtn);
 })
};

function check(button, selected, correct) {
  if (selected === correct) {
    button.style.background = "green";
    score++
    } else {
    button.style.background = "red";
    }

  setTimeout(() => {
    idx++;
    displayQ();
    }, 1000);
}



