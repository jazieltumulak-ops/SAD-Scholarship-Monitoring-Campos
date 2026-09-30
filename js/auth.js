import { supabase } from "./supabase.js";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const togglePassword = document.getElementById("togglePassword");

const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");


// ===============================
// SHOW MESSAGE
// ===============================

function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";
    }

    if (successMessage) {
        successMessage.style.display = "none";
    }
}

function showSuccess(message) {
    if (successMessage) {
        successMessage.textContent = message;
        successMessage.style.display = "block";
    }

    if (errorMessage) {
        errorMessage.style.display = "none";
    }
}


// ===============================
// CHECK EXISTING LOGIN SESSION
// ===============================

async function checkExistingSession() {

    try {

        const {
            data: { session },
            error
        } = await supabase.auth.getSession();

        if (error) {
            console.error("Session error:", error);
            return;
        }

        if (session) {
            window.location.href = "./index.html";
        }

    } catch (error) {

        console.error("Session check failed:", error);

    }
}


// ===============================
// SHOW / HIDE PASSWORD
// ===============================

if (togglePassword) {

    togglePassword.addEventListener("click", () => {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";
            togglePassword.textContent = "🙈";
            togglePassword.setAttribute(
                "aria-label",
                "Hide password"
            );

        } else {

            passwordInput.type = "password";
            togglePassword.textContent = "👁";
            togglePassword.setAttribute(
                "aria-label",
                "Show password"
            );

        }

    });

}


// ===============================
// LOGIN
// ===============================

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {

            showError("Please enter your email and password.");
            return;

        }

        // Disable button while logging in
        loginButton.disabled = true;
        loginButton.textContent = "Signing in...";

        if (errorMessage) {
            errorMessage.style.display = "none";
        }

        if (successMessage) {
            successMessage.style.display = "none";
        }


        try {

            console.log("Attempting Supabase login...");

            const {
                data,
                error
            } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });


            // LOGIN ERROR
            if (error) {

                console.error("Supabase login error:", error);

                showError(error.message);

                loginButton.disabled = false;
                loginButton.textContent = "Sign In";

                return;
            }


            // NO USER RETURNED
            if (!data || !data.user) {

                showError(
                    "Login failed. No user account was returned."
                );

                loginButton.disabled = false;
                loginButton.textContent = "Sign In";

                return;
            }


            // LOGIN SUCCESS
            console.log("Login successful:", data.user.email);

            showSuccess("Login successful. Opening dashboard...");

            // Save basic user information
            localStorage.setItem(
                "userId",
                data.user.id
            );

            localStorage.setItem(
                "userEmail",
                data.user.email
            );


            // Try to get profile information
            try {

                const {
                    data: profile,
                    error: profileError
                } = await supabase
                    .from("profiles")
                    .select("id, full_name, role")
                    .eq("id", data.user.id)
                    .maybeSingle();


                if (!profileError && profile) {

                    localStorage.setItem(
                        "userName",
                        profile.full_name || data.user.email
                    );

                    localStorage.setItem(
                        "userRole",
                        profile.role || ""
                    );

                    console.log("Profile loaded:", profile);

                } else {

                    console.warn(
                        "Profile not found or profile query blocked:",
                        profileError
                    );

                    // Still continue to dashboard
                    localStorage.setItem(
                        "userName",
                        data.user.email
                    );

                }

            } catch (profileError) {

                console.warn(
                    "Could not load profile:",
                    profileError
                );

                // Still allow dashboard after successful authentication
                localStorage.setItem(
                    "userName",
                    data.user.email
                );

            }


            // ===============================
            // REDIRECT TO DASHBOARD
            // ===============================

            setTimeout(() => {

                window.location.href = "./index.html";

            }, 500);


        } catch (error) {

            console.error("Unexpected login error:", error);

            showError(
                "Something went wrong while signing in. Please try again."
            );

            loginButton.disabled = false;
            loginButton.textContent = "Sign In";

        }

    });

}


// Run session check
checkExistingSession();