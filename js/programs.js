import { supabase } from "./supabase.js";

import {
    setupLayout,
    escapeHtml,
    toast,
    openModal,
    closeModal
} from "./layout.js";


let programs = [];


async function init() {

    const profile =
        await setupLayout("programs");

    if (!profile) return;


    document.getElementById(
        "pageTitle"
    ).textContent =
        "Scholarship Programs";


    document.getElementById(
        "pageSubtitle"
    ).textContent =
        "Configure academic scholarship requirements";


    document.getElementById(
        "pageContent"
    ).innerHTML = `

        <div class="page-toolbar">

            <div>

                <strong>
                    Scholarship Requirements
                </strong>

                <div
                    style="
                        color:#6b7280;
                        font-size:11px;
                        margin-top:3px;
                    "
                >
                    Each scholarship may have different rules.
                </div>

            </div>


            <button
                id="addProgram"
                class="btn btn-primary"
            >
                + Add Program
            </button>

        </div>


        <div
            id="programList"
            class="stats-grid"
            style="
                grid-template-columns:
                repeat(3,minmax(0,1fr));
            "
        >
            Loading...
        </div>

    `;


    document
        .getElementById("addProgram")
        .addEventListener(
            "click",
            () => {

                resetForm();

                openModal(
                    "programModal"
                );

            }
        );


    document
        .getElementById("programForm")
        .addEventListener(
            "submit",
            saveProgram
        );


    await loadPrograms();

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


    render();

}


function render() {

    const box =
        document.getElementById(
            "programList"
        );


    if (!programs.length) {

        box.innerHTML = `
            <div class="card">
                <div class="empty-state">
                    <div class="empty-icon">
                        🎓
                    </div>
                    <strong>
                        No scholarship programs
                    </strong>
                    <p>
                        Add a program to configure requirements.
                    </p>
                </div>
            </div>
        `;

        return;

    }


    box.innerHTML =
        programs.map(p => `

            <div class="card">

                <div class="card-body">

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            gap:10px;
                        "
                    >

                        <div>

                            <h3
                                style="
                                    font-size:15px;
                                    margin-bottom:4px;
                                "
                            >
                                ${escapeHtml(
                                    p.program_name
                                )}
                            </h3>

                            <div
                                style="
                                    color:#6b7280;
                                    font-size:10px;
                                "
                            >
                                ${
                                    p.active
                                        ? "Active"
                                        : "Inactive"
                                }
                            </div>

                        </div>


                        <button
                            class="btn btn-secondary"
                            onclick="window.editProgram('${p.id}')"
                        >
                            Edit
                        </button>

                    </div>


                    <div
                        style="
                            margin-top:20px;
                            display:grid;
                            grid-template-columns:
                            repeat(3,1fr);
                            gap:8px;
                        "
                    >

                        <div
                            style="
                                background:#f8fafc;
                                padding:10px;
                                border-radius:9px;
                            "
                        >
                            <small>
                                Required GWA
                            </small>

                            <strong
                                style="
                                    display:block;
                                    margin-top:3px;
                                "
                            >
                                ${p.required_gwa}
                            </strong>
                        </div>


                        <div
                            style="
                                background:#f8fafc;
                                padding:10px;
                                border-radius:9px;
                            "
                        >
                            <small>
                                Minimum Units
                            </small>

                            <strong
                                style="
                                    display:block;
                                    margin-top:3px;
                                "
                            >
                                ${p.min_units}
                            </strong>
                        </div>


                        <div
                            style="
                                background:#f8fafc;
                                padding:10px;
                                border-radius:9px;
                            "
                        >
                            <small>
                                Failing Grade
                            </small>

                            <strong
                                style="
                                    display:block;
                                    margin-top:3px;
                                "
                            >
                                ${
                                    p.allow_failing_grade
                                        ? "Allowed"
                                        : "Not Allowed"
                                }
                            </strong>
                        </div>

                    </div>

                </div>

            </div>

        `).join("");

}


function resetForm() {

    document
        .getElementById("programForm")
        .reset();


    document.getElementById(
        "programId"
    ).value = "";


    document.getElementById(
        "programModalTitle"
    ).textContent =
        "Add Scholarship Program";

}


window.editProgram = function(id) {

    const program =
        programs.find(
            p =>
                String(p.id) ===
                String(id)
        );


    if (!program) return;


    document.getElementById(
        "programModalTitle"
    ).textContent =
        "Edit Scholarship Program";


    document.getElementById(
        "programId"
    ).value =
        program.id;


    document.getElementById(
        "programName"
    ).value =
        program.program_name;


    document.getElementById(
        "requiredGwa"
    ).value =
        program.required_gwa;


    document.getElementById(
        "minUnits"
    ).value =
        program.min_units;


    document.getElementById(
        "allowFailing"
    ).value =
        String(
            program.allow_failing_grade
        );


    document.getElementById(
        "programActive"
    ).value =
        String(
            program.active
        );


    openModal(
        "programModal"
    );

};


async function saveProgram(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "programId"
        ).value;


    const programName =
        document.getElementById(
            "programName"
        ).value.trim();


    const requiredGwa =
        Number(
            document.getElementById(
                "requiredGwa"
            ).value
        );


    const minUnits =
        Number(
            document.getElementById(
                "minUnits"
            ).value
        );


    const allowFailing =
        document.getElementById(
            "allowFailing"
        ).value === "true";


    const active =
        document.getElementById(
            "programActive"
        ).value === "true";


    if (!programName) {

        toast(
            "Program name is required.",
            "error"
        );

        return;

    }


    if (
        requiredGwa < 1 ||
        requiredGwa > 5
    ) {

        toast(
            "GWA must be between 1.00 and 5.00.",
            "error"
        );

        return;

    }


    if (minUnits < 0) {

        toast(
            "Minimum units cannot be negative.",
            "error"
        );

        return;

    }


    const payload = {

        program_name:
            programName,

        required_gwa:
            requiredGwa,

        min_units:
            minUnits,

        allow_failing_grade:
            allowFailing,

        active

    };


    let error;


    if (id) {

        ({
            error
        } = await supabase
            .from("scholarship_programs")
            .update(payload)
            .eq("id", id));

    } else {

        ({
            error
        } = await supabase
            .from("scholarship_programs")
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
            ? "Program updated."
            : "Program created."
    );


    closeModal(
        "programModal"
    );


    await loadPrograms();

}


init();