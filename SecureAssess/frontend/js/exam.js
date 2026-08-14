// ========================================
// SECUREASSESS
// EXAM ENGINE
// FRONTEND DEMONSTRATION
// ========================================


// ========================================
// EXAM CONFIGURATION
// ========================================

const TOTAL_QUESTIONS = 30;

const MAX_WARNINGS = 3;


// ========================================
// QUESTION DATA
// ========================================
//
// IMPORTANT:
// These are temporary frontend questions.
// Later Spring Boot will send the questions
// from MySQL.
//

const questions = [

    {
        id: 1,
        question:
            "Which data structure follows the LIFO principle?",
        options: {
            A: "Queue",
            B: "Stack",
            C: "Linked List",
            D: "Tree"
        },
        correct: "B",
        marks: 1
    },

    {
        id: 2,
        question:
            "Which data structure follows the FIFO principle?",
        options: {
            A: "Stack",
            B: "Queue",
            C: "Heap",
            D: "Graph"
        },
        correct: "B",
        marks: 1
    },

    {
        id: 3,
        question:
            "What is the average time complexity of binary search?",
        options: {
            A: "O(n)",
            B: "O(n²)",
            C: "O(log n)",
            D: "O(1)"
        },
        correct: "C",
        marks: 1
    },

    {
        id: 4,
        question:
            "Which traversal visits Root, Left, Right?",
        options: {
            A: "Preorder",
            B: "Inorder",
            C: "Postorder",
            D: "Level Order"
        },
        correct: "A",
        marks: 1
    },

    {
        id: 5,
        question:
            "Which sorting algorithm uses divide and conquer?",
        options: {
            A: "Bubble Sort",
            B: "Selection Sort",
            C: "Merge Sort",
            D: "Linear Search"
        },
        correct: "C",
        marks: 1
    },

    {
        id: 6,
        question:
            "Which data structure provides average O(1) lookup?",
        options: {
            A: "Array",
            B: "Hash Table",
            C: "Linked List",
            D: "Stack"
        },
        correct: "B",
        marks: 1
    },

    {
        id: 7,
        question:
            "What is the time complexity of traversing an array of n elements?",
        options: {
            A: "O(n)",
            B: "O(log n)",
            C: "O(n²)",
            D: "O(1)"
        },
        correct: "A",
        marks: 1
    },

    {
        id: 8,
        question:
            "Which of the following is a non-linear data structure?",
        options: {
            A: "Array",
            B: "Stack",
            C: "Queue",
            D: "Binary Tree"
        },
        correct: "D",
        marks: 1
    },

    {
        id: 9,
        question:
            "Which data structure is commonly used to represent networks?",
        options: {
            A: "Array",
            B: "Stack",
            C: "Graph",
            D: "Queue"
        },
        correct: "C",
        marks: 1
    },

    {
        id: 10,
        question:
            "Which data structure is commonly used to implement a priority queue?",
        options: {
            A: "Stack",
            B: "Heap",
            C: "Array",
            D: "Linked List"
        },
        correct: "B",
        marks: 1
    }

];


// ========================================
// TEMPORARY PLACEHOLDER QUESTIONS
// ========================================
//
// Your UI currently supports 30 questions.
// Until Spring Boot provides the real
// questions, generate placeholders.
//

for (
    let i = questions.length + 1;
    i <= TOTAL_QUESTIONS;
    i++
) {

    questions.push({

        id: i,

        question:
            `Sample examination question ${i}. This question will be replaced by the question received from the Spring Boot backend.`,

        options: {

            A: "Option A",

            B: "Option B",

            C: "Option C",

            D: "Option D"

        },

        correct: "A",

        marks: 1

    });

}


// ========================================
// STATE
// ========================================

let currentQuestion = 0;

let answers = {};

let markedForReview = new Set();

let remainingSeconds = 45 * 60;

let timerInterval = null;

let warningCount = 0;

let tabSwitches = 0;

let fullscreenExits = 0;

let copyAttempts = 0;

let examSubmitted = false;

let examStartedAt = null;


// ========================================
// INITIALIZE
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeExam();

    }
);


// ========================================
// INITIALIZE EXAM
// ========================================

function initializeExam() {

    examStartedAt =
        new Date();


    localStorage.setItem(
        "examStartedAt",
        examStartedAt.toISOString()
    );


    loadSavedState();

    setupQuestionNavigation();

    setupSecurityControls();

    setupSubmitControls();

    renderQuestion();

    renderQuestionNavigator();

    updateAllUI();

    startTimer();

}


// ========================================
// LOAD SAVED STATE
// ========================================

function loadSavedState() {

    const savedAnswers =
        localStorage.getItem(
            "examAnswers"
        );


    if (savedAnswers) {

        try {

            answers =
                JSON.parse(
                    savedAnswers
                );

        } catch (error) {

            answers = {};

        }

    }


    const savedReview =
        localStorage.getItem(
            "examMarkedQuestions"
        );


    if (savedReview) {

        try {

            markedForReview =
                new Set(
                    JSON.parse(
                        savedReview
                    )
                );

        } catch (error) {

            markedForReview =
                new Set();

        }

    }

}


// ========================================
// SAVE STATE
// ========================================

function saveState() {

    localStorage.setItem(
        "examAnswers",
        JSON.stringify(
            answers
        )
    );


    localStorage.setItem(
        "examMarkedQuestions",
        JSON.stringify(
            [...markedForReview]
        )
    );

}


// ========================================
// RENDER QUESTION
// ========================================

function renderQuestion() {

    const question =
        questions[currentQuestion];


    if (!question) {

        return;

    }


    const questionNumber =
        document.getElementById(
            "questionNumber"
        );


    const questionText =
        document.getElementById(
            "questionText"
        );


    const optionsContainer =
        document.getElementById(
            "optionsContainer"
        );


    const questionMarks =
        document.getElementById(
            "questionMarks"
        );


    if (questionNumber) {

        questionNumber.textContent =
            `Question ${String(
                currentQuestion + 1
            ).padStart(2, "0")}`;

    }


    if (questionText) {

        questionText.textContent =
            question.question;

    }


    if (questionMarks) {

        questionMarks.textContent =
            `${question.marks} mark${question.marks > 1 ? "s" : ""}`;

    }


    if (!optionsContainer) {

        return;

    }


    optionsContainer.innerHTML =
        "";


    const letters =
        ["A", "B", "C", "D"];


    letters.forEach(
        letter => {

            const option =
                document.createElement(
                    "div"
                );


            option.className =
                "option";


            if (
                answers[question.id] ===
                letter
            ) {

                option.classList.add(
                    "selected"
                );

            }


            option.innerHTML = `

                <span class="option-letter">
                    ${letter}
                </span>

                <span class="option-text">
                    ${escapeHTML(
                        question.options[letter]
                    )}
                </span>

            `;


            option.addEventListener(
                "click",
                () => {

                    selectAnswer(
                        question.id,
                        letter
                    );

                }
            );


            optionsContainer.appendChild(
                option
            );

        }
    );


    updateNavigationButtons();

}


// ========================================
// SELECT ANSWER
// ========================================

function selectAnswer(
    questionId,
    answer
) {

    if (examSubmitted) {

        return;

    }


    answers[questionId] =
        answer;


    saveState();

    renderQuestion();

    updateAllUI();

}


// ========================================
// QUESTION NAVIGATION
// ========================================

function setupQuestionNavigation() {

    const previousButton =
        document.getElementById(
            "previousButton"
        );


    const nextButton =
        document.getElementById(
            "nextButton"
        );


    const markButton =
        document.getElementById(
            "markButton"
        );


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            () => {

                if (
                    currentQuestion > 0
                ) {

                    currentQuestion--;

                    renderQuestion();

                    updateAllUI();

                }

            }
        );

    }


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            () => {

                if (
                    currentQuestion <
                    questions.length - 1
                ) {

                    currentQuestion++;

                    renderQuestion();

                    updateAllUI();

                } else {

                    openSubmitModal();

                }

            }
        );

    }


    if (markButton) {

        markButton.addEventListener(
            "click",
            toggleMarkForReview
        );

    }

}


// ========================================
// MARK FOR REVIEW
// ========================================

function toggleMarkForReview() {

    const questionId =
        questions[currentQuestion].id;


    if (
        markedForReview.has(
            questionId
        )
    ) {

        markedForReview.delete(
            questionId
        );

    } else {

        markedForReview.add(
            questionId
        );

    }


    saveState();

    updateAllUI();

}


// ========================================
// QUESTION NAVIGATOR
// ========================================

function renderQuestionNavigator() {

    const container =
        document.getElementById(
            "questionNavigator"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    questions.forEach(
        (question, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "question-nav";


            button.textContent =
                index + 1;


            button.addEventListener(
                "click",
                () => {

                    currentQuestion =
                        index;

                    renderQuestion();

                    updateAllUI();

                }
            );


            container.appendChild(
                button
            );

        }
    );


    updateQuestionNavigator();

}


// ========================================
// UPDATE QUESTION NAVIGATOR
// ========================================

function updateQuestionNavigator() {

    const buttons =
        document.querySelectorAll(
            ".question-nav"
        );


    buttons.forEach(
        (button, index) => {

            button.classList.remove(
                "current"
            );

            button.classList.remove(
                "answered"
            );

            button.classList.remove(
                "review"
            );


            const questionId =
                questions[index].id;


            if (
                index ===
                currentQuestion
            ) {

                button.classList.add(
                    "current"
                );

            }


            if (
                answers[questionId]
            ) {

                button.classList.add(
                    "answered"
                );

            }


            if (
                markedForReview.has(
                    questionId
                )
            ) {

                button.classList.add(
                    "review"
                );

            }

        }
    );

}


// ========================================
// NAVIGATION BUTTONS
// ========================================

function updateNavigationButtons() {

    const previousButton =
        document.getElementById(
            "previousButton"
        );


    const nextButton =
        document.getElementById(
            "nextButton"
        );


    const markButton =
        document.getElementById(
            "markButton"
        );


    if (previousButton) {

        previousButton.disabled =
            currentQuestion === 0;

    }


    if (nextButton) {

        nextButton.textContent =
            currentQuestion ===
            questions.length - 1
                ? "Finish"
                : "Next";

    }


    if (markButton) {

        const questionId =
            questions[currentQuestion].id;


        markButton.textContent =
            markedForReview.has(
                questionId
            )
                ? "Unmark"
                : "Mark for review";

    }

}


// ========================================
// UPDATE ALL UI
// ========================================

function updateAllUI() {

    updateQuestionNavigator();

    updateNavigationButtons();

    updateProgress();

    updateCounters();

    updateIntegrityUI();

}


// ========================================
// PROGRESS
// ========================================

function updateProgress() {

    const progress =
        (
            (currentQuestion + 1) /
            questions.length
        ) * 100;


    const progressBar =
        document.getElementById(
            "progressBar"
        );


    if (progressBar) {

        progressBar.style.width =
            `${progress}%`;

    }

}


// ========================================
// COUNTERS
// ========================================

function updateCounters() {

    const answered =
        Object.keys(
            answers
        ).length;


    const unanswered =
        questions.length -
        answered;


    const answeredElement =
        document.getElementById(
            "answeredCount"
        );


    const unansweredElement =
        document.getElementById(
            "unansweredCount"
        );


    if (answeredElement) {

        answeredElement.textContent =
            answered;

    }


    if (unansweredElement) {

        unansweredElement.textContent =
            unanswered;

    }

}


// ========================================
// TIMER
// ========================================

function startTimer() {

    updateTimer();


    timerInterval =
        setInterval(
            () => {

                if (
                    examSubmitted
                ) {

                    return;

                }


                remainingSeconds--;


                updateTimer();


                if (
                    remainingSeconds <= 0
                ) {

                    clearInterval(
                        timerInterval
                    );


                    submitExam(
                        "TIME_EXPIRED"
                    );

                }

            },
            1000
        );

}


// ========================================
// UPDATE TIMER
// ========================================

function updateTimer() {

    const minutes =
        Math.floor(
            remainingSeconds / 60
        );


    const seconds =
        remainingSeconds % 60;


    const timer =
        document.getElementById(
            "timer"
        );


    if (timer) {

        timer.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    }

}


// ========================================
// SECURITY CONTROLS
// ========================================

function setupSecurityControls() {


    // ------------------------------
    // TAB SWITCH
    // ------------------------------

    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.hidden &&
                !examSubmitted
            ) {

                tabSwitches++;

                registerWarning(
                    "You switched away from the examination window."
                );

            }

        }
    );


    // ------------------------------
    // FULLSCREEN
    // ------------------------------

    document.addEventListener(
        "fullscreenchange",
        () => {

            if (
                !document.fullscreenElement &&
                !examSubmitted
            ) {

                fullscreenExits++;


                registerWarning(
                    "Fullscreen mode was exited."
                );

            }

        }
    );


    // ------------------------------
    // COPY
    // ------------------------------

    document.addEventListener(
        "copy",
        event => {

            event.preventDefault();

            copyAttempts++;

            updateIntegrityUI();

        }
    );


    // ------------------------------
    // CUT
    // ------------------------------

    document.addEventListener(
        "cut",
        event => {

            event.preventDefault();

            copyAttempts++;

            updateIntegrityUI();

        }
    );


    // ------------------------------
    // PASTE
    // ------------------------------

    document.addEventListener(
        "paste",
        event => {

            event.preventDefault();

            copyAttempts++;

            updateIntegrityUI();

        }
    );


    // ------------------------------
    // RIGHT CLICK
    // ------------------------------

    document.addEventListener(
        "contextmenu",
        event => {

            event.preventDefault();

        }
    );


    // ------------------------------
    // SHORTCUTS
    // ------------------------------

    document.addEventListener(
        "keydown",
        event => {

            const key =
                event.key.toLowerCase();


            if (
                (
                    event.ctrlKey ||
                    event.metaKey
                ) &&
                [
                    "c",
                    "v",
                    "x",
                    "u",
                    "s",
                    "p"
                ].includes(key)
            ) {

                event.preventDefault();

                copyAttempts++;

                updateIntegrityUI();

            }


            if (
                event.key === "F12"
            ) {

                event.preventDefault();

            }

        }
    );

}


// ========================================
// WARNING
// ========================================

function registerWarning(
    message
) {

    warningCount++;


    updateIntegrityUI();


    showWarningModal(
        message
    );


    if (
        warningCount >=
        MAX_WARNINGS
    ) {

        setTimeout(
            () => {

                submitExam(
                    "INTEGRITY_LIMIT"
                );

            },
            1200
        );

    }

}


// ========================================
// WARNING MODAL
// ========================================

function showWarningModal(
    message
) {

    const modal =
        document.getElementById(
            "warningModal"
        );


    const messageElement =
        document.getElementById(
            "warningMessage"
        );


    if (messageElement) {

        messageElement.textContent =
            message;

    }


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}


// ========================================
// CLOSE WARNING MODAL
// ========================================

function closeWarningModal() {

    const modal =
        document.getElementById(
            "warningModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


// ========================================
// UPDATE INTEGRITY UI
// ========================================

function updateIntegrityUI() {

    const warningElement =
        document.getElementById(
            "warningCount"
        );


    const tabElement =
        document.getElementById(
            "tabSwitchCount"
        );


    const fullscreenElement =
        document.getElementById(
            "fullscreenExitCount"
        );


    const copyElement =
        document.getElementById(
            "copyAttemptCount"
        );


    if (warningElement) {

        warningElement.textContent =
            warningCount;

    }


    if (tabElement) {

        tabElement.textContent =
            tabSwitches;

    }


    if (fullscreenElement) {

        fullscreenElement.textContent =
            fullscreenExits;

    }


    if (copyElement) {

        copyElement.textContent =
            copyAttempts;

    }

}


// ========================================
// SUBMIT CONTROLS
// ========================================

function setupSubmitControls() {

    const submitButton =
        document.getElementById(
            "submitExam"
        );


    if (submitButton) {

        submitButton.addEventListener(
            "click",
            openSubmitModal
        );

    }


    const confirmButton =
        document.getElementById(
            "confirmSubmit"
        );


    if (confirmButton) {

        confirmButton.addEventListener(
            "click",
            () => {

                closeSubmitModal();

                submitExam(
                    "MANUAL"
                );

            }
        );

    }


    const cancelButton =
        document.getElementById(
            "cancelSubmit"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeSubmitModal
        );

    }


    const warningClose =
        document.getElementById(
            "returnToExam"
        );


    if (warningClose) {

        warningClose.addEventListener(
            "click",
            closeWarningModal
        );

    }

}


// ========================================
// SUBMIT MODAL
// ========================================

function openSubmitModal() {

    const modal =
        document.getElementById(
            "submitModal"
        );


    const answered =
        Object.keys(
            answers
        ).length;


    const unanswered =
        questions.length -
        answered;


    const answeredElement =
        document.getElementById(
            "submitAnswered"
        );


    const unansweredElement =
        document.getElementById(
            "submitUnanswered"
        );


    if (answeredElement) {

        answeredElement.textContent =
            answered;

    }


    if (unansweredElement) {

        unansweredElement.textContent =
            unanswered;

    }


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}


// ========================================
// CLOSE SUBMIT MODAL
// ========================================

function closeSubmitModal() {

    const modal =
        document.getElementById(
            "submitModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


// ========================================
// SUBMIT EXAM
// ========================================

function submitExam(
    submissionReason = "MANUAL"
) {

    if (
        examSubmitted
    ) {

        return;

    }


    examSubmitted = true;


    clearInterval(
        timerInterval
    );


    // --------------------------------
    // CALCULATE RESULT
    // --------------------------------

    let correct = 0;

    let wrong = 0;

    let unanswered = 0;

    let obtainedMarks = 0;

    const questionResults = [];


    questions.forEach(
        question => {

            const studentAnswer =
                answers[question.id];


            if (
                !studentAnswer
            ) {

                unanswered++;


                questionResults.push({

                    question:
                        question.id,

                    status:
                        "unanswered",

                    answer:
                        "Not answered",

                    selected:
                        null,

                    correct:
                        question.correct,

                    marks:
                        0

                });


                return;

            }


            if (
                studentAnswer ===
                question.correct
            ) {

                correct++;


                obtainedMarks +=
                    Number(
                        question.marks ||
                        0
                    );


                questionResults.push({

                    question:
                        question.id,

                    status:
                        "correct",

                    answer:
                        `${studentAnswer} — ${question.options[studentAnswer]}`,

                    selected:
                        studentAnswer,

                    correct:
                        question.correct,

                    marks:
                        question.marks

                });

            } else {

                wrong++;


                questionResults.push({

                    question:
                        question.id,

                    status:
                        "wrong",

                    answer:
                        `${studentAnswer} — ${question.options[studentAnswer]}`,

                    selected:
                        studentAnswer,

                    correct:
                        question.correct,

                    marks:
                        0

                });

            }

        }
    );


    const totalMarks =
        questions.reduce(
            (
                total,
                question
            ) =>
                total +
                Number(
                    question.marks ||
                    0
                ),
            0
        );


    const percentage =
        totalMarks > 0
            ? Math.round(
                (
                    obtainedMarks /
                    totalMarks
                ) * 100
            )
            : 0;


    // --------------------------------
    // TIME TAKEN
    // --------------------------------

    const initialSeconds =
        45 * 60;


    const timeUsed =
        initialSeconds -
        remainingSeconds;


    const timeTakenMinutes =
        Math.max(
            0,
            Math.ceil(
                timeUsed / 60
            )
        );


    // --------------------------------
    // INTEGRITY SCORE
    // --------------------------------

    let integrityScore = 100;


    integrityScore -=
        tabSwitches * 10;


    integrityScore -=
        fullscreenExits * 10;


    integrityScore -=
        copyAttempts * 5;


    integrityScore -=
        warningCount * 10;


    integrityScore =
        Math.max(
            0,
            integrityScore
        );


    // --------------------------------
    // RESULT OBJECT
    // --------------------------------

    const result = {

        totalQuestions:
            questions.length,

        correct,

        wrong,

        unanswered,

        totalMarks,

        obtainedMarks,

        percentage,

        timeTaken:
            `${timeTakenMinutes} min`,

        integrityScore,

        tabSwitches,

        fullscreenExits,

        copyAttempts,

        warnings:
            warningCount,

        submissionReason,

        questionResults,

        submittedAt:
            new Date().toISOString()

    };


    // --------------------------------
    // SAVE RESULT
    // --------------------------------

    localStorage.setItem(
        "examResult",
        JSON.stringify(
            result
        )
    );


    localStorage.setItem(
        "examAnswers",
        JSON.stringify(
            answers
        )
    );


    localStorage.setItem(
        "examSubmitted",
        "true"
    );


    localStorage.setItem(
        "examActive",
        "false"
    );


    // --------------------------------
    // CLEAR TEMPORARY STATE
    // --------------------------------

    localStorage.removeItem(
        "examMarkedQuestions"
    );


    // --------------------------------
    // GO TO RESULT
    // --------------------------------

    window.location.href =
        "result.html";

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}