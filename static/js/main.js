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

    // Clicks of galaxy/panels
    this.spaceEngine.onItemClick = (item) => {
      if (item.item == "galaxy") {
        if (item.protected && !this.spaceEngine.unlockedGalaxies.has(item)) {
          return;
        }
        if (item.name === "Admin") {
          const loggedIn = localStorage.getItem("admin") === "true";
          if (!loggedIn) {
            const password = prompt("Enter admin password:");
            if (!password) return;
            fetch("/api/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ password: password.toLocaleLowerCase() }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.success) {
                  localStorage.setItem("admin", "true");
                  this.soundEngine.play("ufo");
                  this.spaceEngine.start(item.contents);
                } else {
                  alert("Incorrect password");
                }
              })
              .catch((error) => {
                alert("Login failed.");
              });
            return;
          }
        }
        this.soundEngine.play("ufo");
        this.spaceEngine.start(item.contents);
      } else {
        if (item.type == "panel") {
          this.soundEngine.play("transition");
          showPanel(item.name, item.contents);
        } else if (item.type == "link") {
          this.soundEngine.play("transition");
          window.open(item.contents, "_blank");
        } else if (item.type == "create") {
          showCreatePanel("Public");
        } else if (item.type == "createadmin") {
          showAdminCreatePanel(this.spaceEngine.galaxies);
        } else if (item.type == "logout") {
          fetch("/api/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                localStorage.setItem("admin", "false");
                this.spaceEngine.start(this.galaxies);
              } else {
                alert("Issue");
              }
            })
            .catch((error) => {
              alert("Login failed.");
            });
          return;
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

      setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const galaxy = params.get("galaxy");
        if (galaxy) {
          this.spaceEngine.items.forEach((item) => {
            if (item.name === galaxy) {
              if (item.name == "Admin") {
                document
                  .getElementById("loading-screen")
                  .classList.add("hidden");
              } else {
                this.spaceEngine.start(item.contents);
                document
                  .getElementById("loading-screen")
                  .classList.add("hidden");
              }
            }
          });
        } else {
          document.getElementById("loading-screen").classList.add("hidden");
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
        }
      }, 10);
      // Waits 2 seconds so people can appreciate the loading screen!
    } else {
      showPanel(
        "Oh no!",
        `There was an issue while loading the contents of my portfolio! Please try refreshing the page to try again or contact me at <b>@catchc</b> with the error <b>${loadItemsResult}</b>.`
      );
    }

    resetBtn.addEventListener("click", () => {
      this.spaceEngine.resetView();
    });

    zoomInBtn.addEventListener("click", () => {
      this.spaceEngine.zoom(1.2);
    });

    zoomOutBtn.addEventListener("click", () => {
      this.spaceEngine.zoom(0.8);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new App();
});
