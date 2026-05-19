/* =========================
   ADMIN AUTH CHECK
========================= */

const adminToken = localStorage.getItem("adminToken");

if (!adminToken) {
  window.location.href = "/Admin/admin-login.html";
}

/* =========================
   LOGOUT
========================= */

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("adminToken");

    localStorage.removeItem("adminEmail");

    window.location.href = "/Admin/admin-login.html";
  });
}

/* =========================
   FETCH STOCKS
========================= */

async function fetchStocks() {
  try {
    const response = await fetch(
      "https://ki-vix-management-backend.onrender.com/api/stocks/all",
    );

    const stocks = await response.json();

    const tableBody = document.getElementById("stockTableBody");

    tableBody.innerHTML = "";

    let totalProducts = stocks.length;

    let availableStock = 0;

    let totalSold = 0;

    let lowStock = 0;

    stocks.forEach((item) => {
      availableStock += Number(item.quantity);

      const sold = item.sold || 0;

      totalSold += sold;

      if (item.quantity > 0 && item.quantity <= 10) {
        lowStock++;
      }

      let statusClass = "active";

      let statusText = "In Stock";

      if (item.quantity <= 0) {
        statusClass = "out";

        statusText = "Out Of Stock";
      } else if (item.quantity <= 10) {
        statusClass = "low";

        statusText = "Low Stock";
      }

      tableBody.innerHTML += `
        <tr>
          <td>
            <div class="product-info">
              <img src="${item.image}" />

              <div>
                <h4>${item.name}</h4>

                <span>${item.model}</span>
              </div>
            </div>
          </td>

          <td>${item.brand}</td>

          <td>${item.size}</td>

          <td class="stock-value">${item.quantity}</td>

          <td class="sold-value">${sold}</td>

          <td>
            <input
              type="number"
              class="sell-input"
              placeholder="0"
              min="0"
            />
          </td>

          <td>৳ ${item.price}</td>

          <td>
            <span class="status ${statusClass}">
              ${statusText}
            </span>
          </td>

          <td>
            <div class="action-buttons">

              <button
                class="save-btn"
                data-id="${item._id}"
              >
                <i class="fa-solid fa-floppy-disk"></i>
              </button>

              <button
                class="delete-btn"
                data-id="${item._id}"
              >
                <i class="fa-solid fa-trash"></i>
              </button>

            </div>
          </td>
        </tr>
      `;
    });

    document.getElementById("totalProducts").innerText = totalProducts;

    document.getElementById("availableStock").innerText = availableStock;

    document.getElementById("totalSold").innerText = totalSold;

    document.getElementById("lowStock").innerText = lowStock;

    setupSaveButtons();

    setupDeleteButtons();
  } catch (error) {
    console.log(error);
  }
}

/* =========================
   SAVE BUTTON
========================= */

function setupSaveButtons() {
  const saveButtons = document.querySelectorAll(".save-btn");

  saveButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const row = btn.closest("tr");

      const sellInput = row.querySelector(".sell-input");

      const sellNow = Number(sellInput.value);

      const id = btn.dataset.id;

      if (sellNow <= 0 || isNaN(sellNow)) {
        showToast("Enter Sell Quantity");

        return;
      }

      try {
        const response = await fetch(
          `https://ki-vix-management-backend.onrender.com/api/stocks/sell/${id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              sold: sellNow,
            }),
          },
        );

        const data = await response.json();

        if (data.success) {
          showToast("Stock Updated Successfully");

          fetchStocks();
        } else {
          showToast(data.message);
        }
      } catch (error) {
        console.log(error);

        showToast("Update Failed");
      }
    });
  });
}

/* =========================
   CUSTOM DELETE POPUP
========================= */

function showDeletePopup(callback) {
  const popup = document.getElementById("customPopup");

  const confirmBtn = document.getElementById("confirmPopupBtn");

  const cancelBtn = document.getElementById("cancelPopupBtn");

  popup.classList.add("show");

  const closePopup = () => {
    popup.classList.remove("show");
  };

  confirmBtn.onclick = () => {
    callback();

    closePopup();
  };

  cancelBtn.onclick = () => {
    closePopup();
  };
}

/* =========================
   DELETE BUTTON
========================= */

function setupDeleteButtons() {
  const deleteButtons = document.querySelectorAll(".delete-btn");

  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      showDeletePopup(async () => {
        try {
          const response = await fetch(
            `https://ki-vix-management-backend.onrender.com/api/stocks/delete/${id}`,
            {
              method: "DELETE",
            },
          );

          const data = await response.json();

          if (data.success) {
            showToast("Stock Deleted");

            fetchStocks();
          } else {
            showToast(data.message);
          }
        } catch (error) {
          console.log(error);

          showToast("Delete Failed");
        }
      });
    });
  });
}

/* =========================
   SEARCH
========================= */

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("keyup", () => {
  const value = searchInput.value.toLowerCase();

  const rows = document.querySelectorAll("#stockTableBody tr");

  rows.forEach((row) => {
    const text = row.innerText.toLowerCase();

    if (text.includes(value)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});

/* =========================
   TOAST
========================= */

function showToast(text = "Success") {
  const toast = document.getElementById("successToast");

  toast.querySelector("span").innerText = text;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

/* =========================
   PAGE LOADER
========================= */

window.addEventListener("load", () => {
  const loader = document.getElementById("pageLoader");

  setTimeout(() => {
    loader.classList.add("hide");
  }, 700);

  fetchStocks();
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
