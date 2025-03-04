document.getElementById('addQuizBtn').addEventListener('click', addQuiz)

function addQuiz() {
    if (document.getElementById("quizModal")) return;

    const formHTML = `
    <div id="quizModal" class="modal">
        <div class="modal-content">
            <span class="close" id="closeQuizBtn">&times;</span>
            <h2>Ajouter un nouveau Quiz</h2>

                <label>Titre du quiz :</label>
                <input type="text" id="quizTitle" placeholder="Titre du quiz" required>

                <h3>Questions</h3>
                <div id="questionsContainer"></div>

                <button id="addQuestionBtn">Ajouter une question</button>
                <br><br>
            <button id="saveQuizBtn">Enregistrer</button>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML("beforeend", formHTML);

    const modal = document.getElementById("quizModal");

    setTimeout(() => modal.classList.add("show"), 10);

    document.getElementById('closeQuizBtn').addEventListener('click', closeQuiz);
    document.getElementById('addQuestionBtn').addEventListener('click', addQuestion);
    document.getElementById('saveQuizBtn').addEventListener('click', saveQuiz);

    setTimeout(() => {
        document.getElementById('addQuestionBtn').addEventListener('click', addQuestion);
    }, 100);

    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeQuiz();
    });
}

function closeQuiz() {
    const modal = document.getElementById("quizModal");
    modal.classList.remove("show");
    modal.classList.add("hide");

    setTimeout(() => {
        modal.style.display = "none";
        modal.classList.remove("hide");
        modal.remove();
    }, 300);
}

function addQuestion() {
    let questionIndex = document.querySelectorAll(".question-block").length;
    
    const questionHTML = `
        <div class="question-block">
            <input type="text" class="question" placeholder="Question ${questionIndex + 1}" required>
            <div class="answers">
                <input type="text" class="answer" placeholder="Réponse 1">
                <input type="text" class="answer" placeholder="Réponse 2">
                <input type="text" class="answer" placeholder="Réponse 3">
                <input type="text" class="answer" placeholder="Réponse 4">
            </div>
            <label>Bonne réponse (1-4) :</label>
            <input type="number" class="correct-answer" min="1" max="4" required>
        </div>
    `;

    document.getElementById("questionsContainer").insertAdjacentHTML("beforeend", questionHTML);

    setTimeout(() => {
        document.getElementById("quizModal").classList.add("show");
    }, 10);
}

let quizzes = JSON.parse(localStorage.getItem("quizzes")) || [];

function generateQuizID() {
    return "quiz_" + crypto.randomUUID(); 
}

function saveQuiz() {
    let title = document.getElementById("quizTitle").value;
    let questionBlocks = document.querySelectorAll(".question-block");

    if (title.trim() === "" || questionBlocks.length === 0) {
        alert("Veuillez entrer un titre et au moins une question !");
        return;
    }

    let questions = [];

    questionBlocks.forEach(block => {
        let questionText = block.querySelector(".question").value;
        let answers = Array.from(block.querySelectorAll(".answer")).map(input => input.value);
        let correctAnswer = block.querySelector(".correct-answer").value;
        
        if (questionText.trim() === "" || answers.some(a => a.trim() === "") || correctAnswer < 1 || correctAnswer > 4) {
            alert("Veuillez remplir correctement toutes les questions et réponses !");
            return;
        }

        questions.push({
            question: questionText,
            answers: answers,
            correct: parseInt(correctAnswer) - 1
        });
});


const quiz = {
    id: generateQuizID(),
    title: title,
    questions: questions
};

quizzes.push(quiz);
localStorage.setItem("quizzes", JSON.stringify(quizzes));
alert("Quiz ajouté avec succès !");

closeQuiz();
updateQuizList();
}

function updateQuizList() {
    const quizListDiv = document.getElementById("quizList");
    quizListDiv.innerHTML = "";


    quizzes.forEach((quiz, index) => {
        const quizItem = document.createElement("div");
        quizItem.classList.add("quiz-item");

        const quizBtn = document.createElement("button");
        quizBtn.textContent = quiz.title;
        quizBtn.classList.add("quiz-btn");
        quizBtn.dataset.quizId = quiz.id;
        quizBtn.addEventListener("click", () => openQuiz(quiz.id));

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.dataset.quizId = quiz.id;
        deleteBtn.addEventListener("click", () => deleteQuiz(quiz.id));

        quizItem.appendChild(quizBtn);
        quizItem.appendChild(deleteBtn);
        quizListDiv.appendChild(quizItem);
    });
}


let currentQuestionIndex = 0;
const quizContainer = document.getElementById("quiz-container");

function openQuiz(quizId) {
    console.log("Ouverture du quiz avec l'ID :", quizId);

    if (!quizId) {
        alert("Erreur : ID du quiz introuvable !");
        return;
    }

    const quiz = quizzes.find(q => q.id == quizId);
    if (!quiz) {
        alert("Quiz introuvable !");
        return;
    }

    currentQuestionIndex = 0;
    document.getElementById("quizList").style.display = "none"; 
    quizContainer.style.display = "flex"; 

    showQuestion(quizId);
}

let timer;
let timeLeft = 10;

let score = 0;

function showQuestion(quizId) {
    const quiz = quizzes.find(q => q.id == quizId);
    if (!quiz) return;

    if (currentQuestionIndex >= quiz.questions.length) {
        quizContainer.innerHTML = `
        <h2>Quiz terminé ! 🎉</h2>
        <div id="scoreBoard">Votre score est :<span class="scoreText">${score}</span></div>
        `;
        const backBtn = document.createElement("button");
        backBtn.id = "backToMenuBtn";
        backBtn.innerHTML = "Retour";
        backBtn.addEventListener("click", backToQuizMenu);
        quizContainer.append(backBtn);
        score = 0;
        return;
    }

    const q = quiz.questions[currentQuestionIndex];
    quizContainer.innerHTML = `
        <h2>${q.question}</h2>
        <div id="timer"><span id="timeLeft">${timeLeft}</span></div>
        <div id="questionIndicator">${currentQuestionIndex + 1}/${quiz.questions.length}</div>
        <div id="answers">
            ${q.answers.map(a => `<button class="answer-btn">${a}</button>`).join("")}
        </div>
    `;

    if (!document.getElementById("backToMenuBtn")) {
        const backBtn = document.createElement("button");
        backBtn.id = "backToMenuBtn";
        backBtn.innerHTML = "Retour";
        backBtn.addEventListener("click", backToQuizMenu);
        quizContainer.append(backBtn);  
    } 

    document.querySelectorAll(".answer-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            clearInterval(timer);
            checkAnswer(e.target.textContent, quizId);
        });
    });

    startTimer(quizId);
}

function startTimer(quizId) {
    timeLeft = 10;
    document.getElementById("timeLeft").textContent = timeLeft;

    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timeLeft").innerHTML = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
            console.log("⏳ Temps écoulé !");
            currentQuestionIndex++;
            showQuestion(quizId);
        }
    }, 1000);
}

function checkAnswer(answer, quizId) {
    const quiz = quizzes.find(q => q.id == quizId);
    const q = quiz.questions[currentQuestionIndex];
    const checkAnswerContainer = document.createElement("p");
    quizContainer.append(checkAnswerContainer);
    checkAnswerContainer.classList.add("check-answer");

    if (answer === q.answers[q.correct]) { 
        checkAnswerContainer.innerHTML = "Bonne réponse ! ✅";
        score++;
    } else {
        checkAnswerContainer.innerHTML = "Mauvaise réponse ! ❌"
    }

    setTimeout(() => {
        currentQuestionIndex++;
        showQuestion(quizId);
    }, 1000);
}

function backToQuizMenu() {
    const quizListDiv = document.getElementById("quizList");
    const quizContainer = document.getElementById("quiz-container");
    quizListDiv.style.display = "flex";
    quizContainer.style.display = "none";

    updateQuizList();
}

window.onload = () => {
    updateQuizList();
}

function deleteQuiz(quizId) {
    if (!confirm("Voulez-vous vraiment supprimer ce quiz ?")) return;

    quizzes = quizzes.filter(q => q.id !== quizId);

    localStorage.setItem("quizzes", JSON.stringify(quizzes));
    updateQuizList();
}