// ========================================
// SECUREASSESS
// QUESTION BANK
// ========================================


// ========================================
// STATE
// ========================================

let questions = [];

let editingQuestionId = null;


// ========================================
// INITIALIZE
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadQuestions();

        loadExamDetails();

        renderQuestions();

        setupEvents();

        console.log(
            "Question Bank loaded."
        );

    }
);


// ========================================
// LOAD EXAM DETAILS
// ========================================

function loadExamDetails() {

    const exam =
        localStorage.getItem(
            "currentExam"
        );


    if (!exam) {

        return;

    }


    try {

        const data =
            JSON.parse(exam);


        document.getElementById(
            "examSubtitle"
        ).textContent =
            `${data.title} · ${data.subject}`;

    } catch (error) {

        console.error(
            "Unable to load exam:",
            error
        );

    }

}


// ========================================
// LOAD QUESTIONS
// ========================================

function loadQuestions() {

    const saved =
        localStorage.getItem(
            "secureAssessQuestions"
        );


    if (!saved) {

        questions = [];

        return;

    }


    try {

        questions =
            JSON.parse(saved);

    } catch (error) {

        questions = [];

        console.error(
            "Unable to load questions:",
            error
        );

    }

}


// ========================================
// SAVE QUESTIONS
// ========================================

function saveQuestions() {

    localStorage.setItem(
        "secureAssessQuestions",
        JSON.stringify(questions)
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


    const search =
        document.getElementById(
            "searchInput"
        ).value
            .trim()
            .toLowerCase();


    const difficulty =
        document.getElementById(
            "difficultyFilter"
        ).value;


    const marks =
        document.getElementById(
            "marksFilter"
        ).value;


    const filtered =
        questions.filter(
            question => {

                const matchesSearch =
                    !search ||
                    question.text
                        .toLowerCase()
                        .includes(search);


                const matchesDifficulty =
                    difficulty === "all" ||
                    question.difficulty ===
                        difficulty;


                const matchesMarks =
                    marks === "all" ||
                    String(question.marks) ===
                        marks;


                return (
                    matchesSearch &&
                    matchesDifficulty &&
                    matchesMarks
                );

            }
        );


    list.innerHTML = "";


    filtered.forEach(
        (question, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "question-row";


            row.innerHTML = `

                <div class="question-number">
                    Q${String(
                        questions.indexOf(question) + 1
                    ).padStart(2, "0")}
                </div>


                <div class="question-content">

                    <strong>
                        ${escapeHTML(question.text)}
                    </strong>

                    <small>
                        Correct answer:
                        ${question.correct}
                    </small>

                </div>


                <span class="difficulty ${question.difficulty}">
                    ${capitalize(
                        question.difficulty
                    )}
                </span>


                <span class="question-marks">
                    ${question.marks} mark${question.marks > 1 ? "s" : ""}
                </span>


                <div class="question-actions">

                    <button
                        class="action-button"
                        data-action="edit"
                        data-id="${question.id}"
                    >
                        ✎
                    </button>


                    <button
                        class="action-button"
                        data-action="delete"
                        data-id="${question.id}"
                    >
                        ×
                    </button>

                </div>

            `;


            list.appendChild(row);

        }
    );


    emptyState.style.display =
        filtered.length === 0
            ? "flex"
            : "none";


    document.getElementById(
        "visibleQuestionCount"
    ).textContent =
        `${filtered.length} question${filtered.length !== 1 ? "s" : ""}`;


    updateStatistics();

    attachQuestionActions();

}


// ========================================
// STATISTICS
// ========================================

function updateStatistics() {

    const totalMarks =
        questions.reduce(
            (total, question) =>
                total + Number(question.marks),
            0
        );


    const easy =
        questions.filter(
            q => q.difficulty === "easy"
        ).length;


    const hard =
        questions.filter(
            q => q.difficulty === "hard"
        ).length;


    document.getElementById(
        "totalQuestions"
    ).textContent =
        questions.length;


    document.getElementById(
        "totalMarks"
    ).textContent =
        totalMarks;


    document.getElementById(
        "easyCount"
    ).textContent =
        easy;


    document.getElementById(
        "hardCount"
    ).textContent =
        hard;

}


// ========================================
// MODAL
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

            radio.checked = true;

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
        "easy";


    document.getElementById(
        "questionMarks"
    ).value =
        "1";


    document.querySelectorAll(
        'input[name="correctAnswer"]'
    ).forEach(
        radio => {

            radio.checked = false;

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
// ========================================

function saveQuestion() {

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


    const questionData = {

        id:
            editingQuestionId ||
            Date.now(),

        text,

        options: {

            A: optionA,

            B: optionB,

            C: optionC,

            D: optionD

        },

        correct:
            correctRadio.value,

        difficulty,

        marks

    };


    if (editingQuestionId) {

        questions =
            questions.map(
                question =>
                    question.id ===
                    editingQuestionId
                        ? questionData
                        : question
            );

        showToast(
            "Question updated."
        );

    } else {

        questions.push(
            questionData
        );

        showToast(
            "Question added."
        );

    }


    saveQuestions();

    renderQuestions();

    closeQuestionModal();

}


// ========================================
// EDIT / DELETE
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
                            q => q.id === id
                        );


                    if (
                        action === "edit"
                    ) {

                        openQuestionModal(
                            question
                        );

                    }


                    if (
                        action === "delete"
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

function deleteQuestion(id) {

    const confirmed =
        confirm(
            "Delete this question?"
        );


    if (!confirmed) {

        return;

    }


    questions =
        questions.filter(
            question =>
                question.id !== id
        );


    saveQuestions();

    renderQuestions();

    showToast(
        "Question deleted."
    );

}


// ========================================
// EVENTS
// ========================================

function setupEvents() {


    // ADD

    document.getElementById(
        "addQuestionButton"
    ).addEventListener(
        "click",
        () => {

            openQuestionModal();

        }
    );


    document.getElementById(
        "emptyAddButton"
    ).addEventListener(
        "click",
        () => {

            openQuestionModal();

        }
    );


    // CLOSE

    document.getElementById(
        "closeModal"
    ).addEventListener(
        "click",
        closeQuestionModal
    );


    document.getElementById(
        "cancelModal"
    ).addEventListener(
        "click",
        closeQuestionModal
    );


    // SAVE

    document.getElementById(
        "saveQuestionButton"
    ).addEventListener(
        "click",
        saveQuestion
    );


    // SEARCH

    document.getElementById(
        "searchInput"
    ).addEventListener(
        "input",
        renderQuestions
    );


    // FILTERS

    document.getElementById(
        "difficultyFilter"
    ).addEventListener(
        "change",
        renderQuestions
    );


    document.getElementById(
        "marksFilter"
    ).addEventListener(
        "change",
        renderQuestions
    );


    // SAVE QUESTIONS

    document.getElementById(
        "saveQuestionsButton"
    ).addEventListener(
        "click",
        () => {

            saveQuestions();

            showToast(
                "Questions saved successfully."
            );

        }
    );


    // REVIEW

    document.getElementById(
        "reviewButton"
    ).addEventListener(
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


            saveQuestions();


            /*
             * Next page:
             *
             * review-publish.html
             */

            window.location.href =
                "review-publish.html";

        }
    );


    // CLOSE MODAL WHEN CLICKING OUTSIDE

    document.getElementById(
        "questionModal"
    ).addEventListener(
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


// ========================================
// HELPERS
// ========================================

function capitalize(text) {

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


function escapeHTML(text) {

    const div =
        document.createElement("div");

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
        2200
    );

}