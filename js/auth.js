import { supabase } from "./supabase.js";

const form = document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const message =
    document.getElementById("loginMessage");

const button =
    document.getElementById("loginButton");

const buttonText =
    document.getElementById("loginButtonText");

const toggle =
    document.getElementById("togglePassword");


function showMessage(text, type = "error") {

    message.textContent = text;

    message.className =
        `login-message ${type}`;

}


if (toggle) {

    toggle.addEventListener("click", () => {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            toggle.textContent = "Hide";

        } else {

            passwordInput.type = "password";

            toggle.textContent = "Show";

        }

    });

}


async function checkSession() {

    const {
        data
    } = await supabase.auth.getSession();

    if (data.session) {

        window.location.href =
            "index.html";

    }

}


checkSession();


form?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        if (!email || !password) {

            showMessage(
                "Please enter your email and password."
            );

            return;

        }


        button.disabled = true;

        buttonText.textContent =
            "Signing in...";


        try {

            const {
                data,
                error
            } =
                await supabase.auth
                    .signInWithPassword({
                        email,
                        password
                    });


            if (error) {

                throw error;

            }


            const user =
                data.user;


            const {
                data: profile,
                error: profileError
            } =
                await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();


            if (profileError) {

                await supabase.auth.signOut();

                throw new Error(
                    "Profile not found. Please contact the administrator."
                );

            }


            localStorage.setItem(
                "scholartrack_profile",
                JSON.stringify(profile)
            );


            showMessage(
                "Login successful.",
                "success"
            );


            setTimeout(
                () => {
                    window.location.href =
                        "index.html";
                },
                500
            );


        } catch (error) {

            console.error(error);

            showMessage(
                error.message ||
                "Unable to sign in."
            );

        } finally {

            button.disabled = false;

            buttonText.textContent =
                "Sign In";

        }

    }
);