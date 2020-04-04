// Knight Moves!
//
// Board Representation:
// This project switches between two types of chess notation for squares.
//  1) Human readable (e.g. a1, d4)
//  2) Computer 0x88 (0x00, 0x33)
// See https://www.chessprogramming.org/0x88 for details about 0x88 notation.
//
// Variable Naming:
// When squares are in human notation, the h prefix is used, e.g. hSquare. When
// squares are in computer 0x88 notation, the c prefix is used (e.g. cSquare).

var PIECE_OFFSETS = {
  n: [-18, -33, -31, -14, 18, 33, 31, 14],
  b: [-17, -15, 17, 15],
  r: [-16, 1, 16, -1],
  q: [-17, -16, -15, 1, 17, 16, 15, -1],
  k: [-17, -16, -15, 1, 17, 16, 15, -1]
}

function toHumanRank(cRank) {
  return (cRank >> 4) + 1;
}

function toHumanFile(cFile) {
  var fileVal = cFile & 0x0F;
  return String.fromCharCode(97 + fileVal);
}

function toHumanSquare(cSquare) {
  var f = toHumanFile(cSquare);
  var r = toHumanRank(cSquare);
  return f + r;
}

function toComputerRank(hRank) {
  return hRank - 1;
}

function toComputerFile(hFile) {
  return hFile[0].charCodeAt() - 97;
}

function toComputerSquare(hSquare) {
  var f = toComputerFile(hSquare[0]);
  var r = toComputerRank(hSquare[1]);
  return 16 * r + f;
}

function onDragStart(source, piece, position, orientation) {
  // allow dragging spare pieces onto the board during testing.
  if (source == 'spare') {
    return true;
  }

  if (piece.search(/^w/) !== 0) {
    return false
  }
}

function onDrop(hSource, hTarget) {
  // allow dragging spare pieces onto the board during testing.
  if (hSource == 'spare') {
    return;
  }

  cSource = toComputerSquare(hSource);
  cTarget = toComputerSquare(hTarget);

  var offset = cTarget - cSource;
  if (!PIECE_OFFSETS["n"].includes(offset)) {
    return 'snapback'
  }

  if (hTarget == hTargetSquare) {
    window.setTimeout(function() {
      alert('you win!')
    }, 250);
    return;
  }

  capture = checkForCaptures(cTarget);
  if (capture !== undefined) {
    var captureString = capture['hFrom'] + '-' + capture['hTo'];
    window.setTimeout(function() {
      board.move(captureString);
      window.setTimeout(function() {
        alert("you lose!");
      }, 1000)
    }, 250)
  }
}

function checkForCaptures(cKnightSquare) {
  var position = board.position();
  for (hSquare in position) {
    var piece = position[hSquare];
    if (piece.search(/^b/) !== 0) {
      continue;
    }

    moves = generateMoves(piece, hSquare);
    hKnightSquare = toHumanSquare(cKnightSquare);
    for (move of moves) {
      if (move['hTo'] == hKnightSquare) {
        return move;
      }
    }
  }
}


function generateMoves(piece, hSquare) {
  var moves = [];

  var cSquare = toComputerSquare(hSquare);
  var piece_type = piece[1].toLowerCase();

  // TODO(cogan): add pawn logic later.
  if (piece_type == 'p') {
    return;
  }

  for (var j = 0, len = PIECE_OFFSETS[piece_type].length; j < len; j++) {
    var offset = PIECE_OFFSETS[piece_type][j];
    var cOffsetSquare = cSquare;

    while (true) {
      cOffsetSquare += offset
      if (cOffsetSquare & 0x88) {
        break;
      }

      moves.push({
        'hFrom': hSquare,
        'hTo': toHumanSquare(cOffsetSquare),
      });
      // TODO(cogan): need a way to get what pieces are on the board
      // check if it's hitting our own piece
      // check if it's a capture
    }
  }
  return moves;
}

function getRandomSquare() {
    var rank = Math.floor(Math.random() * 8) + 1;
    var fileNumeric = Math.floor(Math.random() * 8) + 1;
    var file = String.fromCharCode(fileNumeric + 96);
    return file + rank;
}

// Initialize the chessboard.
var config = {
  draggable: true,
  moveSpeed: 'slow',
  dropOffBoard: 'trash',
  sparePieces: true,
  onDragStart: onDragStart,
  onDrop: onDrop,
};

// Put the knight on a random square.
var hKnightStartSquare = getRandomSquare();
config['position'] = {}
config['position'][hKnightStartSquare] = 'wN'

// Prevent the screen from scrolling on mobile when we are trying to play.
$('#board').bind('touchmove', function(e) {
    e.preventDefault();
});

var board = Chessboard('board', config);

// Pick a random square for the destination, and make sure it's not the same
// as the square we're starting on!
var hTargetSquare = getRandomSquare();
while (hTargetSquare === hKnightStartSquare) {
  hTargetSquare = getRandomSquare();
}
var $square = $('#board .square-' + hTargetSquare);
$square.css('background', '#87097b');
