// Generate a random puzzle

'use strict';

// Global variables
var board = null;

function onDragStart(source, piece, position, orientation) {
  if (!isWhitePiece(piece)) {
    return false;
  }
}

function onDrop(source, target) {
  // Verify that this is a valid move for the knight.
  let cSource = toComputerSquare(source);
  let cTarget = toComputerSquare(target);
  let offset = cTarget - cSource;
  if (!PIECE_OFFSETS["n"].includes(offset)) {
    return 'snapback'
  }

  // Check if any black piece can capture the knight.
  let capture = isCapturable(board, target);
  if (capture !== undefined) {
    let captureString = capture['from'] + '-' + capture['to'];
    window.setTimeout(function() {
      board.move(captureString);
      window.setTimeout(function() {
        alert("you lose!");
      }, 1000)
    }, 250)
  }

  // Check if the knight made it to the finish.
  if (target === finishSquare) {
    window.setTimeout(function() {
      alert('you win!')
    }, 250);
    return;
  }
}

function generateRandomPosition() {
  for (let i = 0; i < 100; i++) {
    let usedSquares = [];
    let knightStartSquare = getRandomSquare();
    usedSquares.push(knightStartSquare);
    let finishSquare = getRandomSquareExcluding(usedSquares);
    usedSquares.push(finishSquare);
    let blackQueenSquare = getRandomSquareExcluding(usedSquares);
    usedSquares.push(blackQueenSquare);
    let blackRookSquare = getRandomSquareExcluding(usedSquares);
    usedSquares.push(blackRookSquare);
    let blackBishopSquare = getRandomSquareExcluding(usedSquares);
    usedSquares.push(blackBishopSquare);

    let testConfig = {};
    testConfig['position'] = {};
    testConfig['position'][knightStartSquare] = 'wN';
    testConfig['position'][blackQueenSquare] = 'bQ';
    testConfig['position'][blackRookSquare] = 'bR';
    testConfig['position'][blackBishopSquare] = 'bB';

    let testBoard = Chessboard('board', testConfig);

    let blackAttackedSquares = generateAllAttackedSquares(testBoard);
    if (blackAttackedSquares.includes(knightStartSquare)) {
      continue;
    }

    let path = calculateKnightPath(testBoard, knightStartSquare, finishSquare);
    if (path === 'impossible') {
      continue;
    }

    console.log("took " + (i + 1) + " attempt(s) to generate a position.");
    return {
      position: testConfig['position'],
      finishSquare: finishSquare,
    }
  }
  return 'error';
}

// Initialize the chessboard.
let config = {
  draggable: true,
  moveSpeed: 'slow',
  dropOffBoard: 'trash',
  sparePieces: true,
  onDragStart: onDragStart,
  onDrop: onDrop,
};

let generatedPosition = generateRandomPosition();
config['position'] = generatedPosition.position;

// Prevent the screen from scrolling on mobile when we are trying to play.
$('#board').bind('touchmove', function(e) {
    e.preventDefault();
});

board = Chessboard('board', config);

let finishSquare = generatedPosition.finishSquare;
let $square = $('#board .square-' + finishSquare);
$square.css('background', '#87097b');
