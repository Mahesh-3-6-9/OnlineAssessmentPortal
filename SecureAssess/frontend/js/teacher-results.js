// ========================================
// SECUREASSESS
// TEACHER RESULTS
// CONNECTED TO SPRING BOOT
// ========================================

const API_BASE = "http://localhost:8080/api";

let exams = [];

let selectedExamAttempts = [];


// ========================================
// INITIALIZE
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setupNavigation();

        setupLogout();

        setupRefresh();

        setupExamSelector();

        loadTeacherProfile();

        await loadTeacherExams();

        console.log(
            "SecureAssess Teacher Results loaded."
        );

    }
);


// ========================================
// NAVIGATION
// ========================================

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(
        item => {

            item.addEventListener(
                "click",
                event => {

                    const section =
                        item.dataset.section;


                    // If this is a real page link,
                    // allow normal navigation.

                    if (
                        section === "results"
                    ) {

                        return;

                    }


                    event.preventDefault();


                    if (
                        section === "dashboard"
                    ) {

                        window.location.href =
                            "teacher-dashboard.html";

                    }


                    else if (
                        section === "exams"
                    ) {

                        window.location.href =
                            "teacher-exams.html";

                    }


                    else if (
                        section === "questions"
                    ) {

                        window.location.href =
                            "question-bank.html";

                    }


                    else if (
                        section === "students"
                    ) {

                        alert(
                            "Student management will be connected next."
                        );

                    }


                    else if (
                        section === "analytics"
                    ) {

                        window.location.href =
                            "teacher-dashboard-analytics.html";

                    }


                    else if (
                        section === "settings"
                    ) {

                        alert(
                            "Settings are available from your dashboard."
                        );

                    }

                }
            );

        }

    );

}


// ========================================
// LOGOUT
// ========================================

function setupLogout() {

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (!logoutButton) {

        return;

    }


    logoutButton.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) {

                return;

            }


            // Remove current session

            sessionStorage.removeItem(
                "currentUser"
            );


            // Remove local user data

            localStorage.removeItem(
                "userId"
            );

            localStorage.removeItem(
                "teacherId"
            );

            localStorage.removeItem(
                "studentId"
            );

            localStorage.removeItem(
                "userName"
            );

            localStorage.removeItem(
                "userEmail"
            );

            localStorage.removeItem(
                "userRole"
            );


            window.location.href =
                "login.html";

        }
    );

}


// ========================================
// LOAD TEACHER PROFILE
// ========================================

function loadTeacherProfile() {

    let user = null;


    // ====================================
    // 1. SESSION STORAGE
    // ====================================

    const sessionUser =
        sessionStorage.getItem(
            "currentUser"
        );


    if (sessionUser) {

        try {

            user =
                JSON.parse(
                    sessionUser
                );

        }
        catch (error) {

            console.error(
                "Invalid session user:",
                error
            );

        }

    }


    // ====================================
    // 2. LOCAL STORAGE FALLBACK
    // ====================================

    if (!user) {

        const userId =
            localStorage.getItem(
                "userId"
            );


        const userName =
            localStorage.getItem(
                "userName"
            );


        const userEmail =
            localStorage.getItem(
                "userEmail"
            );


        const userRole =
            localStorage.getItem(
                "userRole"
            );


        if (
            userId ||
            userName
        ) {

            user = {

                id:
                    userId,

                name:
                    userName,

                email:
                    userEmail,

                role:
                    userRole

            };

        }

    }


    // ====================================
    // 3. DEFAULT
    // ====================================

    if (!user) {

        console.warn(
            "No logged-in teacher found."
        );


        setTeacherProfile(
            "Faculty",
            "Faculty"
        );


        return;

    }


    // ====================================
    // 4. NAME
    // ====================================

    const name =
        user.name ||
        "Faculty";


    // ====================================
    // 5. ROLE
    // ====================================

    let role =
        user.role ||
        "Faculty";


    if (
        String(role).toUpperCase() ===
        "TEACHER"
    ) {

        role =
            "Faculty";

    }


    // ====================================
    // 6. UPDATE UI
    // ====================================

    setTeacherProfile(
        name,
        role
    );

}


// ========================================
// SET TEACHER PROFILE
// ========================================

function setTeacherProfile(
    name,
    role
) {

    // ====================================
    // TOP PROFILE
    // ====================================

    const topName =
        document.querySelector(
            ".top-profile strong"
        );


    if (topName) {

        topName.textContent =
            name;

    }


    const topRole =
        document.querySelector(
            ".top-profile small"
        );


    if (topRole) {

        topRole.textContent =
            role;

    }


    // ====================================
    // SIDEBAR PROFILE
    // ====================================

    const sidebarName =
        document.querySelector(
            ".teacher-card strong"
        );


    if (sidebarName) {

        sidebarName.textContent =
            name;

    }


    const sidebarRole =
        document.querySelector(
            ".teacher-card small"
        );


    if (sidebarRole) {

        sidebarRole.textContent =
            role;

    }


    // ====================================
    // AVATARS
    // ====================================

    const initials =
        getNameInitials(
            name
        );


    const topAvatar =
        document.querySelector(
            ".top-profile .profile-avatar"
        );


    if (topAvatar) {

        topAvatar.textContent =
            initials;

    }


    const teacherAvatar =
        document.querySelector(
            ".teacher-avatar"
        );


    if (teacherAvatar) {

        teacherAvatar.textContent =
            initials;

    }

}


// ========================================
// GET CURRENT USER
// ========================================

function getCurrentUser() {

    // ====================================
    // SESSION STORAGE
    // ====================================

    const sessionUser =
        sessionStorage.getItem(
            "currentUser"
        );


    if (sessionUser) {

        try {

            return JSON.parse(
                sessionUser
            );

        }
        catch (error) {

            console.error(
                "Unable to parse currentUser:",
                error
            );

        }

    }


    // ====================================
    // LOCAL STORAGE FALLBACK
    // ====================================

    const userId =
        localStorage.getItem(
            "userId"
        );


    const userName =
        localStorage.getItem(
            "userName"
        );


    const userEmail =
        localStorage.getItem(
            "userEmail"
        );


    const userRole =
        localStorage.getItem(
            "userRole"
        );


    if (
        userId ||
        userName
    ) {

        return {

            id:
                userId,

            name:
                userName,

            email:
                userEmail,

            role:
                userRole

        };

    }


    return null;

}


// ========================================
// GET TEACHER ID
// ========================================

function getTeacherId() {

    const user =
        getCurrentUser();


    // ====================================
    // CURRENT LOGGED-IN USER
    // ====================================

    if (
        user &&
        user.id
    ) {

        const id =
            Number(
                user.id
            );


        if (
            Number.isFinite(id) &&
            id > 0
        ) {

            return id;

        }

    }


    // ====================================
    // TEACHER ID FALLBACK
    // ====================================

    const teacherId =
        localStorage.getItem(
            "teacherId"
        );


    if (teacherId) {

        const id =
            Number(
                teacherId
            );


        if (
            Number.isFinite(id) &&
            id > 0
        ) {

            return id;

        }

    }


    // ====================================
    // USER ID FALLBACK
    // ====================================

    const userId =
        localStorage.getItem(
            "userId"
        );


    if (userId) {

        const id =
            Number(
                userId
            );


        if (
            Number.isFinite(id) &&
            id > 0
        ) {

            return id;

        }

    }


    return null;

}


// ========================================
// LOAD TEACHER EXAMS
// ========================================

async function loadTeacherExams() {

    const examSelect =
        document.getElementById(
            "examSelect"
        );


    if (!examSelect) {

        console.error(
            "examSelect element not found."
        );

        return;

    }


    examSelect.innerHTML = `

        <option value="">
            Loading examinations...
        </option>

    `;


    const teacherId =
        getTeacherId();


    // ====================================
    // NO TEACHER ID
    // ====================================

    if (!teacherId) {

        examSelect.innerHTML = `

            <option value="">
                Please login again
            </option>

        `;


        showToast(
            "Teacher session not found. Please login again."
        );


        return;

    }


    console.log(
        "Loading exams for teacher:",
        teacherId
    );


    try {

        const response =
            await fetch(
                `${API_BASE}/exams/teacher/${teacherId}`
            );


        if (!response.ok) {

            const message =
                await response.text();


            throw new Error(
                message ||
                `Server returned ${response.status}`
            );

        }


        const data =
            await response.json();


        exams =
            Array.isArray(data)
                ? data
                : [];


        console.log(
            "Teacher examinations:",
            exams
        );


        // ====================================
        // CLEAR SELECT
        // ====================================

        examSelect.innerHTML = `

            <option value="">
                Select an examination
            </option>

        `;


        // ====================================
        // NO EXAMS
        // ====================================

        if (
            exams.length === 0
        ) {

            examSelect.innerHTML = `

                <option value="">
                    No examinations found
                </option>

            `;


            clearResults();


            return;

        }


        // ====================================
        // ADD EXAMS
        // ====================================

        exams.forEach(
            exam => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    exam.id;


                option.textContent =
                    `${exam.title || "Untitled Examination"} — ${exam.totalQuestions || 0} questions`;


                examSelect.appendChild(
                    option
                );

            }
        );


        clearResults();


    }
    catch (error) {

        console.error(
            "Exam loading error:",
            error
        );


        exams = [];


        examSelect.innerHTML = `

            <option value="">
                Failed to load examinations
            </option>

        `;


        clearResults();


        showToast(
            "Could not load examinations."
        );

    }

}


// ========================================
// EXAM SELECTOR
// ========================================

function setupExamSelector() {

    const examSelect =
        document.getElementById(
            "examSelect"
        );


    if (!examSelect) {

        return;

    }


    examSelect.addEventListener(
        "change",
        async () => {

            const examId =
                examSelect.value;


            if (!examId) {

                clearResults();

                return;

            }


            await loadExamResults(
                examId
            );

        }
    );

}


// ========================================
// REFRESH
// ========================================

function setupRefresh() {

    const refreshButton =
        document.querySelector(
            ".refresh-button"
        );


    if (!refreshButton) {

        return;

    }


    refreshButton.addEventListener(
        "click",
        async () => {

            refreshButton.disabled =
                true;


            refreshButton.textContent =
                "Refreshing...";


            await loadTeacherExams();


            refreshButton.disabled =
                false;


            refreshButton.textContent =
                "↻ Refresh";

        }
    );

}


// ========================================
// LOAD EXAM RESULTS
// ========================================

async function loadExamResults(
    examId
) {

    showLoading();


    try {

        const response =
            await fetch(
                `${API_BASE}/attempts/exam/${examId}`
            );


        if (!response.ok) {

            const message =
                await response.text();


            throw new Error(
                message ||
                "Unable to load results."
            );

        }


        const data =
            await response.json();


        selectedExamAttempts =
            Array.isArray(data)
                ? data
                : [];


        console.log(
            "Exam attempts:",
            selectedExamAttempts
        );


        renderStatistics(
            selectedExamAttempts
        );


        renderResultsTable(
            selectedExamAttempts
        );


    }
    catch (error) {

        console.error(
            "Results loading error:",
            error
        );


        selectedExamAttempts =
            [];


        clearResults();


        showToast(
            "Could not load examination results."
        );

    }

}


// ========================================
// RENDER STATISTICS
// ========================================

function renderStatistics(
    attempts
) {

    const submitted =
        attempts.filter(
            attempt =>
                String(
                    attempt.status || ""
                ).toUpperCase() ===
                "SUBMITTED"
        );


    // ====================================
    // STUDENTS ATTEMPTED
    // ====================================

    const studentsAttempted =
        submitted.length;


    setStatValue(
        0,
        studentsAttempted
    );


    // ====================================
    // PERCENTAGES
    // ====================================

    const percentages =
        submitted
            .map(
                attempt =>
                    Number(
                        attempt.percentage
                    )
            )
            .filter(
                value =>
                    Number.isFinite(
                        value
                    )
            );


    // ====================================
    // AVERAGE
    // ====================================

    let average =
        0;


    if (
        percentages.length > 0
    ) {

        average =
            percentages.reduce(
                (
                    sum,
                    value
                ) =>
                    sum + value,
                0
            )
            /
            percentages.length;

    }


    // ====================================
    // HIGHEST
    // ====================================

    const highest =
        percentages.length > 0
            ? Math.max(
                ...percentages
            )
            : 0;


    setStatValue(
        1,
        `${Math.round(average)}%`
    );


    setStatValue(
        2,
        `${Math.round(highest)}%`
    );


    // ====================================
    // INTEGRITY ALERTS
    // ====================================

    const integrityAlerts =
        attempts.reduce(
            (
                total,
                attempt
            ) => {

                return total +
                    Number(
                        attempt.integrityWarnings ||
                        0
                    );

            },
            0
        );


    setStatValue(
        3,
        integrityAlerts > 0
            ? integrityAlerts
            : "—"
    );

}


// ========================================
// SET STAT VALUE
// ========================================

function setStatValue(
    index,
    value
) {

    const cards =
        document.querySelectorAll(
            ".stat-card"
        );


    if (
        !cards[index]
    ) {

        return;

    }


    const strong =
        cards[index].querySelector(
            "strong"
        );


    if (strong) {

        strong.textContent =
            value;

    }

}


// ========================================
// RENDER RESULTS TABLE
// ========================================

function renderResultsTable(
    attempts
) {

    const tableContainer =
        document.querySelector(
            ".table-container"
        );


    const message =
        document.querySelector(
            ".message"
        );


    const resultsCount =
        document.querySelector(
            ".card-header > span:last-child"
        );


    if (resultsCount) {

        const submittedCount =
            attempts.filter(
                attempt =>
                    String(
                        attempt.status || ""
                    ).toUpperCase() ===
                    "SUBMITTED"
            ).length;


        resultsCount.textContent =
            `${submittedCount} student${
                submittedCount === 1
                    ? ""
                    : "s"
            }`;

    }


    // ====================================
    // HIDE MESSAGE
    // ====================================

    if (message) {

        message.classList.add(
            "hidden"
        );

    }


    if (!tableContainer) {

        return;

    }


    // ====================================
    // SUBMITTED ATTEMPTS
    // ====================================

    const submitted =
        attempts.filter(
            attempt =>
                String(
                    attempt.status || ""
                ).toUpperCase() ===
                "SUBMITTED"
        );


    // ====================================
    // NO RESULTS
    // ====================================

    if (
        submitted.length === 0
    ) {

        tableContainer.innerHTML = `

            <div class="message">

                No students have submitted
                this examination yet.

            </div>

        `;


        return;

    }


    // ====================================
    // TABLE
    // ====================================

    tableContainer.innerHTML = `

        <table>

            <thead>

                <tr>

                    <th>
                        Student
                    </th>

                    <th>
                        Score
                    </th>

                    <th>
                        Percentage
                    </th>

                    <th>
                        Status
                    </th>

                    <th>
                        Integrity
                    </th>

                    <th>
                        Action
                    </th>

                </tr>

            </thead>


            <tbody id="resultsTableBody">

            </tbody>

        </table>

    `;


    const tbody =
        document.getElementById(
            "resultsTableBody"
        );


    submitted.forEach(
        attempt => {

            const row =
                document.createElement(
                    "tr"
                );


            const student =
                attempt.student || {};


            const studentName =
                student.name ||
                "Student";


            const studentEmail =
                student.email ||
                "—";


            const score =
                attempt.score ??
                0;


            const percentage =
                Number(
                    attempt.percentage ||
                    0
                );


            const integrity =
                Number(
                    attempt.integrityWarnings ||
                    0
                );


            const initials =
                getNameInitials(
                    studentName
                );


            row.innerHTML = `

                <td>

                    <div class="student-cell">

                        <span class="student-avatar">

                            ${escapeHTML(
                                initials
                            )}

                        </span>


                        <div>

                            <strong>

                                ${escapeHTML(
                                    studentName
                                )}

                            </strong>


                            <small>

                                ${escapeHTML(
                                    studentEmail
                                )}

                            </small>

                        </div>

                    </div>

                </td>


                <td>

                    ${score}

                </td>


                <td>

                    <span class="percentage">

                        ${Math.round(
                            percentage
                        )}%

                    </span>

                </td>


                <td>

                    <span
                        class="status-badge submitted"
                    >

                        Submitted

                    </span>

                </td>


                <td>

                    <span
                        class="status-badge ${
                            integrity > 0
                                ? "progress"
                                : "unknown"
                        }"
                    >

                        ${
                            integrity > 0
                                ? `${integrity} warning${
                                    integrity === 1
                                        ? ""
                                        : "s"
                                }`
                                : "None"
                        }

                    </span>

                </td>


                <td>

                    <button
                        class="view-button"
                        type="button"
                    >

                        View

                    </button>

                </td>

            `;


            // ====================================
            // VIEW BUTTON
            // ====================================

            const viewButton =
                row.querySelector(
                    ".view-button"
                );


            if (viewButton) {

                viewButton.addEventListener(
                    "click",
                    () => {

                        openAttemptDetails(
                            attempt
                        );

                    }
                );

            }


            tbody.appendChild(
                row
            );

        }
    );

}


// ========================================
// CLEAR RESULTS
// ========================================

function clearResults() {

    selectedExamAttempts =
        [];


    // ====================================
    // RESET STAT CARDS
    // ====================================

    setStatValue(
        0,
        "0"
    );


    setStatValue(
        1,
        "0%"
    );


    setStatValue(
        2,
        "0%"
    );


    setStatValue(
        3,
        "—"
    );


    // ====================================
    // RESULTS COUNT
    // ====================================

    const resultsCount =
        document.querySelector(
            ".card-header > span:last-child"
        );


    if (resultsCount) {

        resultsCount.textContent =
            "0 students";

    }


    // ====================================
    // TABLE CONTAINER
    // ====================================

    const tableContainer =
        document.querySelector(
            ".table-container"
        );


    if (tableContainer) {

        tableContainer.innerHTML =
            "";

    }


    // ====================================
    // MESSAGE
    // ====================================

    const message =
        document.querySelector(
            ".message"
        );


    if (message) {

        message.classList.remove(
            "hidden"
        );


        message.textContent =
            "Select an examination to view results.";

    }

}


// ========================================
// LOADING
// ========================================

function showLoading() {

    const tableContainer =
        document.querySelector(
            ".table-container"
        );


    if (tableContainer) {

        tableContainer.innerHTML = `

            <div class="message">

                Loading examination results...

            </div>

        `;

    }

}


// ========================================
// OPEN ATTEMPT DETAILS
// ========================================

function openAttemptDetails(
    attempt
) {

    if (!attempt) {

        return;

    }


    const student =
        attempt.student || {};


    const studentName =
        student.name ||
        "Student";


    const score =
        attempt.score ??
        0;


    const percentage =
        Number(
            attempt.percentage ||
            0
        );


    const correct =
        attempt.correctAnswers ??
        0;


    const wrong =
        attempt.wrongAnswers ??
        0;


    const unanswered =
        attempt.unanswered ??
        0;


    const tabSwitches =
        attempt.tabSwitches ??
        0;


    const fullscreenExits =
        attempt.fullscreenExits ??
        0;


    const copyAttempts =
        attempt.copyAttempts ??
        0;


    const integrityWarnings =
        attempt.integrityWarnings ??
        0;


    alert(

        `Student: ${studentName}

Score: ${score}

Percentage: ${Math.round(
            percentage
        )}%

Correct answers: ${correct}

Wrong answers: ${wrong}

Unanswered: ${unanswered}

Tab switches: ${tabSwitches}

Fullscreen exits: ${fullscreenExits}

Copy attempts: ${copyAttempts}

Integrity warnings: ${integrityWarnings}`

    );

}


// ========================================
// GET NAME INITIALS
// ========================================

function getNameInitials(
    name
) {

    if (!name) {

        return "F";

    }


    const words =
        String(
            name
        )
            .trim()
            .split(
                /\s+/
            );


    if (
        words.length === 1
    ) {

        return words[0]
            .substring(
                0,
                2
            )
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[1][0]
    ).toUpperCase();

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


// ========================================
// TOAST
// ========================================

function showToast(
    message
) {

    let toast =
        document.getElementById(
            "resultsToast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "resultsToast";


        toast.className =
            "toast";


        document.body.appendChild(
            toast
        );

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