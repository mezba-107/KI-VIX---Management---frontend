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
      <i class="fa-solid ${
        type === "success" ? "fa-circle-check" : "fa-circle-exclamation"
      }"></i>

      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.classList.add("show");
  }, 100);

  setTimeout(() => {
    popup.classList.remove("show");

    setTimeout(() => {
      popup.remove();
    }, 400);
  }, 2500);
}

/* =========================
   IMAGE PREVIEW
========================= */

const imageInput = document.getElementById("productImage");

const previewImage = document.getElementById("previewImage");

const uploadArea = document.querySelector(".upload-area");

imageInput.addEventListener("change", function () {
  const file = this.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    previewImage.src = e.target.result;

    previewImage.style.display = "block";

    uploadArea.querySelector("i").style.display = "none";

    uploadArea.querySelector("h3").style.display = "none";

    uploadArea.querySelector("p").style.display = "none";
  };

  reader.readAsDataURL(file);
});

/* =========================
   SAVE STOCK
========================= */

const stockForm = document.querySelector(".stock-form");

if (stockForm) {
  stockForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    document.getElementById("pageLoader").classList.remove("hide");

    try {
      const formData = new FormData();

      formData.append("name", document.getElementById("productName").value);

      formData.append("brand", document.getElementById("brandName").value);

      formData.append("model", document.getElementById("productModel").value);

      formData.append("size", document.getElementById("productSize").value);

      formData.append("quantity", document.getElementById("productQty").value);

      formData.append("price", document.getElementById("productPrice").value);

      formData.append("image", imageInput.files[0]);

      const response = await fetch(
        "https://ki-vix-management-backend.onrender.com/api/stocks/add",
        {
          method: "POST",

          body: formData,
        },
      );

      const data = await response.json();

      document.getElementById("pageLoader").classList.add("hide");

      if (data.success) {
        showPopup("Stock Added Successfully", "success");

        stockForm.reset();

        previewImage.style.display = "none";

        previewImage.src = "";

        uploadArea.querySelector("i").style.display = "block";

        uploadArea.querySelector("h3").style.display = "block";

        uploadArea.querySelector("p").style.display = "block";
      } else {
        showPopup(data.message, "error");
      }
    } catch (error) {
      console.log(error);

      document.getElementById("pageLoader").classList.add("hide");

      showPopup("Something went wrong", "error");
    }
  });
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
