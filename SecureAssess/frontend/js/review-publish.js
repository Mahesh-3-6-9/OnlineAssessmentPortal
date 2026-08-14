// ========================================
// SECUREASSESS
// REVIEW & PUBLISH
// ========================================


// ========================================
// STATE
// ========================================

let examData = null;

let questions = [];


// ========================================
// INITIALIZE
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadData();

        displayExam();

        displayQuestions();

        setupEvents();

    }
);


// ========================================
// LOAD DATA
// ========================================

function loadData() {

    const savedExam =
        localStorage.getItem(
            "currentExam"
        );


    const savedQuestions =
        localStorage.getItem(
            "secureAssessQuestions"
        );


    if (savedExam) {

        try {

            examData =
                JSON.parse(savedExam);

        } catch (error) {

            console.error(
                "Exam data error:",
                error
            );

        }

    }


    if (savedQuestions) {

        try {

            questions =
                JSON.parse(savedQuestions);

        } catch (error) {

            console.error(
                "Question data error:",
                error
            );

        }

    }

}


// ========================================
// DISPLAY EXAM
// ========================================

function displayExam() {

    if (!examData) {

        return;

    }


    document.getElementById(
        "examTitle"
    ).textContent =
        examData.title ||
        "Untitled examination";


    document.getElementById(
        "examSubject"
    ).textContent =
        examData.subject ||
        "Not specified";


    document.getElementById(
        "examType"
    ).textContent =
        examData.examType ||
        "Not specified";


    document.getElementById(
        "examDate"
    ).textContent =
        formatDate(
            examData.date
        );


    document.getElementById(
        "examTime"
    ).textContent =
        examData.time ||
        "Not specified";


    document.getElementById(
        "examDuration"
    ).textContent =
        examData.duration
            ? `${examData.duration} minutes`
            : "Not specified";


    document.getElementById(
        "examMarks"
    ).textContent =
        examData.maxMarks
            ? `${examData.maxMarks} marks`
            : "Not specified";


    document.getElementById(
        "examDescription"
    ).textContent =
        examData.description ||
        "No description provided.";

}


// ========================================
// DISPLAY QUESTIONS
// ========================================

function displayQuestions() {

    const container =
        document.getElementById(
            "questionPreview"
        );


    container.innerHTML = "";


    document.getElementById(
        "questionCount"
    ).textContent =
        `${questions.length} question${questions.length !== 1 ? "s" : ""}`;


    questions.forEach(
        (question, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "preview-row";


            row.innerHTML = `

                <div class="preview-number">
                    Q${String(index + 1).padStart(2, "0")}
                </div>

                <div class="preview-question">

                    <strong>
                        ${escapeHTML(
                            question.text
                        )}
                    </strong>

                    <small>
                        ${capitalize(
                            question.difficulty
                        )} · Correct answer:
                        ${question.correct}
                    </small>

                </div>

                <div class="preview-marks">
                    ${question.marks}
                    mark${question.marks > 1 ? "s" : ""}
                </div>

            `;


            container.appendChild(
                row
            );

        }
    );


    if (
        questions.length === 0
    ) {

        container.innerHTML = `

            <div style="
                padding:30px;
                text-align:center;
                color:#999;
                font-size:9px;
            ">

                No questions have been added.

            </div>

        `;

    }

}


// ========================================
// PUBLISH
// ========================================

function publishExam() {

    const confirmation =
        document.getElementById(
            "confirmPublish"
        );


    if (!confirmation.checked) {

        showToast(
            "Please confirm that you reviewed the examination."
        );

        return;

    }


    if (
        !examData ||
        !examData.title
    ) {

        showToast(
            "Examination details are incomplete."
        );

        return;

    }


    if (
        questions.length === 0
    ) {

        showToast(
            "Add at least one question."
        );

        return;

    }


    /*
     * TEMPORARY FRONTEND BEHAVIOUR
     *
     * Later:
     *
     * POST /api/exams/{examId}/publish
     *
     * Spring Boot will perform
     * the real publishing operation.
     */


    const examCode =
        generateExamCode();


    const publishedExam = {

        ...examData,

        questions,

        examCode,

        status:
            "PUBLISHED",

        publishedAt:
            new Date().toISOString()

    };


    localStorage.setItem(
        "publishedExam",
        JSON.stringify(
            publishedExam
        )
    );


    document.getElementById(
        "examCode"
    ).textContent =
        examCode;


    document.getElementById(
        "successOverlay"
    ).classList.add(
        "show"
    );


    console.log(
        "Published examination:",
        publishedExam
    );

}


// ========================================
// EXAM CODE
// ========================================

function generateExamCode() {

    const subject =
        examData.subject ||
        "EXAM";


    const prefix =
        subject
            .replace(
                /[^A-Za-z]/g,
                ""
            )
            .substring(0, 3)
            .toUpperCase();


    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    return `SA-${prefix}-${random}`;

}


// ========================================
// EVENTS
// ========================================

function setupEvents() {


    // PUBLISH

    document.getElementById(
        "publishButton"
    ).addEventListener(
        "click",
        publishExam
    );


    // SAVE DRAFT

    document.getElementById(
        "saveDraftButton"
    ).addEventListener(
        "click",
        () => {

            localStorage.setItem(
                "secureAssessExamDraft",
                JSON.stringify(
                    examData
                )
            );


            showToast(
                "Examination saved as draft."
            );

        }
    );


    // EDIT EXAM

    document.getElementById(
        "editExamButton"
    ).addEventListener(
        "click",
        () => {

            window.location.href =
                "create-exam.html";

        }
    );


    // DASHBOARD

    document.getElementById(
        "dashboardButton"
    ).addEventListener(
        "click",
        () => {

            window.location.href =
                "teacher-dashboard.html";

        }
    );

}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(date) {

    if (!date) {

        return "Not specified";

    }


    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return date;

    }


    return parsed.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ========================================
// HELPERS
// ========================================

function capitalize(text) {

    if (!text) {

        return "";

    }


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;

}


// ========================================
// TOAST
// ========================================

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}