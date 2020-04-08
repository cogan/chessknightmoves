// Generate a random puzzle

'use strict';

// Global variables
var board = null;
var config = null;
var flagLocation = null;
var moves = 0;
var generatedPosition = null;

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

  $('#moves-counter').html('moves: ' + ++moves);

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
  if (target === flagLocation) {
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
    let flagLocation = getRandomSquareExcluding(usedSquares);
    usedSquares.push(flagLocation);
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

    let path = calculateKnightPath(testBoard, knightStartSquare, flagLocation);
    if (path === 'impossible') {
      continue;
    }

    console.log("took " + (i + 1) + " attempt(s) to generate a position.");
    return {
      position: testConfig['position'],
      flagLocation: flagLocation,
    }
  }
  return 'error';
}

function resetPuzzle() {
  board = Chessboard('board', config);
  setDefaultBoardStyle();
  moves = 0;
  $('#moves-counter').html('moves: ' + moves);
  putFlagOnSquare(flagLocation);
}

generatedPosition = generateRandomPosition();

// Initialize the chessboard.
config = {
  draggable: true,
  moveSpeed: 'slow',
  dropOffBoard: 'trash',
  onDragStart: onDragStart,
  onDrop: onDrop,
};
config['position'] = generatedPosition.position;

board = Chessboard('board', config);
setDefaultBoardStyle();

flagLocation = generatedPosition.flagLocation;
putFlagOnSquare(flagLocation);

$('#moves-counter').html('moves: ' + moves);
