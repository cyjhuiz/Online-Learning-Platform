

var url_string = window.location;
var url = new URL(url_string);
let course_ID = url.searchParams.get("courseid");
let class_ID = url.searchParams.get("classid");
let section_ID = url.searchParams.get("sectionid");
let learner_ID = url.searchParams.get("userid");

let quiz = null;
let quizQuestions = null;
let learnerScore = 0;
let timeLeft = null;

let currentQuestionNumber = 1;
let questionsFilled = [];
let currentProgressPercentage = 0;
let hasSubmittedQuiz = false;

const convertSecondsToTime = (time) => {
  let minutes = Math.floor(time / 60);
  let seconds = time % 60;
  seconds = seconds < 10 ? "0" + seconds : seconds;
  return `${minutes}: ${seconds}`;
};
const startTimer = () => {
  // Helper function
  const updateCountdown = async () => {
    if (timeLeft === 0 && hasSubmittedQuiz == false) {
      let prevButton = (document.getElementById("prevButton").hidden = true);
      let nextButton = (document.getElementById("nextButton").hidden = true);
      let submitButton = (document.getElementById(
        "submitButton"
      ).hidden = true);

      await submitQuiz();
    }

    let countDownDiv = document.getElementById("countdown");
    countDownDiv.innerHTML = convertSecondsToTime(timeLeft);
    if (timeLeft !== 0 && !hasSubmittedQuiz) {
      timeLeft--;
    }
  };

  // invoke updateCountdown every 1s interval
  setInterval(updateCountdown, 1000);
};

const prevQuestion = () => {
  let currentQuestionDiv = document.getElementById(
    `question${currentQuestionNumber}`
  );
  currentQuestionDiv.classList.add("animate__animated", "animate__fadeOut");
  setTimeout(() => {
    currentQuestionDiv.hidden = true;
    currentQuestionDiv.classList.remove(
      "animate__animated",
      "animate__fadeOut"
    );

    let prevQuestionDiv = document.getElementById(
      `question${currentQuestionNumber - 1}`
    );

    prevQuestionDiv.classList.add("animate__animated", "animate__fadeIn");
    prevQuestionDiv.hidden = false;
    currentQuestionNumber -= 1;

    if (currentQuestionNumber === 1) {
      let prevButton = (document.getElementById("prevButton").hidden = true);
    }
    if (currentQuestionNumber === quizQuestions.length - 1) {
      let submitButton = (document.getElementById(
        "submitButton"
      ).hidden = true);
      let nextButton = (document.getElementById("nextButton").hidden = false);
    }
  }, 750);
};

const nextQuestion = () => {
  let currentQuestionDiv = document.getElementById(
    `question${currentQuestionNumber}`
  );
  currentQuestionDiv.classList.add("animate__animated", "animate__fadeOut");
  setTimeout(() => {
    currentQuestionDiv.hidden = true;
    currentQuestionDiv.classList.remove(
      "animate__animated",
      "animate__fadeOut"
    );

    let nextQuestionDiv = document.getElementById(
      `question${currentQuestionNumber + 1}`
    );
    nextQuestionDiv.classList.add("animate__animated", "animate__fadeIn");
    nextQuestionDiv.hidden = false;
    currentQuestionNumber += 1;

    if (
      currentQuestionNumber > 1 &&
      currentQuestionNumber < quizQuestions.length
    ) {
      let prevButton = (document.getElementById("prevButton").hidden = false);
    }

    if (currentQuestionNumber == quizQuestions.length) {
      let nextButton = (document.getElementById("nextButton").hidden = true);
      let submitButton = (document.getElementById(
        "submitButton"
      ).hidden = false);
    }
  }, 750);
};

const updateProgressBar = (name) => {
  let questionNumber = name;
  if (questionsFilled.includes(questionNumber) === false) {
    questionsFilled.push(questionNumber);
    currentProgressPercentage = parseFloat(
      (questionsFilled.length / quizQuestions.length) * 100
    ).toFixed(2);
    document.getElementById("progressBarColorFill").style.width =
      currentProgressPercentage + "%";
  }
};

const enableSubmitButton = () => {
  if (questionsFilled.length === quizQuestions.length) {
    let submitButton = (document.getElementById(
      "submitButton"
    ).firstChild.disabled = false);
  }
};

const displayQuiz = async () => {
  // Get quiz questions from quizAPI
  let response = await fetch(
    `https://quiz-container-7ii64z76zq-uc.a.run.app/quiz?class_ID=${class_ID}&section_ID=${section_ID}`
  );
  response = await response.json();
  quiz = response.data.quiz;
  quizQuestions = quiz.quiz_questions;

  // add questions to quiz_container
  let quizContainer = document.getElementById("quizContainer");

  timeLeft = quiz.duration * 60;
  let timeStr = convertSecondsToTime(timeLeft);
  let progressBar = `<div class="progress timer-div" style="border-bottom-left-radius: 0px; border-bottom-right-radius: 0px;" >
                      <div id="progressBarColorFill" class="progress-bar quiz-progress" role="progressbar" aria-valuenow="0"
                      aria-valuemin="0" aria-valuemax="${quizQuestions.length}" style="width:${currentProgressPercentage}%;">
                      </div>
                      <div id="countdown" class="timer-text" style="position: absolute; left:5%; right: 0; margin-left: auto; margin-right: auto; width: 100px">${timeStr}</div>
                  </div>`;
  quizContainer.innerHTML += progressBar;

  // timeLeft = quiz.duration * 60;
  // let timeStr = convertSecondsToTime(timeLeft);
  // let countDownDiv = `<div class="ms-auto me-3 w-25 mt-3">
  //                     <div class="text-center d-flex p-1">
  //                       Time Left <div id="countdown" class="">${timeStr}</div>
  //                     </div>
  //                 </div>`;

  // header += countDownDiv;
  // header += `</div>`;
  // quizContainer.innerHTML += header;

  for (i = 0; i < quizQuestions.length; i++) {
    let questionNumber = i + 1;
    let quizQuestion = quizQuestions[i];
    // set question name
    let isHidden = questionNumber > 1;
    let isFirstQuestion = questionNumber == 1;

    let quizQuestionDiv = `
        <div id="question${questionNumber}" class="quiz-header ${
      isFirstQuestion ? "animate__animated animate__fadeIn" : ""
    }" ${isHidden ? "hidden" : ""}>
        <h2>Q${questionNumber}: ${quizQuestion.question} (${quizQuestion.point} points)</h2>
        `;
    // add question options
    let options = `<ul>`;
    for (key in quizQuestion) {
      if (key.includes("option") && quizQuestion[key] !== null) {
        let optionValue = quizQuestion[key];
        let option = `<li>
                            <div class="form-check">
                                <input
                                class="form-check-input quiz-option"
                                type="radio"
                                id="question${
                                  questionNumber + "-" + optionValue
                                }"
                                name="question${questionNumber}"
                                value="${optionValue}"
                                onClick="updateProgressBar(this.name); enableSubmitButton();"
                                />
                                <label id="question${
                                  questionNumber + "-" + optionValue
                                }label" class="form-check-label" for="question${
          questionNumber + "-" + optionValue
        }">
                                ${optionValue}
                                </label>
                            </div>
                        </li>`;
        options += option;
      }
    }
    options += `</ul>`;
    quizQuestionDiv += options;

    quizQuestionDiv += `</div>`;

    quizContainer.innerHTML += quizQuestionDiv;
  }

  // button
  let hasOnly1Question =  quizQuestions.length === 1;
  buttonMenuDiv = `<div class="d-flex flex-row justify-content-end p-3">
                        <div id="leftMostMenuButton" class="align-self-start">
                        <div id="leftMenuButton" class="mx-1">
                            <div id="prevButton" hidden><button type="button" class="btn btn-outline-secondary" onClick="prevQuestion()">Prev</button></div>
                        </div>
                        <div id="rightMenuButton" class="mx-0">
                            <div id="nextButton"" ${hasOnly1Question ? "hidden": ""}><button type="button" class="btn btn-outline-primary" onClick="nextQuestion()">Next</button></div>
                            <div id="submitButton" ${hasOnly1Question ? "": "hidden"}><button type="button" class="btn btn-outline-primary" onClick="submitQuiz()" disabled>Submit</button></div>
                        </div>
                    </div>`;
  quizContainer.innerHTML += buttonMenuDiv;

  startTimer();
};

const submitQuiz = async () => {
  // stop timer using hasSubmitQuiz
  hasSubmittedQuiz = true;

  // hide last question
  let lastQuestionDiv = (document.getElementById(
    `question${quizQuestions.length}`
  ).hidden = true);

  // show loading spinner for result marking
  // ==== TEST CODE ===
  // === END ===

  for (i = 0; i < quizQuestions.length; i++) {
    let questionNumber = i + 1;
    let quizQuestion = quizQuestions[i];

    let userAnswerExists = !!document.querySelector(
      `input[name="question${questionNumber}"]:checked`
    );

    if (userAnswerExists) {
      let userAnswer = document.querySelector(
        `input[name="question${questionNumber}"]:checked`
      ).value;

      let isCorrect = true;
      if (userAnswer !== quizQuestion.answer) {
        let userAnswerLabel = (document.getElementById(
          `question${questionNumber}-${userAnswer}label`
        ).innerHTML += `❌`);
        isCorrect = false;
      }

      if (isCorrect) {
        learnerScore += quizQuestion.point;
      }
    }

    let actualAnswer = (document.getElementById(
      `question${questionNumber}-${quizQuestion.answer}label`
    ).innerHTML += `✔️`);
  }

  let hasPassed = learnerScore / quiz.points >= quiz.passing_rate;

  let quizSubmission = {
    quiz_ID: quiz.quiz_ID,
    class_ID: quiz.class_ID,
    section_ID: quiz.section_ID,
    learner_ID: learner_ID,
    quiz_score: learnerScore,
    has_passed: hasPassed,
  };

  // Comment out below to test marking for graded quiz
  // quiz.grading_type = "graded";
  if (quiz.grading_type === "ungraded") {
    quizSubmission.quiz_score = null;
    quizSubmission.has_passed = true;
  }

  var newHeader = document.createElement("div");
  newHeader.innerHTML = `<div class="container text-center my-3">
                                <h1>Quiz Results</h1>
                          </div>`;

  quizContainer.insertBefore(newHeader, quizContainer.children[1]);


  for (i = 0; i < quizQuestions.length; i++) {
    let questionNumber = i + 1;
    let currentQuestionDiv = document.getElementById(
      `question${questionNumber}`
    );
    currentQuestionDiv.style.paddingBottom = "0";
    currentQuestionDiv.innerHTML += "<br><hr>";
    currentQuestionDiv.hidden = false;
  }

  if (quiz.grading_type == "graded") {
    var resultDiv = document.createElement("div");
    resultDiv.innerHTML = `
        <div class="container text-end me-4 pe-4">
          Quiz Score: ${learnerScore + "/" + quiz.points} <br>
          Passing Rate: ${quiz.passing_rate * 100}% <br>
          Final Quiz Percentage: ${
            parseFloat(learnerScore / quiz.points).toFixed(2) * 100
          }% <br>
          <div id="returnButton" hidden><button type="button" class="btn btn-outline-primary" onclick="returnclass()">Return to Class</button></div>

        </div>
      `;
    quizContainer.insertBefore(resultDiv, quizContainer.lastChild);
  } else {
	   var resultDiv = document.createElement("div");
		resultDiv.innerHTML = `
        <div class="container text-end me-4 pe-4">
          Quiz Score: ${learnerScore + "/" + quiz.points} <br>
          Quiz Percentage: ${
            parseFloat(learnerScore / quiz.points).toFixed(2) * 100
          }% <br>
          <div id="returnButton" hidden><button type="button" class="btn btn-outline-primary" onclick="returnsection()">Return to Section</button></div>

        </div>
      `;
	  quizContainer.insertBefore(resultDiv, quizContainer.lastChild);
	  
  }


  document.getElementById("prevButton").hidden = true;
  document.getElementById("submitButton").hidden = true;
  document.getElementById("returnButton").hidden = false;

  let response = await fetch(
    "https://quiz-container-7ii64z76zq-uc.a.run.app/quiz/submit",
    {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json;",
      },
      body: JSON.stringify(quizSubmission),
    }
  );

  response = await response.json();

  if (response.code == 200) {
    alert("Quiz submitted successfully");
  } else {
    alert("Error occured when submitting quiz");
  }
};

function returnsection(){
  window.location.href = "attendsection.html?sectionid=" + section_ID + "&classid=" + class_ID + "&courseid=" + course_ID
}

function returnclass(){
  window.location.href = "attendclass.html?" + course_ID + "_" + class_ID 
}
