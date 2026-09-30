import { supabase } from "./supabase.js";

import {
    setupLayout,
    escapeHtml,
    statusBadge
} from "./layout.js";


let scholars = [];

let programs = [];


async function init() {

    const profile =
        await setupLayout("search");

    if (!profile) return;


    document.getElementById(
        "pageTitle"
    ).textContent =
        "Search Scholars";


    document.getElementById(
        "pageSubtitle"
    ).textContent =
        "Search and filter scholarship records";


    document.getElementById(
        "pageContent"
    ).innerHTML = `

        <div class="page-toolbar">

            <div class="toolbar-left">

                <div class="search-box">

                    <span>⌕</span>

                    <input
                        id="search"
                        type="text"
                        placeholder="Search Student ID or name..."
                    >

                </div>


                <select
                    id="programFilter"
                    class="filter-select"
                >

                    <option value="">
                        All Scholarship Programs
                    </option>

                </select>


                <select
                    id="statusFilter"
                    class="filter-select"
                >

                    <option value="">
                        All Statuses
                    </option>

                    <option>
                        Active
                    </option>

                    <option>
                        Pending Submission
                    </option>

                    <option>
                        For Verification
                    </option>

                    <option>
                        Compliant
                    </option>

                    <option>
                        With Deficiency
                    </option>

                    <option>
                        Probationary
                    </option>

                    <option>
                        For Renewal
                    </option>

                    <option>
                        Renewed
                    </option>

                    <option>
                        Disqualified
                    </option>

                </select>

            </div>

        </div>


        <div class="card">

            <div class="card-header">

                <div>

                    <h3>
                        Search Results
                    </h3>

                    <p id="resultCount">
                        Loading...
                    </p>

                </div>

            </div>


            <div
                class="card-body"
                id="results"
            >
                Loading...
            </div>

        </div>

    `;


    document
        .getElementById("search")
        .addEventListener(
            "input",
            render
        );


    document
        .getElementById("programFilter")
        .addEventListener(
            "change",
            render
        );


    document
        .getElementById("statusFilter")
        .addEventListener(
            "change",
            render
        );


    await loadPrograms();

    await loadScholars();

}


async function loadPrograms() {

    const {
        data
    } = await supabase
        .from("scholarship_programs")
        .select(
            "id, program_name"
        )
        .order(
            "program_name"
        );


    programs =
        data || [];


    document.getElementById(
        "programFilter"
    ).innerHTML = `

        <option value="">
            All Scholarship Programs
        </option>

        ${programs.map(p => `

            <option value="${p.id}">
                ${escapeHtml(
                    p.program_name
                )}
            </option>

        `).join("")}

    `;

}


async function loadScholars() {

    const {
        data
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


    scholars =
        data || [];


    render();

}


function render() {

    const search =
        document.getElementById(
            "search"
        )
        .value
        .trim()
        .toLowerCase();


    const program =
        document.getElementById(
            "programFilter"
        ).value;


    const status =
        document.getElementById(
            "statusFilter"
        ).value;


    const filtered =
        scholars.filter(s => {

            const textMatch =
                !search ||
                s.student_id
                    ?.toLowerCase()
                    .includes(search) ||
                s.full_name
                    ?.toLowerCase()
                    .includes(search);


            const programMatch =
                !program ||
                String(
                    s.scholarship_id
                ) === String(program);


            const statusMatch =
                !status ||
                s.status === status;


            return (
                textMatch &&
                programMatch &&
                statusMatch
            );

        });


    document.getElementById(
        "resultCount"
    ).textContent =
        `${filtered.length} matching scholar(s)`;


    const box =
        document.getElementById(
            "results"
        );


    if (!filtered.length) {

        box.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🔍
                </div>

                <strong>
                    No matching scholars
                </strong>

                <p>
                    Try changing your search or filters.
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
                            Student
                        </th>

                        <th>
                            Degree
                        </th>

                        <th>
                            Year
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

                    ${filtered.map(s => `

                        <tr>

                            <td>

                                <div class="table-name">
                                    ${escapeHtml(
                                        s.full_name
                                    )}
                                </div>

                                <div class="table-sub">
                                    ${escapeHtml(
                                        s.student_id
                                    )}
                                </div>

                            </td>


                            <td>
                                ${escapeHtml(
                                    s.degree_program
                                )}
                            </td>


                            <td>
                                ${yearText(
                                    s.year_level
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

    `;

}


function yearText(year) {

    return {
        1: "1st Year",
        2: "2nd Year",
        3: "3rd Year",
        4: "4th Year"
    }[year] || "-";

}


init();