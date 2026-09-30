import { supabase } from "./supabase.js";

import {
    setupLayout,
    escapeHtml,
    statusBadge,
    toast
} from "./layout.js";


let rows = [];


async function init() {

    const profile =
        await setupLayout("compliance");

    if (!profile) return;


    document.getElementById(
        "pageTitle"
    ).textContent =
        "Academic Compliance";


    document.getElementById(
        "pageSubtitle"
    ).textContent =
        "Evaluate verified grades against scholarship requirements";


    document.getElementById(
        "pageContent"
    ).innerHTML = `

        <div class="card">

            <div class="card-header">

                <div>

                    <h3>
                        Compliance Evaluation
                    </h3>

                    <p>
                        Only verified grade submissions
                        can be evaluated.
                    </p>

                </div>

            </div>


            <div
                class="card-body"
                id="complianceTable"
            >
                Loading...
            </div>

        </div>

    `;


    await load();

}


async function load() {

    const box =
        document.getElementById(
            "complianceTable"
        );


    const {
        data,
        error
    } = await supabase
        .from("grade_submissions")
        .select(`
            *,
            scholars(
                id,
                student_id,
                full_name,
                scholarship_id,
                status,
                scholarship_programs(
                    id,
                    program_name,
                    required_gwa,
                    min_units,
                    allow_failing_grade
                )
            )
        `)
        .eq(
            "submission_status",
            "Verified"
        )
        .order(
            "verified_at",
            {
                ascending: false
            }
        );


    if (error) {

        box.innerHTML = `
            <div class="empty-state">
                <strong>
                    Unable to load compliance records
                </strong>
                <p>
                    ${escapeHtml(
                        error.message
                    )}
                </p>
            </div>
        `;

        return;

    }


    rows =
        data || [];


    if (!rows.length) {

        box.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ✓
                </div>

                <strong>
                    No verified submissions
                </strong>

                <p>
                    Verify a grade submission first.
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
                            Scholarship
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
                            Requirement
                        </th>

                        <th>
                            Result
                        </th>

                        <th>
                            Action
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${rows.map(row => {

                        const p =
                            row.scholars
                                ?.scholarship_programs;


                        const result =
                            evaluate(
                                row,
                                p
                            );


                        return `

                            <tr>

                                <td>

                                    <div class="table-name">
                                        ${escapeHtml(
                                            row.scholars
                                                ?.full_name
                                        )}
                                    </div>

                                    <div class="table-sub">
                                        ${escapeHtml(
                                            row.scholars
                                                ?.student_id
                                        )}
                                    </div>

                                </td>


                                <td>
                                    ${escapeHtml(
                                        p?.program_name ||
                                        "Not assigned"
                                    )}
                                </td>


                                <td>
                                    ${row.gwa}
                                </td>


                                <td>
                                    ${row.units_enrolled}
                                </td>


                                <td>
                                    ${row.failed_subjects}
                                </td>


                                <td>

                                    GWA ≤
                                    ${p?.required_gwa ?? "-"}

                                    <br>

                                    Units ≥
                                    ${p?.min_units ?? "-"}

                                </td>


                                <td>
                                    ${statusBadge(
                                        result.status
                                    )}
                                </td>


                                <td>

                                    <button
                                        class="btn ${
                                            result.compliant
                                                ? "btn-success"
                                                : "btn-danger"
                                        }"
                                        onclick="
                                            window.applyCompliance(
                                                '${row.id}',
                                                '${row.scholars.id}',
                                                '${result.status}'
                                            )
                                        "
                                    >
                                        Apply Result
                                    </button>

                                </td>

                            </tr>

                        `;

                    }).join("")}

                </tbody>

            </table>

        </div>

    `;

}


function evaluate(
    row,
    program
) {

    if (!program) {

        return {
            compliant: false,
            status: "With Deficiency"
        };

    }


    const gwaOkay =
        Number(row.gwa) <=
        Number(program.required_gwa);


    const unitsOkay =
        Number(row.units_enrolled) >=
        Number(program.min_units);


    const failedOkay =
        program.allow_failing_grade ||
        Number(row.failed_subjects) === 0;


    const incompleteOkay =
        Number(row.incomplete_subjects) === 0;


    const compliant =
        gwaOkay &&
        unitsOkay &&
        failedOkay &&
        incompleteOkay;


    return {

        compliant,

        status:
            compliant
                ? "Compliant"
                : "With Deficiency"

    };

}


window.applyCompliance =
    async function(
        submissionId,
        scholarId,
        status
    ) {

        const confirmed =
            confirm(
                `Set scholar status to "${status}"?`
            );


        if (!confirmed) return;


        const {
            error
        } = await supabase
            .from("scholars")
            .update({
                status
            })
            .eq(
                "id",
                scholarId
            );


        if (error) {

            toast(
                error.message,
                "error"
            );

            return;

        }


        toast(
            `Scholar marked ${status}.`
        );


        await load();

    };


init();