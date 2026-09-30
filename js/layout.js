import { supabase } from "./supabase.js";


export async function requireAuth() {

    const {
        data: {
            session
        }
    } = await supabase.auth.getSession();


    if (!session) {

        window.location.href =
            "login.html";

        return null;

    }


    return session;

}


export async function getProfile() {

    const {
        data: {
            user
        }
    } = await supabase.auth.getUser();


    if (!user) return null;


    const {
        data,
        error
    } =
        await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();


    if (error) {

        console.error(error);

        return null;

    }


    return data;

}


export function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


export function getInitials(name = "User") {

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(x => x[0])
        .join("")
        .toUpperCase();

}


export function statusBadge(status) {

    if (!status) return "";


    const className =
        status
            .toLowerCase()
            .replaceAll(" ", "-");


    return `
        <span class="badge badge-${className}">
            ${escapeHtml(status)}
        </span>
    `;

}


export function toast(
    message,
    type = "success"
) {

    let container =
        document.querySelector(
            ".toast-container"
        );


    if (!container) {

        container =
            document.createElement("div");

        container.className =
            "toast-container";

        document.body.appendChild(
            container
        );

    }


    const item =
        document.createElement("div");

    item.className =
        `toast ${type}`;

    item.textContent =
        message;


    container.appendChild(item);


    setTimeout(
        () => item.remove(),
        3500
    );

}


export function openModal(id) {

    document
        .getElementById(id)
        ?.classList.add("show");

}


export function closeModal(id) {

    document
        .getElementById(id)
        ?.classList.remove("show");

}


export function setupModalClose() {

    document
        .querySelectorAll(".modal-close")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    button
                        .closest(".modal-overlay")
                        ?.classList.remove("show");

                }
            );

        });


    document
        .querySelectorAll(".modal-overlay")
        .forEach(modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {

                        modal.classList.remove(
                            "show"
                        );

                    }

                }
            );

        });

}


export function setupSidebar() {

    const menu =
        document.querySelector(
            ".mobile-menu"
        );

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    menu?.addEventListener(
        "click",
        () => {

            sidebar?.classList.toggle(
                "open"
            );

        }
    );

}


export async function setupLayout(
    activePage
) {

    const session =
        await requireAuth();


    if (!session) return null;


    const profile =
        await getProfile();


    if (!profile) {

        await supabase.auth.signOut();

        window.location.href =
            "login.html";

        return null;

    }


    const app =
        document.getElementById("app");


    app.innerHTML = `

        <aside class="sidebar">

            <div class="sidebar-brand">

                <div class="brand-logo">
                    ST
                </div>

                <div class="sidebar-brand-text">

                    <strong>
                        ScholarTrack
                    </strong>

                    <span>
                        Scholarship Monitoring
                    </span>

                </div>

            </div>


            <nav class="sidebar-nav">

                <div class="nav-section">
                    Main
                </div>

                <a
                    href="index.html"
                    class="nav-link ${
                        activePage === "dashboard"
                            ? "active"
                            : ""
                    }"
                >
                    <span class="nav-icon">
                        ⌂
                    </span>
                    Dashboard
                </a>


                <a
                    href="scholars.html"
                    class="nav-link ${
                        activePage === "scholars"
                            ? "active"
                            : ""
                    }"
                >
                    <span class="nav-icon">
                        👥
                    </span>
                    Scholars
                </a>


                <a
                    href="programs.html"
                    class="nav-link ${
                        activePage === "programs"
                            ? "active"
                            : ""
                    }"
                >
                    <span class="nav-icon">
                        🎓
                    </span>
                    Scholarship Programs
                </a>


                <div class="nav-section">
                    Academic Monitoring
                </div>


                <a
                    href="grades.html"
                    class="nav-link ${
                        activePage === "grades"
                            ? "active"
                            : ""
                    }"
                >
                    <span class="nav-icon">
                        📝
                    </span>
                    Grade Submissions
                </a>


                <a
                    href="compliance.html"
                    class="nav-link ${
                        activePage === "compliance"
                            ? "active"
                            : ""
                    }"
                >
                    <span class="nav-icon">
                        ✓
                    </span>
                    Compliance
                </a>


                <a
                    href="reports.html"
                    class="nav-link ${
                        activePage === "reports"
                            ? "active"
                            : ""
                    }"
                >
                    <span class="nav-icon">
                        📊
                    </span>
                    Compliance Reports
                </a>


                <div class="nav-section">
                    Other
                </div>


                <a
                    href="renewal.html"
                    class="nav-link ${
                        activePage === "renewal"
                            ? "active"
                            : ""
                    }"
                >
                    <span class="nav-icon">
                        ↻
                    </span>
                    Scholarship Renewal
                </a>


                <a
                    href="search.html"
                    class="nav-link ${
                        activePage === "search"
                            ? "active"
                            : ""
                    }"
                >
                    <span class="nav-icon">
                        ⌕
                    </span>
                    Search Scholars
                </a>

            </nav>


            <div class="sidebar-bottom">

                <div class="user-mini">

                    <div class="user-avatar">
                        ${getInitials(
                            profile.full_name
                        )}
                    </div>

                    <div>

                        <strong>
                            ${escapeHtml(
                                profile.full_name
                            )}
                        </strong>

                        <span>
                            ${escapeHtml(
                                profile.role
                            )}
                        </span>

                    </div>

                </div>


                <button
                    id="logoutButton"
                    class="logout-btn"
                >
                    Sign Out
                </button>

            </div>

        </aside>


        <main class="main">

            <header class="topbar">

                <div
                    style="
                        display:flex;
                        align-items:center;
                    "
                >

                    <button
                        class="mobile-menu"
                        type="button"
                    >
                        ☰
                    </button>

                    <div class="page-title">

                        <h1 id="pageTitle">
                            ScholarTrack
                        </h1>

                        <p id="pageSubtitle">
                            Scholarship Monitoring System
                        </p>

                    </div>

                </div>

            </header>


            <section
                class="content"
                id="pageContent"
            ></section>

        </main>

    `;


    document
        .getElementById("logoutButton")
        ?.addEventListener(
            "click",
            async () => {

                await supabase.auth.signOut();

                localStorage.removeItem(
                    "scholartrack_profile"
                );

                window.location.href =
                    "login.html";

            }
        );


    setupSidebar();

    setupModalClose();


    return profile;

}