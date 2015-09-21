function randomPinCount(max) {
  var maxPinCount = max || 10;
  return Math.floor(Math.random() * 100) % (maxPinCount + 1);
}

function Frame() {
  this.strike = false;
  this.spare = false;
  this.rollPoints = [];
  this.finished = false;

  return {
    finished: this.finished,
    get strike() { return this.rollPoints[0] && this.rollPoints[0] == 10; },
    get spare() { return this.rollPoints[0] && this.rollPoints[1] && (this.rollPoints[0] + this.rollPoints[1] == 10); },
    rollPoints: this.rollPoints,
    pinsLeft: function() {
      return 10 - this.points();
    },
    points: function() {
      return (this.rollPoints[0] || 0) + (this.rollPoints[1] || 0);
    },
    addRoll: function(knockedDownPins) {
      if (this.last && (this.strike || this.spare)) {
        this.extraRollPoints.push(knockedDownPins);
      } else {
        this.rollPoints.push(knockedDownPins);
      }
    }
  };
}

function Game() {
  var currentFrameNumber = 1;
  var currentRoll = 1;

  this.NUMBER_OF_FRAMES = 10;

  this.frames = [];
  for (var i = 0; i < this.NUMBER_OF_FRAMES; i++) {
    this.frames.push(new Frame());
  }
  this.frames[this.frames.length - 1].last = true;
  this.frames[this.frames.length - 1].extraRollPoints = [];
  this.frames[this.frames.length - 2].beforeLast = true;

  function outputPins(pinNumber) {
    var output = '';
    for(var i = 0; i < pinNumber; i++) {
      output += '💀';
    }
    for(var i = pinNumber; i < 10; i++) {
      output += '📍';
    }
    return output;
  }

  function padLeft(number) {
    var text = "" + number;
    var pad = "____";
    var paddedText = pad.substring(0, pad.length - text.length) + text;
    return paddedText;
  }

  return {
    frames: this.frames,
    currentFrame: function() {
      return this.frames[currentFrameNumber - 1];
    },
    bowl: function() {
      if (this.finished) {
        printDebugLine("Game has ended. No rolls left.");
        return;
      }

      var currentFrame = this.currentFrame();
      var knockedDownPins = randomPinCount(currentFrame.pinsLeft());
      currentFrame.addRoll(knockedDownPins);

      this.advanceGame();

      return knockedDownPins;
    },
    advanceGame: function() {
      if (this.finished) {
        return;
      }

      var currentFrame = this.currentFrame();

      if (currentFrame.last) {
        var extraRollsNeeded = currentFrame.strike || currentFrame.spare;
        if (currentRoll < 2 || (extraRollsNeeded && currentRoll < 3)) {
            currentRoll += 1;
        } else {
          this.finished = true;
        }
      } else {
        if (currentFrame.strike || currentFrame.spare || currentRoll == 2) {
          currentFrame.finished = true;
          currentFrameNumber += 1;
          currentRoll = 1;
        } else {
          currentRoll = 2;
        }
      }
    },
    score: function() {
      var game = this;
      return this.frames.reduce(function(score, frame, index, frames) {
        var result = score + frame.points();

        if (frame.strike) {
          result += game.getTwoNextRolePoints(frame, index);
        }

        if (frame.spare) {
          result += game.getNextRolePoints(frame, index);
        }

        return result;
      }, 0);
    },
    getNextRolePoints: function(currentFrame, index) {
      if (currentFrame.last) {
        return currentFrame.extraRollPoints[0] || 0;
      } else {
        var nextFrame = this.frames[index+1];
        return nextFrame.rollPoints[0] || 0;
      }
    },
    getTwoNextRolePoints: function(currentFrame, index) {
      if (currentFrame.last) {
        return (currentFrame.extraRollPoints[0] + currentFrame.extraRollPoints[1])|| 0;
      } else {
        var nextFrame = this.frames[index+1];
        if (nextFrame.strike) {
          if (nextFrame.last) {
            return (10 + nextFrame.extraRollPoints[0]) || 0;
          } else {
            return (10 + this.frames[index+2].rollPoints[0]) || 0;
          }
        } else {
          return (nextFrame.rollPoints[0] + nextFrame.rollPoints[1]) || 0;
        }
      }
    },
    scoreBoard: function() {
      var points;
      var scoreBoard;

      scoreBoard = this.frames.map(function(frame, index) {
        var paddedText = padLeft(index+1);
        var line = '' + (paddedText) + ' ';
        points = frame.points();
        line += outputPins(frame.points());
        line += " -> " + frame.points();
        return line;
      }).join("\n");

      var lastFrame = this.frames[this.frames.length - 1];
      if (lastFrame.strike || lastFrame.spare) {
        points = lastFrame.extraRollPoints[0] || 0;
        var paddedText = padLeft("10.1");
        scoreBoard += "\n" + paddedText + " " + outputPins(points);
        scoreBoard += " -> " + points;
      }
      if (lastFrame.strike) {
        points = lastFrame.extraRollPoints[1] || 0;
        var paddedText = padLeft("10.2");
        scoreBoard += "\n" + paddedText + " " + outputPins(points);
        scoreBoard += " -> " + points;
      }

      scoreBoard += "\n score: " + this.score();

      return scoreBoard;
    }
  };
}

function printDebugLine(line) {
  document.getElementById('debug').innerText += '\n' + line;
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('scoreboard').innerText = game.scoreBoard();
  document.getElementById('bowl-button').addEventListener('click', function() {
    var knockedDownPins = game.bowl();
    document.getElementById('scoreboard').innerText = game.scoreBoard();
    if (knockedDownPins) {
      printDebugLine(knockedDownPins + " knocked down!");
    }
  });
});

var game = new Game();
