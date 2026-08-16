// ========================================
// SECUREASSESS
// STUDENT DASHBOARD
// COMPLETE BACKEND CONNECTED VERSION
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // ========================================
        // CONFIGURATION
        // ========================================

        const API_BASE_URL =
            "http://localhost:8080/api";


        // ========================================
        // STATE
        // ========================================

        let publishedExams = [];

        let studentAttempts = [];

        let currentUser =
            getCurrentUser();


        // ========================================
        // ELEMENTS
        // ========================================

        const sidebar =
            document.getElementById(
                "sidebar"
            );

        const menuButton =
            document.getElementById(
                "menuButton"
            );

        const logoutButton =
            document.getElementById(
                "logoutButton"
            );

        const notificationButton =
            document.getElementById(
                "notificationButton"
            );

        const notificationPanel =
            document.getElementById(
                "notificationPanel"
            );

        const closeNotifications =
            document.getElementById(
                "closeNotifications"
            );

        const navItems =
            document.querySelectorAll(
                ".nav-item"
            );

        const currentDate =
            document.getElementById(
                "currentDate"
            );

        const currentYear =
            document.getElementById(
                "currentYear"
            );


        // ========================================
        // INITIALIZE
        // ========================================

        updateDate();

        setupSidebar();

        setupNavigation();

        setupNotifications();

        setupLogout();

        setupProfile();

        setupResults();

        setupSettings();

        setupPeriodButton();

        loadPublishedExams();

        loadStudentAttempts();

        renderProfile();


        console.log(
            "SecureAssess Student Dashboard loaded."
        );


        // ========================================
        // DATE
        // ========================================

        function updateDate() {

            const now =
                new Date();


            if (currentDate) {

                currentDate.textContent =
                    now.toLocaleDateString(
                        "en-US",
                        {
                            weekday: "long",
                            month: "long",
                            day: "numeric"
                        }
                    );

            }


            if (currentYear) {

                currentYear.textContent =
                    now.getFullYear();

            }

        }


        // ========================================
        // SIDEBAR
        // ========================================

        function setupSidebar() {

            if (
                !menuButton ||
                !sidebar
            ) {

                return;

            }


            menuButton.addEventListener(
                "click",
                () => {

                    sidebar.classList.toggle(
                        "open"
                    );

                }
            );

        }


        // ========================================
        // NAVIGATION
        // ========================================

        function setupNavigation() {

            navItems.forEach(
                item => {

                    item.addEventListener(
                        "click",
                        event => {

                            event.preventDefault();


                            const section =
                                item.dataset.section;


                            navItems.forEach(
                                nav => {

                                    nav.classList.remove(
                                        "active"
                                    );

                                }
                            );


                            item.classList.add(
                                "active"
                            );


                            if (
                                section ===
                                "dashboard"
                            ) {

                                window.scrollTo({
                                    top: 0,
                                    behavior:
                                        "smooth"
                                });

                            }


                            if (
                                section ===
                                "exams"
                            ) {

                                scrollToElement(
                                    "upcomingCard"
                                );

                            }


                            if (
                                section ===
                                "results"
                            ) {

                                openResultsModal();

                            }


                            if (
                                section ===
                                "performance"
                            ) {

                                scrollToElement(
                                    "performanceCard"
                                );

                            }


                            if (
                                section ===
                                "profile"
                            ) {

                                openProfileModal();

                            }


                            if (
                                section ===
                                "settings"
                            ) {

                                openSettingsModal();

                            }


                            if (
                                window.innerWidth <=
                                850
                            ) {

                                sidebar.classList.remove(
                                    "open"
                                );

                            }

                        }
                    );

                }
            );

        }


        // ========================================
        // LOAD PUBLISHED EXAMS
        // ========================================

        async function loadPublishedExams() {

            const container =
                document.getElementById(
                    "examList"
                );


            if (!container) {

                return;

            }


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/exams/published`
                    );


                if (!response.ok) {

                    throw new Error(
                        `HTTP ${response.status}`
                    );

                }


                const data =
                    await response.json();


                publishedExams =
                    Array.isArray(data)
                        ? data
                        : [];


                renderExams();


                updatePendingCount();


            } catch (error) {

                console.error(
                    "Unable to load exams:",
                    error
                );


                container.innerHTML = `

                    <div
                        class="dashboard-loading"
                    >

                        Unable to load examinations.

                        <br>

                        <button
                            class="start-button"
                            id="retryExams"
                            type="button"
                            style="margin-top:12px"
                        >
                            Retry
                        </button>

                    </div>

                `;


                const retry =
                    document.getElementById(
                        "retryExams"
                    );


                if (retry) {

                    retry.addEventListener(
                        "click",
                        loadPublishedExams
                    );

                }

            }

        }


        // ========================================
        // RENDER EXAMS
        // ========================================

        function renderExams() {

            const container =
                document.getElementById(
                    "examList"
                );


            if (!container) {

                return;

            }


            container.innerHTML =
                "";


            if (
                publishedExams.length === 0
            ) {

                container.innerHTML = `

                    <div
                        class="dashboard-loading"
                    >

                        No published examinations
                        are currently available.

                    </div>

                `;

                return;

            }


            publishedExams
                .slice(0, 6)
                .forEach(
                    (exam, index) => {

                        container.appendChild(
                            createExamCard(
                                exam,
                                index
                            )
                        );

                    }
                );

        }


        // ========================================
        // CREATE EXAM CARD
        // ========================================

        function createExamCard(
            exam,
            index
        ) {

            const article =
                document.createElement(
                    "article"
                );


            article.className =
                "exam-card";


            const title =
                exam.title ||
                "Untitled examination";


            const description =
                exam.description ||
                exam.subject ||
                "Assessment";


            const duration =
                Number(
                    exam.durationMinutes || 0
                );


            const totalQuestions =
                Number(
                    exam.totalQuestions || 0
                );


            const totalMarks =
                Number(
                    exam.totalMarks ||
                    exam.maxMarks ||
                    0
                );


            article.innerHTML = `

                <div class="exam-icon">

                    ${escapeHTML(
                        getInitials(title)
                    )}

                </div>


                <div class="exam-details">

                    <h3>
                        ${escapeHTML(title)}
                    </h3>

                    <p>
                        ${escapeHTML(description)}
                    </p>


                    <div class="exam-meta">

                        <span>
                            ◷ ${duration} min
                        </span>

                        <span>
                            ▣ ${totalQuestions} questions
                        </span>

                        <span>
                            ◇ ${totalMarks} marks
                        </span>

                    </div>

                </div>


                <div class="exam-action">

                    <span class="exam-date">
                        ${formatExamDate(
                            exam.date ||
                            exam.startDate ||
                            exam.createdAt
                        )}
                    </span>


                    <button
                        class="start-button ${
                            index > 0
                                ? "secondary"
                                : ""
                        }"
                        type="button"
                    >
                        Start exam
                    </button>

                </div>

            `;


            const button =
                article.querySelector(
                    ".start-button"
                );


            button.addEventListener(
                "click",
                () => {

                    startExam(
                        exam
                    );

                }
            );


            return article;

        }


        // ========================================
        // START EXAM
        // ========================================

        function startExam(
            exam
        ) {

            if (
                !exam ||
                !exam.id
            ) {

                alert(
                    "Invalid examination."
                );

                return;

            }


            localStorage.setItem(
                "currentExamId",
                String(
                    exam.id
                )
            );


            localStorage.setItem(
                "currentExam",
                JSON.stringify(
                    exam
                )
            );


            window.location.href =
                `exam.html?examId=${exam.id}`;

        }


        // ========================================
        // LOAD STUDENT ATTEMPTS
        // ========================================

        async function loadStudentAttempts() {

            const studentId =
                getStudentId();


            if (!studentId) {

                console.warn(
                    "Student ID not found."
                );


                showDashboardMessage(
                    "Student session was not found. Please login again."
                );


                return;

            }


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/attempts/student/${studentId}`
                    );


                if (!response.ok) {

                    throw new Error(
                        `HTTP ${response.status}`
                    );

                }


                const data =
                    await response.json();


                studentAttempts =
                    Array.isArray(data)
                        ? data
                        : [];


                studentAttempts.sort(
                    (
                        a,
                        b
                    ) =>
                        getTime(
                            b.submittedAt ||
                            b.startedAt
                        ) -
                        getTime(
                            a.submittedAt ||
                            a.startedAt
                        )
                );


                updateDashboardStats();

                renderRecentResults();

                renderPerformance();

                renderProfile();

                updatePendingCount();

            } catch (error) {

                console.error(
                    "Unable to load student attempts:",
                    error
                );


                renderRecentResults();

                renderPerformance();

            }

        }


        // ========================================
        // DASHBOARD STATISTICS
        // ========================================

        function updateDashboardStats() {

            const submitted =
                getSubmittedAttempts();


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


            const completed =
                submitted.length;


            const average =
                percentages.length
                    ? percentages.reduce(
                        (
                            sum,
                            value
                        ) =>
                            sum + value,
                        0
                    ) /
                    percentages.length
                    : 0;


            const best =
                percentages.length
                    ? Math.max(
                        ...percentages
                    )
                    : 0;


            setText(
                "completedExamsValue",
                completed
            );


            setText(
                "averageScoreValue",
                `${Math.round(
                    average
                )}%`
            );


            setText(
                "performanceAverage",
                `${Math.round(
                    average
                )}%`
            );


            setText(
                "performanceBest",
                `${Math.round(
                    best
                )}%`
            );


            if (percentages.length) {

                setText(
                    "averageScoreDescription",
                    "Based on completed exams"
                );

            } else {

                setText(
                    "averageScoreDescription",
                    "No completed exams yet"
                );

            }


            updateIntegrityScore();

        }


        // ========================================
        // PENDING COUNT
        // ========================================

        function updatePendingCount() {

            const submittedExamIds =
                new Set(
                    studentAttempts
                        .filter(
                            attempt =>
                                String(
                                    attempt.status ||
                                    ""
                                ).toUpperCase() ===
                                "SUBMITTED"
                        )
                        .map(
                            attempt =>
                                String(
                                    attempt.exam?.id
                                )
                        )
                );


            const pending =
                publishedExams.filter(
                    exam =>
                        !submittedExamIds.has(
                            String(
                                exam.id
                            )
                        )
                ).length;


            setText(
                "pendingExamsValue",
                pending
            );

        }


        // ========================================
        // RECENT RESULTS
        // ========================================

        function renderRecentResults() {

            const table =
                document.getElementById(
                    "recentResultsTable"
                );


            if (!table) {

                return;

            }


            const header =
                table.querySelector(
                    ".table-header"
                );


            table.innerHTML =
                "";


            if (header) {

                table.appendChild(
                    header
                );

            }


            const submitted =
                getSubmittedAttempts()
                    .slice(
                        0,
                        5
                    );


            if (
                submitted.length === 0
            ) {

                const empty =
                    document.createElement(
                        "div"
                    );


                empty.className =
                    "dashboard-loading";


                empty.textContent =
                    "No examination results yet.";


                table.appendChild(
                    empty
                );


                return;

            }


            submitted.forEach(
                attempt => {

                    const row =
                        document.createElement(
                            "div"
                        );


                    row.className =
                        "result-row";


                    const exam =
                        attempt.exam || {};


                    const title =
                        exam.title ||
                        "Examination";


                    const percentage =
                        Number(
                            attempt.percentage ||
                            0
                        );


                    const resultClass =
                        getResultClass(
                            percentage
                        );


                    row.innerHTML = `

                        <div class="assessment-name">

                            <span class="result-icon">

                                ${escapeHTML(
                                    getInitials(
                                        title
                                    )
                                )}

                            </span>


                            <div>

                                <strong>
                                    ${escapeHTML(
                                        title
                                    )}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        exam.subject ||
                                        "Assessment"
                                    )}
                                </small>

                            </div>

                        </div>


                        <span class="result-date">

                            ${formatResultDate(
                                attempt.submittedAt
                            )}

                        </span>


                        <strong class="result-score">

                            ${Math.round(
                                percentage
                            )}%

                        </strong>


                        <span
                            class="result-status ${resultClass}"
                        >

                            ${getResultLabel(
                                percentage
                            )}

                        </span>


                        <button
                            class="more-button"
                            type="button"
                            title="View result"
                        >
                            →
                        </button>

                    `;


                    const button =
                        row.querySelector(
                            ".more-button"
                        );


                    if (button) {

                        button.addEventListener(
                            "click",
                            () => {

                                if (
                                    attempt.id
                                ) {

                                    window.location.href =
                                        `result.html?attemptId=${attempt.id}`;

                                }

                            }
                        );

                    }


                    table.appendChild(
                        row
                    );

                }
            );

        }


        // ========================================
        // PERFORMANCE
        // ========================================

        function renderPerformance() {

            const bars =
                document.getElementById(
                    "performanceBars"
                );


            if (!bars) {

                return;

            }


            const submitted =
                getSubmittedAttempts()
                    .sort(
                        (
                            a,
                            b
                        ) =>
                            getTime(
                                a.submittedAt
                            ) -
                            getTime(
                                b.submittedAt
                            )
                    )
                    .slice(
                        -6
                    );


            bars.innerHTML =
                "";


            if (
                submitted.length === 0
            ) {

                for (
                    let i = 0;
                    i < 6;
                    i++
                ) {

                    const wrapper =
                        document.createElement(
                            "div"
                        );


                    wrapper.className =
                        "bar-wrapper";


                    wrapper.innerHTML = `

                        <div
                            class="performance-bar"
                            style="height:0%"
                        ></div>

                        <span>
                            —
                        </span>

                    `;


                    bars.appendChild(
                        wrapper
                    );

                }


                setText(
                    "performanceImprovement",
                    "—"
                );


                return;

            }


            submitted.forEach(
                (
                    attempt,
                    index
                ) => {

                    const percentage =
                        Math.max(
                            0,
                            Math.min(
                                100,
                                Number(
                                    attempt.percentage ||
                                    0
                                )
                            )
                        );


                    const title =
                        attempt.exam?.title ||
                        "Exam";


                    const wrapper =
                        document.createElement(
                            "div"
                        );


                    wrapper.className =
                        "bar-wrapper";


                    wrapper.innerHTML = `

                        <div
                            class="performance-bar ${
                                index ===
                                submitted.length - 1
                                    ? "highlight"
                                    : ""
                            }"
                            style="height:${percentage}%"
                            title="${escapeHTML(
                                title
                            )}: ${Math.round(
                                percentage
                            )}%"
                        ></div>

                        <span>
                            ${escapeHTML(
                                getShortLabel(
                                    title
                                )
                            )}
                        </span>

                    `;


                    bars.appendChild(
                        wrapper
                    );

                }
            );


            const percentages =
                submitted.map(
                    attempt =>
                        Number(
                            attempt.percentage ||
                            0
                        )
                );


            const average =
                percentages.reduce(
                    (
                        sum,
                        value
                    ) =>
                        sum + value,
                    0
                ) /
                percentages.length;


            const best =
                Math.max(
                    ...percentages
                );


            setText(
                "performanceAverage",
                `${Math.round(
                    average
                )}%`
            );


            setText(
                "performanceBest",
                `${Math.round(
                    best
                )}%`
            );


            if (
                percentages.length >= 2
            ) {

                const previous =
                    percentages[
                        percentages.length - 2
                    ];


                const latest =
                    percentages[
                        percentages.length - 1
                    ];


                const difference =
                    latest -
                    previous;


                setText(
                    "performanceImprovement",
                    `${
                        difference >= 0
                            ? "+"
                            : ""
                    }${Math.round(
                        difference
                    )}%`
                );

            } else {

                setText(
                    "performanceImprovement",
                    "—"
                );

            }


            animatePerformanceBars();

        }


        // ========================================
        // INTEGRITY SCORE
        // ========================================

        function updateIntegrityScore() {

            const submitted =
                getSubmittedAttempts();


            if (
                submitted.length === 0
            ) {

                setText(
                    "integrityScoreValue",
                    "100%"
                );


                setText(
                    "integrityDescription",
                    "Excellent"
                );


                return;

            }


            const scores =
                submitted.map(
                    attempt =>
                        calculateIntegrityScore(
                            attempt
                        )
                );


            const average =
                scores.reduce(
                    (
                        sum,
                        value
                    ) =>
                        sum + value,
                    0
                ) /
                scores.length;


            setText(
                "integrityScoreValue",
                `${Math.round(
                    average
                )}%`
            );


            setText(
                "integrityDescription",
                getIntegrityLabel(
                    average
                )
            );

        }


        // ========================================
        // PROFILE
        // ========================================

        function setupProfile() {

            const profileButton =
                document.getElementById(
                    "profileButton"
                );


            if (profileButton) {

                profileButton.addEventListener(
                    "click",
                    openProfileModal
                );

            }


            const closeButton =
                document.getElementById(
                    "closeProfileModal"
                );


            if (closeButton) {

                closeButton.addEventListener(
                    "click",
                    closeProfileModal
                );

            }


            const settingsButton =
                document.getElementById(
                    "profileSettingsButton"
                );


            if (settingsButton) {

                settingsButton.addEventListener(
                    "click",
                    () => {

                        closeProfileModal();

                        openSettingsModal();

                    }
                );

            }


            const modal =
                document.getElementById(
                    "profileModal"
                );


            if (modal) {

                modal.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            modal
                        ) {

                            closeProfileModal();

                        }

                    }
                );

            }

        }


        function renderProfile() {

            currentUser =
                getCurrentUser();


            const name =
                currentUser?.name ||
                localStorage.getItem(
                    "userName"
                ) ||
                "Student";


            const email =
                currentUser?.email ||
                localStorage.getItem(
                    "userEmail"
                ) ||
                "—";


            const id =
                currentUser?.id ||
                getStudentId() ||
                "—";


            const initials =
                getInitials(
                    name
                );


            setText(
                "profileModalName",
                name
            );


            setText(
                "profileModalEmail",
                email
            );


            setText(
                "profileModalId",
                id
            );


            setText(
                "profileModalRole",
                "Student"
            );


            setText(
                "profileModalAvatar",
                initials
            );


            setText(
                "topAvatar",
                initials
            );


            setText(
                "topProfileName",
                name
            );


            setText(
                "welcomeName",
                `${name}.`
            );

        }


        function openProfileModal() {

            renderProfile();


            const modal =
                document.getElementById(
                    "profileModal"
                );


            if (modal) {

                modal.classList.add(
                    "show"
                );


                modal.setAttribute(
                    "aria-hidden",
                    "false"
                );

            }

        }


        function closeProfileModal() {

            const modal =
                document.getElementById(
                    "profileModal"
                );


            if (modal) {

                modal.classList.remove(
                    "show"
                );


                modal.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }

        }


        // ========================================
        // RESULTS
        // ========================================

        function setupResults() {

            const resultsLink =
                document.getElementById(
                    "viewAllResultsLink"
                );


            if (resultsLink) {

                resultsLink.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        openResultsModal();

                    }
                );

            }


            const closeButton =
                document.getElementById(
                    "closeResultsModal"
                );


            if (closeButton) {

                closeButton.addEventListener(
                    "click",
                    closeResultsModal
                );

            }


            const modal =
                document.getElementById(
                    "resultsModal"
                );


            if (modal) {

                modal.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            modal
                        ) {

                            closeResultsModal();

                        }

                    }
                );

            }

        }


        function openResultsModal() {

            renderAllResults();


            const modal =
                document.getElementById(
                    "resultsModal"
                );


            if (modal) {

                modal.classList.add(
                    "show"
                );


                modal.setAttribute(
                    "aria-hidden",
                    "false"
                );

            }

        }


        function closeResultsModal() {

            const modal =
                document.getElementById(
                    "resultsModal"
                );


            if (modal) {

                modal.classList.remove(
                    "show"
                );


                modal.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }

        }


        function renderAllResults() {

            const container =
                document.getElementById(
                    "allResultsContainer"
                );


            const summary =
                document.getElementById(
                    "resultsModalSummary"
                );


            if (!container) {

                return;

            }


            const submitted =
                getSubmittedAttempts();


            container.innerHTML =
                "";


            if (summary) {

                summary.textContent =
                    `${submitted.length} completed examination${
                        submitted.length === 1
                            ? ""
                            : "s"
                    }.`;

            }


            if (
                submitted.length === 0
            ) {

                container.innerHTML = `

                    <div class="dashboard-loading">
                        No results are available yet.
                    </div>

                `;


                return;

            }


            submitted.forEach(
                attempt => {

                    const title =
                        attempt.exam?.title ||
                        "Examination";


                    const percentage =
                        Number(
                            attempt.percentage ||
                            0
                        );


                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "all-result-item";


                    item.innerHTML = `

                        <div>

                            <div class="all-result-title">

                                ${escapeHTML(
                                    title
                                )}

                            </div>

                            <span class="all-result-date">

                                ${formatResultDate(
                                    attempt.submittedAt
                                )}

                            </span>

                        </div>


                        <div class="all-result-score">

                            ${Math.round(
                                percentage
                            )}%

                        </div>


                        <button
                            class="all-result-button"
                            type="button"
                        >
                            →
                        </button>

                    `;


                    const button =
                        item.querySelector(
                            ".all-result-button"
                        );


                    button.addEventListener(
                        "click",
                        () => {

                            window.location.href =
                                `result.html?attemptId=${attempt.id}`;

                        }
                    );


                    container.appendChild(
                        item
                    );

                }
            );

        }


        // ========================================
        // SETTINGS
        // ========================================

        function setupSettings() {

            const closeButton =
                document.getElementById(
                    "closeSettingsModal"
                );


            if (closeButton) {

                closeButton.addEventListener(
                    "click",
                    closeSettingsModal
                );

            }


            const modal =
                document.getElementById(
                    "settingsModal"
                );


            if (modal) {

                modal.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            modal
                        ) {

                            closeSettingsModal();

                        }

                    }
                );

            }


            const saveButton =
                document.getElementById(
                    "saveSettingsButton"
                );


            if (saveButton) {

                saveButton.addEventListener(
                    "click",
                    saveSettings
                );

            }


            loadSettings();

        }


        function openSettingsModal() {

            loadSettings();


            const modal =
                document.getElementById(
                    "settingsModal"
                );


            if (modal) {

                modal.classList.add(
                    "show"
                );


                modal.setAttribute(
                    "aria-hidden",
                    "false"
                );

            }

        }


        function closeSettingsModal() {

            const modal =
                document.getElementById(
                    "settingsModal"
                );


            if (modal) {

                modal.classList.remove(
                    "show"
                );


                modal.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }

        }


        function loadSettings() {

            const notifications =
                localStorage.getItem(
                    "studentNotifications"
                );


            const reminders =
                localStorage.getItem(
                    "studentExamReminders"
                );


            const notificationCheckbox =
                document.getElementById(
                    "notificationSetting"
                );


            const reminderCheckbox =
                document.getElementById(
                    "examReminderSetting"
                );


            if (
                notificationCheckbox
            ) {

                notificationCheckbox.checked =
                    notifications !==
                    "false";

            }


            if (
                reminderCheckbox
            ) {

                reminderCheckbox.checked =
                    reminders !==
                    "false";

            }

        }


        function saveSettings() {

            const notificationCheckbox =
                document.getElementById(
                    "notificationSetting"
                );


            const reminderCheckbox =
                document.getElementById(
                    "examReminderSetting"
                );


            localStorage.setItem(
                "studentNotifications",
                String(
                    notificationCheckbox.checked
                )
            );


            localStorage.setItem(
                "studentExamReminders",
                String(
                    reminderCheckbox.checked
                )
            );


            closeSettingsModal();


            alert(
                "Settings saved successfully."
            );

        }


        // ========================================
        // NOTIFICATIONS
        // ========================================

        function setupNotifications() {

            if (
                !notificationButton ||
                !notificationPanel
            ) {

                return;

            }


            notificationButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    notificationPanel.classList.toggle(
                        "show"
                    );

                }
            );


            if (closeNotifications) {

                closeNotifications.addEventListener(
                    "click",
                    () => {

                        notificationPanel.classList.remove(
                            "show"
                        );

                    }
                );

            }


            document.addEventListener(
                "click",
                event => {

                    if (
                        notificationPanel.classList.contains(
                            "show"
                        ) &&
                        !notificationPanel.contains(
                            event.target
                        ) &&
                        !notificationButton.contains(
                            event.target
                        )
                    ) {

                        notificationPanel.classList.remove(
                            "show"
                        );

                    }

                }
            );

        }


        // ========================================
        // LOGOUT
        // ========================================

        function setupLogout() {

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
                        "userRole"
                    );


                    localStorage.removeItem(
                        "userName"
                    );


                    localStorage.removeItem(
                        "userEmail"
                    );


                    localStorage.removeItem(
                        "studentId"
                    );


                    localStorage.removeItem(
                        "currentExamId"
                    );


                    localStorage.removeItem(
                        "currentExam"
                    );


                    window.location.href =
                        "login.html";

                }
            );

        }


        // ========================================
        // PERIOD BUTTON
        // ========================================

        function setupPeriodButton() {

            const button =
                document.getElementById(
                    "periodButton"
                );


            if (!button) {

                return;

            }


            button.addEventListener(
                "click",
                () => {

                    const submitted =
                        getSubmittedAttempts();


                    const count =
                        Math.min(
                            6,
                            submitted.length
                        );


                    button.textContent =
                        `${count || 0} exams`;

                }
            );

        }


        // ========================================
        // SCROLL
        // ========================================

        function scrollToElement(
            id
        ) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }

        }


        // ========================================
        // HELPERS
        // ========================================

        function getCurrentUser() {

            try {

                const stored =
                    sessionStorage.getItem(
                        "currentUser"
                    );


                if (stored) {

                    return JSON.parse(
                        stored
                    );

                }

            } catch (error) {

                console.error(
                    "Unable to read user session:",
                    error
                );

            }


            return {

                id:
                    localStorage.getItem(
                        "studentId"
                    ),

                name:
                    localStorage.getItem(
                        "userName"
                    ) ||
                    "Student",

                email:
                    localStorage.getItem(
                        "userEmail"
                    ) ||
                    "",

                role:
                    "STUDENT"

            };

        }


        function getStudentId() {

            const user =
                currentUser;


            return Number(
                user?.id ||
                localStorage.getItem(
                    "studentId"
                )
            ) || null;

        }


        function getSubmittedAttempts() {

            return studentAttempts
                .filter(
                    attempt =>
                        String(
                            attempt.status ||
                            ""
                        ).toUpperCase() ===
                        "SUBMITTED"
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        getTime(
                            b.submittedAt
                        ) -
                        getTime(
                            a.submittedAt
                        )
                );

        }


        function calculateIntegrityScore(
            attempt
        ) {

            let score =
                100;


            score -=
                Number(
                    attempt.tabSwitches ||
                    0
                ) * 10;


            score -=
                Number(
                    attempt.fullscreenExits ||
                    0
                ) * 10;


            score -=
                Number(
                    attempt.copyAttempts ||
                    0
                ) * 5;


            score -=
                Number(
                    attempt.integrityWarnings ||
                    0
                ) * 10;


            return Math.max(
                0,
                score
            );

        }


        function getIntegrityLabel(
            score
        ) {

            if (
                score >= 90
            ) {

                return "Excellent";

            }


            if (
                score >= 70
            ) {

                return "Good";

            }


            return "Needs attention";

        }


        function getResultClass(
            percentage
        ) {

            if (
                percentage >= 85
            ) {

                return "excellent";

            }


            if (
                percentage >= 70
            ) {

                return "good";

            }


            return "average";

        }


        function getResultLabel(
            percentage
        ) {

            if (
                percentage >= 85
            ) {

                return "Excellent";

            }


            if (
                percentage >= 70
            ) {

                return "Good";

            }


            return "Average";

        }


        function getInitials(
            text
        ) {

            if (!text) {

                return "S";

            }


            const words =
                text
                    .trim()
                    .split(
                        /\s+/
                    )
                    .filter(
                        Boolean
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


        function getShortLabel(
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
                    )
                    .filter(
                        Boolean
                    );


            if (
                words.length === 1
            ) {

                return words[0]
                    .substring(
                        0,
                        4
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
                        word[0]
                )
                .join("")
                .toUpperCase();

        }


        function formatExamDate(
            date
        ) {

            if (!date) {

                return "Available";

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

                return "Available";

            }


            return parsed.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short"
                }
            );

        }


        function formatResultDate(
            date
        ) {

            if (!date) {

                return "Date unavailable";

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

                return "Date unavailable";

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


        function getTime(
            date
        ) {

            if (!date) {

                return 0;

            }


            const time =
                new Date(
                    date
                ).getTime();


            return Number.isNaN(
                time
            )
                ? 0
                : time;

        }


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


        function animatePerformanceBars() {

            const bars =
                document.querySelectorAll(
                    ".performance-bar"
                );


            bars.forEach(
                (
                    bar,
                    index
                ) => {

                    const height =
                        bar.style.height;


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


        function showDashboardMessage(
            message
        ) {

            alert(
                message
            );

        }

    }
);