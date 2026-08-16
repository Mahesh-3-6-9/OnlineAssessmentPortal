// ========================================
// SECUREASSESS
// TEACHER DASHBOARD
// FULL CONNECTED VERSION
// ========================================

const API_BASE = "http://localhost:8080";

let dashboardExams = [];
let allSubmittedAttempts = [];

let autoRefreshTimer = null;


// ========================================
// INITIALIZE
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setupUserProfile();

        setupNavigation();

        setupMobileMenu();

        setupNotifications();

        setupProfileModal();

        setupSettingsModal();

        setupLogout();

        setupButtons();

        loadSavedSettings();


        try {

            dashboardExams =
                await loadTeacherExams();

            await loadTeacherAnalytics(
                dashboardExams
            );

        }
        catch (error) {

            console.error(
                "Teacher dashboard error:",
                error
            );

            showDashboardError(
                error.message
            );

        }

        animateChart();

        console.log(
            "SecureAssess Teacher Dashboard loaded."
        );

    }
);


// ========================================
// USER PROFILE
// ========================================

function getCurrentUser() {

    try {

        const storedUser =
            sessionStorage.getItem(
                "currentUser"
            );

        if (storedUser) {

            return JSON.parse(
                storedUser
            );

        }

    }
    catch (error) {

        console.error(
            "Could not read currentUser:",
            error
        );

    }


    return null;

}


// ========================================
// SETUP USER PROFILE
// ========================================

function setupUserProfile() {

    const user =
        getCurrentUser();


    if (!user) {

        console.warn(
            "No currentUser found."
        );

        return;

    }


    const name =
        user.name ||
        user.fullName ||
        user.username ||
        "Teacher";


    const role =
        user.role ||
        "TEACHER";


    const email =
        user.email ||
        "Not available";


    const id =
        user.id ||
        localStorage.getItem(
            "teacherId"
        ) ||
        localStorage.getItem(
            "userId"
        ) ||
        "--";


    const firstLetter =
        name
            .trim()
            .charAt(0)
            .toUpperCase();


    setText(
        "sidebarTeacherName",
        name
    );


    setText(
        "topProfileName",
        name
    );


    setText(
        "welcomeTeacherName",
        `${name}.`
    );


    setText(
        "sidebarTeacherRole",
        formatRole(role)
    );


    setText(
        "topProfileRole",
        formatRole(role)
    );


    setText(
        "sidebarAvatar",
        firstLetter
    );


    setText(
        "topProfileAvatar",
        firstLetter
    );


    setText(
        "profileModalAvatar",
        firstLetter
    );


    setText(
        "profileModalName",
        name
    );


    setText(
        "profileModalRole",
        formatRole(role)
    );


    setText(
        "profileNameDetail",
        name
    );


    setText(
        "profileEmailDetail",
        email
    );


    setText(
        "profileIdDetail",
        id
    );


    setText(
        "profileRoleDetail",
        formatRole(role)
    );

}


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


                    // Dashboard

                    if (
                        section ===
                        "dashboard"
                    ) {

                        event.preventDefault();

                        setActiveNav(
                            item
                        );

                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });

                        return;

                    }


                    // Exams

                    if (
                        section ===
                        "exams"
                    ) {

                        event.preventDefault();

                        setActiveNav(
                            item
                        );

                        window.location.href =
                            "teacher-exams.html";

                        return;

                    }


                    // Question Bank

                    if (
                        section ===
                        "questions"
                    ) {

                        event.preventDefault();

                        setActiveNav(
                            item
                        );

                        window.location.href =
                            "question-bank.html";

                        return;

                    }


                    // Students

                    if (
                        section ===
                        "students"
                    ) {

                        event.preventDefault();

                        setActiveNav(
                            item
                        );

                        /*
                         * If you already have a students page,
                         * change this filename.
                         */

                        window.location.href =
                            "students.html";

                        return;

                    }


                    // Results

                    if (
                        section ===
                        "results"
                    ) {

                        event.preventDefault();

                        window.location.href =
                            "teacher-results.html";

                        return;

                    }


                    // Analytics

                    if (
                        section ===
                        "analytics"
                    ) {

                        event.preventDefault();

                        setActiveNav(
                            item
                        );

                        const performance =
                            document.getElementById(
                                "analyticsSection"
                            );


                        if (performance) {

                            performance.scrollIntoView({
                                behavior: "smooth",
                                block: "center"
                            });

                        }

                        return;

                    }


                    // Settings

                    if (
                        section ===
                        "settings"
                    ) {

                        event.preventDefault();

                        setActiveNav(
                            item
                        );

                        openModal(
                            "settingsModal"
                        );

                    }

                }
            );

        }

    );

}


// ========================================
// ACTIVE NAV
// ========================================

function setActiveNav(
    selected
) {

    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            nav => {

                nav.classList.remove(
                    "active"
                );

            }
        );


    if (selected) {

        selected.classList.add(
            "active"
        );

    }

}


// ========================================
// MOBILE MENU
// ========================================

function setupMobileMenu() {

    const menuButton =
        document.getElementById(
            "menuButton"
        );


    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (
        menuButton &&
        sidebar
    ) {

        menuButton.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle(
                    "open"
                );

            }
        );

    }

}


// ========================================
// CREATE / VIEW EXAMS
// ========================================

function setupButtons() {

    const createExamButton =
        document.getElementById(
            "createExamButton"
        );


    if (createExamButton) {

        createExamButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "create-exam.html";

            }
        );

    }


    const viewExamsButton =
        document.getElementById(
            "viewExamsButton"
        );


    if (viewExamsButton) {

        viewExamsButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                window.location.href =
                    "teacher-exams.html";

            }
        );

    }


    const viewAlertsButton =
        document.getElementById(
            "viewAlertsButton"
        );


    if (viewAlertsButton) {

        viewAlertsButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "teacher-results.html";

            }
        );

    }


    document
        .querySelectorAll(
            ".review-alert"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        window.location.href =
                            "teacher-results.html";

                    }
                );

            }
        );

}


// ========================================
// NOTIFICATIONS
// ========================================

function setupNotifications() {

    const button =
        document.getElementById(
            "notificationButton"
        );


    const panel =
        document.getElementById(
            "notificationPanel"
        );


    if (
        !button ||
        !panel
    ) {

        return;

    }


    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            panel.classList.toggle(
                "show"
            );

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !panel.contains(
                    event.target
                ) &&
                !button.contains(
                    event.target
                )
            ) {

                panel.classList.remove(
                    "show"
                );

            }

        }
    );

}


// ========================================
// PROFILE MODAL
// ========================================

function setupProfileModal() {

    const profileButton =
        document.getElementById(
            "profileButton"
        );


    const sidebarProfileButton =
        document.getElementById(
            "sidebarProfileButton"
        );


    const closeButton =
        document.getElementById(
            "closeProfileModal"
        );


    if (profileButton) {

        profileButton.addEventListener(
            "click",
            () => {

                setupUserProfile();

                openModal(
                    "profileModal"
                );

            }
        );

    }


    if (sidebarProfileButton) {

        sidebarProfileButton.addEventListener(
            "click",
            () => {

                setupUserProfile();

                openModal(
                    "profileModal"
                );

            }
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                closeModal(
                    "profileModal"
                );

            }
        );

    }

}


// ========================================
// SETTINGS
// ========================================

function setupSettingsModal() {

    const closeButton =
        document.getElementById(
            "closeSettingsModal"
        );


    const saveButton =
        document.getElementById(
            "saveSettingsButton"
        );


    const modal =
        document.getElementById(
            "settingsModal"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                closeModal(
                    "settingsModal"
                );

            }
        );

    }


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveSettings
        );

    }


    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modal
                ) {

                    closeModal(
                        "settingsModal"
                    );

                }

            }
        );

    }


    const profileModal =
        document.getElementById(
            "profileModal"
        );


    if (profileModal) {

        profileModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    profileModal
                ) {

                    closeModal(
                        "profileModal"
                    );

                }

            }
        );

    }

}


// ========================================
// SAVE SETTINGS
// ========================================

function saveSettings() {

    const notifications =
        document.getElementById(
            "notificationSetting"
        );


    const autoRefresh =
        document.getElementById(
            "autoRefreshSetting"
        );


    const settings = {

        notifications:
            notifications
                ? notifications.checked
                : true,

        autoRefresh:
            autoRefresh
                ? autoRefresh.checked
                : false

    };


    localStorage.setItem(
        "teacherSettings",
        JSON.stringify(
            settings
        )
    );


    closeModal(
        "settingsModal"
    );


    showToast(
        "Settings saved successfully."
    );


    setupAutoRefresh(
        settings.autoRefresh
    );

}


// ========================================
// LOAD SETTINGS
// ========================================

function loadSavedSettings() {

    let settings = {

        notifications: true,

        autoRefresh: false

    };


    try {

        const stored =
            localStorage.getItem(
                "teacherSettings"
            );


        if (stored) {

            settings =
                {
                    ...settings,
                    ...JSON.parse(
                        stored
                    )
                };

        }

    }
    catch (error) {

        console.error(
            "Settings error:",
            error
        );

    }


    const notificationSetting =
        document.getElementById(
            "notificationSetting"
        );


    const autoRefreshSetting =
        document.getElementById(
            "autoRefreshSetting"
        );


    if (notificationSetting) {

        notificationSetting.checked =
            settings.notifications;

    }


    if (autoRefreshSetting) {

        autoRefreshSetting.checked =
            settings.autoRefresh;

    }


    setupAutoRefresh(
        settings.autoRefresh
    );

}


// ========================================
// AUTO REFRESH
// ========================================

function setupAutoRefresh(
    enabled
) {

    if (autoRefreshTimer) {

        clearInterval(
            autoRefreshTimer
        );

        autoRefreshTimer = null;

    }


    if (!enabled) {

        return;

    }


    autoRefreshTimer =
        setInterval(
            async () => {

                try {

                    const exams =
                        await loadTeacherExams();

                    await loadTeacherAnalytics(
                        exams
                    );

                }
                catch (error) {

                    console.error(
                        "Auto refresh failed:",
                        error
                    );

                }

            },
            30000
        );

}


// ========================================
// MODAL HELPERS
// ========================================

function openModal(
    id
) {

    const modal =
        document.getElementById(
            id
        );


    if (modal) {

        modal.classList.add(
            "show"
        );

        document.body.classList.add(
            "modal-open"
        );

    }

}


function closeModal(
    id
) {

    const modal =
        document.getElementById(
            id
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    const anyOpenModal =
        document.querySelector(
            ".modal-overlay.show"
        );


    if (!anyOpenModal) {

        document.body.classList.remove(
            "modal-open"
        );

    }

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


            sessionStorage.removeItem(
                "currentUser"
            );


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
                "userRole"
            );


            window.location.href =
                "login.html";

        }
    );

}


// ========================================
// GET TEACHER ID
// ========================================

function getTeacherId() {

    const user =
        getCurrentUser();


    if (
        user &&
        user.id
    ) {

        return Number(
            user.id
        );

    }


    const teacherId =
        localStorage.getItem(
            "teacherId"
        )
        ||
        localStorage.getItem(
            "userId"
        );


    if (teacherId) {

        return Number(
            teacherId
        );

    }


    /*
     * Development fallback.
     * Remove after your backend login
     * is always storing teacherId.
     */

    return 2;

}


// ========================================
// LOAD TEACHER EXAMS
// ========================================

async function loadTeacherExams() {

    const teacherId =
        getTeacherId();


    console.log(
        "Loading exams for teacher:",
        teacherId
    );


    const response =
        await fetch(
            `${API_BASE}/api/exams/teacher/${teacherId}`
        );


    if (!response.ok) {

        const message =
            await response.text();


        throw new Error(
            `Server returned ${response.status}: ${message}`
        );

    }


    const exams =
        await response.json();


    dashboardExams =
        Array.isArray(
            exams
        )
            ? exams
            : [];


    updateStatistics(
        dashboardExams
    );


    renderExams(
        dashboardExams
    );


    return dashboardExams;

}


// ========================================
// UPDATE EXAM STATISTICS
// ========================================

function updateStatistics(
    exams
) {

    const total =
        exams.length;


    const published =
        exams.filter(
            exam =>
                exam.status ===
                "PUBLISHED"
        ).length;


    const drafts =
        exams.filter(
            exam =>
                exam.status ===
                "DRAFT"
        ).length;


    setText(
        "totalExamsStat",
        total
    );


    setText(
        "examBreakdownStat",
        `${published} published · ${drafts} drafts`
    );

}


// ========================================
// ANALYTICS
// ========================================

async function loadTeacherAnalytics(
    exams
) {

    const publishedExams =
        exams.filter(
            exam =>
                exam.status ===
                "PUBLISHED"
        );


    if (
        publishedExams.length ===
        0
    ) {

        allSubmittedAttempts = [];

        updateAnalyticsCards(
            0,
            0,
            0,
            0
        );


        renderPerformanceChart(
            []
        );


        renderIntegrityAlerts(
            []
        );


        return;

    }


    const attemptResponses =
        await Promise.all(
            publishedExams.map(
                async exam => {

                    try {

                        const response =
                            await fetch(
                                `${API_BASE}/api/attempts/exam/${exam.id}`
                            );


                        if (!response.ok) {

                            return {

                                exam,

                                attempts: []

                            };

                        }


                        const attempts =
                            await response.json();


                        return {

                            exam,

                            attempts:
                                Array.isArray(
                                    attempts
                                )
                                    ? attempts
                                    : []

                        };

                    }
                    catch (error) {

                        console.error(
                            "Attempt request failed:",
                            error
                        );


                        return {

                            exam,

                            attempts: []

                        };

                    }

                }
            )
        );


    const allAttempts =
        attemptResponses.flatMap(
            item =>
                item.attempts
        );


    const submittedAttempts =
        allAttempts.filter(
            attempt =>
                attempt.status ===
                "SUBMITTED"
        );


    allSubmittedAttempts =
        submittedAttempts;


    // ====================================
    // UNIQUE STUDENTS
    // ====================================

    const studentIds =
        new Set();


    submittedAttempts.forEach(
        attempt => {

            if (
                attempt.student &&
                attempt.student.id != null
            ) {

                studentIds.add(
                    attempt.student.id
                );

            }

        }
    );


    // ====================================
    // AVERAGE
    // ====================================

    const percentages =
        submittedAttempts
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


    let averageScore = 0;


    if (
        percentages.length > 0
    ) {

        averageScore =
            percentages.reduce(
                (
                    total,
                    value
                ) =>
                    total + value,
                0
            )
            /
            percentages.length;

    }


    // ====================================
    // TOTAL INTEGRITY WARNINGS
    // ====================================

    const integrityAlerts =
        submittedAttempts.reduce(
            (
                total,
                attempt
            ) => {

                return total +
                    Number(
                        attempt.integrityWarnings
                    ) || 0;

            },
            0
        );


    // ====================================
    // UPDATE
    // ====================================

    updateAnalyticsCards(
        studentIds.size,
        averageScore,
        integrityAlerts,
        submittedAttempts.length
    );


    // ====================================
    // PERFORMANCE DATA
    // ====================================

    const performanceData =
        attemptResponses.map(
            item => {

                const validAttempts =
                    item.attempts.filter(
                        attempt =>

                            attempt.status ===
                            "SUBMITTED"

                            &&

                            Number.isFinite(
                                Number(
                                    attempt.percentage
                                )
                            )
                    );


                let examAverage = 0;


                if (
                    validAttempts.length >
                    0
                ) {

                    examAverage =
                        validAttempts.reduce(
                            (
                                total,
                                attempt
                            ) =>
                                total +
                                Number(
                                    attempt.percentage
                                ),
                            0
                        )
                        /
                        validAttempts.length;

                }


                return {

                    title:
                        item.exam.title,

                    average:
                        examAverage,

                    attempts:
                        validAttempts.length

                };

            }
        );


    renderPerformanceChart(
        performanceData
    );


    renderIntegrityAlerts(
        submittedAttempts
    );

}


// ========================================
// ANALYTICS CARDS
// ========================================

function updateAnalyticsCards(
    studentsAssessed,
    averageScore,
    integrityAlerts,
    attempts
) {

    setText(
        "studentsAssessedStat",
        studentsAssessed
    );


    setText(
        "averageScoreStat",
        `${Math.round(
            averageScore
        )}%`
    );


    setText(
        "averageScoreTrend",
        "Based on submitted attempts"
    );


    setText(
        "integrityAlertsStat",
        String(
            integrityAlerts
        ).padStart(
            2,
            "0"
        )
    );


    setText(
        "analyticsAverage",
        `${Math.round(
            averageScore
        )}%`
    );


    setText(
        "analyticsStudents",
        studentsAssessed
    );


    setText(
        "analyticsAttempts",
        attempts || 0
    );


    setText(
        "integrityAlertCount",
        integrityAlerts
    );

}


// ========================================
// INTEGRITY ALERT LIST
// ========================================

function renderIntegrityAlerts(
    attempts
) {

    const alertList =
        document.getElementById(
            "alertList"
        );


    if (!alertList) {

        return;

    }


    const alerts = [];


    attempts.forEach(
        attempt => {

            const warnings =
                Number(
                    attempt.integrityWarnings
                ) || 0;


            const tabSwitches =
                Number(
                    attempt.tabSwitches
                ) || 0;


            const fullscreenExits =
                Number(
                    attempt.fullscreenExits
                ) || 0;


            const copyAttempts =
                Number(
                    attempt.copyAttempts
                ) || 0;


            if (
                warnings > 0 ||
                tabSwitches > 0 ||
                fullscreenExits > 0 ||
                copyAttempts > 0
            ) {

                const studentName =
                    attempt.student &&
                    attempt.student.name
                        ? attempt.student.name
                        : "Student";


                alerts.push({

                    student:
                        studentName,

                    warnings,

                    tabSwitches,

                    fullscreenExits,

                    copyAttempts

                });

            }

        }
    );


    if (
        alerts.length === 0
    ) {

        alertList.innerHTML = `

            <div class="no-alerts">

                <span class="success-icon">
                    ✓
                </span>

                <div>

                    <strong>
                        No integrity alerts
                    </strong>

                    <small>
                        No suspicious activity recorded.
                    </small>

                </div>

            </div>

        `;

        return;

    }


    alertList.innerHTML =
        "";


    alerts
        .slice(
            0,
            5
        )
        .forEach(
            alert => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "alert-row";


                const details = [];


                if (
                    alert.warnings > 0
                ) {

                    details.push(
                        `${alert.warnings} warning${alert.warnings > 1 ? "s" : ""}`
                    );

                }


                if (
                    alert.tabSwitches > 0
                ) {

                    details.push(
                        `${alert.tabSwitches} tab switch${alert.tabSwitches > 1 ? "es" : ""}`
                    );

                }


                if (
                    alert.fullscreenExits > 0
                ) {

                    details.push(
                        `${alert.fullscreenExits} fullscreen exit${alert.fullscreenExits > 1 ? "s" : ""}`
                    );

                }


                if (
                    alert.copyAttempts > 0
                ) {

                    details.push(
                        `${alert.copyAttempts} copy attempt${alert.copyAttempts > 1 ? "s" : ""}`
                    );

                }


                row.innerHTML = `

                    <span class="alert-indicator">
                        !
                    </span>

                    <div>

                        <strong>
                            ${escapeHTML(
                                alert.student
                            )}
                        </strong>

                        <small>
                            ${escapeHTML(
                                details.join(" · ")
                            )}
                        </small>

                    </div>

                    <button
                        class="review-alert"
                        type="button"
                    >
                        Review
                    </button>

                `;


                row
                    .querySelector(
                        ".review-alert"
                    )
                    .addEventListener(
                        "click",
                        () => {

                            window.location.href =
                                "teacher-results.html";

                        }
                    );


                alertList.appendChild(
                    row
                );

            }
        );

}


// ========================================
// PERFORMANCE CHART
// ========================================

function renderPerformanceChart(
    performanceData
) {

    const chart =
        document.getElementById(
            "performanceChartBars"
        );


    if (!chart) {

        return;

    }


    chart.innerHTML =
        "";


    if (
        performanceData.length ===
        0
    ) {

        chart.innerHTML = `

            <div class="no-chart-data">

                No submitted attempts yet.

            </div>

        `;


        setText(
            "performancePeriod",
            "No data"
        );


        return;

    }


    const visibleData =
        performanceData.slice(
            -5
        );


    visibleData.forEach(
        (
            item,
            index
        ) => {

            const column =
                document.createElement(
                    "div"
                );


            column.className =
                "chart-column";


            const bar =
                document.createElement(
                    "div"
                );


            bar.className =
                "chart-bar";


            if (
                index ===
                visibleData.length - 1
            ) {

                bar.classList.add(
                    "highlight"
                );

            }


            const average =
                Math.max(
                    0,
                    Math.min(
                        100,
                        Number(
                            item.average
                        ) || 0
                    )
                );


            bar.style.height =
                `${average}%`;


            const label =
                document.createElement(
                    "small"
                );


            label.textContent =
                getChartLabel(
                    item.title
                );


            column.appendChild(
                bar
            );


            column.appendChild(
                label
            );


            chart.appendChild(
                column
            );

        }
    );


    setText(
        "performancePeriod",
        "Submitted attempts"
    );


    animateChart();

}


// ========================================
// CHART LABEL
// ========================================

function getChartLabel(
    title
) {

    if (!title) {

        return "EXAM";

    }


    const words =
        title
            .trim()
            .split(
                /\s+/
            );


    if (
        words.length ===
        1
    ) {

        return words[0]
            .substring(
                0,
                5
            )
            .toUpperCase();

    }


    return words
        .slice(
            0,
            2
        )
        .map(
            word =>
                word
                    .substring(
                        0,
                        3
                    )
                    .toUpperCase()
        )
        .join(" ");

}


// ========================================
// RENDER EXAMS
// ========================================

function renderExams(
    exams
) {

    const examList =
        document.querySelector(
            ".exam-list"
        );


    if (!examList) {

        return;

    }


    examList.innerHTML =
        "";


    if (
        exams.length ===
        0
    ) {

        examList.innerHTML = `

            <div class="empty-exams">

                <p>
                    No examinations created yet.
                </p>

                <button
                    class="create-button"
                    id="emptyCreateExamButton"
                >
                    + Create examination
                </button>

            </div>

        `;


        document
            .getElementById(
                "emptyCreateExamButton"
            )
            ?.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "create-exam.html";

                }
            );


        return;

    }


    exams.forEach(
        exam => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "exam-row";


            const initials =
                getInitials(
                    exam.title
                );


            const status =
                exam.status ||
                "DRAFT";


            const statusClass =
                status.toLowerCase();


            row.innerHTML = `

                <div class="exam-icon">

                    ${escapeHTML(
                        initials
                    )}

                </div>


                <div class="exam-info">

                    <strong>
                        ${escapeHTML(
                            exam.title
                        )}
                    </strong>

                    <small>

                        ${exam.totalQuestions || 0}
                        questions

                        ·

                        ${exam.durationMinutes || 0}
                        min

                    </small>

                </div>


                <div class="exam-date">

                    <strong>
                        ${formatDate(
                            exam.createdAt
                        )}
                    </strong>

                    <small>
                        Created
                    </small>

                </div>


                <span
                    class="status ${statusClass}"
                >
                    ${formatStatus(
                        status
                    )}
                </span>

            `;


            examList.appendChild(
                row
            );

        }
    );

}


// ========================================
// INITIALS
// ========================================

function getInitials(
    title
) {

    if (!title) {

        return "EX";

    }


    const words =
        title
            .trim()
            .split(
                /\s+/
            );


    if (
        words.length ===
        1
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
// STATUS
// ========================================

function formatStatus(
    status
) {

    switch (status) {

        case "PUBLISHED":
            return "Published";

        case "DRAFT":
            return "Draft";

        case "CLOSED":
            return "Closed";

        default:
            return status;

    }

}


// ========================================
// DATE
// ========================================

function formatDate(
    value
) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric"
        }
    );

}


// ========================================
// ROLE
// ========================================

function formatRole(
    role
) {

    if (!role) {

        return "Faculty";

    }


    if (
        role === "TEACHER"
    ) {

        return "Faculty";

    }


    return role;

}


// ========================================
// TEXT HELPER
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
// ERROR
// ========================================

function showDashboardError(
    message
) {

    const examList =
        document.querySelector(
            ".exam-list"
        );


    if (!examList) {

        return;

    }


    examList.innerHTML = `

        <div class="empty-exams">

            <strong>
                Unable to load examinations
            </strong>

            <p>
                ${escapeHTML(
                    message
                )}
            </p>

            <button
                class="create-button"
                id="retryDashboardButton"
            >
                Retry
            </button>

        </div>

    `;


    document
        .getElementById(
            "retryDashboardButton"
        )
        ?.addEventListener(
            "click",
            async () => {

                try {

                    const exams =
                        await loadTeacherExams();

                    await loadTeacherAnalytics(
                        exams
                    );

                }
                catch (error) {

                    showDashboardError(
                        error.message
                    );

                }

            }
        );

}


// ========================================
// CHART ANIMATION
// ========================================

function animateChart() {

    const bars =
        document.querySelectorAll(
            ".chart-bar"
        );


    bars.forEach(
        (
            bar,
            index
        ) => {

            const height =
                bar.style.height;


            if (!height) {

                return;

            }


            bar.style.height =
                "0";


            setTimeout(
                () => {

                    bar.style.height =
                        height;

                },
                100 +
                index * 100
            );

        }
    );

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