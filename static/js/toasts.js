const toast = document.getElementById("toast");
const toastText = document.getElementById("toast-text");
let toastTimeout;

function showToast(message, style = "default", duration = 3500) {
  toast.classList.remove("show", "default");
  toastText.textContent = message;
  toast.classList.add("show");
  if (style === "default") {
    toast.classList.add("default");
  } else if (style === "danger") {
    toast.classList.add("danger");
  } else if (style === "success") {
    toast.classList.add("success");
  }

  setTimeout(() => {
    hideToast();
  }, duration);
}

function hideToast() {
  toast.classList.remove("show");
}
