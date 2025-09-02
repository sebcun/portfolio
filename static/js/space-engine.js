class SpaceEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.stars = [];
    this.items = [];
    this.itemSizeMultipliers = new Map();

    // View Camera
    this.camera = {
      x: 0,
      y: 0,
      zoom: 1,
    };

    // World Boundaries
    this.worldHeight = 800;
    this.worldWidth = 1200;

    // Interaction States
    this.isDragging = false;
    this.lastMousePos = { x: 0, y: 0 };
    this.currentHovered = null;
    this.currentContents = undefined;

    // Animation
    this.animationTime = 0;
    this.isRunning = false;
    this.animationId = null;

    // Planet Images
    this.planetImages = {
      earth: new Image(),
      github: new Image(),
    };
    this.planetImages.earth.src = earthImagePath;
    this.planetImages.github.src = githubImagePath;

    // Galaxy Images
    this.galaxyImages = {
      milkyway: new Image(),
    };
    this.galaxyImages.milkyway.src = milkywayImagePath;

    this.setupCanvas();
    this.bindEvents();
  }

  // Create canvas
  setupCanvas() {
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  // Resize canvas to window constraints
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // Bind Events
  bindEvents() {
    this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
    this.canvas.addEventListener("mouseup", (e) => this.onMouseUp(e));
    this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.canvas.addEventListener("wheel", (e) => this.onWheel(e));
    this.canvas.addEventListener("click", (e) => this.onClick(e));
  }

  // Convert screen X and Y to actual map X and Y
  screenToWorld(screenX, screenY) {
    return {
      x: (screenX - this.canvas.width / 2) / this.camera.zoom + this.camera.x,
      y: (screenY - this.canvas.height / 2) / this.camera.zoom + this.camera.y,
    };
  }

  // Convert map X and Y to screen X and Y
  worldToScreen(worldX, worldY) {
    return {
      x: (worldX - this.camera.x) * this.camera.zoom + this.canvas.width / 2,
      y: (worldY - this.camera.y) * this.camera.zoom + this.canvas.height / 2,
    };
  }

  // Load Stars
  loadStars() {
    const minZoom = 0.3;
    const margin = 10;
    const maxScreenWidth = this.worldWidth;
    const maxScreenHeight = this.worldHeight;

    const maxViewableWidth = Math.floor(maxScreenWidth / minZoom);
    const maxViewableHeight = Math.floor(maxScreenHeight / minZoom);

    const totalWidth = this.worldWidth + 2 * margin + maxViewableWidth;
    const totalHeight = this.worldHeight + 2 * margin + maxViewableHeight;

    const startX = -margin - Math.floor(maxViewableWidth / 2);
    const startY = -margin - Math.floor(maxViewableHeight / 2);

    for (let i = 0; i < 3000; i++) {
      const sizeOptions = [1, 1, 2, 2, 3];
      const star = {
        x: Math.floor(Math.random() * totalWidth) + startX,
        y: Math.floor(Math.random() * totalHeight) + startY,
        size: sizeOptions[Math.floor(Math.random() * sizeOptions.length)],
      };
      this.stars.push(star);
    }
  }

  // Load Items
  loadItems() {
    this.items = [
      {
        item: "galaxy",
        image: "milkyway",
        x: 0,
        y: 0,
        size: 250,
        color: "#000000",
        name: "About me",
        contents: [
          {
            item: "planet",
            image: "earth",
            x: 0,
            y: 0,
            size: 350,
            color: "#ffffff",
            type: "home",
            name: "Home",
          },
          {
            item: "planet",
            image: "earth",
            x: 780,
            y: 300,
            size: 250,
            color: "#88ccff",
            type: "panel",
            name: "About Me",
            contents:
              "<bold>Hi!</bold> My name is <b>Sebastian Cunningham</b> and I am a 17 year old highschool student from <b>Melbourne, Australia</b>.<br><br>In the future, I want to become a software engineer/developer, or go into cybersecurity.<br><br>In my spare time, I am a competitive swimmer training up to 18 hours every week. Apart from that, I also like to code small side projects, cook (savoury, never sweet), and build LEGO.",
          },
          {
            item: "planet",
            image: "github",
            x: -780,
            y: -300,
            size: 250,
            color: "#ffffff",
            type: "link",
            name: "GitHub",
            contents: "https://github.com/sebcun",
          },
        ],
      },
    ];
    this.galaxies = this.items;

    this.items.forEach((item) => {
      this.itemSizeMultipliers.set(item, 1.0);
      if (item.contents) {
        item.contents.forEach((subItem) => {
          this.itemSizeMultipliers.set(subItem, 1.0);
        });
      }
    });
  }

  // Get Items At
  getItemAt(worldX, worldY, items) {
    for (let galaxy of this.items) {
      const dx = worldX - galaxy.x;
      const dy = worldY - galaxy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= galaxy.size / 2) {
        return galaxy;
      }
    }
    return null;
  }

  //      Mouse Events
  // Mouse Down, set dragging to true
  onMouseDown(e) {
    this.isDragging = true;
    this.lastMousePos = { x: e.clientX, y: e.clientY };
    this.canvas.parentElement.classList.add("dragging");
  }

  // Mouse Up, set dragging to false
  onMouseUp(e) {
    this.isDragging = false;
    this.canvas.parentElement.classList.remove("dragging");
  }

  // Mouse Move, change camera position
  onMouseMove(e) {
    if (this.isDragging) {
      const deltaX = e.clientX - this.lastMousePos.x;
      const deltaY = e.clientY - this.lastMousePos.y;

      this.camera.x -= deltaX / this.camera.zoom;
      this.camera.y -= deltaY / this.camera.zoom;

      this.constrainCamera();
      this.lastMousePos = { x: e.clientX, y: e.clientY };
    }

    const worldPos = this.screenToWorld(e.clientX, e.clientY);
    const itemsToCheck =
      this.currentContents === undefined ? this.galaxies : this.currentContents;
    const hoveredItem = this.getItemAt(worldPos.x, worldPos.y, itemsToCheck);
    this.currentHovered = hoveredItem;

    this.canvas.style.cursor = hoveredItem ? "pointer" : "grab";
  }

  // On Wheel, change zoom
  onWheel(e) {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const mousePos = this.screenToWorld(e.clientX, e.clientY);

    this.zoomAt(mousePos.x, mousePos.y, zoomFactor);
  }

  // On Click
  onClick(e) {
    if (!this.isDragging) {
      const worldPos = this.screenToWorld(e.clientX, e.clientY);
      const itemsToCheck =
        this.currentContents === undefined
          ? this.galaxies
          : this.currentContents;
      const clickedItem = this.getItemAt(worldPos.x, worldPos.y, itemsToCheck);

      if (clickedItem && this.onItemClick) {
        this.onItemClick(clickedItem);
      }
    }
  }

  //      Camera Functions
  // Constrain Camera
  constrainCamera() {
    const margin = 200;
    this.camera.x = Math.max(
      -margin,
      Math.min(this.worldWidth + margin, this.camera.x)
    );
    this.camera.y = Math.max(
      -margin,
      Math.min(this.worldHeight + margin, this.camera.y)
    );
  }

  // Zoom
  zoomAt(worldX, worldY, factor) {
    const oldZoom = this.camera.zoom;
    this.camera.zoom = Math.max(0.3, Math.min(3, this.camera.zoom * factor));

    if (this.camera.zoom !== oldZoom) {
      const zoomChange = this.camera.zoom / oldZoom;
      this.camera.x = worldX + (this.camera.x - worldX) / zoomChange;
      this.camera.y = worldY + (this.camera.y - worldY) / zoomChange;
      this.constrainCamera();
    }
  }
  zoom(factor) {
    this.zoomAt(this.camera.x, this.camera.y, factor);
  }

  //      Animation Functions
  // Start
  start(contents) {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isRunning = true;
    this.animate(contents);
  }

  // Stop
  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // Animation
  animate(contents) {
    if (!this.isRunning) return;
    this.animationTime += 0.016;
    this.render(contents);
    this.animationId = requestAnimationFrame(() => this.animate(contents));
  }

  //      Render Functions
  // Main Render
  render(contents) {
    this.currentContents = contents;
    this.ctx.fillStyle = "#0a0a0f";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();

    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.scale(this.camera.zoom, this.camera.zoom);
    this.ctx.translate(-this.camera.x, -this.camera.y);

    this.renderStars();
    if (contents === undefined) {
      this.items = this.galaxies;
      this.renderGalaxies();
    } else {
      this.items = contents;
      this.renderPlanets();
    }

    this.ctx.restore();
  }

  // Render Stars
  renderStars() {
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";

    for (let star of this.stars) {
      const twinkle =
        Math.sin(this.animationTime * 2 + star.x * 0.01) * 0.3 + 0.7;
      this.ctx.globalAlpha = twinkle;

      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1;
  }

  // Render Galaxies
  renderGalaxies() {
    for (let galaxy of this.items) {
      this.renderGalaxy(galaxy);
    }
  }

  // Render Galaxy
  renderGalaxy(galaxy) {
    const isHovered = this.currentHovered === galaxy;

    const targetMultiplier = isHovered ? 1.15 : 1.0;
    const currentMultiplier = this.itemSizeMultipliers.get(galaxy) || 1.0;
    let postMultiplier =
      currentMultiplier + (targetMultiplier - currentMultiplier) * 0.1;
    this.itemSizeMultipliers.set(galaxy, postMultiplier);

    const pulse = Math.sin(this.animationTime * 2) * 0.03 + 0.9;
    const size = galaxy.size * postMultiplier * pulse;

    const jiggleFactor = isHovered ? 1 : 0;
    const jiggleX = jiggleFactor * Math.sin(this.animationTime * 8) * 3;
    const jiggleY = jiggleFactor * Math.cos(this.animationTime * 8) * 3;

    if (this.galaxyImages[galaxy.image].complete) {
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = "high";

      this.ctx.drawImage(
        this.galaxyImages[galaxy.image],
        galaxy.x - size / 2 + jiggleX,
        galaxy.y - size / 2 + jiggleY,
        size,
        size
      );
    }

    if (this.camera.zoom > 0.8) {
      // let textMultiplier = 1;
      // if (isHovered) {
      //   textMultiplier += 0.5;
      // }
      this.ctx.save();
      this.ctx.scale(1 / this.camera.zoom, 1 / this.camera.zoom);
      this.ctx.fillStyle = "white";
      this.ctx.font = `${isHovered ? "900" : "700"} ${
        30 * postMultiplier
      }px 'TASA Explorer', sans-serif`;
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        galaxy.name,
        galaxy.x * this.camera.zoom,
        (galaxy.y + size - 80) * this.camera.zoom
      );
      this.ctx.restore();
    }
  }

  // Render Planets
  renderPlanets() {
    for (let planet of this.items) {
      this.renderPlanet(planet);
    }
  }

  // Render Planet
  renderPlanet(planet) {
    const isHovered = this.currentHovered === planet;
    const targetMultiplier = isHovered ? 1.15 : 1.0;
    const currentMultiplier = this.itemSizeMultipliers.get(planet) || 1.0;
    const postMultiplier =
      currentMultiplier + (targetMultiplier - currentMultiplier) * 0.1;
    this.itemSizeMultipliers.set(planet, postMultiplier);

    const pulse = Math.sin(this.animationTime * 2) * 0.01 + 0.9;
    const size = planet.size * postMultiplier * pulse;

    const jiggleFactor = isHovered ? 1 : 0;
    const jiggleX = jiggleFactor * Math.sin(this.animationTime * 8) * 3;
    const jiggleY = jiggleFactor * Math.cos(this.animationTime * 8) * 3;

    const gradient = this.ctx.createRadialGradient(
      planet.x + jiggleX,
      planet.y + jiggleY,
      0,
      planet.x + jiggleY,
      planet.y + jiggleX,
      size * 0.55
    );
    gradient.addColorStop(0, planet.color + "66");
    gradient.addColorStop(0.7, planet.color + "22");
    gradient.addColorStop(1, planet.color + "00");

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(
      planet.x + jiggleX,
      planet.y + jiggleY,
      size * 1.2,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    if (this.planetImages[planet.image].complete) {
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = "high";

      this.ctx.drawImage(
        this.planetImages[planet.image],
        planet.x - size / 2 + jiggleX,
        planet.y - size / 2 + jiggleY,
        size,
        size
      );
    }

    if (this.camera.zoom > 0.8) {
      this.ctx.save();
      this.ctx.scale(1 / this.camera.zoom, 1 / this.camera.zoom);
      this.ctx.fillStyle = "white";
      this.ctx.font = `${isHovered ? "900" : "700 "} ${
        30 * postMultiplier
      }px 'TASA Explorer', sans-serif`;
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        planet.name,
        (planet.x + jiggleY) * this.camera.zoom,
        (planet.y + size - 80 + jiggleY) * this.camera.zoom
      );
      this.ctx.restore();
    }
  }
}
