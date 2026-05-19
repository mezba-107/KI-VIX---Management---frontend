/* =========================
         AUTH CHECK
      ========================= */

const adminToken = localStorage.getItem("adminToken");

if (!adminToken) {
  window.location.href = "/Admin/admin-login.html";
}

/* =========================
         ADMIN DATA
      ========================= */

const adminData = {
  "m.m.simon.107@gmail.com": {
    name: "M M Simon",
    role: "Super Admin",
    phone: "01842385257",
    address: "Dhaka, Bangladesh",
    image: "",
  },

  "tanvirul484@gmail.com": {
    name: "Tanvirul",
    role: "Super Admin",
    phone: "",
    address: "",
    image: "",
  },

  "saiyeedbappy895@gmail.com": {
    name: "Bappy",
    role: "Super Admin",
    phone: "01822222222",
    address: "",
    image: "",
  },

  "armanriad171@gmail.com": {
    name: "Arman",
    role: "Super Admin",
    phone: "",
    address: "",
    image: "",
  },
};

/* =========================
         LOAD ADMIN
      ========================= */

const adminEmail = localStorage.getItem("adminEmail");

const admin = adminData[adminEmail];

if (!admin) {
  window.location.href = "/Admin/admin-login.html";
}

/* =========================
         LOAD PROFILE FROM DB
      ========================= */

async function loadProfileFromDB() {
  try {
    const response = await fetch(
      "https://ki-vix-management-backend.onrender.com/api/admin/profile",
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      },
    );

    const data = await response.json();

    if (!data.success) return;

    admin.name = data.profile.name || admin.name;

    admin.phone = data.profile.phone || admin.phone;

    admin.address = data.profile.address || admin.address;

    admin.image = data.profile.image || "";

    updateUI();
  } catch (error) {
    console.log(error);
  }
}

/* =========================
         UPDATE UI
      ========================= */

function updateUI() {
  document.getElementById("adminName").innerText = admin.name;

  document.getElementById("adminRole").innerText = admin.role;

  document.getElementById("adminEmail").innerText = adminEmail;

  document.getElementById("adminPhone").innerText = admin.phone;

  document.getElementById("adminAddress").innerText = admin.address;

  document.getElementById("adminRoleBox").innerText = admin.role;

  /* PROFILE IMAGE */

  const profileImage = document.getElementById("profileImage");

  if (admin.image) {
    profileImage.src = admin.image;

    profileImage.style.display = "block";

    document.getElementById("avatarText").style.display = "none";
  } else {
    profileImage.style.display = "none";

    document.getElementById("avatarText").style.display = "flex";

    document.getElementById("avatarText").innerText = admin.name
      .charAt(0)
      .toUpperCase();
  }
}

updateUI();

loadProfileFromDB();

/* =========================
         POPUP
      ========================= */

let currentEditType = "";

function openEditPopup(type) {
  currentEditType = type;

  const overlay = document.getElementById("popupOverlay");

  const input = document.getElementById("popupInput");

  const title = document.getElementById("popupTitle");

  const subTitle = document.getElementById("popupSubTitle");

  const label = document.querySelector(".input-label");

  const note = document.getElementById("popupNoteText");

  /* NAME */

  if (type === "name") {
    title.innerText = "Edit Admin Name";

    subTitle.innerText = "Update your admin name";

    label.innerText = "Admin Name";

    note.innerText = "Make sure your admin name is correct.";

    input.value = admin.name;
  }

  /* PHONE */

  if (type === "phone") {
    title.innerText = "Edit Mobile Number";

    subTitle.innerText = "Update your mobile number";

    label.innerText = "Mobile Number";

    note.innerText = "This number will be used for important alerts.";

    input.value = admin.phone;
  }

  /* ADDRESS */

  if (type === "address") {
    title.innerText = "Edit Address";

    subTitle.innerText = "Update your address";

    label.innerText = "Address";

    note.innerText = "Enter your current address correctly.";

    input.value = admin.address;
  }

  overlay.classList.add("show");

  input.focus();
}

/* =========================
         CLOSE POPUP
      ========================= */

function closePopup() {
  document.getElementById("popupOverlay").classList.remove("show");
}

/* =========================
         SAVE DATA
========================= */

async function savePopupData() {
  const value = document.getElementById("popupInput").value.trim();

  if (!value) return;

  try {
    const token = localStorage.getItem("adminToken");

    const body = {};

    /* NAME */
    if (currentEditType === "name") {
      body.name = value;
    }

    /* PHONE */
    if (currentEditType === "phone") {
      body.phone = value;
    }

    /* ADDRESS */
    if (currentEditType === "address") {
      body.address = value;
    }

    /* API CALL */

    const res = await fetch(
      "https://ki-vix-management-backend.onrender.com/api/admin/profile",
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(body),
      },
    );

    const data = await res.json();

    if (!data.success) {
      return alert(data.message || "Update Failed");
    }

    /* UPDATE UI */

    if (body.name) {
      admin.name = body.name;
    }

    if (body.phone) {
      admin.phone = body.phone;
    }

    if (body.address) {
      admin.address = body.address;
    }

    updateUI();

    closePopup();

    showSuccessToast();
  } catch (error) {
    console.log(error);

    alert("Server Error");
  }
}

/* =========================
         SUCCESS TOAST
      ========================= */

function showSuccessToast() {
  const toast = document.getElementById("successToast");

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

/* =========================
         CLOSE OUTSIDE
      ========================= */

document.getElementById("popupOverlay").addEventListener("click", (e) => {
  if (e.target.id === "popupOverlay") {
    closePopup();
  }
});

/* =========================
         PROFILE IMAGE UPLOAD
      ========================= */

const profileUpload = document.getElementById("profileUpload");

profileUpload.addEventListener("change", async function () {
  const file = this.files[0];

  if (!file) return;

  /* SHOW LOADER */

  const loader = document.getElementById("pageLoader");

  loader.classList.remove("hide");

  try {
    const formData = new FormData();

    formData.append("image", file);

    const res = await fetch(
      "https://ki-vix-management-backend.onrender.com/api/admin/upload-profile",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${adminToken}`,
        },

        body: formData,
      },
    );

    const data = await res.json();

    if (!data.success) {
      loader.classList.add("hide");

      return alert(data.message || "Upload Failed");
    }

    admin.image = data.image;

    updateUI();

    showSuccessToast();

    /* HIDE LOADER */

    setTimeout(() => {
      loader.classList.add("hide");
    }, 500);
  } catch (error) {
    console.log(error);

    loader.classList.add("hide");

    alert("Image Upload Failed");
  }
});
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
