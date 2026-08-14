// ========================================
// SECUREASSESS
// RESULT PAGE
// FRONTEND DEMONSTRATION
// ========================================


// ========================================
// FALLBACK RESULT
// ========================================

const fallbackResult = {

    totalQuestions: 30,

    correct: 0,

    wrong: 0,

    unanswered: 30,

    totalMarks: 30,

    obtainedMarks: 0,

    percentage: 0,

    timeTaken: "0 min",

    integrityScore: 100,

    tabSwitches: 0,

    fullscreenExits: 0,

    copyAttempts: 0,

    warnings: 0,

    questionResults: []

};


// ========================================
// RESULT STATE
// ========================================

let resultData =
    fallbackResult;


// ========================================
// INITIALIZE
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadResult();

        generateQuestionSummary();

        setupQuestionToggle();

        setupDownload();

        animateProgressBars();

        console.log(
            "SecureAssess Result page loaded."
        );

    }
);


// ========================================
// LOAD RESULT
// ========================================

function loadResult() {

    const savedResult =
        localStorage.getItem(
            "examResult"
        );


    if (savedResult) {

        try {

            resultData =
                JSON.parse(
                    savedResult
                );

        } catch (error) {

            console.error(
                "Unable to read exam result:",
                error
            );

            resultData =
                fallbackResult;

        }

    }


    setText(
        "finalPercentage",
        resultData.percentage
    );


    setText(
        "correctAnswers",
        resultData.correct
    );


    setText(
        "wrongAnswers",
        resultData.wrong
    );


    setText(
        "unanswered",
        resultData.unanswered
    );


    setText(
        "timeTaken",
        resultData.timeTaken
    );


    setText(
        "integrityScore",
        resultData.integrityScore
    );


    /*
     * These elements may or may not
     * exist in your current result.html.
     *
     * setText() safely ignores missing
     * elements.
     */

    setText(
        "obtainedMarks",
        resultData.obtainedMarks
    );


    setText(
        "totalMarks",
        resultData.totalMarks
    );


    setText(
        "tabSwitches",
        resultData.tabSwitches
    );


    setText(
        "fullscreenExits",
        resultData.fullscreenExits
    );


    setText(
        "copyAttempts",
        resultData.copyAttempts
    );


    setText(
        "warnings",
        resultData.warnings
    );

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


    container.innerHTML =
        "";


    const results =
        resultData.questionResults ||
        [];


    results.forEach(
        item => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "question-row";


            let statusText =
                "Unanswered";


            if (
                item.status ===
                "correct"
            ) {

                statusText =
                    "Correct";

            } else if (
                item.status ===
                "wrong"
            ) {

                statusText =
                    "Incorrect";

            }


            let answerText =
                item.answer ||
                "Not answered";


            row.innerHTML = `

                <span class="question-number">
                    Q${String(
                        item.question
                    ).padStart(2, "0")}
                </span>

                <div class="question-result">

                    <span
                        class="result-dot ${item.status}"
                    ></span>

                    <span>
                        ${statusText}
                    </span>

                </div>

                <span class="question-answer">
                    ${escapeHTML(
                        answerText
                    )}
                </span>

            `;


            container.appendChild(
                row
            );

        }
    );


    /*
     * If there is no stored result,
     * show a useful message.
     */

    if (
        results.length === 0
    ) {

        container.innerHTML = `

            <div style="
                padding:20px;
                text-align:center;
                color:#999;
                font-size:9px;
            ">
                No detailed question result is available.
            </div>

        `;

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
        () => {

            downloadResult();

        }
    );

}


// ========================================
// DOWNLOAD RESULT
// ========================================

function downloadResult() {

    /*
     * Frontend demonstration:
     * generate a simple text report.
     *
     * Later Spring Boot can generate
     * a proper PDF result.
     */

    const report = `

SECUREASSESS
EXAMINATION RESULT
==============================

Total Questions : ${resultData.totalQuestions}

Correct         : ${resultData.correct}

Wrong           : ${resultData.wrong}

Unanswered      : ${resultData.unanswered}

Marks           : ${resultData.obtainedMarks} / ${resultData.totalMarks}

Percentage      : ${resultData.percentage}%

Time Taken      : ${resultData.timeTaken}

Integrity Score : ${resultData.integrityScore}%

Tab Switches    : ${resultData.tabSwitches}

Fullscreen Exits: ${resultData.fullscreenExits}

Copy Attempts   : ${resultData.copyAttempts}

Warnings        : ${resultData.warnings}

Submission      : ${resultData.submissionReason || "MANUAL"}

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
            value;

    }

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