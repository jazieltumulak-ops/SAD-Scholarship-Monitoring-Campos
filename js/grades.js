import { supabase } from "./supabase.js";

import {
    setupLayout,
    escapeHtml,
    statusBadge,
    toast,
    openModal
} from "./layout.js";


let submissions = [];


async function init() {

    const profile =
        await setupLayout("grades");

    if (!profile) return;


    document.getElementById(
        "pageTitle"
    ).textContent =
        "Grade Submissions";


    document.getElementById(
        "pageSubtitle"
    ).textContent =
        "Submit and verify semester academic records";


    document.getElementById(
        "pageContent"
    ).innerHTML = `

        <div class="page-toolbar">

            <div class="toolbar-left">

                <select
                    id="gradeStatusFilter"
                    class="filter-select"
                >

                    <option value="">
                        All Statuses
                    </option>

                    <option value="Pending">
                        Pending
                    </option>

                    <option value="For Verification">
                        For Verification
                    </option>

                    <option value="Verified">
                        Verified
                    </option>

                    <option value="Returned">
                        Returned
                    </option>

                </select>

            </div>


            <button
                id="addGrade"
                class="btn btn-primary"
            >
                + Submit Grades
            </button>

        </div>


        <div class="card">

            <div class="card-header">

                <div>

                    <h3>
                        Semester Grade Submissions
                    </h3>

                    <p>
                        Pending submissions must be verified
                        before compliance evaluation.
                    </p>

                </div>

            </div>


            <div
                class="card-body"
                id="gradeTable"
            >
                Loading...
            </div>

        </div>

    `;


    document
        .getElementById("addGrade")
        .addEventListener(
            "click",
            async () => {

                await loadScholarOptions();

                openModal(
                    "gradeModal"
                );

            }
        );


    document
        .getElementById(
            "gradeStatusFilter"
        )
        .addEventListener(
            "change",
            render
        );


    document
        .getElementById("gradeForm")
        .addEventListener(
            "submit",
            submitGrade
        );


    await loadSubmissions();

}


async function loadScholarOptions() {

    const select =
        document.getElementById(
            "gradeScholar"
        );


    const {
        data,
        error
    } = await supabase
        .from("scholars")
        .select(
            "id, student_id, full_name"
        )
        .order(
            "full_name"
        );


    if (error) {

        toast(
            error.message,
            "error"
        );

        return;

    }


    select.innerHTML = `

        <option value="">
            Select scholar
        </option>

        ${data.map(s => `

            <option value="${s.id}">

                ${escapeHtml(
                    s.full_name
                )}
                —
                ${escapeHtml(
                    s.student_id
                )}

            </option>

        `).join("")}

    `;

}


async function loadSubmissions() {

    const {
        data,
        error
    } = await supabase
        .from("grade_submissions")
        .select(`
            *,
            scholars(
                student_id,
                full_name
            )
        `)
        .order(
            "submitted_at",
            {
                ascending: false
            }
        );


    if (error) {

        toast(
            error.message,
            "error"
        );

        return;

    }


    submissions =
        data || [];


    render();

}


function render() {

    const box =
        document.getElementById(
            "gradeTable"
        );


    const filter =
        document.getElementById(
            "gradeStatusFilter"
        ).value;


    const rows =
        submissions.filter(
            s =>
                !filter ||
                s.submission_status ===
                    filter
        );


    if (!rows.length) {

        box.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    📝
                </div>

                <strong>
                    No submissions found
                </strong>

                <p>
                    Submit semester grades to begin monitoring.
                </p>

            </div>
        `;

        return;

    }


    box.innerHTML = `

        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>
                            Scholar
                        </th>

                        <th>
                            Academic Period
                        </th>

                        <th>
                            GWA
                        </th>

                        <th>
                            Units
                        </th>

                        <th>
                            Failed
                        </th>

                        <th>
                            Incomplete
                        </th>

                        <th>
                            Status
                        </th>

                        <th>
                            Action
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${rows.map(s => `

                        <tr>

                            <td>

                                <div class="table-name">
                                    ${escapeHtml(
                                        s.scholars?.full_name
                                    )}
                                </div>

                                <div class="table-sub">
                                    ${escapeHtml(
                                        s.scholars?.student_id
                                    )}
                                </div>

                            </td>


                            <td>

                                ${escapeHtml(
                                    s.academic_year
                                )}

                                <br>

                                <span class="table-sub">
                                    ${escapeHtml(
                                        s.semester
                                    )}
                                </span>

                            </td>


                            <td>
                                ${s.gwa}
                            </td>


                            <td>
                                ${s.units_enrolled}
                            </td>


                            <td>
                                ${s.failed_subjects}
                            </td>


                            <td>
                                ${s.incomplete_subjects}
                            </td>


                            <td>
                                ${statusBadge(
                                    s.submission_status
                                )}
                            </td>


                            <td>

                                ${
                                    s.submission_status !==
                                        "Verified"
                                    ? `
                                        <button
                                            class="btn btn-success"
                                            onclick="
                                                window.verifyGrade('${s.id}')
                                            "
                                        >
                                            Verify
                                        </button>
                                    `
                                    : `
                                        <span
                                            style="
                                                color:#16a34a;
                                                font-size:10px;
                                                font-weight:700;
                                            "
                                        >
                                            Verified
                                        </span>
                                    `
                                }

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>

    `;

}


async function submitGrade(event) {

    event.preventDefault();


    const scholarId =
        document.getElementById(
            "gradeScholar"
        ).value;


    const academicYear =
        document.getElementById(
            "academicYear"
        ).value.trim();


    const semester =
        document.getElementById(
            "semester"
        ).value;


    const gwa =
        Number(
            document.getElementById(
                "gwa"
            ).value
        );


    const units =
        Number(
            document.getElementById(
                "unitsEnrolled"
            ).value
        );


    const failed =
        Number(
            document.getElementById(
                "failedSubjects"
            ).value || 0
        );


    const incomplete =
        Number(
            document.getElementById(
                "incompleteSubjects"
            ).value || 0
        );


    if (!scholarId) {

        toast(
            "Please select a scholar.",
            "error"
        );

        return;

    }


    if (
        gwa < 1 ||
        gwa > 5
    ) {

        toast(
            "GWA must be between 1.00 and 5.00.",
            "error"
        );

        return;

    }


    if (
        units < 0 ||
        failed < 0 ||
        incomplete < 0
    ) {

        toast(
            "Numeric values cannot be negative.",
            "error"
        );

        return;

    }


    const {
        error
    } = await supabase
        .from("grade_submissions")
        .insert({

            scholar_id:
                scholarId,

            academic_year:
                academicYear,

            semester:
                semester,

            gwa:
                gwa,

            units_enrolled:
                units,

            failed_subjects:
                failed,

            incomplete_subjects:
                incomplete,

            submission_status:
                "Pending",

            submitted_at:
                new Date().toISOString()

        });


    if (error) {

        toast(
            error.message,
            "error"
        );

        return;

    }


    toast(
        "Grade submission saved as Pending."
    );


    document
        .getElementById("gradeForm")
        .reset();


    document
        .getElementById("gradeModal")
        .classList.remove(
            "show"
        );


    await loadSubmissions();

}


window.verifyGrade = async function(id) {

    const {
        data: {
            user
        }
    } =
        await supabase.auth.getUser();


    if (!user) {

        toast(
            "You must be logged in.",
            "error"
        );

        return;

    }


    const confirmVerify =
        confirm(
            "Verify this grade submission?"
        );


    if (!confirmVerify) return;


    const {
        error
    } = await supabase
        .from("grade_submissions")
        .update({

            submission_status:
                "Verified",

            verified_by:
                user.id,

            verified_at:
                new Date().toISOString()

        })
        .eq(
            "id",
            id
        )
        .neq(
            "submission_status",
            "Verified"
        );


    if (error) {

        toast(
            error.message,
            "error"
        );

        return;

    }


    toast(
        "Grade submission verified."
    );


    await loadSubmissions();

};


init();