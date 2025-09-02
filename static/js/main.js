class App {
  constructor() {
    this.canvas = document.getElementById("space-map");
    this.spaceEngine = new SpaceEngine(this.canvas);
    this.soundEngine = new SoundEngine();
    this.portfolioData = null;

    this.initUI();
  }

  async initUI() {
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
    const loadItemsResult = await this.spaceEngine.loadItems();
    if (loadItemsResult === true) {
      this.spaceEngine.start();
      document.getElementById("loading-screen").classList.add("hidden");
    } else {
      showPanel(
        "Oh no!",
        `There was an issue while loading the contents of my portfolio! Please try refreshing the page to try again or contact me at <b>@catchc</b> with the error <b>${loadItemsResult}</b>.`
      );
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new App();
});
