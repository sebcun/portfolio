const infoPanel = document.getElementById("info-panel");
const panelName = document.getElementById("panel-name");
const panelContainer = document.getElementById("panel-container");
const panelClose = document.getElementById("close-panel");

function showPanel(name, content) {
  // Block handlers (create content)
  const blockHandlers = {
    br: () => {
      const item = document.createElement("br");
      contents.appendChild(item);
    },
    bold: (block) => {
      const item = document.createElement("span");
      item.classList.add("bold");
      item.textContent = block.content;
      contents.appendChild(item);
    },
    text: (block) => {
      const item = document.createElement("span");
      item.textContent = block.content;
      contents.appendChild(item);
    },
    italic: (block) => {
      const item = document.createElement("span");
      item.classList.add("italic");
      item.textContent = block.content;
      contents.appendChild(item);
    },
    italicbold: (block) => {
      const item = document.createElement("span");
      item.classList.add("italic", "bold");
      item.textContent = block.content;
      contents.appendChild(item);
    },
    link: (block) => {
      const item = document.createElement("a");
      item.href = block.content[1];
      item.textContent = block.content[0];
      item.target = "_blank";
      contents.appendChild(item);
    },
    image: (block) => {
      const item = document.createElement("img");
      item.src = block.content[1];
      item.alt = block.content[0];
      item.style.maxWidth = "100%";
      contents.appendChild(item);
    },
    code: (block) => {
      if (block.content[0]) {
        const item = document.createElement("code");
        item.textContent = block.content[1];
        contents.appendChild(item);
      } else {
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.textContent = block.content[1];
        pre.appendChild(code);
        contents.appendChild(pre);
      }
    },
    card: (block) => {
      const cardDiv = document.createElement("div");
      cardDiv.classList.add("card");

      const originalContents = contents;
      contents = cardDiv;

      block.content.forEach((subBlock) => {
        const subHandler = blockHandlers[subBlock.type];
        if (subHandler) {
          subHandler(subBlock);
        }
      });

      contents = originalContents;
      contents.appendChild(cardDiv);
    },
  };

  panelName.textContent = name;
  panelContainer.innerHTML = "";

  let contents = document.createElement("div");

  content.forEach((block) => {
    const handler = blockHandlers[block.type];
    if (handler) {
      handler(block);
    }
  });
  panelContainer.appendChild(contents);
  infoPanel.classList.remove("hidden");
}

panelClose.addEventListener("click", function () {
  infoPanel.classList.add("hidden");
});

const openInfoBtn = document.getElementById("view-info");
openInfoBtn.addEventListener("click", function () {
  showPanel("Welcome to my Portfolio!", [
    {
      type: "text",
      content:
        "Hi, I am Sebastian Cunningham, and you are visiting my portfolio.",
    },
    {
      type: "br",
    },
    {
      type: "br",
    },
    {
      type: "text",
      content: "🖱️ Drag using your mouse or finger to navigate.",
    },
    {
      type: "br",
    },
    {
      type: "text",
      content: "🔎 Scroll to zoom.",
    },
    {
      type: "br",
    },
    {
      type: "text",
      content:
        "🌍 Click galaxies and planets to explore and learn more about me.",
    },
  ]);
});
