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

      <div class="popup-icon">
        ${type === "success" ? "✅" : type === "error" ? "❌" : "⚠️"}
      </div>

      <div class="popup-message">
        ${message}
      </div>

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
    }, 350);
  }, 2600);
}

// ================= DATE =================

const today = new Date();

document.getElementById("invoiceDate").innerText = today.toLocaleDateString();

// const invoiceNumber = Math.floor(Math.random() * 100000);

// document.getElementById("invoiceNo").innerText = "Invoice #" + invoiceNumber;

document.getElementById("invoiceNo").innerText = "Generating...";

// ================= VARIABLES =================

const itemsBody = document.getElementById("itemsBody");

let subtotal = 0;

let products = [];

// ================= LOAD VIEW INVOICE =================

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  const invoiceId = params.get("id");

  if (invoiceId) {
    loadInvoice(invoiceId);
  }
});

// ================= LOAD SINGLE INVOICE =================

async function loadInvoice(id) {
  try {
    const response = await fetch(
      `https://ki-vix-management-backend.onrender.com/api/invoices/${id}`,
    );

    const invoice = await response.json();

    if (!response.ok) {
      showPopup(invoice.message || "Invoice Not Found ❌", "error");

      return;
    }

    console.log(invoice);

    // ================= CUSTOMER INFO =================

    document.getElementById("customerNameInfo").innerHTML = `
      <strong>${invoice.customerName || ""}</strong>
    `;

    document.getElementById("customerPhoneInfo").innerHTML =
      invoice.customerPhone || "";

    document.getElementById("billTo").innerHTML = `
      Address: ${invoice.customerAddress || ""}
    `;

    document.getElementById("paymentInfo").innerHTML = `
      Payment Method: Cash On Delivery
    `;

    document.getElementById("shipTo").innerHTML = invoice.customerAddress || "";

    document.getElementById("orderDetails").innerHTML = `
      Order Status: Confirmed
    `;

    // ================= INVOICE INFO =================

    document.getElementById("invoiceNo").innerText =
      "Invoice #" + (invoice.invoiceNo || "");

    document.getElementById("invoiceDate").innerText = new Date(
      invoice.createdAt,
    ).toLocaleDateString();

    // ================= PRODUCTS =================

    itemsBody.innerHTML = "";

    /*
      IMPORTANT FIX 🔥

      MongoDB te tomar data te:
      items : Array(empty)

      but frontend e tumi:
      invoice.products use korcho

      tai product dekhaitese na.

      Ekhane products + items duita check kora hoise.
    */

    const invoiceProducts = invoice.products || invoice.items || [];

    if (invoiceProducts.length === 0) {
      itemsBody.innerHTML = `
        <tr>
          <td colspan="5" class="center">
            No Product Found
          </td>
        </tr>
      `;
    } else {
      invoiceProducts.forEach((item) => {
        itemsBody.innerHTML += `
  <tr>
    <td>${item.productName}</td>

    <td class="center">
      ${item.productSize || "N/A"}
    </td>

    <td class="center">${item.qty}</td>

    <td class="right">৳${item.price}</td>

    <td class="right">৳${item.amount}</td>
  </tr>
`;
      });
    }

    // ================= TOTAL =================

    document.getElementById("subtotal").innerText = `৳${invoice.subtotal || 0}`;

    document.getElementById("paid").innerText = `৳${invoice.paid || 0}`;

    document.getElementById("delivery").innerText =
      `৳${invoice.deliveryCharge || 0}`;

    document.getElementById("total").innerText = `৳${invoice.total || 0}`;

    document.getElementById("due").innerText = `৳${invoice.due || 0}`;

    // ================= HIDE INPUT SECTION =================

    const inputSection = document.querySelector(".input-section");

    if (inputSection) {
      inputSection.style.display = "none";
    }
  } catch (error) {
    console.log(error);

    showPopup("Failed To Load Invoice ❌", "error");
  }
}

// ================= ADD PRODUCT =================

function addInvoiceItem() {
  // ================= CUSTOMER INFO =================

  const customerName = document.getElementById("customerName").value.trim();

  const customerPhone = document.getElementById("customerPhone").value.trim();

  const customerAddress = document
    .getElementById("customerAddress")
    .value.trim();

  // ================= PRODUCT INFO =================

  const productName = document.getElementById("productName").value.trim();

  const productSize = document.getElementById("productSize").value.trim();

  const qty = Number(document.getElementById("productQty").value);

  const price = Number(document.getElementById("productPrice").value);

  const delivery = Number(document.getElementById("deliveryInput").value) || 0;

  const paidAmount = Number(document.getElementById("paidInput").value) || 0;

  // ================= VALIDATION =================

  if (
    !customerName ||
    !customerPhone ||
    !customerAddress ||
    !productName ||
    !productSize ||
    qty <= 0 ||
    price <= 0
  ) {
    showPopup("Please fill all fields correctly", "warning");

    return;
  }

  // ================= UI UPDATE =================

  document.getElementById("customerNameInfo").innerHTML = `
    <strong>${customerName}</strong>
  `;

  document.getElementById("customerPhoneInfo").innerHTML = customerPhone;

  document.getElementById("billTo").innerHTML = `
    Address: ${customerAddress}
  `;

  document.getElementById("paymentInfo").innerHTML = `
    Payment Method: Cash On Delivery
  `;

  document.getElementById("shipTo").innerHTML = customerAddress;

  document.getElementById("orderDetails").innerHTML = `
    Order Status: Confirmed
  `;

  // ================= CALCULATION =================

  const amount = qty * price;

  subtotal += amount;

  const total = subtotal + delivery;

  const due = total - paidAmount;

  // ================= SAVE PRODUCT =================

  products.push({
    productName,
    productSize,
    qty,
    price,
    amount,
  });

  // ================= TABLE ROW =================

  itemsBody.innerHTML += `
  <tr>
    <td>${productName}</td>

    <td class="center">${productSize}</td>

    <td class="center">${qty}</td>

    <td class="right">৳${price}</td>

    <td class="right">৳${amount}</td>
  </tr>
`;

  // ================= TOTAL UPDATE =================

  document.getElementById("subtotal").innerText = `৳${subtotal}`;

  document.getElementById("paid").innerText = `৳${paidAmount}`;

  document.getElementById("delivery").innerText = `৳${delivery}`;

  document.getElementById("total").innerText = `৳${total}`;

  document.getElementById("due").innerText = `৳${due}`;

  // ================= CLEAR PRODUCT INPUT =================

  document.getElementById("productName").value = "";

  document.getElementById("productSize").value = "";

  document.getElementById("productQty").value = "";

  document.getElementById("productPrice").value = "";

  showPopup("Product Added Successfully ✅", "success");
}

// ================= SAVE INVOICE =================

async function saveInvoice() {
  // ================= CUSTOMER INFO =================

  const customerName = document.getElementById("customerName").value.trim();

  const customerPhone = document.getElementById("customerPhone").value.trim();

  const customerAddress = document
    .getElementById("customerAddress")
    .value.trim();

  const delivery = Number(document.getElementById("deliveryInput").value) || 0;

  const paidAmount = Number(document.getElementById("paidInput").value) || 0;

  const total = subtotal + delivery;

  const due = total - paidAmount;

  // ================= VALIDATION =================

  if (!customerName || !customerPhone || !customerAddress) {
    showPopup("Customer info missing", "warning");

    return;
  }

  if (products.length === 0) {
    showPopup("Add at least one product", "warning");

    return;
  }

  // ================= API SAVE =================

  try {
    const response = await fetch(
      "https://ki-vix-management-backend.onrender.com/api/invoices",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },

        body: JSON.stringify({
          // invoiceNo: invoiceNumber,

          customerName,

          customerPhone,

          customerAddress,

          // IMPORTANT 🔥
          // backend e items save hoitese kina check koro
          // safest way
          products: products,
          items: products,

          subtotal,

          deliveryCharge: delivery,

          paid: paidAmount,

          total,

          due,
        }),
      },
    );

    const data = await response.json();

    console.log(data);

    if (!response.ok) {
      showPopup(data.message || "Failed To Save Invoice ❌", "error");

      return;
    }

    showPopup("Invoice Saved Successfully ✅", "success");

    document.getElementById("invoiceNo").innerText =
      "Invoice #" + data.invoiceNo;

    // ================= RESET =================

    products = [];

    subtotal = 0;

    itemsBody.innerHTML = "";

    document.getElementById("subtotal").innerText = "";

    document.getElementById("paid").innerText = "";

    document.getElementById("delivery").innerText = "";

    document.getElementById("total").innerText = "";

    document.getElementById("due").innerText = "";

    document.getElementById("customerName").value = "";

    document.getElementById("customerPhone").value = "";

    document.getElementById("customerAddress").value = "";

    document.getElementById("deliveryInput").value = "";

    document.getElementById("paidInput").value = "";

    document.getElementById("customerNameInfo").innerHTML = "";

    document.getElementById("customerPhoneInfo").innerHTML = "";

    document.getElementById("billTo").innerHTML = "";

    document.getElementById("paymentInfo").innerHTML = "";

    document.getElementById("shipTo").innerHTML = "";

    document.getElementById("orderDetails").innerHTML = "";
  } catch (error) {
    console.log(error);

    showPopup("Server Error ❌", "error");
  }
}

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
