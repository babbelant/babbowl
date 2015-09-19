function randomPinCount() {
  return Math.floor(Math.random() * 100) % 11;
}

function Game() {
  this.MAX_FRAMES = 10;
  this.score = 0;
  this.currentFrame = 1;
  this.currentRoll = 1;
}

Game.prototype.bowl = function() {
  if (this.ended()) {
    console.log("Game has ended. No rolls left.");
    return;
  }

  if (this.currentRoll == 1) {
    this.currentRoll = 2;
  } else if (this.currentRoll == 2) {
    this.currentRoll = 1;
    this.currentFrame += 1;
  }

  console.log("Current frame: " + this.currentFrame);
  console.log("Current roll: " + this.currentRoll);
};

Game.prototype.ended = function() {
  return this.currentFrame == this.MAX_FRAMES && this.currentRoll == 2;
};

var game = new Game();

do {
  game.bowl();
} while (!game.ended());
