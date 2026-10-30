
/* RAVEX PLAY — Sistema de autenticación
   Supabase Auth | Versión 1.0
*/

const SUPABASE_URL = "PEGA_AQUI_TU_PROJECT_URL";
const SUPABASE_ANON_KEY = "PEGA_AQUI_TU_PUBLISHABLE_KEY";

const ravexSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

let selectedAccountType = "standard";
let pendingEmail = "";

const authStatus = document.getElementById("authStatus");
const emailInput = document.getElementById("authEmail");
const codeInput = document.getElementById("authCode");

function showStatus(message, isError = false) {
  authStatus.textContent = message;
  authStatus.style.color = isError ? "#ff7777" : "#70f58a";
}

function selectAccount(type) {
  if (!["standard", "kids"].includes(type)) return;

  selectedAccountType = type;

  document.querySelectorAll("[data-account]").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.account === type
    );
  });

  showStatus(
    type === "kids"
      ? "Kids: utiliza el correo del adulto responsable."
      : "Standard: utiliza tu correo personal."
  );
}

async function sendVerificationCode() {
  const email = emailInput.value.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    showStatus("Introduce un correo válido.", true);
    return;
  }

  const { error } = await ravexSupabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true
    }
  });

  if (error) {
    showStatus("No se pudo enviar el código: " + error.message, true);
    return;
  }

  pendingEmail = email;
  showStatus("Código enviado. Revisa tu correo.");
  document.getElementById("codeArea").hidden = false;
}

async function verifyCode() {
  const token = codeInput.value.trim();

  if (!pendingEmail || !/^\d{6}$/.test(token)) {
    showStatus("Introduce el código de 6 dígitos.", true);
    return;
  }

  const { data, error } = await ravexSupabase.auth.verifyOtp({
    email: pendingEmail,
    token,
    type: "email"
  });

  if (error) {
    showStatus("Código incorrecto o caducado.", true);
    return;
  }

  showStatus("¡Bienvenido a RAVEX PLAY!");

  document.getElementById("authPanel").hidden = true;
  document.getElementById("userPanel").hidden = false;

  document.getElementById("userEmail").textContent =
    data.user.email;

  document.getElementById("userType").textContent =
    selectedAccountType === "kids"
      ? "RAVEX Kids"
      : "RAVEX Standard";
}

async function logoutRavex() {
  const { error } = await ravexSupabase.auth.signOut();

  if (error) {
    showStatus("No se pudo cerrar la sesión.", true);
    return;
  }

  location.reload();
}

// Recuperar una sesión anterior
async function restoreSession() {
  const { data } = await ravexSupabase.auth.getSession();

  if (data.session) {
    document.getElementById("authPanel").hidden = true;
    document.getElementById("userPanel").hidden = false;
    document.getElementById("userEmail").textContent =
      data.session.user.email;
    document.getElementById("userType").textContent =
      "Sesión activa";
  }
}

restoreSession();
