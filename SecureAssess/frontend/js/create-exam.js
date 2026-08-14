// ========================================
// SECUREASSESS
// CREATE EXAMINATION
// ========================================


document.addEventListener(
    "DOMContentLoaded",
    () => {


        // ===============================
        // ELEMENTS
        // ===============================

        const title =
            document.getElementById(
                "examTitle"
            );

        const subject =
            document.getElementById(
                "subject"
            );

        const examType =
            document.getElementById(
                "examType"
            );

        const examDate =
            document.getElementById(
                "examDate"
            );

        const examTime =
            document.getElementById(
                "examTime"
            );

        const duration =
            document.getElementById(
                "duration"
            );

        const maxMarks =
            document.getElementById(
                "maxMarks"
            );

        const description =
            document.getElementById(
                "description"
            );


        const saveDraftButton =
            document.getElementById(
                "saveDraftButton"
            );

        const continueButton =
            document.getElementById(
                "continueButton"
            );

        const toast =
            document.getElementById(
                "toast"
            );


        // ===============================
        // SHOW TOAST
        // ===============================

        function showToast(message) {

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


        // ===============================
        // COLLECT FORM DATA
        // ===============================

        function getExamData() {

            return {

                title:
                    title.value.trim(),

                subject:
                    subject.value,

                examType:
                    examType.value,

                date:
                    examDate.value,

                time:
                    examTime.value,

                duration:
                    duration.value,

                maxMarks:
                    maxMarks.value,

                description:
                    description.value.trim(),

                security: {

                    fullscreen:
                        document.getElementById(
                            "fullscreenSetting"
                        ).checked,

                    tabDetection:
                        document.getElementById(
                            "tabSetting"
                        ).checked,

                    copyProtection:
                        document.getElementById(
                            "copySetting"
                        ).checked,

                    eventLogging:
                        document.getElementById(
                            "loggingSetting"
                        ).checked

                },

                rules: {

                    randomQuestions:
                        document.getElementById(
                            "randomQuestions"
                        ).checked,

                    randomOptions:
                        document.getElementById(
                            "randomOptions"
                        ).checked,

                    oneAttempt:
                        document.getElementById(
                            "oneAttempt"
                        ).checked

                }

            };

        }


        // ===============================
        // VALIDATION
        // ===============================

        function validateExam() {

            if (!title.value.trim()) {

                showToast(
                    "Please enter an examination title."
                );

                title.focus();

                return false;

            }


            if (!subject.value) {

                showToast(
                    "Please select a subject."
                );

                subject.focus();

                return false;

            }


            if (!examType.value) {

                showToast(
                    "Please select the examination type."
                );

                examType.focus();

                return false;

            }


            if (!examDate.value) {

                showToast(
                    "Please select the examination date."
                );

                examDate.focus();

                return false;

            }


            if (!examTime.value) {

                showToast(
                    "Please select the examination time."
                );

                examTime.focus();

                return false;

            }


            if (!duration.value) {

                showToast(
                    "Please select the examination duration."
                );

                duration.focus();

                return false;

            }


            if (
                !maxMarks.value ||
                Number(maxMarks.value) <= 0
            ) {

                showToast(
                    "Please enter valid maximum marks."
                );

                maxMarks.focus();

                return false;

            }


            return true;

        }


        // ===============================
        // SAVE DRAFT
        // ===============================

        saveDraftButton.addEventListener(
            "click",
            () => {

                const data =
                    getExamData();


                if (!data.title) {

                    showToast(
                        "Enter an examination title before saving."
                    );

                    return;

                }


                /*
                 * TEMPORARY:
                 *
                 * Later:
                 *
                 * POST /api/exams
                 *
                 * Spring Boot will store
                 * this information in MySQL.
                 */

                localStorage.setItem(
                    "secureAssessExamDraft",
                    JSON.stringify(data)
                );


                showToast(
                    "Examination draft saved."
                );


                console.log(
                    "Exam draft:",
                    data
                );

            }
        );


        // ===============================
        // CONTINUE
        // ===============================

        continueButton.addEventListener(
            "click",
            () => {

                if (
                    !validateExam()
                ) {

                    return;

                }


                const data =
                    getExamData();


                /*
                 * Temporary local storage.
                 *
                 * Later this becomes:
                 *
                 * POST /api/exams
                 *
                 * Backend creates:
                 *
                 * examId
                 */

                localStorage.setItem(
                    "currentExam",
                    JSON.stringify(data)
                );


                /*
                 * Question bank page
                 * will be created next.
                 */

                window.location.href =
                    "question-bank.html";

            }
        );


        // ===============================
        // LOAD DRAFT
        // ===============================

        const savedDraft =
            localStorage.getItem(
                "secureAssessExamDraft"
            );


        if (savedDraft) {

            try {

                const data =
                    JSON.parse(savedDraft);


                title.value =
                    data.title || "";


                subject.value =
                    data.subject || "";


                examType.value =
                    data.examType || "";


                examDate.value =
                    data.date || "";


                examTime.value =
                    data.time || "";


                duration.value =
                    data.duration || "";


                maxMarks.value =
                    data.maxMarks || "";


                description.value =
                    data.description || "";


                if (data.security) {

                    document.getElementById(
                        "fullscreenSetting"
                    ).checked =
                        data.security.fullscreen;

                    document.getElementById(
                        "tabSetting"
                    ).checked =
                        data.security.tabDetection;

                    document.getElementById(
                        "copySetting"
                    ).checked =
                        data.security.copyProtection;

                    document.getElementById(
                        "loggingSetting"
                    ).checked =
                        data.security.eventLogging;

                }


                if (data.rules) {

                    document.getElementById(
                        "randomQuestions"
                    ).checked =
                        data.rules.randomQuestions;

                    document.getElementById(
                        "randomOptions"
                    ).checked =
                        data.rules.randomOptions;

                    document.getElementById(
                        "oneAttempt"
                    ).checked =
                        data.rules.oneAttempt;

                }


                console.log(
                    "Previous draft loaded."
                );

            } catch (error) {

                console.error(
                    "Could not load draft:",
                    error
                );

            }

        }


        console.log(
            "Create Examination page loaded."
        );

    }
);