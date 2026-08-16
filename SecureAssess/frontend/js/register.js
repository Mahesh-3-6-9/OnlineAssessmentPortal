// ========================================
// SECUREASSESS REGISTRATION
// ========================================

const API_URL =
    "http://localhost:8080/api/users";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "registerForm"
            );

        const nameInput =
            document.getElementById(
                "name"
            );

        const emailInput =
            document.getElementById(
                "email"
            );

        const passwordInput =
            document.getElementById(
                "password"
            );

        const confirmPasswordInput =
            document.getElementById(
                "confirmPassword"
            );

        const button =
            document.getElementById(
                "registerButton"
            );

        const buttonText =
            document.getElementById(
                "registerButtonText"
            );

        const loader =
            document.getElementById(
                "registerLoader"
            );

        const message =
            document.getElementById(
                "registerMessage"
            );


        // ========================================
        // MESSAGE
        // ========================================

        function showMessage(
            text,
            type
        ) {

            message.textContent =
                text;

            message.className =
                "register-message show " +
                type;

        }


        function clearMessage() {

            message.textContent =
                "";

            message.className =
                "register-message";

        }


        // ========================================
        // FORM SUBMIT
        // ========================================

        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                clearMessage();


                const name =
                    nameInput.value.trim();

                const email =
                    emailInput.value
                        .trim()
                        .toLowerCase();

                const password =
                    passwordInput.value;

                const confirmPassword =
                    confirmPasswordInput.value;


                const selectedRole =
                    document.querySelector(
                        'input[name="role"]:checked'
                    );


                // ====================================
                // VALIDATION
                // ====================================

                if (!name) {

                    showMessage(
                        "Please enter your name.",
                        "error"
                    );

                    nameInput.focus();

                    return;
                }


                if (name.length < 2) {

                    showMessage(
                        "Name must contain at least 2 characters.",
                        "error"
                    );

                    nameInput.focus();

                    return;
                }


                const emailPattern =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                if (
                    !emailPattern.test(email)
                ) {

                    showMessage(
                        "Please enter a valid email address.",
                        "error"
                    );

                    emailInput.focus();

                    return;
                }


                if (
                    password.length < 6
                ) {

                    showMessage(
                        "Password must contain at least 6 characters.",
                        "error"
                    );

                    passwordInput.focus();

                    return;
                }


                if (
                    password !==
                    confirmPassword
                ) {

                    showMessage(
                        "Passwords do not match.",
                        "error"
                    );

                    confirmPasswordInput.focus();

                    return;
                }


                if (!selectedRole) {

                    showMessage(
                        "Please select your account type.",
                        "error"
                    );

                    return;
                }


                // ====================================
                // LOADING
                // ====================================

                button.disabled =
                    true;

                buttonText.textContent =
                    "Creating account...";

                loader.classList.add(
                    "show"
                );


                try {

                    // =================================
                    // REGISTER
                    // =================================

                    const response =
                        await fetch(
                            `${API_URL}/register`,
                            {
                                method:
                                    "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({

                                        name:
                                            name,

                                        email:
                                            email,

                                        password:
                                            password,

                                        role:
                                            selectedRole.value

                                    })
                            }
                        );


                    // =================================
                    // RESPONSE
                    // =================================

                    const contentType =
                        response.headers.get(
                            "content-type"
                        );


                    let data;


                    if (
                        contentType &&
                        contentType.includes(
                            "application/json"
                        )
                    ) {

                        data =
                            await response.json();

                    } else {

                        data =
                            await response.text();

                    }


                    // =================================
                    // ERROR
                    // =================================

                    if (!response.ok) {

                        throw new Error(
                            typeof data === "string"
                                ? data
                                : "Unable to create account."
                        );

                    }


                    // =================================
                    // SUCCESS
                    // =================================

                    showMessage(
                        "Account created successfully! Redirecting to login...",
                        "success"
                    );


                    // Clear password fields

                    passwordInput.value =
                        "";

                    confirmPasswordInput.value =
                        "";


                    // =================================
                    // REDIRECT
                    // =================================

                    setTimeout(
                        () => {

                            window.location.href =
                                "login.html";

                        },
                        1200
                    );


                } catch (error) {

                    console.error(
                        "Registration error:",
                        error
                    );


                    showMessage(
                        error.message ||
                        "Unable to create account. Please try again.",
                        "error"
                    );


                } finally {

                    button.disabled =
                        false;

                    buttonText.textContent =
                        "Create account";

                    loader.classList.remove(
                        "show"
                    );

                }

            }
        );

    }
);