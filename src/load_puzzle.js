// Create your own puzzle.

'use strict';

// Global variables
var board = null;
var finishSquare = null;

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

function getUrlParameter(targetParam) {
  let queryString = window.location.search.substring(1);
  let allParams = queryString.split('&');

  for (let i = 0; i < allParams.length; i++) {
    let splitParam = allParams[i].split('=');

    if (splitParam[0] === targetParam) {
      if (splitParam[1] === undefined) {
        return "";
      } else {
        return decodeURIComponent(splitParam[1]);
      }
    }
  }
  return "";
};

// Initialize the chessboard.
let config = {
  draggable: true,
  moveSpeed: 'slow',
  dropOffBoard: 'trash',
  onDragStart: onDragStart,
  onDrop: onDrop,
};

let encodedGameState = getUrlParameter('puzzle_code');
let gameState = decodeGameState(encodedGameState);

config['position'] = gameState.position;

// Prevent the screen from scrolling on mobile when we are trying to play.
$('#board').bind('touchmove', function(e) {
    e.preventDefault();
});

board = Chessboard('board', config);

finishSquare = gameState.flag;
$('#board .square-' + finishSquare).css({
  'background-image': "url('img/green_flag.png')",
  'background-repeat': 'no-repeat',
  'background-size': `${SQUARE_SIZE}px ${SQUARE_SIZE}px`,
})
