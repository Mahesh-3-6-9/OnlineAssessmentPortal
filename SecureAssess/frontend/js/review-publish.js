// ========================================
// SECUREASSESS
// REVIEW & PUBLISH
// BACKEND CONNECTED VERSION
// ========================================


// ========================================
// CONFIGURATION
// ========================================

const API_BASE_URL =
    "http://localhost:8080/api";


// Current development teacher
// Test Teacher = ID 2

const TEACHER_ID =
    Number(
        localStorage.getItem(
            "teacherId"
        )
    ) || 2;


// ========================================
// STATE
// ========================================

let examData = null;

let questions = [];

let examId = null;


// ========================================
// INITIALIZE
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            setupEvents();

            getExamId();


            if (!examId) {

                showToast(
                    "Exam ID not found."
                );

                return;

            }


            await loadData();

            displayExam();

            displayQuestions();

            updateChecks();


        } catch (error) {

            console.error(
                "Review page initialization error:",
                error
            );


            showToast(
                error.message ||
                "Unable to load examination data."
            );

        }

    }
);


// ========================================
// GET EXAM ID
// ========================================

function getExamId() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const urlExamId =
        params.get(
            "examId"
        );


    if (urlExamId) {

        examId =
            Number(
                urlExamId
            );

        return;

    }


    const savedExam =
        localStorage.getItem(
            "currentExam"
        );


    if (savedExam) {

        try {

            const parsed =
                JSON.parse(
                    savedExam
                );


            if (parsed.id) {

                examId =
                    Number(
                        parsed.id
                    );

            }


        } catch (error) {

            console.error(
                "Invalid currentExam:",
                error
            );

        }

    }

}


// ========================================
// LOAD DATA FROM BACKEND
// ========================================

async function loadData() {

    // ------------------------------------
    // LOAD EXAM
    // ------------------------------------

    const examResponse =
        await fetch(
            `${API_BASE_URL}/exams/${examId}`
        );


    if (!examResponse.ok) {

        throw new Error(
            "Failed to load exam."
        );

    }


    examData =
        await examResponse.json();


    // ------------------------------------
    // LOAD QUESTIONS
    // ------------------------------------

    const questionResponse =
        await fetch(
            `${API_BASE_URL}/questions/exam/${examId}`
        );


    if (!questionResponse.ok) {

        throw new Error(
            "Failed to load questions."
        );

    }


    questions =
        await questionResponse.json();


    console.log(
        "Exam loaded:",
        examData
    );


    console.log(
        "Questions loaded:",
        questions
    );

}


// ========================================
// DISPLAY EXAM
// ========================================

function displayExam() {

    if (!examData) {

        return;

    }


    setText(
        "examTitle",
        examData.title ||
        "Untitled examination"
    );


    setText(
        "examSubject",
        examData.subject ||
        examData.title ||
        "Not specified"
    );


    setText(
        "examType",
        examData.examType ||
        "Assessment"
    );


    if (examData.createdAt) {

        setText(
            "examDate",
            formatDate(
                examData.createdAt
            )
        );

    } else {

        setText(
            "examDate",
            "Not specified"
        );

    }


    setText(
        "examTime",
        "Not specified"
    );


    if (
        examData.durationMinutes !==
        null &&
        examData.durationMinutes !==
        undefined
    ) {

        setText(
            "examDuration",
            `${examData.durationMinutes} minutes`
        );

    } else {

        setText(
            "examDuration",
            "Not specified"
        );

    }


    if (
        examData.totalMarks !==
        null &&
        examData.totalMarks !==
        undefined
    ) {

        setText(
            "examMarks",
            `${examData.totalMarks} marks`
        );

    } else {

        setText(
            "examMarks",
            "Not specified"
        );

    }


    setText(
        "examDescription",
        examData.description ||
        "No description provided."
    );

}


// ========================================
// DISPLAY QUESTIONS
// ========================================

function displayQuestions() {

    const container =
        document.getElementById(
            "questionPreview"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    const questionCount =
        document.getElementById(
            "questionCount"
        );


    if (questionCount) {

        questionCount.textContent =
            `${questions.length} question${
                questions.length !== 1
                    ? "s"
                    : ""
            }`;

    }


    if (
        questions.length === 0
    ) {

        container.innerHTML = `

            <div style="
                padding:30px;
                text-align:center;
                color:#999;
            ">

                No questions have been added.

            </div>

        `;

        return;

    }


    questions.forEach(
        (
            question,
            index
        ) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "preview-row";


            row.innerHTML = `

                <div class="preview-number">

                    Q${String(
                        index + 1
                    ).padStart(
                        2,
                        "0"
                    )}

                </div>


                <div class="preview-question">

                    <strong>

                        ${escapeHTML(
                            question.questionText ||
                            "Question"
                        )}

                    </strong>


                    <small>

                        Correct answer:

                        <strong>

                            ${escapeHTML(
                                question.correctAnswer ||
                                "-"
                            )}

                        </strong>

                    </small>

                </div>


                <div class="preview-marks">

                    ${question.marks || 0}

                    mark${
                        Number(
                            question.marks
                        ) > 1
                            ? "s"
                            : ""
                    }

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}


// ========================================
// UPDATE MARKS CHECK
// ========================================

function updateChecks() {

    const marksCheck =
        document.getElementById(
            "marksCheck"
        );


    if (!marksCheck) {

        return;

    }


    const totalMarks =
        Number(
            examData?.totalMarks ||
            0
        );


    const actualMarks =
        questions.reduce(
            (
                total,
                question
            ) => {

                return total +
                    Number(
                        question.marks ||
                        0
                    );

            },
            0
        );


    if (
        totalMarks > 0 &&
        actualMarks ===
            totalMarks
    ) {

        marksCheck.innerHTML = `

            <span>✓</span>

            Marks verified

        `;

        marksCheck.style.color =
            "";

    } else {

        marksCheck.innerHTML = `

            <span>!</span>

            Marks mismatch
            (${actualMarks}/${totalMarks})

        `;

        marksCheck.style.color =
            "#b45309";

    }

}


// ========================================
// PUBLISH EXAM
// ========================================

async function publishExam() {

    // ------------------------------------
    // CONFIRMATION
    // ------------------------------------

    const confirmation =
        document.getElementById(
            "confirmPublish"
        );


    if (
        !confirmation ||
        !confirmation.checked
    ) {

        showToast(
            "Please confirm that you reviewed the examination."
        );

        return;

    }


    // ------------------------------------
    // EXAM VALIDATION
    // ------------------------------------

    if (!examData) {

        showToast(
            "Examination data is not available."
        );

        return;

    }


    if (!examData.title) {

        showToast(
            "Examination title is missing."
        );

        return;

    }


    // ------------------------------------
    // QUESTION VALIDATION
    // ------------------------------------

    if (
        questions.length === 0
    ) {

        showToast(
            "Add at least one question before publishing."
        );

        return;

    }


    /*
     * IMPORTANT:
     *
     * We are NOT checking:
     *
     * questions.length === examData.totalQuestions
     *
     * right now.
     *
     * This allows us to test publishing
     * with only one question.
     *
     * Later, when the project is complete,
     * we can enforce the exact number.
     */


    // ------------------------------------
    // MARKS CHECK
    // ------------------------------------

    const actualMarks =
        questions.reduce(
            (
                total,
                question
            ) => {

                return total +
                    Number(
                        question.marks ||
                        0
                    );

            },
            0
        );


    const totalMarks =
        Number(
            examData.totalMarks ||
            0
        );


    /*
     * For testing, don't BLOCK publishing
     * when question marks don't yet equal
     * the configured total marks.
     *
     * Just show a confirmation.
     */

    if (
        totalMarks > 0 &&
        actualMarks !==
            totalMarks
    ) {

        const proceed =
            confirm(
                `Exam total marks are ${totalMarks}, but the questions currently contain ${actualMarks} marks.\n\nThis is okay for testing.\n\nDo you want to publish anyway?`
            );


        if (!proceed) {

            return;

        }

    }


    // ------------------------------------
    // DISABLE BUTTON
    // ------------------------------------

    const publishButton =
        document.getElementById(
            "publishButton"
        );


    if (publishButton) {

        publishButton.disabled =
            true;


        publishButton.innerHTML =
            "Publishing...";

    }


    try {

        // --------------------------------
        // REAL BACKEND REQUEST
        // --------------------------------

        const response =
            await fetch(
                `${API_BASE_URL}/exams/${examId}/publish?teacherId=${TEACHER_ID}`,
                {

                    method:
                        "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    }

                }
            );


        // --------------------------------
        // HANDLE ERROR
        // --------------------------------

        if (!response.ok) {

            let message =
                "Failed to publish examination.";


            try {

                message =
                    await response.text();

            } catch (error) {

                console.error(
                    error
                );

            }


            throw new Error(
                message
            );

        }


        // --------------------------------
        // BACKEND RESPONSE
        // --------------------------------

        const publishedExam =
            await response.json();


        console.log(
            "Published examination:",
            publishedExam
        );


        // --------------------------------
        // UPDATE LOCAL CACHE
        // --------------------------------

        localStorage.setItem(
            "currentExam",
            JSON.stringify(
                publishedExam
            )
        );


        // --------------------------------
        // GENERATE DISPLAY CODE
        // --------------------------------

        const examCode =
            generateExamCode();


        const examCodeElement =
            document.getElementById(
                "examCode"
            );


        if (examCodeElement) {

            examCodeElement.textContent =
                examCode;

        }


        // --------------------------------
        // SHOW SUCCESS
        // --------------------------------

        const successOverlay =
            document.getElementById(
                "successOverlay"
            );


        if (successOverlay) {

            successOverlay.classList.add(
                "show"
            );

        }


        showToast(
            "Examination published successfully."
        );


    } catch (error) {

        console.error(
            "Publish error:",
            error
        );


        showToast(
            error.message ||
            "Unable to publish examination."
        );


        if (publishButton) {

            publishButton.disabled =
                false;


            publishButton.innerHTML = `

                Publish examination

                <span>
                    →
                </span>

            `;

        }

    }

}


// ========================================
// GENERATE EXAM CODE
// ========================================

function generateExamCode() {

    const subject =
        examData?.title ||
        "EXAM";


    const prefix =
        subject
            .replace(
                /[^A-Za-z]/g,
                ""
            )
            .substring(
                0,
                3
            )
            .toUpperCase();


    const random =
        Math.floor(
            1000 +
            Math.random() *
            9000
        );


    return `SA-${
        prefix || "EXM"
    }-${random}`;

}


// ========================================
// EVENTS
// ========================================

function setupEvents() {

    // ------------------------------------
    // PUBLISH
    // ------------------------------------

    const publishButton =
        document.getElementById(
            "publishButton"
        );


    if (publishButton) {

        publishButton.addEventListener(
            "click",
            publishExam
        );

    }


    // ------------------------------------
    // SAVE DRAFT
    // ------------------------------------

    const saveDraftButton =
        document.getElementById(
            "saveDraftButton"
        );


    if (saveDraftButton) {

        saveDraftButton.addEventListener(
            "click",
            () => {

                showToast(
                    "Exam is already saved as a draft in the backend."
                );

            }
        );

    }


    // ------------------------------------
    // EDIT EXAM
    // ------------------------------------

    const editExamButton =
        document.getElementById(
            "editExamButton"
        );


    if (editExamButton) {

        editExamButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    `create-exam.html?examId=${examId}`;

            }

        );

    }


    // ------------------------------------
    // DASHBOARD
    // ------------------------------------

    const dashboardButton =
        document.getElementById(
            "dashboardButton"
        );


    if (dashboardButton) {

        dashboardButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "teacher-dashboard.html";

            }

        );

    }

}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(
    date
) {

    if (!date) {

        return "Not specified";

    }


    const parsed =
        new Date(
            date
        );


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

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"

        }
    );

}


// ========================================
// SET TEXT SAFELY
// ========================================

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            value;

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


// ========================================
// TOAST
// ========================================

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        alert(
            message
        );

        return;

    }


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
        3000
    );

}