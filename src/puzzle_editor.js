// Create your own puzzle.

'use strict';

// Constants
let INITIAL_FLAG_SQUARE = 'e5';
let DRAGGED_FLAG_ID = 'dragged-flag';
let DEFAULT_DRAG_THROTTLE_RATE = 20;

// Global variables
var board = null;
var isDraggingFlag = false;
var flagLocation = INITIAL_FLAG_SQUARE;
var squareElsOffsets = {};
var $draggedFlag = null;

function throttle (f, interval, scope) {
  var timeout = 0
  var shouldFire = false
  var args = []

  var handleTimeout = function () {
    timeout = 0
    if (shouldFire) {
      shouldFire = false
      fire()
    }
  }

  var fire = function () {
    timeout = window.setTimeout(handleTimeout, interval)
    f.apply(scope, args)
  }

  return function (_args) {
    args = arguments
    if (!timeout) {
      fire()
    } else {
      shouldFire = true
    }
  }
}

function stopDefault (evt) {
  evt.preventDefault()
}

function onDrop(source, target) {
  let encodedGameState = encodeGameState(board.position(), flagLocation);
  $('#puzzle-output').val(encodedGameState);
}

function mousedownSquare(evt) {
  let clickedSquare = $(this).attr('data-square')
  if (clickedSquare !== flagLocation) return;

  // if there is also a piece on this square, drag the piece instead of the
  // flag. Otherwise we'll drag both the piece and the flag at the same time
  // and they'll be stuck together.
  if (board.position().hasOwnProperty(clickedSquare)) return;

  beginDraggingFlag(clickedSquare, evt.pageX, evt.pageY)
}

function mousemoveWindow(evt) {
  if (isDraggingFlag) {
    updateDraggedFlag(evt.pageX, evt.pageY)
  }
}

function mouseupWindow(evt) {
  // do nothing if we are not dragging the flag
  if (!isDraggingFlag) return

  // get the location
  var location = isXYOnSquare(evt.pageX, evt.pageY)

  dropDraggedFlagOnSquare(location);

  // update the encoded game state.
  let encodedGameState = encodeGameState(board.position(), flagLocation);
  $('#puzzle-output').val(encodedGameState);
}

function beginDraggingFlag(source, x, y) {
  isDraggingFlag = true;

  captureSquareOffsets();

  // show the dragged piece, and put it over the mouse cursor.
  $draggedFlag.css({
    display: '',
    position: 'absolute',
    left: x - SQUARE_SIZE / 2,
    top: y - SQUARE_SIZE / 2,
  })

  // TODO: highlight the source square (optional)

  $('#board .square-' + flagLocation).css({
    'background-image': "",
    'background-repeat': "",
    'background-size': "",
  })
}

function updateDraggedFlag(x, y) {
  // put the dragged piece over the mouse cursor
  $draggedFlag.css({
    left: x - SQUARE_SIZE / 2,
    top: y - SQUARE_SIZE / 2
  })

  // TODO: add highlight logic (optional)
}

function dropDraggedFlagOnSquare(square) {
  flagLocation = square;
  putFlagOnSquare(flagLocation);
  isDraggingFlag = false;
  $draggedFlag.css('display', 'none')
}

// records the XY coords of every square into memory
function captureSquareOffsets() {
  squareElsOffsets = {}

  for (let file of 'abcdefgh') {
    for (let rank of [1, 2, 3, 4, 5, 6, 7, 8]) {
      let square = file + rank;
      squareElsOffsets[square] = $('#board .square-' + square).offset()
    }
  }
  return squareElsOffsets;
}

function isXYOnSquare(x, y) {
  for (let sq in squareElsOffsets) {
    if (!squareElsOffsets.hasOwnProperty(sq)) continue;

    var s = squareElsOffsets[sq]
    if (x >= s.left &&
        x < s.left + SQUARE_SIZE &&
        y >= s.top &&
        y < s.top + SQUARE_SIZE) {
      return sq;
    }
  }

  return 'offboard';
}

function validatePuzzle() {
  // TODO(cogan)
}

function generateLink() {
  let encodedGameState = encodeGameState(board.position(), flagLocation);

  let currentUrl = window.location.href;
  let puzzleUrl = currentUrl.replace('puzzle_editor.html', 'load_puzzle.html');
  puzzleUrl += '?puzzle_code=' + encodeURIComponent(encodedGameState);
  console.log(decodeGameState(encodedGameState));
  console.log("encodedGameState")
  console.log(encodedGameState);
  console.log("puzzleUrl");
  console.log(puzzleUrl);
}

function buildFlagHtml(id, hidden) {
  let flag_size = SQUARE_SIZE;

  let html = `<img src="img/green_flag.png" id="${id}" ` +
    `class="ui-widget-content" ` +
    `style="width:${flag_size}px;height:${flag_size}px;`

  if (hidden) {
    html += 'display:none;'
  }

  html += '" />'

  return html;
}

// Initialize the chessboard.
var config = {
  draggable: true,
  dropOffBoard: 'trash',
  sparePieces: true,
  position: {
    d4: 'wN',
  },
  onDrop: onDrop,
};

board = Chessboard('board', config);
setDefaultBoardStyle();

// Place the flag in an initial position.
putFlagOnSquare(INITIAL_FLAG_SQUARE);

// create the dragged flag
$('body').append(buildFlagHtml(DRAGGED_FLAG_ID, true))
$draggedFlag = $('#' + DRAGGED_FLAG_ID)

var throttledMousemoveWindow =
    throttle(mousemoveWindow, DEFAULT_DRAG_THROTTLE_RATE);

// prevent "image drag"
$('body').on('mousedown mousemove', '#' + DRAGGED_FLAG_ID, stopDefault)

$('#board').on('mousedown', '.square-55d63', mousedownSquare);
$(window)
    .on('mousemove', throttledMousemoveWindow)
    .on('mouseup', mouseupWindow);

$('#board .square-a1').addClass('attacked-square');

$('.spare-pieces-7492f').css('paddingLeft', '0px')
