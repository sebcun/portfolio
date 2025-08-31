class App {
  constructor() {
    this.canvas = document.getElementById("space-map");
    this.spaceEngine = new SpaceEngine(this.canvas);
    this.portfolioData = null;

    this.initUI();
  }

  initUI() {
    const resetBtn = document.getElementById("reset-view");
    const zoomInBtn = document.getElementById("zoom-in");
    const zoomOutBtn = document.getElementById("zoom-out");

    this.spaceEngine.onItemClick = (item) => {
      if (item.type == "panel") {
        showPanel(item.name, item.contents);
      } else {
        window.open(item.contents, "_blank");
      }
    };

    this.spaceEngine.loadStars();
    this.spaceEngine.loadItems();
    this.spaceEngine.start();

    setTimeout(() => {
      document.getElementById("loading-screen").classList.add("hidden");
    }, 1000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new App();
});
