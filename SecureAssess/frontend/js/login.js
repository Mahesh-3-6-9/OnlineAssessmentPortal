// ========================================
// SECUREASSESS LOGIN
// CONNECTED TO SPRING BOOT BACKEND
// ========================================

const API_URL =
    "http://localhost:8080/api/auth";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const loginForm =
            document.getElementById(
                "loginForm"
            );

        const emailInput =
            document.getElementById(
                "email"
            );

        const passwordInput =
            document.getElementById(
                "password"
            );

        const roleInput =
            document.getElementById(
                "role"
            );

        const togglePassword =
            document.getElementById(
                "togglePassword"
            );

        const forgotPassword =
            document.getElementById(
                "forgotPassword"
            );

        const loginButton =
            document.getElementById(
                "loginButton"
            );

        const buttonText =
            document.getElementById(
                "buttonText"
            );

        const buttonLoader =
            document.getElementById(
                "buttonLoader"
            );

        const loginMessage =
            document.getElementById(
                "loginMessage"
            );

        const rememberMe =
            document.getElementById(
                "rememberMe"
            );


        // ========================================
        // SHOW / HIDE PASSWORD
        // ========================================

        if (togglePassword) {

            togglePassword.addEventListener(
                "click",
                () => {

                    if (
                        passwordInput.type ===
                        "password"
                    ) {

                        passwordInput.type =
                            "text";

                        togglePassword.textContent =
                            "Hide";

                        togglePassword.setAttribute(
                            "aria-label",
                            "Hide password"
                        );

                    } else {

                        passwordInput.type =
                            "password";

                        togglePassword.textContent =
                            "Show";

                        togglePassword.setAttribute(
                            "aria-label",
                            "Show password"
                        );

                    }

                }
            );

        }


        // ========================================
        // MESSAGE
        // ========================================

        function showMessage(
            message,
            type
        ) {

            if (!loginMessage) {

                return;

            }


            loginMessage.textContent =
                message;


            loginMessage.className =
                "login-message show " +
                type;

        }


        function clearMessage() {

            if (!loginMessage) {

                return;

            }


            loginMessage.textContent =
                "";


            loginMessage.className =
                "login-message";

        }


        // ========================================
        // FORGOT PASSWORD
        // ========================================

        if (forgotPassword) {

            forgotPassword.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    showMessage(
                        "Password recovery is not available yet.",
                        "info"
                    );

                }
            );

        }


        // ========================================
        // LOAD REMEMBERED EMAIL
        // ========================================

        const savedEmail =
            localStorage.getItem(
                "rememberedEmail"
            );


        if (savedEmail) {

            emailInput.value =
                savedEmail;


            rememberMe.checked =
                true;

        }


        // ========================================
        // LOGIN
        // ========================================

        loginForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                clearMessage();


                const email =
                    emailInput.value.trim();


                const password =
                    passwordInput.value;


                const selectedRole =
                    roleInput.value;


                // ====================================
                // VALIDATION
                // ====================================

                if (
                    email === ""
                ) {

                    showMessage(
                        "Please enter your email address.",
                        "error"
                    );


                    emailInput.focus();


                    return;

                }


                if (
                    password === ""
                ) {

                    showMessage(
                        "Please enter your password.",
                        "error"
                    );


                    passwordInput.focus();


                    return;

                }


                const emailPattern =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                if (
                    !emailPattern.test(
                        email
                    )
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


                // ====================================
                // LOADING
                // ====================================

                loginButton.disabled =
                    true;


                buttonText.textContent =
                    "Signing in...";


                buttonLoader.classList.add(
                    "show"
                );


                try {

                    // =================================
                    // CALL SPRING BOOT
                    // =================================

                    const response =
                        await fetch(
                            `${API_URL}/login`,
                            {
                                method:
                                    "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        email:
                                            email,

                                        password:
                                            password
                                    })
                            }
                        );


                    // =================================
                    // READ RESPONSE
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
                    // LOGIN FAILED
                    // =================================

                    if (
                        !response.ok
                    ) {

                        throw new Error(
                            typeof data ===
                            "string"
                                ? data
                                : "Invalid email or password."
                        );

                    }


                    // =================================
                    // VALIDATE RESPONSE
                    // =================================

                    if (
                        !data.id
                    ) {

                        throw new Error(
                            "Login response does not contain a user ID."
                        );

                    }


                    if (
                        !data.role
                    ) {

                        throw new Error(
                            "Login response does not contain a user role."
                        );

                    }


                    // =================================
                    // ROLE CHECK
                    // =================================

                    if (
                        data.role !==
                        selectedRole
                    ) {

                        throw new Error(
                            "The selected role does not match this account."
                        );

                    }


                    // =================================
                    // CURRENT USER
                    // =================================

                    const currentUser = {

                        id:
                            Number(
                                data.id
                            ),

                        name:
                            data.name ||
                            "",

                        email:
                            data.email ||
                            email,

                        role:
                            data.role

                    };


                    // =================================
                    // SAVE SESSION
                    // =================================

                    sessionStorage.setItem(
                        "currentUser",
                        JSON.stringify(
                            currentUser
                        )
                    );


                    // =================================
                    // SAVE COMMON USER DATA
                    // =================================

                    localStorage.setItem(
                        "userId",
                        String(
                            currentUser.id
                        )
                    );


                    localStorage.setItem(
                        "userRole",
                        currentUser.role
                    );


                    localStorage.setItem(
                        "userName",
                        currentUser.name
                    );


                    localStorage.setItem(
                        "userEmail",
                        currentUser.email
                    );


                    // =================================
                    // SAVE ROLE-SPECIFIC ID
                    // =================================

                    if (
                        currentUser.role ===
                        "STUDENT"
                    ) {

                        localStorage.setItem(
                            "studentId",
                            String(
                                currentUser.id
                            )
                        );


                        // Remove stale teacher ID

                        localStorage.removeItem(
                            "teacherId"
                        );

                    }


                    if (
                        currentUser.role ===
                        "TEACHER"
                    ) {

                        localStorage.setItem(
                            "teacherId",
                            String(
                                currentUser.id
                            )
                        );


                        // Remove stale student ID

                        localStorage.removeItem(
                            "studentId"
                        );

                    }


                    // =================================
                    // REMEMBER EMAIL
                    // =================================

                    if (
                        rememberMe.checked
                    ) {

                        localStorage.setItem(
                            "rememberedEmail",
                            email
                        );

                    } else {

                        localStorage.removeItem(
                            "rememberedEmail"
                        );

                    }


                    // =================================
                    // SUCCESS
                    // =================================

                    showMessage(
                        "Login successful. Redirecting...",
                        "success"
                    );


                    // =================================
                    // REDIRECT
                    // =================================

                    setTimeout(
                        () => {

                            if (
                                currentUser.role ===
                                "STUDENT"
                            ) {

                                window.location.href =
                                    "student-dashboard.html";

                            } else if (
                                currentUser.role ===
                                "TEACHER"
                            ) {

                                window.location.href =
                                    "teacher-dashboard.html";

                            }

                        },
                        700
                    );


                } catch (
                    error
                ) {

                    console.error(
                        "Login error:",
                        error
                    );


                    showMessage(
                        getErrorMessage(
                            error
                        ),
                        "error"
                    );


                } finally {

                    loginButton.disabled =
                        false;


                    buttonText.textContent =
                        "Sign in";


                    buttonLoader.classList.remove(
                        "show"
                    );

                }

            }
        );


        // ========================================
        // ERROR MESSAGE
        // ========================================

        function getErrorMessage(
            error
        ) {

            if (
                error &&
                error.message
            ) {

                return error.message;

            }


            return (
                "Unable to connect to the server. " +
                "Please try again."
            );

        }

    }
);