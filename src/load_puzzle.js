// Create your own puzzle.

'use strict';

// Global variables
var board = null;
var flagLocation = null;

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
  if (target === flagLocation) {
    window.setTimeout(function() {
      alert('you win!')
    }, 250);
    return;
  }
}

function loadPuzzle() {
  let inputCode = $('#puzzle-input').val();
  let gameState = decodeGameState(inputCode);

  config['position'] = gameState.position;

  board = Chessboard('board', config);
  setDefaultBoardStyle();

  flagLocation = gameState.flag;
  putFlagOnSquare(flagLocation);
}

// Initialize the chessboard.
let config = {
  draggable: true,
  moveSpeed: 'slow',
  dropOffBoard: 'trash',
  onDragStart: onDragStart,
  onDrop: onDrop,
};

let puzzleCodeUrlParam = getUrlParameter('puzzle_code');
if (puzzleCodeUrlParam !== "")
{
  let gameState = decodeGameState(puzzleCodeUrlParam);
  config['position'] = gameState.position;
}

board = Chessboard('board', config);
setDefaultBoardStyle();

if (puzzleCodeUrlParam !== "") {
  flagLocation = gameState.flag;
  putFlagOnSquare(flagLocation);
}
