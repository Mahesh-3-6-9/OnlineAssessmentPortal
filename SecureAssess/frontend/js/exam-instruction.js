// ========================================
// SECUREASSESS
// EXAM INSTRUCTIONS
// ========================================

document.addEventListener("DOMContentLoaded", () => {


    // ===============================
    // ELEMENTS
    // ===============================

    const agreementCheckbox =
        document.getElementById("agreeCheckbox");

    const startExamButton =
        document.getElementById("startExamButton");


    // ===============================
    // AGREEMENT CHECKBOX
    // ===============================

    agreementCheckbox.addEventListener(
        "change",
        () => {

            if (agreementCheckbox.checked) {

                startExamButton.disabled = false;

                startExamButton.classList.add(
                    "enabled"
                );

            } else {

                startExamButton.disabled = true;

                startExamButton.classList.remove(
                    "enabled"
                );

            }

        }
    );


    // ===============================
    // START EXAM
    // ===============================

    startExamButton.addEventListener(
        "click",
        async () => {

            if (!agreementCheckbox.checked) {

                return;

            }


            /*
             * IMPORTANT:
             *
             * This is only frontend navigation
             * for now.
             *
             * Later Spring Boot will:
             *
             * 1. Verify the student
             * 2. Verify exam availability
             * 3. Create an exam session
             * 4. Load randomized questions
             * 5. Start integrity monitoring
             */

            startExamButton.disabled = true;

            startExamButton.innerHTML =
                "Preparing examination...";


            setTimeout(() => {

                window.location.href =
                    "exam.html";

            }, 1000);

        }
    );


    // ===============================
    // PREVENT ACCIDENTAL BACK ACTION
    // ===============================

    window.addEventListener(
        "beforeunload",
        (event) => {

            /*
             * We don't block navigation yet.
             *
             * Real exam protection will be
             * implemented inside exam.html
             * and the Spring Boot backend.
             */

        }
    );


    console.log(
        "Exam instructions page loaded."
    );

});