// ========================================
// SECUREASSESS
// CREATE EXAMINATION
// CONNECTED TO SPRING BOOT
// WITH START + END TIME
// ========================================

const API_BASE = "http://localhost:8080";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const title =
            document.getElementById("examTitle");

        const subject =
            document.getElementById("subject");

        const examType =
            document.getElementById("examType");

        const examDate =
            document.getElementById("examDate");

        const examTime =
            document.getElementById("examTime");

        const examEndTime =
            document.getElementById("examEndTime");

        const duration =
            document.getElementById("duration");

        const maxMarks =
            document.getElementById("maxMarks");

        const totalQuestions =
            document.getElementById("totalQuestions");

        const description =
            document.getElementById("description");

        const saveDraftButton =
            document.getElementById("saveDraftButton");

        const continueButton =
            document.getElementById("continueButton");

        const toast =
            document.getElementById("toast");


        // ========================================
        // TEACHER ID
        // ========================================

        function getTeacherId() {

            const storedTeacherId =
                localStorage.getItem("teacherId")
                ||
                localStorage.getItem("userId");


            if (storedTeacherId) {

                return Number(
                    storedTeacherId
                );

            }


            return 2;
        }


        // ========================================
        // TOAST
        // ========================================

        function showToast(message) {

            if (!toast) {

                return;

            }


            toast.textContent =
                message;


            toast.classList.add("show");


            setTimeout(
                () => {

                    toast.classList.remove("show");

                },
                2500
            );

        }


        // ========================================
        // GET DATETIME
        // ========================================

        function buildDateTime(
            date,
            time
        ) {

            if (
                !date ||
                !time
            ) {

                return null;

            }


            /*
             * Spring Boot LocalDateTime expects:
             *
             * 2026-08-15T14:30:00
             */

            return `${date}T${time}:00`;

        }


        // ========================================
        // COLLECT FORM DATA
        // ========================================

        function getExamData() {

            const startTime =
                buildDateTime(
                    examDate.value,
                    examTime.value
                );


            const endTime =
                buildDateTime(
                    examDate.value,
                    examEndTime.value
                );


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

                endTimeInput:
                    examEndTime.value,

                startTime:
                    startTime,

                endTime:
                    endTime,

                duration:
                    Number(
                        duration.value
                    ),

                maxMarks:
                    Number(
                        maxMarks.value
                    ),

                totalQuestions:
                    Number(
                        totalQuestions.value
                    ),

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


        // ========================================
        // VALIDATION
        // ========================================

        function validateExam() {

            if (
                !title.value.trim()
            ) {

                showToast(
                    "Please enter an examination title."
                );

                title.focus();

                return false;

            }


            if (
                !subject.value
            ) {

                showToast(
                    "Please select a subject."
                );

                subject.focus();

                return false;

            }


            if (
                !examType.value
            ) {

                showToast(
                    "Please select the examination type."
                );

                examType.focus();

                return false;

            }


            if (
                !examDate.value
            ) {

                showToast(
                    "Please select the examination date."
                );

                examDate.focus();

                return false;

            }


            if (
                !examTime.value
            ) {

                showToast(
                    "Please select the start time."
                );

                examTime.focus();

                return false;

            }


            if (
                !examEndTime.value
            ) {

                showToast(
                    "Please select the end time."
                );

                examEndTime.focus();

                return false;

            }


            // ========================================
            // CHECK START < END
            // ========================================

            const start =
                new Date(
                    `${examDate.value}T${examTime.value}`
                );


            const end =
                new Date(
                    `${examDate.value}T${examEndTime.value}`
                );


            if (
                end <= start
            ) {

                showToast(
                    "End time must be after start time."
                );

                examEndTime.focus();

                return false;

            }


            // ========================================
            // CHECK DURATION
            // ========================================

            if (
                !duration.value
            ) {

                showToast(
                    "Please select the examination duration."
                );

                duration.focus();

                return false;

            }


            // ========================================
            // CHECK DURATION AGAINST WINDOW
            // ========================================

            const durationMinutes =
                Number(
                    duration.value
                );


            const availableMinutes =
                (
                    end.getTime()
                    -
                    start.getTime()
                )
                /
                (1000 * 60);


            if (
                durationMinutes >
                availableMinutes
            ) {

                showToast(
                    `Duration cannot exceed the exam window of ${Math.floor(availableMinutes)} minutes.`
                );

                duration.focus();

                return false;

            }


            if (
                !maxMarks.value ||
                Number(
                    maxMarks.value
                ) <= 0
            ) {

                showToast(
                    "Please enter valid maximum marks."
                );

                maxMarks.focus();

                return false;

            }


            if (
                !totalQuestions.value ||
                Number(
                    totalQuestions.value
                ) <= 0
            ) {

                showToast(
                    "Please enter the total number of questions."
                );

                totalQuestions.focus();

                return false;

            }


            return true;

        }


        // ========================================
        // CREATE EXAM
        // ========================================

        async function createExam(
            data
        ) {

            const teacherId =
                getTeacherId();


            const requestBody = {

                title:
                    data.title,

                description:
                    data.description,

                durationMinutes:
                    data.duration,

                totalMarks:
                    data.maxMarks,

                totalQuestions:
                    data.totalQuestions,

                teacherId:
                    teacherId,

                startTime:
                    data.startTime,

                endTime:
                    data.endTime

            };


            console.log(
                "Creating exam:",
                requestBody
            );


            const response =
                await fetch(
                    `${API_BASE}/api/exams`,
                    {

                        method: "POST",

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


            if (
                !response.ok
            ) {

                const errorText =
                    await response.text();


                throw new Error(
                    errorText ||
                    `Server returned ${response.status}`
                );

            }


            const exam =
                await response.json();


            console.log(
                "Exam created:",
                exam
            );


            return exam;

        }


        // ========================================
        // SAVE DRAFT
        // ========================================

        saveDraftButton.addEventListener(
            "click",
            async () => {

                if (
                    !title.value.trim()
                ) {

                    showToast(
                        "Enter an examination title before saving."
                    );

                    title.focus();

                    return;

                }


                if (
                    !duration.value ||
                    !maxMarks.value ||
                    !totalQuestions.value
                ) {

                    showToast(
                        "Please complete duration, marks and questions."
                    );

                    return;

                }


                const data =
                    getExamData();


                try {

                    saveDraftButton.disabled =
                        true;


                    saveDraftButton.textContent =
                        "Saving...";


                    /*
                     * For a draft we still create it in backend.
                     * If your backend has a dedicated draft endpoint,
                     * we can change this later.
                     */

                    const exam =
                        await createExam(
                            data
                        );


                    localStorage.setItem(
                        "currentExam",
                        JSON.stringify(
                            data
                        )
                    );


                    localStorage.setItem(
                        "currentExamId",
                        exam.id
                    );


                    localStorage.setItem(
                        "secureAssessExamDraft",
                        JSON.stringify(
                            data
                        )
                    );


                    showToast(
                        "Examination draft saved successfully."
                    );


                }
                catch (error) {

                    console.error(
                        "Create exam error:",
                        error
                    );


                    showToast(
                        error.message
                    );

                }
                finally {

                    saveDraftButton.disabled =
                        false;


                    saveDraftButton.textContent =
                        "Save draft";

                }

            }
        );


        // ========================================
        // CONTINUE TO QUESTIONS
        // ========================================

        continueButton.addEventListener(
            "click",
            async () => {

                if (
                    !validateExam()
                ) {

                    return;

                }


                const data =
                    getExamData();


                try {

                    continueButton.disabled =
                        true;


                    continueButton.innerHTML =
                        "Creating examination...";


                    const exam =
                        await createExam(
                            data
                        );


                    localStorage.setItem(
                        "currentExam",
                        JSON.stringify(
                            data
                        )
                    );


                    localStorage.setItem(
                        "currentExamId",
                        exam.id
                    );


                    localStorage.removeItem(
                        "secureAssessExamDraft"
                    );


                    console.log(
                        "Exam ID:",
                        exam.id
                    );


                    window.location.href =
                        "question-bank.html";

                }
                catch (error) {

                    console.error(
                        "Create exam error:",
                        error
                    );


                    showToast(
                        error.message
                    );

                }
                finally {

                    continueButton.disabled =
                        false;


                    continueButton.innerHTML = `
                        Continue to questions
                        <span>→</span>
                    `;

                }

            }
        );


        // ========================================
        // LOAD SAVED DRAFT
        // ========================================

        const savedDraft =
            localStorage.getItem(
                "secureAssessExamDraft"
            );


        if (
            savedDraft
        ) {

            try {

                const data =
                    JSON.parse(
                        savedDraft
                    );


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


                examEndTime.value =
                    data.endTimeInput || "";


                duration.value =
                    data.duration || "";


                maxMarks.value =
                    data.maxMarks || "";


                totalQuestions.value =
                    data.totalQuestions || "";


                description.value =
                    data.description || "";


                if (
                    data.security
                ) {

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


                if (
                    data.rules
                ) {

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

            }
            catch (error) {

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