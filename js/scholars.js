import { supabase } from "./supabase.js";

import {
    setupLayout,
    escapeHtml,
    statusBadge,
    toast,
    openModal,
    closeModal
} from "./layout.js";


let programs = [];

let scholars = [];


async function init() {

    const profile =
        await setupLayout("scholars");

    if (!profile) return;


    document.getElementById(
        "pageTitle"
    ).textContent =
        "Scholar Management";


    document.getElementById(
        "pageSubtitle"
    ).textContent =
        "Register and manage scholarship scholars";


    document.getElementById(
        "pageContent"
    ).innerHTML = `

        <div class="page-toolbar">

            <div class="toolbar-left">

                <div class="search-box">

                    <span>⌕</span>

                    <input
                        id="searchInput"
                        type="text"
                        placeholder="Search student ID or name..."
                    >

                </div>


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


            <div class="toolbar-right">

                <button
                    id="addScholar"
                    class="btn btn-primary"
                >
                    + Register Scholar
                </button>

            </div>

        </div>


        <div class="card">

            <div class="card-header">

                <div>

                    <h3>
                        Scholar Records
                    </h3>

                    <p id="scholarCount">
                        Loading...
                    </p>

                </div>

            </div>


            <div
                class="card-body"
                id="scholarTable"
            >
                Loading...
            </div>

        </div>

    `;


    document
        .getElementById("addScholar")
        .addEventListener(
            "click",
            () => {

                resetForm();

                openModal("scholarModal");

            }
        );


    document
        .getElementById("searchInput")
        .addEventListener(
            "input",
            render
        );


    document
        .getElementById("statusFilter")
        .addEventListener(
            "change",
            render
        );


    document
        .getElementById("scholarForm")
        .addEventListener(
            "submit",
            saveScholar
        );


    await loadPrograms();

    await loadScholars();

}


async function loadPrograms() {

    const {
        data,
        error
    } = await supabase
        .from("scholarship_programs")
        .select("*")
        .order(
            "program_name"
        );


    if (error) {

        toast(
            error.message,
            "error"
        );

        return;

    }


    programs =
        data || [];


    const select =
        document.getElementById(
            "scholarshipId"
        );


    select.innerHTML = `
        <option value="">
            Select scholarship
        </option>

        ${programs
            .filter(p => p.active)
            .map(p => `
                <option value="${p.id}">
                    ${escapeHtml(
                        p.program_name
                    )}
                </option>
            `)
            .join("")}
    `;

}


async function loadScholars() {

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
            "created_at",
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


    scholars =
        data || [];


    render();

}


function render() {

    const box =
        document.getElementById(
            "scholarTable"
        );


    const search =
        document.getElementById(
            "searchInput"
        )
        .value
        .trim()
        .toLowerCase();


    const status =
        document.getElementById(
            "statusFilter"
        ).value;


    const filtered =
        scholars.filter(s => {

            const matchesSearch =
                !search ||
                s.student_id
                    ?.toLowerCase()
                    .includes(search) ||
                s.full_name
                    ?.toLowerCase()
                    .includes(search);


            const matchesStatus =
                !status ||
                s.status === status;


            return (
                matchesSearch &&
                matchesStatus
            );

        });


    document.getElementById(
        "scholarCount"
    ).textContent =
        `${filtered.length} scholar record(s)`;


    if (!filtered.length) {

        box.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    👥
                </div>

                <strong>
                    No scholars found
                </strong>

                <p>
                    Try another search or register a scholar.
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
                            Degree Program
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

                        <th>
                            Actions
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


                            <td>

                                <button
                                    class="btn btn-secondary"
                                    onclick="window.editScholar('${s.id}')"
                                >
                                    Edit
                                </button>

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>

    `;

}


function yearText(year) {

    const years = {
        1: "1st Year",
        2: "2nd Year",
        3: "3rd Year",
        4: "4th Year"
    };


    return years[year] || "-";

}


function resetForm() {

    document.getElementById(
        "scholarForm"
    ).reset();


    document.getElementById(
        "scholarId"
    ).value = "";


    document.getElementById(
        "scholarModalTitle"
    ).textContent =
        "Register Scholar";

}


window.editScholar = async function(id) {

    const scholar =
        scholars.find(
            s => String(s.id) === String(id)
        );


    if (!scholar) return;


    document.getElementById(
        "scholarModalTitle"
    ).textContent =
        "Edit Scholar";


    document.getElementById(
        "scholarId"
    ).value =
        scholar.id;


    document.getElementById(
        "studentId"
    ).value =
        scholar.student_id;


    document.getElementById(
        "fullName"
    ).value =
        scholar.full_name;


    document.getElementById(
        "degreeProgram"
    ).value =
        scholar.degree_program;


    document.getElementById(
        "yearLevel"
    ).value =
        scholar.year_level;


    document.getElementById(
        "scholarshipId"
    ).value =
        scholar.scholarship_id;


    document.getElementById(
        "status"
    ).value =
        scholar.status;


    openModal(
        "scholarModal"
    );

};


async function saveScholar(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "scholarId"
        ).value;


    const studentId =
        document.getElementById(
            "studentId"
        ).value
        .trim();


    const fullName =
        document.getElementById(
            "fullName"
        ).value
        .trim();


    const degreeProgram =
        document.getElementById(
            "degreeProgram"
        ).value
        .trim();


    const yearLevel =
        Number(
            document.getElementById(
                "yearLevel"
            ).value
        );


    const scholarshipId =
        document.getElementById(
            "scholarshipId"
        ).value;


    const status =
        document.getElementById(
            "status"
        ).value;


    if (!studentId) {

        toast(
            "Student ID is required.",
            "error"
        );

        return;

    }


    if (!scholarshipId) {

        toast(
            "Please select a scholarship program.",
            "error"
        );

        return;

    }


    const duplicate =
        scholars.find(
            s =>
                s.student_id
                    ?.toLowerCase() ===
                    studentId.toLowerCase() &&
                String(s.id) !== String(id)
        );


    if (duplicate) {

        toast(
            "Student ID already exists.",
            "error"
        );

        return;

    }


    const payload = {

        student_id:
            studentId,

        full_name:
            fullName,

        degree_program:
            degreeProgram,

        year_level:
            yearLevel,

        scholarship_id:
            scholarshipId,

        status:
            status

    };


    let error;


    if (id) {

        ({
            error
        } = await supabase
            .from("scholars")
            .update(payload)
            .eq("id", id));

    } else {

        ({
            error
        } = await supabase
            .from("scholars")
            .insert(payload));

    }


    if (error) {

        toast(
            error.message,
            "error"
        );

        return;

    }


    toast(
        id
            ? "Scholar updated successfully."
            : "Scholar registered successfully."
    );


    closeModal(
        "scholarModal"
    );


    await loadScholars();

}


init();