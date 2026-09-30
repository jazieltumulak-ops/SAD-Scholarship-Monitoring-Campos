import { supabase } from "./supabase.js";

import {
    setupLayout,
    escapeHtml,
    statusBadge,
    toast
} from "./layout.js";


async function init() {

    const profile =
        await setupLayout("reports");

    if (!profile) return;


    document.getElementById(
        "pageTitle"
    ).textContent =
        "Compliance Reports";


    document.getElementById(
        "pageSubtitle"
    ).textContent =
        "Scholarship compliance summary";


    document.getElementById(
        "pageContent"
    ).innerHTML = `

        <div class="page-toolbar">

            <div>

                <strong>
                    Current Scholar Status Report
                </strong>

                <p
                    style="
                        color:#6b7280;
                        font-size:11px;
                    "
                >
                    Summary of current scholarship statuses.
                </p>

            </div>


            <button
                id="printReport"
                class="btn btn-primary"
            >
                🖨 Print Report
            </button>

        </div>


        <div
            id="reportArea"
        >
            Loading...
        </div>

    `;


    document
        .getElementById("printReport")
        .addEventListener(
            "click",
            () => {

                window.print();

            }
        );


    await loadReport();

}


async function loadReport() {

    const area =
        document.getElementById(
            "reportArea"
        );


    const {
        data,
        error
    } = await supabase
        .from("scholars")
        .select(`
            *,
            scholarship_programs(
                program_name
            )
        `)
        .order(
            "full_name"
        );


    if (error) {

        area.innerHTML = `
            <div class="card">
                <div class="empty-state">
                    <strong>
                        Unable to generate report
                    </strong>
                    <p>
                        ${escapeHtml(
                            error.message
                        )}
                    </p>
                </div>
            </div>
        `;

        return;

    }


    const scholars =
        data || [];


    const countStatus =
        status =>
            scholars.filter(
                s => s.status === status
            ).length;


    area.innerHTML = `

        <div class="report-summary">

            <div class="stat-card">

                <div class="report-number">
                    ${scholars.length}
                </div>

                <div class="report-label">
                    Total Scholars
                </div>

            </div>


            <div class="stat-card">

                <div class="report-number">
                    ${countStatus("Compliant")}
                </div>

                <div class="report-label">
                    Compliant
                </div>

            </div>


            <div class="stat-card">

                <div class="report-number">
                    ${countStatus("With Deficiency")}
                </div>

                <div class="report-label">
                    With Deficiency
                </div>

            </div>


            <div class="stat-card">

                <div class="report-number">
                    ${countStatus("For Renewal")}
                </div>

                <div class="report-label">
                    For Renewal
                </div>

            </div>

        </div>


        <div class="card">

            <div class="card-header">

                <div>

                    <h3>
                        Scholar Compliance Report
                    </h3>

                    <p>
                        Generated from current scholar records
                    </p>

                </div>

            </div>


            <div class="card-body">

                <div class="table-wrapper">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Student ID
                                </th>

                                <th>
                                    Scholar
                                </th>

                                <th>
                                    Program
                                </th>

                                <th>
                                    Scholarship
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${scholars.map(s => `

                                <tr>

                                    <td>
                                        ${escapeHtml(
                                            s.student_id
                                        )}
                                    </td>

                                    <td>
                                        ${escapeHtml(
                                            s.full_name
                                        )}
                                    </td>

                                    <td>
                                        ${escapeHtml(
                                            s.degree_program
                                        )}
                                    </td>

                                    <td>
                                        ${escapeHtml(
                                            s.scholarship_programs
                                                ?.program_name ||
                                            "Not assigned"
                                        )}
                                    </td>

                                    <td>
                                        ${statusBadge(
                                            s.status
                                        )}
                                    </td>

                                </tr>

                            `).join("")}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    `;

}


init();