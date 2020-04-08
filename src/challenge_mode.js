// Create your own puzzle.

'use strict';

// Levels
var LEVELS = {
  1: 'eyJwb3NpdGlvbiI6eyJkNCI6IndOIiwiYTgiOiJiUSIsImI3IjoiYlIiLCJoMSI6ImJRIiwiZzIiOiJiUiJ9LCJmbGFnIjoiZTUifQ==',
  2: 'eyJwb3NpdGlvbiI6eyJkNCI6IndOIiwiYTgiOiJiUSIsImI3IjoiYlIiLCJoMSI6ImJRIiwiZzIiOiJiUiJ9LCJmbGFnIjoiZTQifQ==',
  3: '',
}

// Global variables
var board = null;
var flagLocation = null;
var puzzleNum = -1;
var moves = 0;

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

function prevPuzzle() {
  loadPuzzleNum(puzzleNum - 1);
}

function retryPuzzle() {
  loadPuzzleNum(puzzleNum);
}

function nextPuzzle() {
  loadPuzzleNum(puzzleNum + 1);
}

function loadPuzzleNum(num) {
  window.location.href = window.location.pathname + '?puzzle=' + num;
}

let puzzleNumUrlParam = getUrlParameter('puzzle');
if (puzzleNumUrlParam === "") {
  window.location.href = window.location.pathname + '?puzzle=' + 1;
}
puzzleNum = parseInt(puzzleNumUrlParam);

let encodedGameState = LEVELS[puzzleNum];
let gameState = decodeGameState(encodedGameState);

// Initialize the chessboard.
let config = {
  draggable: true,
  moveSpeed: 'slow',
  dropOffBoard: 'trash',
  onDragStart: onDragStart,
  onDrop: onDrop,
};
config['position'] = gameState.position;

board = Chessboard('board', config);
setDefaultBoardStyle();

flagLocation = gameState.flag;
putFlagOnSquare(flagLocation);

$('#current-level').html('Level ' + puzzleNum);
$('#moves-counter').html('moves: ' + moves);

showAttacks();
