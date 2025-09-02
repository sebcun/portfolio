class SoundEngine {
  constructor() {
    this.sounds = {
      ambience: new Audio(ambienceSoundPath),
      click: new Audio(clickSoundPath),
      transition: new Audio(transitionSoundPath),
      ufo: new Audio(ufoSoundPath),
    };
  }

  play(sound) {
    this.sounds[sound].currentTime = 0;
    this.sounds[sound].play();
  }

  playLoop(sound) {
    this.sounds[sound].loop = true;
    this.sounds[sound].currentTime = 0;
    this.sounds[sound].play();
  }

  stop(sound) {
    this.sounds[sound].pause();
    this.sounds[sound].currentTime = 0;
    this.sounds[sound].loop = false;
  }
}
