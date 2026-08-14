// SecureAssess Landing Page

document.addEventListener("DOMContentLoaded", () => {

    console.log("SecureAssess landing page loaded.");

    // Smooth scrolling for internal navigation links
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {

        link.addEventListener("click", function (event) {

            const targetId = this.getAttribute("href");

            if (targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });

});