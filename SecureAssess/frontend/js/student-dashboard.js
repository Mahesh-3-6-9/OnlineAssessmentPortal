javascript
// ========================================
// SECUREASSESS STUDENT DASHBOARD
// Frontend Demo
// ========================================

document.addEventListener("DOMContentLoaded", () => {


    // ========================================
    // ELEMENTS
    // ========================================

    const sidebar =
        document.getElementById("sidebar");

    const menuButton =
        document.getElementById("menuButton");

    const logoutButton =
        document.getElementById("logoutButton");

    const notificationButton =
        document.getElementById("notificationButton");

    const notificationPanel =
        document.getElementById("notificationPanel");

    const closeNotifications =
        document.getElementById("closeNotifications");

    const navItems =
        document.querySelectorAll(".nav-item");

    const startButtons =
        document.querySelectorAll(".start-button");

    const currentDate =
        document.getElementById("currentDate");


    // ========================================
    // CURRENT DATE
    // ========================================

    function updateDate() {

        const now = new Date();

        const options = {
            weekday: "long",
            month: "long",
            day: "numeric"
        };

        const formattedDate =
            now.toLocaleDateString(
                "en-US",
                options
            );

        if (currentDate) {

            currentDate.textContent =
                formattedDate;

        }

    }

    updateDate();


    // ========================================
    // MOBILE SIDEBAR
    // ========================================

    if (menuButton) {

        menuButton.addEventListener("click", () => {

            sidebar.classList.toggle("open");

        });

    }


    // ========================================
    // SIDEBAR NAVIGATION
    // ========================================

    navItems.forEach(item => {

        item.addEventListener("click", (event) => {

            event.preventDefault();


            // Remove active state

            navItems.forEach(nav => {

                nav.classList.remove("active");

            });


            // Add active state

            item.classList.add("active");


            const section =
                item.dataset.section;

            console.log(
                "Selected section:",
                section
            );


            // Close sidebar on mobile

            if (window.innerWidth <= 850) {

                sidebar.classList.remove("open");

            }

        });

    });


    // ========================================
    // NOTIFICATION PANEL
    // ========================================

    notificationButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            notificationPanel.classList.toggle(
                "show"
            );

        }
    );


    closeNotifications.addEventListener(
        "click",
        () => {

            notificationPanel.classList.remove(
                "show"
            );

        }
    );


    // Close notification panel
    // when clicking outside

    document.addEventListener(
        "click",
        (event) => {

            if (
                notificationPanel.classList.contains(
                    "show"
                ) &&
                !notificationPanel.contains(event.target) &&
                !notificationButton.contains(event.target)
            ) {

                notificationPanel.classList.remove(
                    "show"
                );

            }

        }
    );


    // ========================================
    // EXAM BUTTONS
    // ========================================

    startButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const examName =
                    button.dataset.exam;

                console.log(
                    "Selected exam:",
                    examName
                );


                // Temporary demo message

                alert(
                    `${examName} examination will open here once the exam module is connected.`
                );

            }
        );

    });


    // ========================================
    // LOGOUT
    // ========================================

    logoutButton.addEventListener(
        "click",
        () => {

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (confirmLogout) {

                // Backend authentication
                // will handle real logout later.

                window.location.href =
                    "login.html";

            }

        }
    );


    // ========================================
    // PERFORMANCE BAR ANIMATION
    // ========================================

    const bars =
        document.querySelectorAll(
            ".performance-bar"
        );


    bars.forEach((bar, index) => {

        const originalHeight =
            bar.style.height;

        bar.style.height = "0";

        setTimeout(() => {

            bar.style.height =
                originalHeight;

        }, 150 + (index * 100));

    });


    // ========================================
    // CONSOLE MESSAGE
    // ========================================

    console.log(
        "SecureAssess Student Dashboard loaded successfully."
    );

});

