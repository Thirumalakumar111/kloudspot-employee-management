const api = "/api/employees";
const $ = id => document.getElementById(id);

let page = 0, size = 10, totalPages = 0, editing = false, debounce;

const dialog = $("employeeDialog");

const fields = [
    "employeeId",
    "fullName",
    "email",
    "phoneNumber",
    "designation",
    "dateOfJoining",
    "salary",
    "employmentStatus"
];

function showToast(message) {
    $("toast").textContent = message;
    $("toast").style.display = "block";
    setTimeout(() => $("toast").style.display = "none", 2600);
}

function query() {
    const p = new URLSearchParams({ page, size });

    if ($("search").value.trim()) {
        p.set("search", $("search").value.trim());
    }

    if ($("department").value) {
        p.set("department", $("department").value);
    }

    if ($("status").value) {
        p.set("status", $("status").value);
    }

    return p;
}

async function request(url, options = {}) {
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options
    });

    if (!res.ok) {
        let data = {};

        try {
            data = await res.json();
        } catch {}

        throw new Error(
            data.error || data.message || "Request failed"
        );
    }

    if (res.status === 204) return null;

    return res.json();
}

// Update Active and Inactive counts without changing the UI.
async function updateStatusCounts() {
    try {
        const [activeData, inactiveData] = await Promise.all([
            request(`${api}?status=Active&page=0&size=1`),
            request(`${api}?status=Inactive&page=0&size=1`)
        ]);

        $("active").textContent = activeData.totalElements ?? 0;
        $("inactive").textContent = inactiveData.totalElements ?? 0;
    } catch (error) {
        console.error("Could not load employee status counts:", error);
    }
}

async function load() {
    try {
        const data = await request(`${api}?${query()}`);

        totalPages = data.totalPages || 0;

        $("total").textContent = data.totalElements ?? 0;

        const all = data.content || [];

        $("pageInfo").textContent =
            `Page ${(data.number ?? page) + 1} of ${Math.max(data.totalPages || 0, 1)} · ${data.totalElements ?? 0} records`;

        $("prev").disabled = page <= 0;
        $("next").disabled = page >= totalPages - 1;

        render(all);

        // Fetch status counts independently of the current page.
        await updateStatusCounts();

    } catch (e) {
        $("rows").innerHTML =
            `<tr><td colspan="8" class="empty">${escapeHtml(e.message)}. Check that MongoDB and the Spring Boot server are running.</td></tr>`;
    }
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[c]));
}

function render(list) {
    if (!list.length) {
        $("rows").innerHTML =
            '<tr><td colspan="8" class="empty">No employees found</td></tr>';
        return;
    }

    $("rows").innerHTML = list.map(e => `
        <tr>
            <td>
                <span class="person">${escapeHtml(e.fullName)}</span>
                <small>${escapeHtml(e.employeeId)}</small>
            </td>
            <td>
                ${escapeHtml(e.email)}
                <small>${escapeHtml(e.phoneNumber)}</small>
            </td>
            <td>${escapeHtml(e.department)}</td>
            <td>${escapeHtml(e.designation)}</td>
            <td>${escapeHtml(e.dateOfJoining)}</td>
            <td>₹${Number(e.salary).toLocaleString("en-IN")}</td>
            <td>
                <span class="pill ${String(e.employmentStatus).toLowerCase() === "inactive" ? "inactive" : ""}">
                    ${escapeHtml(e.employmentStatus)}
                </span>
            </td>
            <td>
                <div class="actions">
                    <button class="secondary" data-action="view" data-id="${escapeHtml(e.id)}">View</button>
                    <button data-action="edit" data-id="${escapeHtml(e.id)}">Edit</button>
                    <button class="delete" data-action="delete" data-id="${escapeHtml(e.id)}">Delete</button>
                </div>
            </td>
        </tr>
    `).join("");
}

function openForm(employee = null) {
    editing = Boolean(employee);

    $("employeeForm").reset();
    $("error").textContent = "";
    $("formTitle").textContent = editing ? "Edit Employee" : "Add Employee";
    $("saveBtn").textContent = editing ? "Update Employee" : "Save Employee";
    $("id").value = employee?.id || "";

    fields.forEach(k => {
        $(k).value = employee?.[k] ?? "";
    });

    $("formDepartment").value = employee?.department || "";

    dialog.showModal();
}

async function getEmployee(id) {
    return request(`${api}/${encodeURIComponent(id)}`);
}

$("addBtn").addEventListener("click", () => openForm());

$("closeBtn").addEventListener("click", () => dialog.close());
$("cancelBtn").addEventListener("click", () => dialog.close());

$("employeeForm").addEventListener("submit", async event => {
    event.preventDefault();

    const body = {};

    fields.forEach(k => {
        body[k] = $(k).value;
    });

    body.department = $("formDepartment").value;
    body.salary = Number(body.salary);

    try {
        if (editing) {
            await request(`${api}/${encodeURIComponent($("id").value)}`, {
                method: "PUT",
                body: JSON.stringify(body)
            });
        } else {
            await request(api, {
                method: "POST",
                body: JSON.stringify(body)
            });
        }

        dialog.close();

        showToast(editing ? "Employee updated" : "Employee created");

        await load();

    } catch (e) {
        $("error").textContent = e.message;
    }
});

$("rows").addEventListener("click", async event => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const { action, id } = button.dataset;

    try {
        const employee = await getEmployee(id);

        if (action === "edit") {
            openForm(employee);
        }

        if (action === "view") {
            alert(
                `Employee ID: ${employee.employeeId}\n` +
                `Name: ${employee.fullName}\n` +
                `Email: ${employee.email}\n` +
                `Phone: ${employee.phoneNumber}\n` +
                `Department: ${employee.department}\n` +
                `Designation: ${employee.designation}\n` +
                `Joining Date: ${employee.dateOfJoining}\n` +
                `Salary: ₹${employee.salary}\n` +
                `Status: ${employee.employmentStatus}`
            );
        }

        if (action === "delete" && confirm(`Delete ${employee.fullName}?`)) {
            await request(`${api}/${encodeURIComponent(id)}`, {
                method: "DELETE"
            });

            showToast("Employee deleted");

            if (page > 0 && $("rows").querySelectorAll("tr").length === 1) {
                page--;
            }

            await load();
        }

    } catch (e) {
        showToast(e.message);
    }
});

["department", "status"].forEach(id => {
    $(id).addEventListener("change", () => {
        page = 0;
        load();
    });
});

$("search").addEventListener("input", () => {
    clearTimeout(debounce);

    debounce = setTimeout(() => {
        page = 0;
        load();
    }, 300);
});

$("resetBtn").addEventListener("click", () => {
    $("search").value = "";
    $("department").value = "";
    $("status").value = "";
    page = 0;
    load();
});

$("prev").addEventListener("click", () => {
    if (page > 0) {
        page--;
        load();
    }
});

$("next").addEventListener("click", () => {
    if (page < totalPages - 1) {
        page++;
        load();
    }
});

load();