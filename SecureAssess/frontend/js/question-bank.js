// ========================================
// SECUREASSESS
// QUESTION BANK
// CONNECTED TO SPRING BOOT
// ========================================

const API_BASE = "http://localhost:8080";


// ========================================
// STATE
// ========================================

let questions = [];

let editingQuestionId = null;

let currentExamId = null;

let currentTeacherId = null;


// ========================================
// INITIALIZE
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            currentExamId =
                getExamId();

            currentTeacherId =
                getTeacherId();


            console.log(
                "Current Exam ID:",
                currentExamId
            );


            console.log(
                "Current Teacher ID:",
                currentTeacherId
            );


            await loadTeacherDetails();

            await loadExamDetails();

            await loadQuestions();

            renderQuestions();

            setupEvents();


            console.log(
                "SecureAssess Question Bank loaded."
            );


        } catch (error) {

            console.error(
                "Question Bank initialization failed:",
                error
            );


            showToast(
                error.message ||
                "Unable to load question bank."
            );

        }

    }
);


// ========================================
// GET EXAM ID
// ========================================

function getExamId() {

    const examId =
        localStorage.getItem(
            "currentExamId"
        );


    if (!examId) {

        throw new Error(
            "No examination selected. Please create or select an examination first."
        );

    }


    return Number(
        examId
    );

}


// ========================================
// GET TEACHER ID
// ========================================

function getTeacherId() {

    const teacherId =
        localStorage.getItem(
            "teacherId"
        )
        ||
        localStorage.getItem(
            "userId"
        );


    if (!teacherId) {

        throw new Error(
            "Teacher session not found. Please log in again."
        );

    }


    return Number(
        teacherId
    );

}


// ========================================
// LOAD TEACHER DETAILS
// ========================================

async function loadTeacherDetails() {

    const teacherNameElement =
        document.getElementById(
            "teacherName"
        );


    const teacherAvatarElement =
        document.getElementById(
            "teacherAvatar"
        );


    /*
     * First try information stored
     * during login.
     */

    let storedName =
        localStorage.getItem(
            "userName"
        )
        ||
        localStorage.getItem(
            "teacherName"
        );


    /*
     * If no name is available locally,
     * ask the backend for the teacher.
     */

    if (!storedName) {

        try {

            const response =
                await fetch(
                    `${API_BASE}/api/users/${currentTeacherId}`
                );


            if (response.ok) {

                const user =
                    await response.json();


                storedName =
                    user.name;


                if (storedName) {

                    localStorage.setItem(
                        "userName",
                        storedName
                    );

                }

            }

        } catch (error) {

            console.warn(
                "Unable to load teacher profile:",
                error
            );

        }

    }


    /*
     * Fallback only if the backend
     * profile endpoint is unavailable.
     */

    if (!storedName) {

        storedName =
            "Teacher";

    }


    if (teacherNameElement) {

        teacherNameElement.textContent =
            storedName;

    }


    if (teacherAvatarElement) {

        teacherAvatarElement.textContent =
            getInitials(
                storedName
            );

    }

}


// ========================================
// GET INITIALS
// ========================================

function getInitials(
    name
) {

    if (!name) {

        return "T";

    }


    const words =
        name
            .trim()
            .split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .charAt(0)
            .toUpperCase();

    }


    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();

}


// ========================================
// LOAD EXAM DETAILS
// ========================================

async function loadExamDetails() {

    const response =
        await fetch(
            `${API_BASE}/api/exams/${currentExamId}`
        );


    if (!response.ok) {

        const message =
            await response.text();


        throw new Error(
            message ||
            "Unable to load examination."
        );

    }


    const exam =
        await response.json();


    console.log(
        "Current exam:",
        exam
    );


    const subtitle =
        document.getElementById(
            "examSubtitle"
        );


    if (subtitle) {

        subtitle.textContent =
            `${exam.title} · ${exam.totalQuestions} questions · ${exam.durationMinutes} min`;

    }


    localStorage.setItem(
        "currentExam",
        JSON.stringify(
            exam
        )
    );

}


// ========================================
// LOAD QUESTIONS
// ========================================

async function loadQuestions() {

    const response =
        await fetch(
            `${API_BASE}/api/questions/exam/${currentExamId}`
        );


    if (!response.ok) {

        const message =
            await response.text();


        throw new Error(
            message ||
            "Unable to load questions."
        );

    }


    const backendQuestions =
        await response.json();


    console.log(
        "Questions from backend:",
        backendQuestions
    );


    questions =
        backendQuestions.map(
            question => ({

                id:
                    question.id,

                text:
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

                correct:
                    question.correctAnswer,

                marks:
                    question.marks,

                difficulty:
                    question.difficulty ||
                    "medium"

            })
        );


    mergeLocalDifficulty();

}


// ========================================
// MERGE LOCAL DIFFICULTY
// ========================================

function mergeLocalDifficulty() {

    const saved =
        localStorage.getItem(
            "secureAssessQuestionDifficulty"
        );


    if (!saved) {

        return;

    }


    try {

        const difficultyData =
            JSON.parse(
                saved
            );


        questions.forEach(
            question => {

                if (
                    difficultyData[
                        question.id
                    ]
                ) {

                    question.difficulty =
                        difficultyData[
                            question.id
                        ];

                }

            }
        );


    } catch (error) {

        console.error(
            "Unable to load difficulty information:",
            error
        );

    }

}


// ========================================
// SAVE DIFFICULTY CACHE
// ========================================

function saveDifficultyCache() {

    const difficultyData = {};


    questions.forEach(
        question => {

            difficultyData[
                question.id
            ] =
                question.difficulty;

        }
    );


    localStorage.setItem(
        "secureAssessQuestionDifficulty",
        JSON.stringify(
            difficultyData
        )
    );

}


// ========================================
// RENDER QUESTIONS
// ========================================

function renderQuestions() {

    const list =
        document.getElementById(
            "questionList"
        );


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    if (!list || !emptyState) {

        return;

    }


    const searchElement =
        document.getElementById(
            "searchInput"
        );


    const difficultyElement =
        document.getElementById(
            "difficultyFilter"
        );


    const marksElement =
        document.getElementById(
            "marksFilter"
        );


    const search =
        searchElement
            ? searchElement.value
                .trim()
                .toLowerCase()
            : "";


    const difficulty =
        difficultyElement
            ? difficultyElement.value
            : "all";


    const marks =
        marksElement
            ? marksElement.value
            : "all";


    const filtered =
        questions.filter(
            question => {

                const matchesSearch =
                    !search ||
                    question.text
                        .toLowerCase()
                        .includes(
                            search
                        );


                const matchesDifficulty =
                    difficulty === "all" ||
                    question.difficulty ===
                        difficulty;


                const matchesMarks =
                    marks === "all" ||
                    String(
                        question.marks
                    ) ===
                        marks;


                return (
                    matchesSearch &&
                    matchesDifficulty &&
                    matchesMarks
                );

            }
        );


    list.innerHTML =
        "";


    filtered.forEach(
        question => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "question-row";


            row.innerHTML = `

                <div class="question-number">

                    Q${String(
                        questions.indexOf(
                            question
                        ) + 1
                    ).padStart(
                        2,
                        "0"
                    )}

                </div>


                <div class="question-content">

                    <strong>
                        ${escapeHTML(
                            question.text
                        )}
                    </strong>


                    <small>

                        Correct answer:
                        ${escapeHTML(
                            question.correct
                        )}

                    </small>

                </div>


                <span
                    class="difficulty ${question.difficulty}"
                >

                    ${capitalize(
                        question.difficulty
                    )}

                </span>


                <span class="question-marks">

                    ${question.marks}

                    mark${
                        question.marks > 1
                            ? "s"
                            : ""
                    }

                </span>


                <div class="question-actions">

                    <button
                        class="action-button"
                        data-action="edit"
                        data-id="${question.id}"
                        title="Edit"
                        type="button"
                    >
                        ✎
                    </button>


                    <button
                        class="action-button"
                        data-action="delete"
                        data-id="${question.id}"
                        title="Delete"
                        type="button"
                    >
                        ×
                    </button>

                </div>

            `;


            list.appendChild(
                row
            );

        }
    );


    emptyState.style.display =
        filtered.length === 0
            ? "flex"
            : "none";


    const visibleCount =
        document.getElementById(
            "visibleQuestionCount"
        );


    if (visibleCount) {

        visibleCount.textContent =
            `${filtered.length} question${
                filtered.length !== 1
                    ? "s"
                    : ""
            }`;

    }


    updateStatistics();

    attachQuestionActions();

}


// ========================================
// STATISTICS
// ========================================

function updateStatistics() {

    const totalMarks =
        questions.reduce(
            (
                total,
                question
            ) =>
                total +
                Number(
                    question.marks
                ),
            0
        );


    const easy =
        questions.filter(
            question =>
                question.difficulty ===
                "easy"
        ).length;


    const hard =
        questions.filter(
            question =>
                question.difficulty ===
                "hard"
        ).length;


    const totalQuestionsElement =
        document.getElementById(
            "totalQuestions"
        );


    const totalMarksElement =
        document.getElementById(
            "totalMarks"
        );


    const easyCountElement =
        document.getElementById(
            "easyCount"
        );


    const hardCountElement =
        document.getElementById(
            "hardCount"
        );


    if (totalQuestionsElement) {

        totalQuestionsElement.textContent =
            questions.length;

    }


    if (totalMarksElement) {

        totalMarksElement.textContent =
            totalMarks;

    }


    if (easyCountElement) {

        easyCountElement.textContent =
            easy;

    }


    if (hardCountElement) {

        hardCountElement.textContent =
            hard;

    }

}


// ========================================
// OPEN QUESTION MODAL
// ========================================

function openQuestionModal(
    question = null
) {

    const modal =
        document.getElementById(
            "questionModal"
        );


    clearModal();


    if (question) {

        editingQuestionId =
            question.id;


        document.getElementById(
            "modalTitle"
        ).textContent =
            "Edit question";


        document.getElementById(
            "questionText"
        ).value =
            question.text;


        document.getElementById(
            "optionA"
        ).value =
            question.options.A;


        document.getElementById(
            "optionB"
        ).value =
            question.options.B;


        document.getElementById(
            "optionC"
        ).value =
            question.options.C;


        document.getElementById(
            "optionD"
        ).value =
            question.options.D;


        document.getElementById(
            "questionDifficulty"
        ).value =
            question.difficulty;


        document.getElementById(
            "questionMarks"
        ).value =
            question.marks;


        const radio =
            document.querySelector(
                `input[name="correctAnswer"][value="${question.correct}"]`
            );


        if (radio) {

            radio.checked =
                true;

        }

    }


    modal.classList.add(
        "show"
    );

}


// ========================================
// CLEAR MODAL
// ========================================

function clearModal() {

    editingQuestionId =
        null;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Add question";


    document.getElementById(
        "questionText"
    ).value =
        "";


    document.getElementById(
        "optionA"
    ).value =
        "";


    document.getElementById(
        "optionB"
    ).value =
        "";


    document.getElementById(
        "optionC"
    ).value =
        "";


    document.getElementById(
        "optionD"
    ).value =
        "";


    document.getElementById(
        "questionDifficulty"
    ).value =
        "medium";


    document.getElementById(
        "questionMarks"
    ).value =
        "1";


    document.querySelectorAll(
        'input[name="correctAnswer"]'
    ).forEach(
        radio => {

            radio.checked =
                false;

        }
    );

}


// ========================================
// CLOSE MODAL
// ========================================

function closeQuestionModal() {

    document.getElementById(
        "questionModal"
    ).classList.remove(
        "show"
    );


    clearModal();

}


// ========================================
// SAVE QUESTION
// ADD OR EDIT
// ========================================

async function saveQuestion() {

    const text =
        document.getElementById(
            "questionText"
        ).value.trim();


    const optionA =
        document.getElementById(
            "optionA"
        ).value.trim();


    const optionB =
        document.getElementById(
            "optionB"
        ).value.trim();


    const optionC =
        document.getElementById(
            "optionC"
        ).value.trim();


    const optionD =
        document.getElementById(
            "optionD"
        ).value.trim();


    const correctRadio =
        document.querySelector(
            'input[name="correctAnswer"]:checked'
        );


    const difficulty =
        document.getElementById(
            "questionDifficulty"
        ).value;


    const marks =
        Number(
            document.getElementById(
                "questionMarks"
            ).value
        );


    // ====================================
    // VALIDATION
    // ====================================

    if (!text) {

        showToast(
            "Please enter the question."
        );

        return;

    }


    if (
        !optionA ||
        !optionB ||
        !optionC ||
        !optionD
    ) {

        showToast(
            "Please enter all four options."
        );

        return;

    }


    if (!correctRadio) {

        showToast(
            "Please select the correct answer."
        );

        return;

    }


    if (
        !marks ||
        marks <= 0
    ) {

        showToast(
            "Marks must be greater than 0."
        );

        return;

    }


    const saveButton =
        document.getElementById(
            "saveQuestionButton"
        );


    // ====================================
    // PREVENT DOUBLE CLICK
    // ====================================

    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.textContent =
            editingQuestionId
                ? "Updating..."
                : "Saving...";

    }


    try {

        // ==================================
        // EDIT EXISTING QUESTION
        // ==================================

        if (editingQuestionId) {

            const requestBody = {

                teacherId:
                    currentTeacherId,

                questionText:
                    text,

                optionA:
                    optionA,

                optionB:
                    optionB,

                optionC:
                    optionC,

                optionD:
                    optionD,

                correctAnswer:
                    correctRadio.value,

                marks:
                    marks

            };


            console.log(
                "Updating question:",
                editingQuestionId,
                requestBody
            );


            const response =
                await fetch(
                    `${API_BASE}/api/questions/${editingQuestionId}`,
                    {

                        method:
                            "PUT",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                requestBody
                            )

                    }
                );


            if (!response.ok) {

                const errorText =
                    await response.text();


                throw new Error(
                    errorText ||
                    `Server returned ${response.status}`
                );

            }


            const updatedQuestion =
                await response.json();


            console.log(
                "Question updated:",
                updatedQuestion
            );


            // ==================================
            // UPDATE FRONTEND STATE
            // ==================================

            const index =
                questions.findIndex(
                    question =>
                        question.id ===
                        editingQuestionId
                );


            if (index !== -1) {

                questions[index] = {

                    id:
                        updatedQuestion.id,

                    text:
                        updatedQuestion.questionText,

                    options: {

                        A:
                            updatedQuestion.optionA,

                        B:
                            updatedQuestion.optionB,

                        C:
                            updatedQuestion.optionC,

                        D:
                            updatedQuestion.optionD

                    },

                    correct:
                        updatedQuestion.correctAnswer,

                    marks:
                        updatedQuestion.marks,

                    difficulty:
                        difficulty

                };

            }


            saveDifficultyCache();

            renderQuestions();

            closeQuestionModal();


            showToast(
                "Question updated successfully."
            );


            return;

        }


        // ==================================
        // CREATE NEW QUESTION
        // ==================================

        const requestBody = {

            examId:
                currentExamId,

            teacherId:
                currentTeacherId,

            questionText:
                text,

            optionA:
                optionA,

            optionB:
                optionB,

            optionC:
                optionC,

            optionD:
                optionD,

            correctAnswer:
                correctRadio.value,

            marks:
                marks

        };


        console.log(
            "Creating question:",
            requestBody
        );


        const response =
            await fetch(
                `${API_BASE}/api/questions`,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            requestBody
                        )

                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                `Server returned ${response.status}`
            );

        }


        const createdQuestion =
            await response.json();


        console.log(
            "Question created:",
            createdQuestion
        );


        const newQuestion = {

            id:
                createdQuestion.id,

            text:
                createdQuestion.questionText,

            options: {

                A:
                    createdQuestion.optionA,

                B:
                    createdQuestion.optionB,

                C:
                    createdQuestion.optionC,

                D:
                    createdQuestion.optionD

            },

            correct:
                createdQuestion.correctAnswer,

            marks:
                createdQuestion.marks,

            difficulty:
                difficulty

        };


        questions.push(
            newQuestion
        );


        saveDifficultyCache();

        renderQuestions();

        closeQuestionModal();


        showToast(
            "Question added successfully."
        );


    } catch (error) {

        console.error(
            "Unable to save question:",
            error
        );


        showToast(
            error.message ||
            "Unable to save question."
        );


    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "Save question";

        }

    }

}


// ========================================
// ATTACH EDIT / DELETE ACTIONS
// ========================================

function attachQuestionActions() {

    document.querySelectorAll(
        ".action-button"
    ).forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            button.dataset.id
                        );


                    const action =
                        button.dataset.action;


                    const question =
                        questions.find(
                            q =>
                                q.id ===
                                id
                        );


                    if (!question) {

                        return;

                    }


                    if (
                        action ===
                        "edit"
                    ) {

                        openQuestionModal(
                            question
                        );

                    }


                    if (
                        action ===
                        "delete"
                    ) {

                        deleteQuestion(
                            id
                        );

                    }

                }
            );

        }
    );

}


// ========================================
// DELETE QUESTION
// ========================================

async function deleteQuestion(
    id
) {

    const confirmed =
        confirm(
            "Delete this question?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE}/api/questions/${id}?teacherId=${currentTeacherId}`,
                {

                    method:
                        "DELETE"

                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                `Server returned ${response.status}`
            );

        }


        questions =
            questions.filter(
                question =>
                    question.id !==
                    id
            );


        saveDifficultyCache();

        renderQuestions();


        showToast(
            "Question deleted successfully."
        );


    } catch (error) {

        console.error(
            "Unable to delete question:",
            error
        );


        showToast(
            error.message ||
            "Unable to delete question."
        );

    }

}


// ========================================
// EVENTS
// ========================================

function setupEvents() {


    // ====================================
    // ADD QUESTION
    // ====================================

    const addQuestionButton =
        document.getElementById(
            "addQuestionButton"
        );


    if (addQuestionButton) {

        addQuestionButton.addEventListener(
            "click",
            () => {

                openQuestionModal();

            }
        );

    }


    const emptyAddButton =
        document.getElementById(
            "emptyAddButton"
        );


    if (emptyAddButton) {

        emptyAddButton.addEventListener(
            "click",
            () => {

                openQuestionModal();

            }
        );

    }


    // ====================================
    // CLOSE MODAL
    // ====================================

    const closeModal =
        document.getElementById(
            "closeModal"
        );


    if (closeModal) {

        closeModal.addEventListener(
            "click",
            closeQuestionModal
        );

    }


    const cancelModal =
        document.getElementById(
            "cancelModal"
        );


    if (cancelModal) {

        cancelModal.addEventListener(
            "click",
            closeQuestionModal
        );

    }


    // ====================================
    // SAVE QUESTION
    // ====================================

    const saveQuestionButton =
        document.getElementById(
            "saveQuestionButton"
        );


    if (saveQuestionButton) {

        saveQuestionButton.addEventListener(
            "click",
            saveQuestion
        );

    }


    // ====================================
    // SEARCH
    // ====================================

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            renderQuestions
        );

    }


    // ====================================
    // DIFFICULTY FILTER
    // ====================================

    const difficultyFilter =
        document.getElementById(
            "difficultyFilter"
        );


    if (difficultyFilter) {

        difficultyFilter.addEventListener(
            "change",
            renderQuestions
        );

    }


    // ====================================
    // MARKS FILTER
    // ====================================

    const marksFilter =
        document.getElementById(
            "marksFilter"
        );


    if (marksFilter) {

        marksFilter.addEventListener(
            "change",
            renderQuestions
        );

    }


    // ====================================
    // SAVE QUESTIONS
    // ====================================

    const saveQuestionsButton =
        document.getElementById(
            "saveQuestionsButton"
        );


    if (saveQuestionsButton) {

        saveQuestionsButton.addEventListener(
            "click",
            async () => {

                await loadQuestions();

                renderQuestions();


                showToast(
                    "Questions are saved in the database."
                );

            }
        );

    }


    // ====================================
    // REVIEW & PUBLISH
    // ====================================

    const reviewButton =
        document.getElementById(
            "reviewButton"
        );


    if (reviewButton) {

        reviewButton.addEventListener(
            "click",
            () => {

                if (
                    questions.length === 0
                ) {

                    showToast(
                        "Add at least one question before continuing."
                    );

                    return;

                }


                localStorage.setItem(
                    "currentExamId",
                    String(
                        currentExamId
                    )
                );


                window.location.href =
                    `review-publish.html?examId=${currentExamId}`;

            }
        );

    }


    // ====================================
    // CLOSE MODAL OUTSIDE CLICK
    // ====================================

    const questionModal =
        document.getElementById(
            "questionModal"
        );


    if (questionModal) {

        questionModal.addEventListener(
            "click",
            event => {

                if (
                    event.target.id ===
                    "questionModal"
                ) {

                    closeQuestionModal();

                }

            }
        );

    }

}


// ========================================
// HELPERS
// ========================================

function capitalize(
    text
) {

    if (!text) {

        return "";

    }


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

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
        2500
    );

}