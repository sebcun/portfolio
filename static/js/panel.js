const infoPanel = document.getElementById("info-panel");
const panelName = document.getElementById("panel-name");
const panelContainer = document.getElementById("panel-container");
const panelClose = document.getElementById("close-panel");

function showPanel(name, content) {
  panelName.textContent = name;
  panelContainer.innerHTML = content;
  infoPanel.classList.remove("hidden");
}

panelClose.addEventListener("click", function () {
  infoPanel.classList.add("hidden");
});

document.addEventListener("DOMContentLoaded", function () {
  showPanel(
    "Welcome to my Portfolio!",
    `Hi, I am Sebastian Cunningham, and you are visiting my portfolio.<br /><br />
          🖱️ Drag using your mouse or finger to navigate.<br />
          🔎 Scroll to zoom.<br />
          🌍 Click galaxies and planets to explore and learn more about me.`
  );
});

const openInfoBtn = document.getElementById("view-info");
openInfoBtn.addEventListener("click", function () {
  showPanel(
    "Welcome to my Portfolio!",
    `Hi, I am Sebastian Cunningham, and you are visiting my portfolio.<br /><br />
          🖱️ Drag using your mouse or finger to navigate.<br />
          🔎 Scroll to zoom.<br />
          🌍 Click galaxies and planets to explore and learn more about me.`
  );
});
