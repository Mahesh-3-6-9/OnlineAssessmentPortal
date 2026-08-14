// ========================================
// SECUREASSESS
// TEACHER DASHBOARD
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {


        // ===============================
        // ELEMENTS
        // ===============================

        const sidebar =
            document.getElementById("sidebar");

        const menuButton =
            document.getElementById("menuButton");

        const logoutButton =
            document.getElementById("logoutButton");

        const notificationButton =
            document.getElementById(
                "notificationButton"
            );

        const notificationPanel =
            document.getElementById(
                "notificationPanel"
            );

        const createExamButton =
            document.getElementById(
                "createExamButton"
            );

        const viewAlertsButton =
            document.getElementById(
                "viewAlertsButton"
            );

        const navItems =
            document.querySelectorAll(
                ".nav-item"
            );


        // ===============================
        // MOBILE SIDEBAR
        // ===============================

        menuButton.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle(
                    "open"
                );

            }
        );


        // ===============================
        // NAVIGATION
        // ===============================

        navItems.forEach(
            item => {

                item.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();


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


                        const section =
                            item.dataset.section;


                        console.log(
                            "Teacher section:",
                            section
                        );


                        /*
                         * Later these will navigate
                         * to actual pages:
                         *
                         * Exams
                         * Question Bank
                         * Students
                         * Results
                         * Analytics
                         */

                    }
                );

            }
        );


        // ===============================
        // CREATE EXAM
        // ===============================

        createExamButton.addEventListener(
            "click",
            () => {

                /*
                 * Temporary navigation.
                 *
                 * create-exam.html will be
                 * created next.
                 */

                window.location.href =
                    "create-exam.html";

            }
        );


        // ===============================
        // NOTIFICATIONS
        // ===============================

        notificationButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                notificationPanel.classList.toggle(
                    "show"
                );

            }
        );


        document.addEventListener(
            "click",
            event => {

                if (
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


        // ===============================
        // INTEGRITY ALERTS
        // ===============================

        const reviewButtons =
            document.querySelectorAll(
                ".review-alert"
            );


        reviewButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        alert(
                            "Integrity review module will be connected to Spring Boot later."
                        );

                    }
                );

            }
        );


        viewAlertsButton.addEventListener(
            "click",
            () => {

                alert(
                    "Full integrity analytics will be available after backend integration."
                );

            }
        );


        // ===============================
        // LOGOUT
        // ===============================

        logoutButton.addEventListener(
            "click",
            () => {

                const confirmed =
                    confirm(
                        "Are you sure you want to logout?"
                    );


                if (confirmed) {

                    /*
                     * Real logout will be handled
                     * by Spring Security.
                     */

                    window.location.href =
                        "login.html";

                }

            }
        );


        // ===============================
        // CHART ANIMATION
        // ===============================

        const bars =
            document.querySelectorAll(
                ".chart-bar"
            );


        bars.forEach(
            (bar, index) => {

                const height =
                    bar.style.height;


                bar.style.height =
                    "0";


                setTimeout(
                    () => {

                        bar.style.height =
                            height;

                    },
                    150 + index * 100
                );

            }
        );


        console.log(
            "SecureAssess Teacher Dashboard loaded."
        );

    }
);