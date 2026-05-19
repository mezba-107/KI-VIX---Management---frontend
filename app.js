/* =========================
   ADMIN AUTH CHECK
========================= */

const adminToken = localStorage.getItem("adminToken");

if (!adminToken) {
  window.location.href = "/Admin/admin-login.html";
}

/* =========================
   CUSTOM POPUP
========================= */

function showPopup(message, type = "success") {
  const oldPopup = document.querySelector(".custom-popup");

  if (oldPopup) {
    oldPopup.remove();
  }

  const popup = document.createElement("div");

  popup.className = `custom-popup ${type}`;

  popup.innerHTML = `
    <div class="popup-content">
      <span class="popup-icon">
        ${type === "success" ? "✅" : type === "error" ? "❌" : "⚠️"}
      </span>

      <span class="popup-message">
        ${message}
      </span>
    </div>
  `;

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.classList.add("show");
  }, 10);

  setTimeout(() => {
    popup.classList.remove("show");

    setTimeout(() => {
      popup.remove();
    }, 300);
  }, 2500);
}

/* =========================
   CUSTOM CONFIRM POPUP
========================= */

function showConfirmPopup(message) {
  return new Promise((resolve) => {
    const oldPopup = document.querySelector(".confirm-popup");

    if (oldPopup) {
      oldPopup.remove();
    }

    const popup = document.createElement("div");

    popup.className = "confirm-popup";

    popup.innerHTML = `
      <div class="confirm-box">

        <div class="confirm-icon">
          ⚠️
        </div>

        <h2>Delete Invoice?</h2>

        <p>${message}</p>

        <div class="confirm-actions">

          <button class="cancel-confirm">
            Cancel
          </button>

          <button class="ok-confirm">
            Delete
          </button>

        </div>

      </div>
    `;

    document.body.appendChild(popup);

    setTimeout(() => {
      popup.classList.add("show");
    }, 10);

    popup.querySelector(".cancel-confirm").addEventListener("click", () => {
      popup.remove();

      resolve(false);
    });

    popup.querySelector(".ok-confirm").addEventListener("click", () => {
      popup.remove();

      resolve(true);
    });
  });
}

const invoiceList = document.getElementById("invoiceList");

const searchInput = document.getElementById("searchInput");

/* =========================
   INVOICES
========================= */

let invoices = [];

/* =========================
   FETCH INVOICES
========================= */

async function fetchInvoices() {
  const loader = document.getElementById("pageLoader");

  try {
    /* SHOW LOADER */
    loader.classList.remove("hide");

    const response = await fetch("http://localhost:5000/api/invoices");

    const data = await response.json();

    invoices = data;

    renderInvoices(invoices);

    updateStats(invoices);

    /* HIDE LOADER */
    setTimeout(() => {
      loader.classList.add("hide");
    }, 500);
  } catch (error) {
    console.log(error);

    loader.classList.add("hide");

    showPopup("Failed To Load Invoices", "error");
  }
}

/* =========================
   RENDER
========================= */

function renderInvoices(data) {
  invoiceList.innerHTML = "";

  data.forEach((invoice) => {
    let statusText = "";
    let statusClass = "";

    if (invoice.due <= 0) {
      statusText = "✅ Paid";

      statusClass = "status-paid";
    } else if (invoice.paid > 0) {
      statusText = `⚠️ Partial (৳${invoice.due} Due)`;

      statusClass = "status-due";
    } else {
      statusText = `❌ Due (৳${invoice.due})`;

      statusClass = "status-due";
    }

    invoiceList.innerHTML += `

   <div class="invoice-row">

    <div class="invoice-info">

      <div class="invoice-number">
        #${invoice.invoiceNo}
      </div>

      <div class="created-by">
        Created by ${invoice.createdBy || "Admin"}
      </div>

    </div>

    <div>${invoice.customerName}</div>

    <div>${invoice.customerPhone}</div>

    <div>৳${invoice.total}</div>

    <div class="${statusClass}">
      ${statusText}
    </div>

    <div>
      ${new Date(invoice.createdAt).toLocaleDateString()}
    </div>

    <div class="action-buttons">

      <a
        href="/Admin/admin-invoice.html?id=${invoice._id}"
        class="view-btn"
      >
        View
      </a>

      ${
        invoice.due > 0
          ? `
        <button
          class="paid-btn"
          onclick="markAsPaid('${invoice._id}')"
        >
          ✓ Paid
        </button>
      `
          : `
        <button class="done-btn">
          Paid
        </button>
      `
      }

      <button
        class="delete-btn"
        onclick="deleteInvoice('${invoice._id}')"
      >
        Delete
      </button>

    </div>

  </div>

`;
  });
}

/* =========================
   STATS
========================= */

function updateStats(data) {
  document.getElementById("totalInvoices").innerText = data.length;

  // TOTAL PAID INVOICES
  const paidInvoices = data.filter((i) => i.due <= 0);

  // TOTAL DUE INVOICES
  const dueInvoices = data.filter((i) => i.due > 0);

  // COUNT
  document.getElementById("paidInvoices").innerHTML = `
    ${paidInvoices.length}
    <span class="money-text">
      ৳${data.reduce((sum, i) => sum + i.paid, 0)}
    </span>
  `;

  document.getElementById("dueInvoices").innerHTML = `
    ${dueInvoices.length}
    <span class="money-text due-money">
      ৳${data.reduce((sum, i) => sum + i.due, 0)}
    </span>
  `;
}

/* =========================
   SEARCH
========================= */

searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();

  const filtered = invoices.filter((invoice) => {
    return (
      invoice.customerName.toLowerCase().includes(value) ||
      invoice.customerPhone.includes(value) ||
      invoice.invoiceNo.toString().includes(value)
    );
  });

  renderInvoices(filtered);
});

/* =========================
   LOGOUT
========================= */

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("adminToken");

  localStorage.removeItem("adminEmail");

  showPopup("Logout Success", "success");

  setTimeout(() => {
    window.location.href = "/Admin/admin-login.html";
  }, 1000);
});
/* =========================
   MARK AS PAID
========================= */

async function markAsPaid(id) {
  try {
    const invoice = invoices.find((item) => item._id === id);

    if (!invoice) return;

    const response = await fetch(`http://localhost:5000/api/invoices/${id}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        paid: invoice.total,
        due: 0,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      showPopup(data.message || "Failed To Update", "error");

      return;
    }

    // LOCAL UPDATE
    invoice.paid = invoice.total;

    invoice.due = 0;

    renderInvoices(invoices);

    updateStats(invoices);

    showPopup("Invoice marked as PAID", "success");
  } catch (error) {
    console.log(error);

    showPopup("Server Error", "error");
  }
}

/* =========================
   DELETE INVOICE
========================= */

async function deleteInvoice(id) {
  const confirmDelete = await showConfirmPopup(
    "Are you sure you want to delete this invoice?",
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(`http://localhost:5000/api/invoices/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      showPopup(data.message || "Failed To Delete", "error");

      return;
    }

    invoices = invoices.filter((invoice) => invoice._id !== id);

    renderInvoices(invoices);

    updateStats(invoices);

    showPopup("Invoice Deleted Successfully", "success");
  } catch (error) {
    console.log(error);

    showPopup("Server Error", "error");
  }
}

/* =========================
   INIT
========================= */

fetchInvoices();

/* =========================
   PAGE LOADER
========================= */

window.addEventListener("load", () => {
  const loader = document.getElementById("pageLoader");

  setTimeout(() => {
    loader.classList.add("hide");
  }, 700);
});

/* =========================
   SHOW LOADER ON NAVIGATION
========================= */

document.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    const loader = document.getElementById("pageLoader");

    loader.classList.remove("hide");
  });
});
