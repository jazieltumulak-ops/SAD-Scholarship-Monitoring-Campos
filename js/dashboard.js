import { supabase } from "./supabase.js";

/*
|--------------------------------------------------------------------------
| ScholarTrack Dashboard
|--------------------------------------------------------------------------
| This dashboard:
| - Checks Supabase authentication
| - Loads the user's profile
| - Loads scholar statistics
| - Loads recent grade submissions
| - Builds the dashboard using the exact HTML class structure
| - Handles navigation
| - Handles sign out
|--------------------------------------------------------------------------
*/

const app = document.getElementById("app");

const NAV_ITEMS = [
    {
        label: "Dashboard",
        href: "index.html"
    },
    {
        label: "Scholars",
        href: "scholars.html"
    },
    {
        label: "Scholarship Programs",
        href: "programs.html"
    },
    {
        label: "Grade Submissions",
        href: "grades.html"
    },
    {
        label: "Compliance",
        href: "compliance.html"
    },
    {
        label: "Compliance Reports",
        href: "reports.html"
    },
    {
        label: "Scholarship Renewal",
        href: "renewal.html"
    },
    {
        label: "Search Scholars",
        href: "search.html"
    }
];

/*
|--------------------------------------------------------------------------
| Utility Functions
|--------------------------------------------------------------------------
*/

function escapeHtml(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateValue) {
    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

function getCurrentPage() {
    const path = window.location.pathname;

    if (
        path === "/" ||
        path.endsWith("/") ||
        path.endsWith("index.html")
    ) {
        return "index.html";
    }

    return path.split("/").pop();
}

function getStoredProfile() {
    try {
        const profile = localStorage.getItem("scholartrack_profile");

        if (!profile) {
            return null;
        }

        return JSON.parse(profile);
    } catch (error) {
        console.error("Unable to read stored profile:", error);
        return null;
    }
}

function getInitials(name) {
    if (!name) {
        return "S";
    }

    const words = String(name)
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }

    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();
}

function formatNumber(value) {
    const number = Number(value || 0);

    return number.toLocaleString("en-US");
}

function normalizeStatus(status) {
    if (!status) {
        return "Pending";
    }

    return String(status)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function getStatusClass(status) {
    const normalized = normalizeStatus(status);

    if (normalized === "verified") {
        return "status-verified";
    }

    if (normalized === "compliant") {
        return "status-compliant";
    }

    if (normalized === "with deficiency") {
        return "status-deficiency";
    }

    if (normalized === "returned") {
        return "status-returned";
    }

    if (normalized === "pending") {
        return "status-pending";
    }

    if (normalized === "for verification") {
        return "status-verification";
    }

    return "status-default";
}

function showToast(message, type = "success") {
    let toast = document.getElementById("dashboardToast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "dashboardToast";
        toast.className = "dashboard-toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = `dashboard-toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

async function checkAuthentication() {
    const {
        data: { session },
        error
    } = await supabase.auth.getSession();

    if (error) {
        console.error("Session error:", error);
    }

    if (!session) {
        window.location.href = "login.html";
        return null;
    }

    return session;
}

/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/

async function loadProfile(userId) {
    const storedProfile = getStoredProfile();

    if (storedProfile && storedProfile.id === userId) {
        return storedProfile;
    }

    const {
        data: profile,
        error
    } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) {
        console.error("Profile loading error:", error);
        return {
            id: userId,
            full_name: "Scholarship Staff",
            role: "staff"
        };
    }

    localStorage.setItem(
        "scholartrack_profile",
        JSON.stringify(profile)
    );

    return profile;
}

/*
|--------------------------------------------------------------------------
| Dashboard Layout
|--------------------------------------------------------------------------
*/

function renderDashboard(profile) {
    const currentPage = getCurrentPage();

    const fullName =
        profile?.full_name ||
        profile?.name ||
        "Scholarship Staff";

    const role =
        profile?.role ||
        "staff";

    const initials = getInitials(fullName);

    const navLinks = NAV_ITEMS.map(item => {
        const isActive = item.href === currentPage;

        return `
            <a
                href="${item.href}"
                class="nav-link ${isActive ? "active" : ""}"
            >
                <span class="nav-link-icon">
                    ${getNavIcon(item.label)}
                </span>

                <span class="nav-link-text">
                    ${escapeHtml(item.label)}
                </span>
            </a>
        `;
    }).join("");

    app.innerHTML = `
        <div class="app-shell">

            <aside class="sidebar">

                <div class="sidebar-brand">
                    <div class="brand-icon">S</div>

                    <div class="brand-copy">
                        <h2>ScholarTrack</h2>
                        <span>Scholarship Monitoring</span>
                    </div>
                </div>

                <nav class="sidebar-nav">

                    ${navLinks}

                </nav>

                <button
                    type="button"
                    class="sign-out-btn"
                    id="signOutButton"
                >
                    <span class="sign-out-icon">
                        ${getLogoutIcon()}
                    </span>

                    <span>Sign Out</span>
                </button>

            </aside>


            <main class="main-content">

                <header class="topbar">

                    <div class="topbar-left">

                        <button
                            type="button"
                            class="mobile-menu-btn"
                            id="mobileMenuButton"
                            aria-label="Open navigation"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>

                        <div class="topbar-title">
                            <span class="topbar-label">
                                Scholarship Office
                            </span>

                            <span class="topbar-context">
                                Monitoring System
                            </span>
                        </div>

                    </div>


                    <div class="topbar-right">

                        <div class="topbar-user">

                            <div class="topbar-avatar">
                                ${escapeHtml(initials)}
                            </div>

                            <div class="topbar-user-info">
                                <strong class="topbar-user-name">
                                    ${escapeHtml(fullName)}
                                </strong>

                                <span class="topbar-user-role">
                                    ${escapeHtml(formatRole(role))}
                                </span>
                            </div>

                        </div>

                    </div>

                </header>


                <section class="content">

                    <div class="page-header">

                        <div class="page-header-content">

                            <div>
                                <span class="page-eyebrow">
                                    Overview
                                </span>

                                <h1>Dashboard</h1>

                                <p>
                                    Monitor scholarship compliance and academic submissions.
                                </p>
                            </div>

                        </div>

                    </div>


                    <div class="welcome-banner">

                        <div class="welcome-content">

                            <div class="welcome-text">

                                <span class="welcome-label">
                                    ScholarTrack Dashboard
                                </span>

                                <h2>
                                    Welcome back, ${escapeHtml(getFirstName(fullName))}!
                                </h2>

                                <p>
                                    Here's an overview of your scholarship monitoring system.
                                </p>

                            </div>

                            <div class="welcome-decoration">
                                <div class="welcome-circle circle-one"></div>
                                <div class="welcome-circle circle-two"></div>
                                <div class="welcome-shape">
                                    ✓
                                </div>
                            </div>

                        </div>

                    </div>


                    <div class="stats-grid">

                        <div class="stat-card">

                            <div class="stat-icon stat-icon-blue">
                                ${getUsersIcon()}
                            </div>

                            <div class="stat-info">
                                <span class="stat-label">
                                    Total Scholars
                                </span>

                                <strong
                                    class="stat-value"
                                    id="totalScholars"
                                >
                                    —
                                </strong>

                                <span class="stat-description">
                                    Registered scholars
                                </span>
                            </div>

                        </div>


                        <div class="stat-card">

                            <div class="stat-icon stat-icon-orange">
                                ${getClockIcon()}
                            </div>

                            <div class="stat-info">
                                <span class="stat-label">
                                    Pending Submissions
                                </span>

                                <strong
                                    class="stat-value"
                                    id="pendingSubmissions"
                                >
                                    —
                                </strong>

                                <span class="stat-description">
                                    Awaiting verification
                                </span>
                            </div>

                        </div>


                        <div class="stat-card">

                            <div class="stat-icon stat-icon-green">
                                ${getCheckIcon()}
                            </div>

                            <div class="stat-info">
                                <span class="stat-label">
                                    Verified Submissions
                                </span>

                                <strong
                                    class="stat-value"
                                    id="verifiedSubmissions"
                                >
                                    —
                                </strong>

                                <span class="stat-description">
                                    Successfully verified
                                </span>
                            </div>

                        </div>


                        <div class="stat-card">

                            <div class="stat-icon stat-icon-purple">
                                ${getShieldIcon()}
                            </div>

                            <div class="stat-info">
                                <span class="stat-label">
                                    Compliant Scholars
                                </span>

                                <strong
                                    class="stat-value"
                                    id="compliantScholars"
                                >
                                    —
                                </strong>

                                <span class="stat-description">
                                    Meeting requirements
                                </span>
                            </div>

                        </div>

                    </div>


                    <div class="dashboard-grid">

                        <div class="card recent-submissions-card">

                            <div class="card-header">

                                <div>
                                    <h3>
                                        Recent Grade Submissions
                                    </h3>

                                    <p>
                                        Latest semester submissions.
                                    </p>
                                </div>

                                <a
                                    href="grades.html"
                                    class="view-all-link"
                                >
                                    View all
                                    <span>→</span>
                                </a>

                            </div>


                            <div class="table-wrapper">

                                <table class="dashboard-table">

                                    <thead>
                                        <tr>
                                            <th>Scholar</th>
                                            <th>Academic Period</th>
                                            <th>GWA</th>
                                            <th>Status</th>
                                            <th>Submitted</th>
                                        </tr>
                                    </thead>

                                    <tbody id="recentSubmissionsBody">

                                        <tr>
                                            <td colspan="5">
                                                <div class="table-loading">
                                                    <div class="loading-spinner"></div>
                                                    <span>
                                                        Loading recent submissions...
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>

                                    </tbody>

                                </table>

                            </div>

                        </div>


                        <div class="card quick-actions-card">

                            <div class="card-header">

                                <div>
                                    <h3>
                                        Quick Actions
                                    </h3>

                                    <p>
                                        Common scholarship tasks.
                                    </p>
                                </div>

                            </div>


                            <div class="quick-actions">

                                <a
                                    href="scholars.html"
                                    class="quick-action"
                                >
                                    <div class="quick-action-icon quick-icon-blue">
                                        ${getUsersIcon()}
                                    </div>

                                    <div class="quick-action-text">
                                        <strong>
                                            Manage Scholars
                                        </strong>

                                        <span>
                                            Add or update scholar records
                                        </span>
                                    </div>

                                    <span class="quick-action-arrow">
                                        →
                                    </span>
                                </a>


                                <a
                                    href="grades.html"
                                    class="quick-action"
                                >
                                    <div class="quick-action-icon quick-icon-orange">
                                        ${getDocumentIcon()}
                                    </div>

                                    <div class="quick-action-text">
                                        <strong>
                                            Grade Submissions
                                        </strong>

                                        <span>
                                            Review semester submissions
                                        </span>
                                    </div>

                                    <span class="quick-action-arrow">
                                        →
                                    </span>
                                </a>


                                <a
                                    href="compliance.html"
                                    class="quick-action"
                                >
                                    <div class="quick-action-icon quick-icon-green">
                                        ${getCheckIcon()}
                                    </div>

                                    <div class="quick-action-text">
                                        <strong>
                                            Evaluate Compliance
                                        </strong>

                                        <span>
                                            Check academic requirements
                                        </span>
                                    </div>

                                    <span class="quick-action-arrow">
                                        →
                                    </span>
                                </a>


                                <a
                                    href="reports.html"
                                    class="quick-action"
                                >
                                    <div class="quick-action-icon quick-icon-purple">
                                        ${getChartIcon()}
                                    </div>

                                    <div class="quick-action-text">
                                        <strong>
                                            Compliance Reports
                                        </strong>

                                        <span>
                                            View monitoring reports
                                        </span>
                                    </div>

                                    <span class="quick-action-arrow">
                                        →
                                    </span>
                                </a>

                            </div>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    `;

    setupDashboardEvents();
}

/*
|--------------------------------------------------------------------------
| Dashboard Events
|--------------------------------------------------------------------------
*/

function setupDashboardEvents() {
    const signOutButton =
        document.getElementById("signOutButton");

    signOutButton?.addEventListener(
        "click",
        handleSignOut
    );

    const mobileMenuButton =
        document.getElementById("mobileMenuButton");

    mobileMenuButton?.addEventListener(
        "click",
        toggleMobileSidebar
    );

    document
        .querySelectorAll(".nav-link")
        .forEach(link => {
            link.addEventListener("click", () => {
                closeMobileSidebar();
            });
        });
}

function toggleMobileSidebar() {
    const sidebar = document.querySelector(".sidebar");

    if (!sidebar) {
        return;
    }

    sidebar.classList.toggle("mobile-open");

    let overlay =
        document.querySelector(".sidebar-overlay");

    if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "sidebar-overlay";

        overlay.addEventListener(
            "click",
            closeMobileSidebar
        );

        document.body.appendChild(overlay);
    }

    overlay.classList.toggle(
        "show",
        sidebar.classList.contains("mobile-open")
    );

    document.body.classList.toggle(
        "menu-open",
        sidebar.classList.contains("mobile-open")
    );
}

function closeMobileSidebar() {
    const sidebar =
        document.querySelector(".sidebar");

    const overlay =
        document.querySelector(".sidebar-overlay");

    sidebar?.classList.remove("mobile-open");
    overlay?.classList.remove("show");

    document.body.classList.remove("menu-open");
}

/*
|--------------------------------------------------------------------------
| Sign Out
|--------------------------------------------------------------------------
*/

async function handleSignOut() {
    const button =
        document.getElementById("signOutButton");

    if (button) {
        button.disabled = true;
        button.classList.add("loading");
    }

    try {
        const { error } =
            await supabase.auth.signOut();

        if (error) {
            throw error;
        }

        localStorage.removeItem(
            "scholartrack_profile"
        );

        window.location.href = "login.html";

    } catch (error) {

        console.error("Sign out error:", error);

        if (button) {
            button.disabled = false;
            button.classList.remove("loading");
        }

        showToast(
            "Unable to sign out. Please try again.",
            "error"
        );
    }
}

/*
|--------------------------------------------------------------------------
| Load Statistics
|--------------------------------------------------------------------------
*/

async function loadStatistics() {
    const totalElement =
        document.getElementById("totalScholars");

    const pendingElement =
        document.getElementById("pendingSubmissions");

    const verifiedElement =
        document.getElementById("verifiedSubmissions");

    const compliantElement =
        document.getElementById("compliantScholars");

    try {

        /*
        |--------------------------------------------------------------
        | Total Scholars
        |--------------------------------------------------------------
        */

        const {
            count: totalScholars,
            error: scholarsError
        } = await supabase
            .from("scholars")
            .select("*", {
                count: "exact",
                head: true
            });

        if (scholarsError) {
            throw scholarsError;
        }


        /*
        |--------------------------------------------------------------
        | Pending Grade Submissions
        |--------------------------------------------------------------
        */

        const {
            count: pendingSubmissions,
            error: pendingError
        } = await supabase
            .from("grade_submissions")
            .select("*", {
                count: "exact",
                head: true
            })
            .in(
                "submission_status",
                [
                    "Pending",
                    "For Verification"
                ]
            );

        if (pendingError) {
            throw pendingError;
        }


        /*
        |--------------------------------------------------------------
        | Verified Grade Submissions
        |--------------------------------------------------------------
        */

        const {
            count: verifiedSubmissions,
            error: verifiedError
        } = await supabase
            .from("grade_submissions")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq(
                "submission_status",
                "Verified"
            );

        if (verifiedError) {
            throw verifiedError;
        }


        /*
        |--------------------------------------------------------------
        | Compliant Scholars
        |--------------------------------------------------------------
        |
        | Uses scholar status because the lab requires the scholar
        | status to be maintained after compliance evaluation.
        |
        */

        const {
            count: compliantScholars,
            error: compliantError
        } = await supabase
            .from("scholars")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq(
                "status",
                "Compliant"
            );

        if (compliantError) {
            throw compliantError;
        }


        if (totalElement) {
            totalElement.textContent =
                formatNumber(totalScholars);
        }

        if (pendingElement) {
            pendingElement.textContent =
                formatNumber(pendingSubmissions);
        }

        if (verifiedElement) {
            verifiedElement.textContent =
                formatNumber(verifiedSubmissions);
        }

        if (compliantElement) {
            compliantElement.textContent =
                formatNumber(compliantScholars);
        }

    } catch (error) {

        console.error(
            "Unable to load dashboard statistics:",
            error
        );

        if (totalElement) {
            totalElement.textContent = "0";
        }

        if (pendingElement) {
            pendingElement.textContent = "0";
        }

        if (verifiedElement) {
            verifiedElement.textContent = "0";
        }

        if (compliantElement) {
            compliantElement.textContent = "0";
        }
    }
}

/*
|--------------------------------------------------------------------------
| Load Recent Submissions
|--------------------------------------------------------------------------
*/

async function loadRecentSubmissions() {
    const tableBody =
        document.getElementById(
            "recentSubmissionsBody"
        );

    if (!tableBody) {
        return;
    }

    try {

        /*
        |--------------------------------------------------------------
        | Fetch recent grade submissions.
        |--------------------------------------------------------------
        | We load the related scholar record so the dashboard can
        | display the scholar's name.
        |--------------------------------------------------------------
        */

        const {
            data,
            error
        } = await supabase
            .from("grade_submissions")
            .select(`
                id,
                scholar_id,
                academic_year,
                semester,
                gwa,
                units_enrolled,
                failed_subjects,
                incomplete_subjects,
                submission_status,
                submitted_at,
                scholars (
                    id,
                    student_id,
                    full_name,
                    degree_program,
                    year_level
                )
            `)
            .order(
                "submitted_at",
                {
                    ascending: false
                }
            )
            .limit(6);

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="empty-table-state">
                            <div class="empty-table-icon">
                                ${getDocumentIcon()}
                            </div>

                            <strong>
                                No grade submissions yet
                            </strong>

                            <span>
                                Recent semester submissions will appear here.
                            </span>
                        </div>
                    </td>
                </tr>
            `;

            return;
        }

        tableBody.innerHTML =
            data
                .map(renderSubmissionRow)
                .join("");

    } catch (error) {

        console.error(
            "Unable to load recent submissions:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-table-state error-state">
                        <div class="empty-table-icon">
                            !
                        </div>

                        <strong>
                            Unable to load submissions
                        </strong>

                        <span>
                            Please refresh the page and try again.
                        </span>
                    </div>
                </td>
            </tr>
        `;
    }
}

function renderSubmissionRow(submission) {
    const scholar =
        submission.scholars || {};

    const scholarName =
        scholar.full_name ||
        `Scholar #${submission.scholar_id || "—"}`;

    const studentId =
        scholar.student_id || "";

    const academicYear =
        submission.academic_year || "—";

    const semester =
        submission.semester || "—";

    const gwa =
        submission.gwa !== null &&
        submission.gwa !== undefined &&
        submission.gwa !== ""
            ? Number(submission.gwa).toFixed(2)
            : "—";

    const status =
        submission.submission_status ||
        "Pending";

    const statusClass =
        getStatusClass(status);

    return `
        <tr>

            <td>

                <div class="scholar-cell">

                    <div class="scholar-avatar">
                        ${escapeHtml(
                            getInitials(scholarName)
                        )}
                    </div>

                    <div class="scholar-cell-info">

                        <strong>
                            ${escapeHtml(scholarName)}
                        </strong>

                        <span>
                            ${escapeHtml(studentId)}
                        </span>

                    </div>

                </div>

            </td>


            <td>

                <div class="academic-period">

                    <strong>
                        ${escapeHtml(academicYear)}
                    </strong>

                    <span>
                        ${escapeHtml(semester)}
                    </span>

                </div>

            </td>


            <td>

                <span class="gwa-value">
                    ${escapeHtml(gwa)}
                </span>

            </td>


            <td>

                <span class="status-badge ${statusClass}">
                    <span class="status-dot"></span>
                    ${escapeHtml(status)}
                </span>

            </td>


            <td>

                <span class="submitted-date">
                    ${escapeHtml(
                        formatDate(
                            submission.submitted_at
                        )
                    )}
                </span>

            </td>

        </tr>
    `;
}

/*
|--------------------------------------------------------------------------
| Helper Text
|--------------------------------------------------------------------------
*/

function getFirstName(fullName) {
    if (!fullName) {
        return "there";
    }

    return String(fullName)
        .trim()
        .split(/\s+/)[0];
}

function formatRole(role) {
    const value = String(role || "staff")
        .replace(/_/g, " ")
        .trim();

    if (!value) {
        return "Staff";
    }

    return value
        .split(" ")
        .map(word =>
            word.charAt(0).toUpperCase() +
            word.slice(1).toLowerCase()
        )
        .join(" ");
}

/*
|--------------------------------------------------------------------------
| Icons
|--------------------------------------------------------------------------
*/

function svgIcon(path, viewBox = "0 0 24 24") {
    return `
        <svg
            viewBox="${viewBox}"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            ${path}
        </svg>
    `;
}

function getUsersIcon() {
    return svgIcon(`
        <path
            d="M16 21V19C16 16.7909 14.2091 15 12 15H6C3.79086 15 2 16.7909 2 19V21"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
        />
        <circle
            cx="9"
            cy="7"
            r="4"
            stroke="currentColor"
            stroke-width="1.8"
        />
        <path
            d="M22 21V19C21.9999 17.1771 20.765 15.586 19 15.13"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
        />
        <path
            d="M16 3.13C17.7699 3.58319 19.0087 5.17683 19.0087 7C19.0087 8.82317 17.7699 10.4168 16 10.87"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
        />
    `);
}

function getClockIcon() {
    return svgIcon(`
        <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            stroke-width="1.8"
        />
        <path
            d="M12 7V12L15.5 14"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    `);
}

function getCheckIcon() {
    return svgIcon(`
        <path
            d="M20 6L9 17L4 12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    `);
}

function getShieldIcon() {
    return svgIcon(`
        <path
            d="M12 3L19 6V11C19 15.5 16.1 19.6 12 21C7.9 19.6 5 15.5 5 11V6L12 3Z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
        />
        <path
            d="M9 12L11 14L15 10"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    `);
}

function getDocumentIcon() {
    return svgIcon(`
        <path
            d="M6 3H14L18 7V21H6V3Z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
        />
        <path
            d="M14 3V7H18"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
        />
        <path
            d="M9 11H15"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
        />
        <path
            d="M9 15H15"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
        />
    `);
}

function getChartIcon() {
    return svgIcon(`
        <path
            d="M4 19V5"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
        />
        <path
            d="M4 19H20"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
        />
        <path
            d="M8 16V12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
        />
        <path
            d="M12 16V8"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
        />
        <path
            d="M16 16V10"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
        />
    `);
}

function getLogoutIcon() {
    return svgIcon(`
        <path
            d="M10 17L15 12L10 7"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
        <path
            d="M15 12H3"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
        />
        <path
            d="M20 19V5C20 3.89543 19.1046 3 18 3H14"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
        />
    `);
}

function getNavIcon(label) {
    switch (label) {
        case "Dashboard":
            return getChartIcon();

        case "Scholars":
            return getUsersIcon();

        case "Scholarship Programs":
            return getShieldIcon();

        case "Grade Submissions":
            return getDocumentIcon();

        case "Compliance":
            return getCheckIcon();

        case "Compliance Reports":
            return getChartIcon();

        case "Scholarship Renewal":
            return getClockIcon();

        case "Search Scholars":
            return getUsersIcon();

        default:
            return getDocumentIcon();
    }
}

/*
|--------------------------------------------------------------------------
| Initialize
|--------------------------------------------------------------------------
*/

async function initializeDashboard() {

    if (!app) {
        console.error(
            "Dashboard app container was not found."
        );

        return;
    }

    const session =
        await checkAuthentication();

    if (!session) {
        return;
    }

    const profile =
        await loadProfile(
            session.user.id
        );

    renderDashboard(profile);

    await Promise.all([
        loadStatistics(),
        loadRecentSubmissions()
    ]);
}

initializeDashboard();