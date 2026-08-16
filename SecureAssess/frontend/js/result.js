// ========================================
// SECUREASSESS
// REAL RESULT PAGE
// CONNECTED TO SPRING BOOT
// ========================================

const API_BASE = "http://localhost:8080";

let resultData = null;

let questionResults = [];

let currentAttemptId = null;


// ========================================
// INITIALIZE
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            await loadResult();

            await loadQuestionResults();

            generateQuestionSummary();

            setupQuestionToggle();

            setupDownload();

            animateProgressBars();


            console.log(
                "SecureAssess real result loaded."
            );


        } catch (error) {

            console.error(
                "Unable to load result:",
                error
            );


            showError(
                error.message
            );
        }
    }
);


// ========================================
// GET ATTEMPT ID
// ========================================

function getAttemptId() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    let attemptId =
        params.get(
            "attemptId"
        );


    if (!attemptId) {

        attemptId =
            localStorage.getItem(
                "attemptId"
            );
    }


    if (!attemptId) {

        throw new Error(
            "Exam attempt ID was not found."
        );
    }


    return attemptId;
}


// ========================================
// LOAD RESULT FROM BACKEND
// ========================================

async function loadResult() {

    currentAttemptId =
        getAttemptId();


    const response =
        await fetch(
            `${API_BASE}/api/attempts/${currentAttemptId}/result`
        );


    if (!response.ok) {

        const message =
            await response.text();


        throw new Error(
            message ||
            "Unable to load examination result."
        );
    }


    resultData =
        await response.json();


    console.log(
        "Backend result:",
        resultData
    );


    updateResultPage();
}


// ========================================
// LOAD QUESTION RESULTS
// ========================================

async function loadQuestionResults() {

    if (!currentAttemptId) {

        throw new Error(
            "Attempt ID is missing."
        );
    }


    const response =
        await fetch(
            `${API_BASE}/api/attempts/${currentAttemptId}/question-results`
        );


    if (!response.ok) {

        const message =
            await response.text();


        throw new Error(
            message ||
            "Unable to load question analysis."
        );
    }


    questionResults =
        await response.json();


    console.log(
        "Question results:",
        questionResults
    );
}


// ========================================
// UPDATE RESULT PAGE
// ========================================

function updateResultPage() {

    if (!resultData) {

        return;
    }


    // ====================================
    // BASIC RESULT
    // ====================================

    setText(
        "finalPercentage",
        formatNumber(
            resultData.percentage
        )
    );


    setText(
        "correctAnswers",
        resultData.correctAnswers
    );


    setText(
        "wrongAnswers",
        resultData.wrongAnswers
    );


    setText(
        "unanswered",
        resultData.unanswered
    );


    setText(
        "timeTaken",
        formatTime(
            resultData.timeTakenSeconds
        )
    );


    // ====================================
    // MARKS
    // ====================================

    setText(
        "obtainedMarks",
        resultData.obtainedMarks
    );


    setText(
        "totalMarks",
        resultData.totalMarks
    );


    // ====================================
    // EXAM INFORMATION
    // ====================================

    setText(
        "examTitle",
        resultData.examTitle
    );


    setText(
        "studentName",
        resultData.studentName
    );


    setText(
        "breadcrumbExam",
        resultData.examTitle
    );


    // ====================================
    // SCORE TEXT
    // ====================================

    setText(
        "performanceText",
        getPerformanceText(
            resultData.percentage
        )
    );


    setText(
        "marksText",
        `${resultData.obtainedMarks} / ${resultData.totalMarks} marks`
    );


    // ====================================
    // SCORE BREAKDOWN
    // ====================================

    const total =
        Number(
            resultData.totalQuestions
        ) || 0;


    const correct =
        Number(
            resultData.correctAnswers
        ) || 0;


    const wrong =
        Number(
            resultData.wrongAnswers
        ) || 0;


    const correctPercentage =
        total > 0
            ? (correct / total) * 100
            : 0;


    const wrongPercentage =
        total > 0
            ? (wrong / total) * 100
            : 0;


    setText(
        "correctQuestionText",
        `${correct} questions`
    );


    setText(
        "wrongQuestionText",
        `${wrong} questions`
    );


    setText(
        "correctPercentage",
        `${Math.round(
            correctPercentage
        )}%`
    );


    setText(
        "wrongPercentage",
        `${Math.round(
            wrongPercentage
        )}%`
    );


    setWidth(
        "correctProgress",
        correctPercentage
    );


    setWidth(
        "wrongProgress",
        wrongPercentage
    );


    // ====================================
    // YOUR SCORE
    // ====================================

    setText(
        "yourScore",
        `${formatNumber(
            resultData.percentage
        )}%`
    );


    // ====================================
    // INTEGRITY
    // ====================================

    /*
     * IMPORTANT:
     *
     * Integrity values now come from
     * the Spring Boot backend.
     *
     * They were stored in ExamAttempt
     * when the student submitted the exam.
     */


    const tabSwitches =
        Number(
            resultData.tabSwitches
        ) || 0;


    const fullscreenExits =
        Number(
            resultData.fullscreenExits
        ) || 0;


    const copyAttempts =
        Number(
            resultData.copyAttempts
        ) || 0;


    const warnings =
        Number(
            resultData.integrityWarnings
        ) || 0;


    // ====================================
    // CALCULATE INTEGRITY SCORE
    // ====================================

    let integrityScore =
        100;


    integrityScore -=
        tabSwitches * 10;


    integrityScore -=
        fullscreenExits * 10;


    integrityScore -=
        copyAttempts * 5;


    integrityScore -=
        warnings * 10;


    integrityScore =
        Math.max(
            0,
            integrityScore
        );


    // ====================================
    // DISPLAY INTEGRITY
    // ====================================

    setText(
        "integrityScore",
        integrityScore
    );


    setText(
        "tabSwitches",
        tabSwitches
    );


    setText(
        "fullscreenExits",
        fullscreenExits
    );


    setText(
        "copyAttempts",
        copyAttempts
    );


    setText(
        "warnings",
        warnings
    );


    // ====================================
    // COMPLETION DATE
    // ====================================

    if (
        resultData.submittedAt
    ) {

        const date =
            new Date(
                resultData.submittedAt
            );


        setText(
            "completedDate",
            `Completed on ${formatDate(
                date
            )}`
        );
    }
}


// ========================================
// QUESTION SUMMARY
// ========================================

function generateQuestionSummary() {

    const container =
        document.getElementById(
            "questionSummary"
        );


    if (!container) {

        return;
    }


    if (
        !Array.isArray(
            questionResults
        ) ||
        questionResults.length === 0
    ) {

        container.innerHTML = `

            <div class="no-question-results">

                No question analysis is available.

            </div>

        `;


        return;
    }


    container.innerHTML =
        "";


    questionResults.forEach(
        (question) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "question-result-card";


            const statusClass =
                getStatusClass(
                    question.status
                );


            const statusText =
                getStatusText(
                    question.status
                );


            const yourAnswerText =
                getAnswerText(
                    question,
                    question.yourAnswer
                );


            const correctAnswerText =
                getAnswerText(
                    question,
                    question.correctAnswer
                );


            card.innerHTML = `

                <div class="question-result-header">

                    <div class="question-number">

                        Question
                        ${question.questionNumber}

                    </div>


                    <span
                        class="question-status ${statusClass}"
                    >

                        ${statusText}

                    </span>

                </div>


                <div class="question-result-text">

                    ${escapeHTML(
                        question.questionText
                    )}

                </div>


                <div class="question-answer-grid">


                    <div class="answer-box">

                        <span class="answer-label">
                            Your answer
                        </span>


                        <strong>
                            ${escapeHTML(
                                yourAnswerText
                            )}
                        </strong>

                    </div>


                    <div class="answer-box">

                        <span class="answer-label">
                            Correct answer
                        </span>


                        <strong>
                            ${escapeHTML(
                                correctAnswerText
                            )}
                        </strong>

                    </div>


                    <div class="answer-box marks-box">

                        <span class="answer-label">
                            Marks
                        </span>


                        <strong>

                            ${question.marksObtained}

                            /

                            ${question.marks}

                        </strong>

                    </div>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );
}


// ========================================
// GET ANSWER TEXT
// ========================================

function getAnswerText(
    question,
    answer
) {

    if (
        !answer
    ) {

        return "Not answered";
    }


    const option =
        String(
            answer
        ).toUpperCase();


    if (
        question.options
    ) {

        return `${option} — ${
            question.options[option] || ""
        }`;
    }


    switch (
        option
    ) {

        case "A":

            return `A — ${question.optionA}`;


        case "B":

            return `B — ${question.optionB}`;


        case "C":

            return `C — ${question.optionC}`;


        case "D":

            return `D — ${question.optionD}`;


        default:

            return option;
    }
}


// ========================================
// STATUS CLASS
// ========================================

function getStatusClass(
    status
) {

    switch (
        status
    ) {

        case "CORRECT":

            return "status-correct";


        case "INCORRECT":

            return "status-incorrect";


        case "UNANSWERED":

            return "status-unanswered";


        default:

            return "";
    }
}


// ========================================
// STATUS TEXT
// ========================================

function getStatusText(
    status
) {

    switch (
        status
    ) {

        case "CORRECT":

            return "✓ Correct";


        case "INCORRECT":

            return "✕ Incorrect";


        case "UNANSWERED":

            return "— Unanswered";


        default:

            return status ||
                "Unknown";
    }
}


// ========================================
// QUESTION TOGGLE
// ========================================

function setupQuestionToggle() {

    const button =
        document.getElementById(
            "toggleQuestions"
        );


    const container =
        document.getElementById(
            "questionSummary"
        );


    if (
        !button ||
        !container
    ) {

        return;
    }


    button.addEventListener(
        "click",
        () => {

            container.classList.toggle(
                "show"
            );


            if (
                container.classList.contains(
                    "show"
                )
            ) {

                button.textContent =
                    "Hide questions ↑";

            } else {

                button.textContent =
                    "View questions ↓";

            }

        }
    );
}


// ========================================
// DOWNLOAD
// ========================================

function setupDownload() {

    const button =
        document.getElementById(
            "downloadButton"
        );


    if (!button) {

        return;
    }


    button.addEventListener(
        "click",
        downloadResult
    );
}


// ========================================
// DOWNLOAD RESULT
// ========================================

function downloadResult() {

    if (!resultData) {

        return;
    }


    // ====================================
    // INTEGRITY VALUES
    // ====================================

    const tabSwitches =
        Number(
            resultData.tabSwitches
        ) || 0;


    const fullscreenExits =
        Number(
            resultData.fullscreenExits
        ) || 0;


    const copyAttempts =
        Number(
            resultData.copyAttempts
        ) || 0;


    const warnings =
        Number(
            resultData.integrityWarnings
        ) || 0;


    let integrityScore =
        100;


    integrityScore -=
        tabSwitches * 10;


    integrityScore -=
        fullscreenExits * 10;


    integrityScore -=
        copyAttempts * 5;


    integrityScore -=
        warnings * 10;


    integrityScore =
        Math.max(
            0,
            integrityScore
        );


    // ====================================
    // QUESTION REPORT
    // ====================================

    let questionReport =
        "";


    if (
        Array.isArray(
            questionResults
        )
    ) {

        questionResults.forEach(
            question => {

                questionReport += `

Question ${question.questionNumber}

${question.questionText}


Your Answer:

${getAnswerText(
    question,
    question.yourAnswer
)}


Correct Answer:

${getAnswerText(
    question,
    question.correctAnswer
)}


Result:

${question.status}


Marks:

${question.marksObtained}
/
${question.marks}

--------------------------------

`;

            }
        );
    }


    // ====================================
    // COMPLETE REPORT
    // ====================================

    const report = `

SECUREASSESS
EXAMINATION RESULT
==============================


Student         : ${resultData.studentName}

Exam            : ${resultData.examTitle}


RESULT
==============================

Total Questions : ${resultData.totalQuestions}

Correct         : ${resultData.correctAnswers}

Wrong           : ${resultData.wrongAnswers}

Unanswered      : ${resultData.unanswered}

Marks           : ${resultData.obtainedMarks}
                  /
                  ${resultData.totalMarks}

Percentage      : ${formatNumber(
    resultData.percentage
)}%

Time Taken      : ${formatTime(
    resultData.timeTakenSeconds
)}

Status          : ${resultData.status}


INTEGRITY
==============================

Integrity Score : ${integrityScore}%

Tab Switches    : ${tabSwitches}

Fullscreen Exits: ${fullscreenExits}

Copy Attempts   : ${copyAttempts}

Warnings        : ${warnings}


QUESTION ANALYSIS
==============================

${questionReport}


==============================

SecureAssess

`;


    const blob =
        new Blob(
            [report],
            {
                type:
                    "text/plain"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "SecureAssess-Result.txt";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    showToast();
}


// ========================================
// TOAST
// ========================================

function showToast() {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        return;
    }


    toast.textContent =
        "Result downloaded successfully.";


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        3000
    );
}


// ========================================
// PROGRESS ANIMATION
// ========================================

function animateProgressBars() {

    const bars =
        document.querySelectorAll(
            ".progress-fill"
        );


    bars.forEach(
        bar => {

            const originalWidth =
                bar.dataset.width ||
                bar.style.width;


            bar.style.width =
                "0";


            setTimeout(
                () => {

                    bar.style.width =
                        originalWidth;

                },
                200
            );

        }
    );
}


// ========================================
// PERFORMANCE TEXT
// ========================================

function getPerformanceText(
    percentage
) {

    percentage =
        Number(
            percentage
        );


    if (
        percentage >= 90
    ) {

        return "Excellent performance";
    }


    if (
        percentage >= 75
    ) {

        return "Good performance";
    }


    if (
        percentage >= 50
    ) {

        return "Average performance";
    }


    return "Needs improvement";
}


// ========================================
// FORMAT TIME
// ========================================

function formatTime(
    seconds
) {

    seconds =
        Number(
            seconds
        ) || 0;


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        seconds % 60;


    if (
        minutes === 0
    ) {

        return `${remainingSeconds} sec`;
    }


    return `${minutes} min ${remainingSeconds} sec`;
}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(
    date
) {

    return date.toLocaleDateString(
        "en-US",
        {
            month: "long",

            day: "numeric",

            year: "numeric"
        }
    );
}


// ========================================
// FORMAT NUMBER
// ========================================

function formatNumber(
    value
) {

    const number =
        Number(
            value
        ) || 0;


    return Number.isInteger(
        number
    )
        ? number
        : number.toFixed(1);
}


// ========================================
// SAFE TEXT SETTER
// ========================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value ?? "";

    }
}


// ========================================
// SET PROGRESS WIDTH
// ========================================

function setWidth(
    id,
    percentage
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return;
    }


    const width =
        Math.max(
            0,

            Math.min(
                100,

                Number(
                    percentage
                ) || 0
            )
        );


    element.dataset.width =
        `${width}%`;


    element.style.width =
        `${width}%`;
}


// ========================================
// ERROR
// ========================================

function showError(
    message
) {

    document.body.innerHTML = `

        <div style="
            min-height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            font-family:Arial,sans-serif;
            text-align:center;
            padding:30px;
        ">

            <div>

                <h2>
                    Unable to load result
                </h2>


                <p>
                    ${escapeHTML(
                        message
                    )}
                </p>


                <button
                    onclick="location.reload()"
                >

                    Try again

                </button>

            </div>

        </div>

    `;
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