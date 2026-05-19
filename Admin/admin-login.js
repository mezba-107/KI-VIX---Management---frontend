const loginForm = document.getElementById("loginForm");

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
        ${type === "success" ? "✅" : "❌"}
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
    }, 300);
  }, 2500);
}

/* =========================
   LOGIN
========================= */

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();

  const password = document.getElementById("password").value.trim();

  try {
    /* SHOW LOADER */
    document.getElementById("pageLoader").classList.remove("hide");

    const response = await fetch(
      "https://ki-vix-management-backend.onrender.com/api/admin/login",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      document.getElementById("pageLoader").classList.add("hide");

      showPopup(data.message || "Login Failed", "error");

      return;
    }

    /* SAVE TOKEN */

    localStorage.setItem("adminToken", data.token);

    localStorage.setItem("adminEmail", data.admin.email);

    localStorage.setItem("adminName", data.admin.name);

    showPopup("Login Success", "success");

    setTimeout(() => {
      window.location.href = "/index.html";
    }, 1200);
  } catch (error) {
    console.log(error);

    document.getElementById("pageLoader").classList.add("hide");

    showPopup("Server Error", "error");
  }
});

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
