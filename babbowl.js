function randomPinCount(max) {
  var maxPinCount = max || 10;
  // return Math.floor(Math.random() * 100) % (maxPinCount + 1);
  return 10;
}

function Frame() {
  this.strike = false;
  this.spare = false;
  this.points = 0;
  this.finished = false;
}

Frame.prototype.pinsLeft = function() {
  return 10 - this.points;
};

function Game() {
  this.MAX_FRAMES = 10;
  this.currentFrameNumber = 1;
  this.currentRoll = 1;
  this.frames = [];
  for (var i = 0; i < this.MAX_FRAMES; i++) {
    this.frames.push(new Frame());
  }
}

Game.prototype.currentFrame = function() {
  return this.frames[this.currentFrameNumber - 1];
};

Game.prototype.inLastFrame = function() {
  return this.currentFrameNumber == this.MAX_FRAMES;
};

Game.prototype.score  = function() {
  return this.frames.reduce(function(score, frame, index, frames) {
    if (frame.finished === false) {
      return score;
    } else {
      if (frame.strike) {
        if (index == this.MAX_FRAMES - 1) {
          if (frame.finished) {
            return score + frame.points;
          } else {
            return score;
          }
        }
        else if (frames[index+1].finished && frames[index+2].finished) {
          frameScore = frame.points + frames[index+1].points + frames[index+2].points;
          return score + frameScore;
        } else {
          return score;
        }
      } else if (frame.spare) {
        if (frames[index+1].finished) {
          frameScore = frame.points + frames[index+1].points;
          return score + frameScore;
        } else {
          return score;
        }
      } else {
        return score + frame.points;
      }
    }
  }, 0);
};

Game.prototype.advanceGame = function() {
  if (this.inLastFrame()) {
    if (this.currentFrame.strike || this.currentFrame.spare) {
      if (this.currentRoll < 3) {
        this.currentRoll += 1;
      } else {
        this.currentFrame().finished = true;
        this.currentFrameNumber = null;
        this.currentRoll = null;
      }
    } else {
      if (this.currentRoll < 2) {
        this.currentRoll += 1;
      } else {
        this.currentFrame().finished = true;
        this.currentFrameNumber = null;
        this.currentRoll = null;
      }
    }
  } else {
    this.currentFrame().finished = true;
    this.currentFrameNumber += 1;
    this.currentRoll = 1;
  }
};

Game.prototype.bowl = function() {
  if (this.ended()) {
    printDebugLine("Game has ended. No rolls left.");
    return;
  }

  var knockedDownPins;
  var currentFrame = this.currentFrame();

  if (this.currentRoll == 1) {
    knockedDownPins = randomPinCount();
    currentFrame.points = knockedDownPins;

    if (currentFrame.points == 10) {
      currentFrame.strike = true;
      this.advanceGame();
    } else {
      this.currentRoll = 2;
    }
  } else if (this.currentRoll == 2) {
    knockedDownPins = randomPinCount(currentFrame.pinsLeft());
    currentFrame.points += knockedDownPins;

    if (currentFrame.points == 10) {
      currentFrame.spare = true;
    }

    this.advanceGame();
  }

  return knockedDownPins;
};

Game.prototype.ended = function() {
  return this.currentFrame == this.MAX_FRAMES && this.currentRoll == 2;
};

Game.prototype.scoreBoard = function() {
  var scoreBoard =  this.frames.map(function(frame, index) {
    var frameDescription = (index + 1) + ": ";
    if (frame.strike) {
      frameDescription += "X";
    } else if (frame.spare) {
      frameDescription += "/";
    } else if (frame.finished) {
      frameDescription += frame.points;
    }
    return frameDescription;
  }).join(' |||| ');

  scoreBoard += "  SCORE: " + this.score();

  return scoreBoard;
};

function printDebugLine(line) {
  debugLine = document.createElement('p');
  debugLine.textContent = line;
  document.getElementById('debug').appendChild(debugLine);
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('bowl-button').addEventListener('click', function() {
    var pinsKnockedDown = game.bowl();
    // printDebugLine("You knocked " + pinsKnockedDown + " down");
    printDebugLine(game.scoreBoard());
  });
});

var game = new Game();
