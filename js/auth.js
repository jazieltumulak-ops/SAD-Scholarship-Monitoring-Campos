// =========================================================
// SCHOLARTRACK
// Authentication System
// =========================================================

import {
    supabase
} from "./supabase.js";


// =========================================================
// ELEMENTS
// =========================================================

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");

const loginButton =
    document.getElementById("loginButton");

const loginButtonText =
    document.getElementById("loginButtonText");

const loginSpinner =
    document.getElementById("loginSpinner");

const togglePassword =
    document.getElementById("togglePassword");

const passwordInput =
    document.getElementById("password");


// =========================================================
// CHECK EXISTING SESSION
// =========================================================

async function checkExistingSession() {

    try {

        const {
            data,
            error
        } = await supabase.auth.getSession();


        if (error) {

            console.error(error);

            return;
        }


        if (data.session) {

            window.location.href =
                "index.html";
        }

    } catch (error) {

        console.error(
            "Session check error:",
            error
        );

    }

}


checkExistingSession();


// =========================================================
// SHOW / HIDE PASSWORD
// =========================================================

if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        function() {

            if (
                passwordInput.type ===
                "password"
            ) {

                passwordInput.type =
                    "text";

                togglePassword.textContent =
                    "🙈";

            } else {

                passwordInput.type =
                    "password";

                togglePassword.textContent =
                    "👁";
            }

        }
    );

}


// =========================================================
// LOGIN FORM
// =========================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const password =
                passwordInput.value;


            // -------------------------------------------------
            // RESET MESSAGE
            // -------------------------------------------------

            loginMessage.textContent = "";

            loginMessage.className =
                "login-message";


            // -------------------------------------------------
            // BUTTON LOADING
            // -------------------------------------------------

            loginButton.disabled = true;

            loginButtonText.textContent =
                "Signing in...";

            loginSpinner.classList.remove(
                "hidden"
            );


            try {

                // ---------------------------------------------
                // SUPABASE AUTHENTICATION
                // ---------------------------------------------

                const {
                    data,
                    error
                } =
                    await supabase.auth
                        .signInWithPassword({

                            email: email,

                            password: password

                        });


                if (error) {

                    throw error;
                }


                if (!data.user) {

                    throw new Error(
                        "Unable to authenticate your account."
                    );

                }


                // ---------------------------------------------
                // GET PROFILE
                // ---------------------------------------------

                const {
                    data: profile,
                    error: profileError
                } =
                    await supabase
                        .from("profiles")
                        .select(
                            "id, full_name, role"
                        )
                        .eq(
                            "id",
                            data.user.id
                        )
                        .single();


                if (profileError) {

                    throw new Error(
                        "Your account profile was not found."
                    );

                }


                if (!profile) {

                    throw new Error(
                        "No profile record exists for this account."
                    );

                }


                // ---------------------------------------------
                // CHECK VALID ROLE
                // ---------------------------------------------

                const validRoles = [
                    "admin",
                    "staff",
                    "scholar"
                ];


                if (
                    !validRoles.includes(
                        profile.role
                    )
                ) {

                    await supabase.auth
                        .signOut();


                    throw new Error(
                        "Your account does not have a valid system role."
                    );

                }


                // ---------------------------------------------
                // SAVE SESSION INFORMATION
                // ---------------------------------------------

                localStorage.setItem(
                    "userId",
                    profile.id
                );


                localStorage.setItem(
                    "userName",
                    profile.full_name ||
                    "User"
                );


                localStorage.setItem(
                    "userRole",
                    profile.role
                );


                // ---------------------------------------------
                // SUCCESS MESSAGE
                // ---------------------------------------------

                loginMessage.textContent =
                    "Login successful. Opening dashboard...";

                loginMessage.className =
                    "login-message success";


                // ---------------------------------------------
                // REDIRECT
                // ---------------------------------------------

                setTimeout(
                    function() {

                        window.location.href =
                            "index.html";

                    },
                    500
                );


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                loginMessage.textContent =
                    getFriendlyErrorMessage(
                        error
                    );


                loginMessage.className =
                    "login-message error";


                loginButton.disabled =
                    false;


                loginButtonText.textContent =
                    "Sign In";


                loginSpinner.classList.add(
                    "hidden"
                );

            }

        }
    );

}


// =========================================================
// FRIENDLY ERROR MESSAGES
// =========================================================

function getFriendlyErrorMessage(
    error
) {

    const message =
        error?.message || "";


    if (
        message
            .toLowerCase()
            .includes("invalid login credentials")
    ) {

        return "Incorrect email or password.";

    }


    if (
        message
            .toLowerCase()
            .includes("email not confirmed")
    ) {

        return "Please confirm your email address first.";

    }


    if (
        message
            .toLowerCase()
            .includes("profile was not found")
    ) {

        return "Your account profile is not configured.";

    }


    return (
        message ||
        "Unable to sign in. Please try again."
    );

}