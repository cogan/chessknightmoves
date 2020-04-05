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

// global variables, initialized later (yay)
var board = null;
var hTargetSquare = null;

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

  hCapture = hCheckForCaptures(cTarget);
  if (hCapture !== undefined) {
    var captureString = hCapture['from'] + '-' + hCapture['to'];
    window.setTimeout(function() {
      board.move(captureString);
      window.setTimeout(function() {
        alert("you lose!");
      }, 1000)
    }, 250)
  }
}

function hCheckForCaptures(cKnightSquare) {
  var position = board.position();
  for (hSquare in position) {
    var piece = position[hSquare];
    if (piece.search(/^b/) !== 0) {
      continue;
    }

    moves = hGenerateAttackedSquares(piece, hSquare);
    hKnightSquare = toHumanSquare(cKnightSquare);
    for (move of moves) {
      if (move['to'] == hKnightSquare) {
        return move;
      }
    }
  }
}

function hGenerateAllAttackedSquares() {
  hAttackedSquares = new Set();

  var position = board.position();
  for (hSquare in position) {
    var piece = position[hSquare];
    if (piece.search(/^b/) !== 0) {
      continue;
    }

    hMoves = hGenerateAttackedSquares(piece, hSquare);
    for (hMove of hMoves) {
      hAttackedSquares.add(hMove['to'])
    }
  }
  return [...hAttackedSquares];
}

function hGenerateAttackedSquares(piece, hSquare) {
  var moves = [];

  var cSquare = toComputerSquare(hSquare);
  var pieceType = piece[1].toLowerCase();

  // TODO(cogan): add pawn logic later.
  if (pieceType == 'p') {
    return;
  }

  for (var j = 0, len = PIECE_OFFSETS[pieceType].length; j < len; j++) {
    var offset = PIECE_OFFSETS[pieceType][j];
    var cOffsetSquare = cSquare;

    while (true) {
      cOffsetSquare += offset
      if (cOffsetSquare & 0x88) {
        break;
      }

      moves.push({
        'from': hSquare,
        'to': toHumanSquare(cOffsetSquare),
      });
      // TODO(cogan): need a way to get what pieces are on the board
      // check if it's hitting our own piece
      // check if it's a capture
    }
  }
  return moves;
}

function hGetRandomSquare() {
  var rank = Math.floor(Math.random() * 8) + 1;
  var fileNumeric = Math.floor(Math.random() * 8) + 1;
  var file = String.fromCharCode(fileNumeric + 96);
  return file + rank;
}

function hGetRandomSquareExcluding(hExcludedSquares) {
  var hSquare = hGetRandomSquare();
  while (hExcludedSquares.includes(hSquare)) {
    hSquare = hGetRandomSquare();
  }
  return hSquare;
}

function hCalculateKnightPath(hStart, hDest) {
  var cStart = toComputerSquare(hStart);
  var cDest = toComputerSquare(hDest);

  var hBlackAttackedSquares = hGenerateAllAttackedSquares();

  var cBlackAttackedSquares = hBlackAttackedSquares.map(
    hSquare => toComputerSquare(hSquare));

  var queue = [];
  queue.push([cStart]);

  while (queue.length !== 0) {
    var queueEntry = queue.pop();
    var cSquare = queueEntry[queueEntry.length - 1];
    for (var j = 0, len = PIECE_OFFSETS['n'].length; j < len; j++) {
      var offset = PIECE_OFFSETS['n'][j];
      var cOffsetSquare = cSquare + offset;
      if (cOffsetSquare & 0x88) {
        // we're off the board.
        continue;
      }
      if (queueEntry.includes(cOffsetSquare)) {
        // we've already visited this square.
        continue;
      }
      if (cBlackAttackedSquares.includes(cOffsetSquare)) {
        // this square is not safe!
        continue;
      }
      // TODO(cogan): if we ever have friendly pieces on the board, we need
      // to take them into account, because they can block our path.
      if (cOffsetSquare === cDest) {
        // we found our destination!
        queueEntry.push(cOffsetSquare);
        return queueEntry;
      }

      // otherwise, keep searching.
      var newEntry = queueEntry.slice();
      newEntry.push(cOffsetSquare);
      queue.push(newEntry);
    }
  }
  return 'impossible'
}

function generateRandomPosition() {
  for (var i = 0; i < 100; i++) {
    hUsedSquares = [];
    var hKnightStartSquare = hGetRandomSquare();
    hUsedSquares.push(hKnightStartSquare);
    var hTargetSquare = hGetRandomSquareExcluding(hUsedSquares);
    hUsedSquares.push(hTargetSquare);
    var hBlackQueenSquare = hGetRandomSquareExcluding(hUsedSquares);
    hUsedSquares.push(hBlackQueenSquare);
    var hBlackRookSquare = hGetRandomSquareExcluding(hUsedSquares);
    hUsedSquares.push(hBlackRookSquare);
    var hBlackBishopSquare = hGetRandomSquareExcluding(hUsedSquares);
    hUsedSquares.push(hBlackBishopSquare);

    var testConfig = {};
    testConfig['position'] = {};
    testConfig['position'][hKnightStartSquare] = 'wN';
    testConfig['position'][hBlackQueenSquare] = 'bQ';
    testConfig['position'][hBlackRookSquare] = 'bR';
    testConfig['position'][hBlackBishopSquare] = 'bB';

    board = Chessboard('board', testConfig);

    var hBlackAttackedSquares = hGenerateAllAttackedSquares();
    if (hBlackAttackedSquares.includes(hKnightStartSquare)) {
      continue;
    }

    hPath = hCalculateKnightPath(hKnightStartSquare, hTargetSquare);
    if (hPath === 'impossible') {
      continue;
    }

    console.log("took " + (i + 1) + " attempt(s) to generate a position.");
    return {
      position: testConfig['position'],
      hTargetSquare: hTargetSquare,
    }
  }
  return 'error';
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

var generatedPosition = generateRandomPosition();
config['position'] = generatedPosition.position;

// Prevent the screen from scrolling on mobile when we are trying to play.
$('#board').bind('touchmove', function(e) {
    e.preventDefault();
});

board = Chessboard('board', config);

hTargetSquare = generatedPosition.hTargetSquare;
var $square = $('#board .square-' + hTargetSquare);
$square.css('background', '#87097b');
