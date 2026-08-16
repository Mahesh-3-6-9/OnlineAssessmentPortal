// ========================================
// SECUREASSESS
// REAL EXAM ENGINE
// CONNECTED TO SPRING BOOT
// FULLSCREEN + INTEGRITY MONITORING
// EXAM WINDOW + HARD DEADLINE
// ========================================

const API_BASE = "http://localhost:8080";


// ========================================
// EXAM CONFIGURATION
// ========================================

const EXAM_ID =
    Number(
        new URLSearchParams(window.location.search)
            .get("examId")
    ) || 1;


// Student ID comes from login/localStorage
const STUDENT_ID =
    Number(
        localStorage.getItem("studentId")
    ) || 1;


// ========================================
// STATE
// ========================================

let examData = null;

let questions = [];

let currentQuestion = 0;

let answers = {};

let markedForReview = new Set();

let remainingSeconds = 0;

let timerInterval = null;

let warningCount = 0;

let tabSwitches = 0;

let fullscreenExits = 0;

let copyAttempts = 0;

let examSubmitted = false;

let attemptId = null;

let examDurationMinutes = 0;

let attemptStartedAt = null;

let actualDeadline = null;


// ========================================
// FULLSCREEN STATE
// ========================================

let fullscreenPromptActive = false;


// ========================================
// INITIALIZE
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            console.log(
                "Starting exam:",
                EXAM_ID
            );


            // ====================================
            // 1. LOAD EXAM
            // ====================================

            await loadExam();


            // ====================================
            // 2. START / RESTORE BACKEND ATTEMPT
            // ====================================

            await startExam();


            // ====================================
            // 3. CALCULATE ACTUAL DEADLINE
            // ====================================

            calculateActualDeadline();


            // ====================================
            // 4. LOAD QUESTIONS
            // ====================================

            await loadQuestions();


            // ====================================
            // 5. RESTORE ANSWERS
            // ====================================

            loadSavedState();


            // ====================================
            // 6. SETUP CONTROLS
            // ====================================

            setupQuestionNavigation();

            setupSecurityControls();

            setupSubmitControls();


            // ====================================
            // 7. RENDER PAGE
            // ====================================

            renderExamDetails();

            renderQuestion();

            renderQuestionNavigator();

            updateAllUI();


            // ====================================
            // 8. START TIMER
            // ====================================

            startTimer();


            // ====================================
            // 9. REQUEST FULLSCREEN
            // ====================================

            showFullscreenPrompt();


            console.log(
                "Exam initialized successfully."
            );

        } catch (error) {

            console.error(
                "Exam initialization failed:",
                error
            );

            alert(
                "Unable to start the examination.\n\n" +
                error.message
            );

        }

    }
);


// ========================================
// LOAD EXAM DETAILS
// GET /api/exams/{id}
// ========================================

async function loadExam() {

    const response =
        await fetch(
            `${API_BASE}/api/exams/${EXAM_ID}`
        );


    if (!response.ok) {

        const message =
            await response.text();

        throw new Error(
            message ||
            "Failed to load examination."
        );

    }


    examData =
        await response.json();


    console.log(
        "Exam loaded:",
        examData
    );


    examDurationMinutes =
        Number(
            examData.durationMinutes || 0
        );


    if (
        examDurationMinutes <= 0
    ) {

        throw new Error(
            "Invalid examination duration."
        );

    }

}


// ========================================
// RENDER EXAM DETAILS
// ========================================

function renderExamDetails() {

    if (!examData) {

        return;

    }


    const titleElement =
        document.getElementById(
            "examTitle"
        );


    if (titleElement) {

        titleElement.textContent =
            examData.title ||
            "Examination";

    }


    const descriptionElement =
        document.getElementById(
            "examDescription"
        );


    if (descriptionElement) {

        descriptionElement.textContent =
            examData.description ||
            "";

    }


    const durationElements =
        document.querySelectorAll(
            ".exam-duration"
        );


    durationElements.forEach(
        element => {

            element.textContent =
                `${examDurationMinutes} min`;

        }
    );


    const marksElements =
        document.querySelectorAll(
            ".exam-marks"
        );


    marksElements.forEach(
        element => {

            element.textContent =
                `${examData.totalMarks || 0} marks`;

        }
    );


    const questionTotalElements =
        document.querySelectorAll(
            ".question-total"
        );


    questionTotalElements.forEach(
        element => {

            element.textContent =
                `/ ${
                    examData.totalQuestions ||
                    questions.length
                }`;

        }
    );
}


// ========================================
// START / RESTORE EXAM ATTEMPT
// POST /api/attempts/start
// ========================================

async function startExam() {

    const response =
        await fetch(
            `${API_BASE}/api/attempts/start`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    studentId:
                        STUDENT_ID,

                    examId:
                        EXAM_ID

                })
            }
        );


    if (!response.ok) {

        const message =
            await response.text();

        throw new Error(
            message ||
            "Failed to start examination."
        );

    }


    const attempt =
        await response.json();


    console.log(
        "Attempt:",
        attempt
    );


    attemptId =
        attempt.id;


    if (!attemptId) {

        throw new Error(
            "Backend did not return an attempt ID."
        );

    }


    // ====================================
    // SAVE ATTEMPT INFORMATION
    // ====================================

    localStorage.setItem(
        "attemptId",
        attemptId
    );


    localStorage.setItem(
        "examId",
        EXAM_ID
    );


    localStorage.setItem(
        "studentId",
        STUDENT_ID
    );


    attemptStartedAt =
        attempt.startedAt;


    if (!attemptStartedAt) {

        attemptStartedAt =
            new Date().toISOString();

    }


    localStorage.setItem(
        "examStartedAt",
        attemptStartedAt
    );


    // ====================================
    // RESTORE / RESET INTEGRITY
    // ====================================

    warningCount = 0;

    tabSwitches = 0;

    fullscreenExits = 0;

    copyAttempts = 0;


    saveIntegrityState();

}


// ========================================
// CALCULATE ACTUAL DEADLINE
// ========================================
//
// Actual deadline:
//
// MIN(
//     startedAt + duration,
//     exam.endTime
// )
//
// Example:
//
// Exam:
// 10:00 -> 11:00
//
// Duration:
// 30 minutes
//
// Student starts:
// 10:45
//
// Duration deadline:
// 11:15
//
// Exam deadline:
// 11:00
//
// Actual deadline:
// 11:00
// ========================================

function calculateActualDeadline() {

    if (!attemptStartedAt) {

        throw new Error(
            "Exam start time was not received."
        );

    }


    const startedTime =
        new Date(
            attemptStartedAt
        );


    if (
        Number.isNaN(
            startedTime.getTime()
        )
    ) {

        throw new Error(
            "Invalid exam start time."
        );

    }


    // ====================================
    // STUDENT DURATION DEADLINE
    // ====================================

    const durationDeadline =
        new Date(
            startedTime.getTime()
            +
            examDurationMinutes *
            60 *
            1000
        );


    actualDeadline =
        durationDeadline;


    // ====================================
    // EXAM HARD END TIME
    // ====================================

    if (
        examData &&
        examData.endTime
    ) {

        const examEndTime =
            parseBackendDate(
                examData.endTime
            );


        if (
            examEndTime &&
            examEndTime < actualDeadline
        ) {

            actualDeadline =
                examEndTime;

        }

    }


    console.log(
        "Attempt started:",
        startedTime
    );


    console.log(
        "Duration deadline:",
        durationDeadline
    );


    console.log(
        "Exam hard deadline:",
        examData.endTime
            ? parseBackendDate(
                examData.endTime
            )
            : "Not configured"
    );


    console.log(
        "Actual deadline:",
        actualDeadline
    );


    updateRemainingSeconds();

}


// ========================================
// PARSE BACKEND LOCALDATETIME
// ========================================
//
// Spring Boot LocalDateTime normally returns:
//
// 2026-08-15T15:30:00
//
// This function treats it as local browser
// time rather than UTC.
// ========================================

function parseBackendDate(
    value
) {

    if (!value) {

        return null;

    }


    if (
        value instanceof Date
    ) {

        return value;

    }


    // ISO value with timezone
    if (
        value.endsWith("Z") ||
        value.includes("+")
    ) {

        const date =
            new Date(value);


        return Number.isNaN(
            date.getTime()
        )
            ? null
            : date;

    }


    // LocalDateTime:
    // YYYY-MM-DDTHH:mm:ss
    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;
}


// ========================================
// UPDATE REMAINING SECONDS
// ========================================

function updateRemainingSeconds() {

    if (!actualDeadline) {

        return;

    }


    const now =
        new Date();


    const difference =
        Math.floor(
            (
                actualDeadline.getTime()
                -
                now.getTime()
            )
            / 1000
        );


    remainingSeconds =
        Math.max(
            0,
            difference
        );

}


// ========================================
// LOAD QUESTIONS
// GET /api/questions/exam/{examId}
// ========================================

async function loadQuestions() {

    const response =
        await fetch(
            `${API_BASE}/api/questions/exam/${EXAM_ID}`
        );


    if (!response.ok) {

        const message =
            await response.text();

        throw new Error(
            message ||
            "Failed to load questions."
        );

    }


    const backendQuestions =
        await response.json();


    if (
        !Array.isArray(
            backendQuestions
        ) ||
        backendQuestions.length === 0
    ) {

        throw new Error(
            "No questions are available for this examination."
        );

    }


    console.log(
        "Questions loaded:",
        backendQuestions
    );


    questions =
        backendQuestions.map(
            question => ({

                id:
                    question.id,

                question:
                    question.questionText,

                options: {

                    A:
                        question.optionA,

                    B:
                        question.optionB,

                    C:
                        question.optionC,

                    D:
                        question.optionD

                },

                marks:
                    Number(
                        question.marks || 0
                    )

            })
        );


    const total =
        questions.length;


    document
        .querySelectorAll(
            ".question-total"
        )
        .forEach(
            element => {

                element.textContent =
                    `/ ${total}`;

            }
        );


    const navigationStatus =
        document.getElementById(
            "navigationStatus"
        );


    if (navigationStatus) {

        navigationStatus.textContent =
            `Question 1 of ${total}`;

    }


    const examQuestionCount =
        document.getElementById(
            "examQuestionCount"
        );


    if (examQuestionCount) {

        examQuestionCount.textContent =
            `${total} questions`;

    }

}


// ========================================
// LOAD SAVED STATE
// ========================================

function loadSavedState() {

    const savedAnswers =
        localStorage.getItem(
            `examAnswers_${EXAM_ID}`
        );


    if (savedAnswers) {

        try {

            answers =
                JSON.parse(
                    savedAnswers
                );

        } catch {

            answers = {};

        }

    }


    const savedReview =
        localStorage.getItem(
            `examMarkedQuestions_${EXAM_ID}`
        );


    if (savedReview) {

        try {

            markedForReview =
                new Set(
                    JSON.parse(
                        savedReview
                    )
                );

        } catch {

            markedForReview =
                new Set();

        }

    }

}


// ========================================
// SAVE ANSWER STATE
// ========================================

function saveState() {

    localStorage.setItem(
        `examAnswers_${EXAM_ID}`,
        JSON.stringify(
            answers
        )
    );


    localStorage.setItem(
        `examMarkedQuestions_${EXAM_ID}`,
        JSON.stringify(
            [...markedForReview]
        )
    );


    const saveStatus =
        document.getElementById(
            "saveStatus"
        );


    if (saveStatus) {

        saveStatus.textContent =
            "All changes saved";

    }

}


// ========================================
// SAVE INTEGRITY STATE
// ========================================

function saveIntegrityState() {

    localStorage.setItem(
        `examIntegrity_${EXAM_ID}`,
        JSON.stringify({

            warningCount:
                warningCount,

            tabSwitches:
                tabSwitches,

            fullscreenExits:
                fullscreenExits,

            copyAttempts:
                copyAttempts

        })
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


    if (questionNumber) {

        questionNumber.textContent =
            String(
                currentQuestion + 1
            ).padStart(
                2,
                "0"
            );

    }


    if (questionText) {

        questionText.textContent =
            question.question;

    }


    if (!optionsContainer) {

        return;

    }


    optionsContainer.innerHTML =
        "";


    const letters =
        [
            "A",
            "B",
            "C",
            "D"
        ];


    letters.forEach(
        letter => {

            const option =
                document.createElement(
                    "label"
                );


            option.className =
                "option";


            const selected =
                answers[
                    question.id
                ] === letter;


            if (selected) {

                option.classList.add(
                    "selected"
                );

            }


            option.innerHTML = `

                <input
                    type="radio"
                    name="answer"
                    value="${letter}"
                    ${selected ? "checked" : ""}
                >

                <span class="option-letter">
                    ${letter}
                </span>

                <span class="option-text">
                    ${escapeHTML(
                        question.options[letter] ||
                        ""
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


    updateAnswerStatus();

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
// ANSWER STATUS
// ========================================

function updateAnswerStatus() {

    const status =
        document.getElementById(
            "answerStatus"
        );


    if (!status) {

        return;

    }


    const question =
        questions[currentQuestion];


    if (!question) {

        return;

    }


    if (
        answers[
            question.id
        ]
    ) {

        status.textContent =
            "Answered";

    } else {

        status.textContent =
            "Not answered";

    }

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


    const reviewButton =
        document.getElementById(
            "reviewButton"
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


    if (reviewButton) {

        reviewButton.addEventListener(
            "click",
            toggleMarkForReview
        );

    }

}


// ========================================
// MARK FOR REVIEW
// ========================================

function toggleMarkForReview() {

    const question =
        questions[currentQuestion];


    if (!question) {

        return;

    }


    if (
        markedForReview.has(
            question.id
        )
    ) {

        markedForReview.delete(
            question.id
        );

    } else {

        markedForReview.add(
            question.id
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
            "questionGrid"
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


            button.type =
                "button";


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

            const question =
                questions[index];


            if (!question) {

                return;

            }


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
                question.id;


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


    const reviewButton =
        document.getElementById(
            "reviewButton"
        );


    if (previousButton) {

        previousButton.disabled =
            currentQuestion === 0;

    }


    if (nextButton) {

        nextButton.innerHTML =
            currentQuestion ===
            questions.length - 1
                ? "Finish →"
                : "Next →";

    }


    if (
        reviewButton &&
        questions[currentQuestion]
    ) {

        const question =
            questions[currentQuestion];


        const marked =
            markedForReview.has(
                question.id
            );


        reviewButton.classList.toggle(
            "active",
            marked
        );


        const icon =
            document.getElementById(
                "reviewIcon"
            );


        if (icon) {

            icon.textContent =
                marked
                    ? "★"
                    : "☆";

        }

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

    updateAnswerStatus();

}


// ========================================
// PROGRESS
// ========================================

function updateProgress() {

    if (
        questions.length === 0
    ) {

        return;

    }


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
        ).filter(
            id =>
                answers[id] !== null &&
                answers[id] !== ""
        ).length;


    const unanswered =
        Math.max(
            0,
            questions.length -
            answered
        );


    const answeredElement =
        document.getElementById(
            "answeredCount"
        );


    if (answeredElement) {

        answeredElement.textContent =
            `${answered} / ${questions.length}`;

    }


    const submitAnswered =
        document.getElementById(
            "submitAnswered"
        );


    const submitUnanswered =
        document.getElementById(
            "submitUnanswered"
        );


    if (submitAnswered) {

        submitAnswered.textContent =
            answered;

    }


    if (submitUnanswered) {

        submitUnanswered.textContent =
            unanswered;

    }

}


// ========================================
// TIMER
// ========================================

function startTimer() {

    if (timerInterval) {

        clearInterval(
            timerInterval
        );

    }


    // Calculate immediately
    updateRemainingSeconds();

    updateTimer();


    // ====================================
    // ALREADY EXPIRED
    // ====================================

    if (
        remainingSeconds <= 0
    ) {

        submitExam(
            "TIME_EXPIRED"
        );

        return;

    }


    timerInterval =
        setInterval(
            () => {

                if (
                    examSubmitted
                ) {

                    clearInterval(
                        timerInterval
                    );

                    return;

                }


                /*
                 * IMPORTANT:
                 *
                 * Do not simply do:
                 *
                 * remainingSeconds--
                 *
                 * because the browser may be
                 * paused/backgrounded.
                 *
                 * Instead calculate the actual
                 * difference from the deadline.
                 */

                updateRemainingSeconds();

                updateTimer();


                // ====================================
                // TIME EXPIRED
                // ====================================

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

    const safeSeconds =
        Math.max(
            0,
            remainingSeconds
        );


    const minutes =
        Math.floor(
            safeSeconds / 60
        );


    const seconds =
        safeSeconds % 60;


    const timer =
        document.getElementById(
            "timer"
        );


    if (timer) {

        timer.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    }


    // ====================================
    // TIMER WARNING
    // ====================================

    if (timer) {

        timer.classList.remove(
            "timer-warning"
        );

        timer.classList.remove(
            "timer-danger"
        );


        if (
            safeSeconds <= 60
        ) {

            timer.classList.add(
                "timer-danger"
            );

        } else if (
            safeSeconds <= 300
        ) {

            timer.classList.add(
                "timer-warning"
            );

        }

    }

}


// ========================================
// SECURITY CONTROLS
// ========================================

function setupSecurityControls() {

    // ====================================
    // TAB SWITCH
    // ====================================

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


    // ====================================
    // FULLSCREEN EXIT
    // ====================================

    document.addEventListener(
        "fullscreenchange",
        () => {

            console.log(
                "Fullscreen state changed:",
                Boolean(
                    document.fullscreenElement
                )
            );


            if (
                !document.fullscreenElement &&
                !examSubmitted &&
                !fullscreenPromptActive
            ) {

                fullscreenExits++;

                registerWarning(
                    "Fullscreen mode was exited."
                );

            }

        }
    );


    // ====================================
    // COPY
    // ====================================

    document.addEventListener(
        "copy",
        event => {

            event.preventDefault();

            copyAttempts++;

            registerIntegrityChange();

        }
    );


    // ====================================
    // CUT
    // ====================================

    document.addEventListener(
        "cut",
        event => {

            event.preventDefault();

            copyAttempts++;

            registerIntegrityChange();

        }
    );


    // ====================================
    // PASTE
    // ====================================

    document.addEventListener(
        "paste",
        event => {

            event.preventDefault();

            copyAttempts++;

            registerIntegrityChange();

        }
    );


    // ====================================
    // RIGHT CLICK
    // ====================================

    document.addEventListener(
        "contextmenu",
        event => {

            event.preventDefault();

        }
    );


    // ====================================
    // KEYBOARD SHORTCUTS
    // ====================================

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
// FULLSCREEN PROMPT
// ========================================

function showFullscreenPrompt() {

    const modal =
        document.getElementById(
            "warningModal"
        );


    const title =
        document.getElementById(
            "warningTitle"
        );


    const message =
        document.getElementById(
            "warningMessage"
        );


    const button =
        document.getElementById(
            "warningClose"
        );


    if (
        !modal ||
        !title ||
        !message ||
        !button
    ) {

        console.error(
            "Fullscreen prompt elements not found."
        );

        return;

    }


    fullscreenPromptActive =
        true;


    const counter =
        document.querySelector(
            ".warning-counter"
        );


    if (counter) {

        counter.style.display =
            "none";

    }


    title.textContent =
        "Enter Secure Exam Mode";


    message.textContent =
        "This examination requires fullscreen mode. Click the button below to enter secure exam mode. Pressing Esc later will be recorded as a fullscreen exit.";


    button.textContent =
        "Enter Fullscreen & Continue";


    modal.classList.add(
        "show"
    );


    const newButton =
        button.cloneNode(
            true
        );


    button.parentNode.replaceChild(
        newButton,
        button
    );


    newButton.addEventListener(
        "click",
        async () => {

            await enterExamFullscreen(
                newButton
            );

        }
    );

}


// ========================================
// ENTER FULLSCREEN
// ========================================

async function enterExamFullscreen(
    button
) {

    try {

        if (
            !document.fullscreenElement
        ) {

            await document.documentElement.requestFullscreen();

        }


        console.log(
            "Secure fullscreen enabled."
        );


        fullscreenPromptActive =
            false;


        restoreWarningModal();

        closeWarningModal();


    } catch (error) {

        console.error(
            "Fullscreen request failed:",
            error
        );


        fullscreenPromptActive =
            true;


        if (button) {

            button.disabled =
                false;

        }


        alert(
            "Fullscreen could not be enabled.\n\n" +
            "Please click the button again and allow fullscreen mode."
        );

    }

}


// ========================================
// RESTORE WARNING MODAL
// ========================================

function restoreWarningModal() {

    const title =
        document.getElementById(
            "warningTitle"
        );


    const message =
        document.getElementById(
            "warningMessage"
        );


    const count =
        document.getElementById(
            "warningCount"
        );


    const button =
        document.getElementById(
            "warningClose"
        );


    if (title) {

        title.textContent =
            "Suspicious activity detected";

    }


    if (message) {

        message.textContent =
            "Your examination session detected an integrity-related event.";

    }


    if (count) {

        count.textContent =
            warningCount;

    }


    const counter =
        document.querySelector(
            ".warning-counter"
        );


    if (counter) {

        counter.style.display =
            "";

    }


    if (button) {

        button.textContent =
            "Continue examination";


        const newButton =
            button.cloneNode(
                true
            );


        button.parentNode.replaceChild(
            newButton,
            button
        );


        newButton.addEventListener(
            "click",
            closeWarningModal
        );

    }

}


// ========================================
// INTEGRITY CHANGE
// ========================================

function registerIntegrityChange() {

    saveIntegrityState();

    updateIntegrityUI();

}


// ========================================
// WARNING
// ========================================

function registerWarning(
    message
) {

    warningCount++;


    saveIntegrityState();

    updateIntegrityUI();


    showWarningModal(
        message
    );


    if (
        warningCount >= 3
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


    const title =
        document.getElementById(
            "warningTitle"
        );


    const messageElement =
        document.getElementById(
            "warningMessage"
        );


    const countElement =
        document.getElementById(
            "warningCount"
        );


    if (title) {

        title.textContent =
            "Suspicious activity detected";

    }


    if (messageElement) {

        messageElement.textContent =
            message;

    }


    if (countElement) {

        countElement.textContent =
            warningCount;

    }


    const counter =
        document.querySelector(
            ".warning-counter"
        );


    if (counter) {

        counter.style.display =
            "";

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


    const scoreElement =
        document.getElementById(
            "integrityScore"
        );


    const levelElement =
        document.getElementById(
            "integrityLevel"
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


    let score =
        100;


    score -=
        tabSwitches * 10;


    score -=
        fullscreenExits * 10;


    score -=
        copyAttempts * 5;


    score -=
        warningCount * 10;


    score =
        Math.max(
            0,
            score
        );


    if (scoreElement) {

        scoreElement.textContent =
            score;

    }


    if (levelElement) {

        if (score >= 80) {

            levelElement.textContent =
                "Excellent";

        } else if (score >= 50) {

            levelElement.textContent =
                "Good";

        } else {

            levelElement.textContent =
                "At risk";

        }

    }

}


// ========================================
// SUBMIT CONTROLS
// ========================================

function setupSubmitControls() {

    const submitButton =
        document.getElementById(
            "submitButton"
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
            "warningClose"
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


    updateCounters();


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
// SUBMIT EXAM TO BACKEND
// ========================================

async function submitExam(
    submissionReason = "MANUAL"
) {

    if (
        examSubmitted
    ) {

        return;

    }


    if (!attemptId) {

        attemptId =
            Number(
                localStorage.getItem(
                    "attemptId"
                )
            );

    }


    if (!attemptId) {

        alert(
            "Exam attempt was not found."
        );

        return;

    }


    examSubmitted =
        true;


    clearInterval(
        timerInterval
    );


    const submitButton =
        document.getElementById(
            "confirmSubmit"
        );


    if (submitButton) {

        submitButton.disabled =
            true;


        submitButton.textContent =
            "Submitting...";

    }


    try {

        const submissionData = {

            answers:
                answers,

            tabSwitches:
                Number(
                    tabSwitches
                ),

            fullscreenExits:
                Number(
                    fullscreenExits
                ),

            copyAttempts:
                Number(
                    copyAttempts
                ),

            integrityWarnings:
                Number(
                    warningCount
                )

        };


        console.log(
            "Submitting examination:",
            submissionData
        );


        const response =
            await fetch(
                `${API_BASE}/api/attempts/${attemptId}/submit`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            submissionData
                        )
                }
            );


        if (!response.ok) {

            const message =
                await response.text();


            throw new Error(
                message ||
                "Failed to submit examination."
            );

        }


        const result =
            await response.json();


        console.log(
            "Exam result:",
            result
        );


        localStorage.setItem(
            "examResult",
            JSON.stringify(
                result
            )
        );


        localStorage.setItem(
            "submissionReason",
            submissionReason
        );


        localStorage.setItem(
            "examSubmitted",
            "true"
        );


        localStorage.setItem(
            "examActive",
            "false"
        );


        localStorage.setItem(
            "lastTabSwitches",
            String(
                tabSwitches
            )
        );


        localStorage.setItem(
            "lastFullscreenExits",
            String(
                fullscreenExits
            )
        );


        localStorage.setItem(
            "lastCopyAttempts",
            String(
                copyAttempts
            )
        );


        localStorage.setItem(
            "lastIntegrityWarnings",
            String(
                warningCount
            )
        );


        localStorage.removeItem(
            `examAnswers_${EXAM_ID}`
        );


        localStorage.removeItem(
            `examMarkedQuestions_${EXAM_ID}`
        );


        localStorage.removeItem(
            `examIntegrity_${EXAM_ID}`
        );


        // ====================================
        // EXIT FULLSCREEN
        // ====================================

        if (
            document.fullscreenElement
        ) {

            try {

                await document.exitFullscreen();

            } catch (
                fullscreenError
            ) {

                console.warn(
                    "Could not exit fullscreen:",
                    fullscreenError
                );

            }

        }


        // ====================================
        // RESULT PAGE
        // ====================================

        window.location.href =
            `result.html?attemptId=${attemptId}`;


    } catch (error) {

        console.error(
            "Submission failed:",
            error
        );


        examSubmitted =
            false;


        if (submitButton) {

            submitButton.disabled =
                false;


            submitButton.textContent =
                "Submit exam";

        }


        alert(
            "Submission failed: " +
            error.message
        );

    }

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text ?? "";


    return div.innerHTML;
}