class App {
  constructor() {
    this.canvas = document.getElementById("space-map");
    this.spaceEngine = new SpaceEngine(this.canvas);
    this.soundEngine = new SoundEngine();
    this.portfolioData = null;

    this.initUI();
  }

  initUI() {
    const resetBtn = document.getElementById("reset-view");
    const zoomInBtn = document.getElementById("zoom-in");
    const zoomOutBtn = document.getElementById("zoom-out");

    this.spaceEngine.onItemClick = (item) => {
      if (item.item == "galaxy") {
        this.soundEngine.play("ufo");
        this.spaceEngine.start(item.contents);
      } else {
        if (item.type == "panel") {
          this.soundEngine.play("transition");
          showPanel(item.name, item.contents);
        } else if (item.type == "link") {
          this.soundEngine.play("transition");
          window.open(item.contents, "_blank");
        } else {
          this.soundEngine.play("ufo");
          this.spaceEngine.start();
        }
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
