import { supabase } from "./supabase.js";

import {
    setupLayout,
    escapeHtml,
    statusBadge,
    toast
} from "./layout.js";


let scholars = [];


async function init() {

    const profile =
        await setupLayout("renewal");

    if (!profile) return;


    document.getElementById(
        "pageTitle"
    ).textContent =
        "Scholarship Renewal";


    document.getElementById(
        "pageSubtitle"
    ).textContent =
        "Process scholarship renewal status";


    document.getElementById(
        "pageContent"
    ).innerHTML = `

        <div class="card">

            <div class="card-header">

                <div>

                    <h3>
                        Renewal Management
                    </h3>

                    <p>
                        Update scholars for renewal processing.
                    </p>

                </div>

            </div>


            <div
                class="card-body"
                id="renewalTable"
            >
                Loading...
            </div>

        </div>

    `;


    await load();

}


async function load() {

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
            "renewalTable"
        );


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
                            Current Status
                        </th>

                        <th>
                            Renewal Action
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${scholars.map(s => `

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
                                    onclick="
                                        window.setRenewal(
                                            '${s.id}',
                                            'For Renewal'
                                        )
                                    "
                                >
                                    For Renewal
                                </button>


                                <button
                                    class="btn btn-success"
                                    onclick="
                                        window.setRenewal(
                                            '${s.id}',
                                            'Renewed'
                                        )
                                    "
                                >
                                    Renew
                                </button>

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>

    `;

}


window.setRenewal =
    async function(
        id,
        status
    ) {

        const {
            error
        } = await supabase
            .from("scholars")
            .update({
                status
            })
            .eq(
                "id",
                id
            );


        if (error) {

            toast(
                error.message,
                "error"
            );

            return;

        }


        toast(
            `Scholar status updated to ${status}.`
        );


        await load();

    };


init();