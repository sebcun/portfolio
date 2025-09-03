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

function showCreatePanel(galaxy) {
  panelName.textContent = "Create a Planet";
  panelContainer.innerHTML = `
  <br>
  <form id="create-planet-form">
    <label for="planet-name">Name:</label>
    <input type="text" id="planet-name" name="name" required><br><br>

    <label>Content:</label>
    <div id="block-builder">
      <div id="add-block-buttons">
        <button type="button" id="add-text">Add Text</button>
        <button type="button" id="add-bold">Add Bold Text</button>
        <button type="button" id="add-italic">Add Italic Text</button>
        <button type="button" id="add-link">Add Link</button>
        <button type="button" id="add-br">Add Line Break</button>
      </div>
      <div id="blocks-list"></div>
    </div><br>

    <label>Planet:</label>
    <div class="image-picker">
      <input type="radio" id="earth" name="image" value="earth" checked><label for="earth">🌍</label>
      <input type="radio" id="milkyway" name="image" value="milkyway" checked><label for="milkyway">🌌</label>
      <input type="radio" id="alien" name="image" value="alien" checked><label for="alien">👽</label>
      <input type="radio" id="rocket" name="image" value="rocket" checked><label for="rocket">🚀</label>
      <input type="radio" id="satellite" name="image" value="satellite" checked><label for="satellite">🛰️</label>
      <input type="radio" id="meteor" name="image" value="meteor" checked><label for="meteor">☄️</label>
    </div>
    <br>
    <div id="block-builder">
      <p><b>Please note,</b> please ensure anything uploaded is appropriate and that you do not abuse this system. Any planets found to be innapropriate or spam will be removed and you will be banned from creating anymore planets.</p>
    </div>
    <br>

    <button type="submit">Create Planet</button>
  </form>`;

  const blocksList = document.getElementById("blocks-list");
  let blockCounter = 0;

  // Add block handler
  function addBlock(type, config = {}) {
    blockCounter++;
    const blockId = `block-${blockCounter}`;
    const blockDiv = document.createElement("div");
    blockDiv.className = "block-item";
    blockDiv.id = blockId;

    let fields = "";
    switch (type) {
      case "text":
        fields = `<textarea name="content" placeholder="Enter text">${
          config.content || ""
        }</textarea>`;
        break;
      case "bold":
        fields = `<input type="text" name="content" placeholder="Enter bold text" value="${
          config.content || ""
        }">`;
        break;
      case "italic":
        fields = `<input type="text" name="content" placeholder="Enter italic text" value="${
          config.content || ""
        }">`;
        break;
      case "link":
        fields = `
          <input type="text" name="text" placeholder="Link text" value="${
            config.text || ""
          }">
          <input type="url" name="url" placeholder="URL" value="${
            config.url || ""
          }">
        `;
        break;
      case "br":
        fields = "<p>Line Break</p>";
        break;
    }

    blockDiv.innerHTML = `
      <strong>${type.toUpperCase()} Block</strong>
      ${fields}
      <button type="button" class="remove-block">Remove</button>
    `;

    blocksList.appendChild(blockDiv);

    // Add remove event
    blockDiv.querySelector(".remove-block").addEventListener("click", () => {
      blocksList.removeChild(blockDiv);
    });
  }

  // Add Block Events
  document
    .getElementById("add-text")
    .addEventListener("click", () => addBlock("text"));
  document
    .getElementById("add-bold")
    .addEventListener("click", () => addBlock("bold"));
  document
    .getElementById("add-italic")
    .addEventListener("click", () => addBlock("italic"));
  document
    .getElementById("add-link")
    .addEventListener("click", () => addBlock("link"));
  document
    .getElementById("add-br")
    .addEventListener("click", () => addBlock("br"));

  // Form Handler
  const form = document.getElementById("create-planet-form");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    const name = formData.get("name");
    const image = formData.get("image");

    const blocks = [];
    const blockItems = blocksList.querySelectorAll(".block-item");
    blockItems.forEach((item) => {
      const type = item
        .querySelector("strong")
        .textContent.toLowerCase()
        .replace(" block", "");
      const inputs = item.querySelectorAll("input, textarea");
      let blockData = { type };
      if (type === "text" || type === "bold" || type === "italic") {
        blockData.content = inputs[0].value;
      } else if (type === "link") {
        blockData.content = [inputs[0].value, inputs[1].value];
      }
      blocks.push(blockData);
    });

    const data = { name, content: blocks, image, galaxy };

    try {
      const response = await fetch("/api/createplanet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        infoPanel.classList.add("hidden");
        location.search = `?galaxy=${galaxy}`;
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to create planet"}`);
      }
    } catch (error) {
      alert("Network error. Please try again");
    }
  });

  infoPanel.classList.remove("hidden");
}

function showAdminCreatePanel(galaxies) {
  panelName.textContent = "Create a Planet";
  panelContainer.innerHTML = `
  <br>
  <form id="create-planet-form">

    <label for="galaxy-name">Galaxy:</label>
    <select name="galaxy" id="galaxy-name" required>
    </select><br><br>

    <label for="planet-name">Name:</label>
    <input type="text" id="planet-name" name="name" required><br><br>

    <label>Content:</label>
    <div id="block-builder">
      <div id="add-block-buttons">
        <button type="button" id="add-text">Add Text</button>
        <button type="button" id="add-bold">Add Bold Text</button>
        <button type="button" id="add-italic">Add Italic Text</button>
        <button type="button" id="add-link">Add Link</button>
        <button type="button" id="add-br">Add Line Break</button>
      </div>
      <div id="blocks-list"></div>
    </div><br>

    <label for="planet-positions">Position:</label>
    <div id="planet-positions">
      <input type="number" id="planet-x" name="x" placeholder="X" required>
      <input type="number" id="planet-y" name="y" placeholder="Y" required>
    </div><br>

    <label>Size:</label>
    <div class="size-picker">
      <input type="radio" id="size-xs" name="size" value="size-xs"><label for="size-xs">XS</label>
      <input type="radio" id="size-s" name="size" value="size-s"><label for="size-s">S</label>
      <input type="radio" id="size-m" name="size" value="size-m" checked><label for="size-m">M</label>
      <input type="radio" id="size-l" name="size" value="size-l"><label for="size-l">L</label>
      <input type="radio" id="size-xl" name="size" value="size-xl"><label for="size-xl">XL</label>
    </div><br>
    

    <label>Planet:</label>
    <div class="image-picker">
      <input type="radio" id="earth" name="image" value="earth" checked><label for="earth">🌍</label>
      <input type="radio" id="milkyway" name="image" value="milkyway" checked><label for="milkyway">🌌</label>
      <input type="radio" id="alien" name="image" value="alien" checked><label for="alien">👽</label>
      <input type="radio" id="rocket" name="image" value="rocket" checked><label for="rocket">🚀</label>
      <input type="radio" id="satellite" name="image" value="satellite" checked><label for="satellite">🛰️</label>
      <input type="radio" id="meteor" name="image" value="meteor" checked><label for="meteor">☄️</label>
    </div>
    <br>
    <br>

    <button type="submit">Create Planet</button>
  </form>`;

  const galaxySelect = document.getElementById("galaxy-name");
  galaxies.forEach((item) => {
    const selectOption = document.createElement("option");
    selectOption.value = item.name;
    selectOption.textContent = item.name;
    galaxySelect.appendChild(selectOption);
  });

  const blocksList = document.getElementById("blocks-list");
  let blockCounter = 0;

  // Add block handler
  function addBlock(type, config = {}) {
    blockCounter++;
    const blockId = `block-${blockCounter}`;
    const blockDiv = document.createElement("div");
    blockDiv.className = "block-item";
    blockDiv.id = blockId;

    let fields = "";
    switch (type) {
      case "text":
        fields = `<textarea name="content" placeholder="Enter text">${
          config.content || ""
        }</textarea>`;
        break;
      case "bold":
        fields = `<input type="text" name="content" placeholder="Enter bold text" value="${
          config.content || ""
        }">`;
        break;
      case "italic":
        fields = `<input type="text" name="content" placeholder="Enter italic text" value="${
          config.content || ""
        }">`;
        break;
      case "link":
        fields = `
          <input type="text" name="text" placeholder="Link text" value="${
            config.text || ""
          }">
          <input type="url" name="url" placeholder="URL" value="${
            config.url || ""
          }">
        `;
        break;
      case "br":
        fields = "<p>Line Break</p>";
        break;
    }

    blockDiv.innerHTML = `
      <strong>${type.toUpperCase()} Block</strong>
      ${fields}
      <button type="button" class="remove-block">Remove</button>
    `;

    blocksList.appendChild(blockDiv);

    // Add remove event
    blockDiv.querySelector(".remove-block").addEventListener("click", () => {
      blocksList.removeChild(blockDiv);
    });
  }

  // Add Block Events
  document
    .getElementById("add-text")
    .addEventListener("click", () => addBlock("text"));
  document
    .getElementById("add-bold")
    .addEventListener("click", () => addBlock("bold"));
  document
    .getElementById("add-italic")
    .addEventListener("click", () => addBlock("italic"));
  document
    .getElementById("add-link")
    .addEventListener("click", () => addBlock("link"));
  document
    .getElementById("add-br")
    .addEventListener("click", () => addBlock("br"));

  // Form Handler
  const form = document.getElementById("create-planet-form");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    const name = formData.get("name");
    const image = formData.get("image");
    const galaxy = formData.get("galaxy");
    const x = formData.get("x");
    const y = formData.get("y");
    const size = formData.get("size");

    const blocks = [];
    const blockItems = blocksList.querySelectorAll(".block-item");
    blockItems.forEach((item) => {
      const type = item
        .querySelector("strong")
        .textContent.toLowerCase()
        .replace(" block", "");
      const inputs = item.querySelectorAll("input, textarea");
      let blockData = { type };
      if (type === "text" || type === "bold" || type === "italic") {
        blockData.content = inputs[0].value;
      } else if (type === "link") {
        blockData.content = [inputs[0].value, inputs[1].value];
      }
      blocks.push(blockData);
    });

    const data = { name, content: blocks, image, galaxy, x, y, size };

    try {
      const response = await fetch("/api/createplanet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        infoPanel.classList.add("hidden");
        location.search = `?galaxy=${galaxy}`;
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to create planet"}`);
      }
    } catch (error) {
      alert("Network error. Please try again");
    }
  });

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
