// Utilities for working with the chessboard.

'use strict';

// Constants
var SQUARE_SIZE = 52; // TODO(cogan): calculate via function.
let LIGHT_SQUARE_DEFAULT_COLOR = '#dee3e6';
let DARK_SQUARE_DEFAULT_COLOR = '#8ca2ad';
let LIGHT_SQUARE_ATTACKED_COLOR = '#475dcf';
let DARK_SQUARE_ATTACKED_COLOR = '#334cca';

function showAttacks() {
  clearBoard();

  let squares = generateAllAttackedSquares(board);
  for (let square of squares) {
    paintAttackedSquare(square);
  }
}

function hideAttacks() {
  clearBoard();
}

function paintAttackedSquare(square) {
  let $square = $('#board .square-' + square)

  let background = LIGHT_SQUARE_ATTACKED_COLOR;
  if ($square.hasClass('black-3c85d')) {
    background = DARK_SQUARE_ATTACKED_COLOR;
  }

  $square.css('background-color', background)
}

function setDefaultBoardStyle() {
  $('.white-1e1d7').css('background-color', '#dee3e6');
  $('.black-3c85d').css('background-color', '#8ca2ad');
}

function clearBoard() {
  // Set the board to the default style.
  $('.white-1e1d7').css('background-color', '#dee3e6');
  $('.black-3c85d').css('background-color', '#8ca2ad');

  putFlagOnSquare(flagLocation)
}

function putFlagOnSquare(square) {
  $('#board .square-' + square).css({
    'background-image': "url('img/green_flag.png')",
    'background-repeat': 'no-repeat',
    'background-size': `${SQUARE_SIZE}px ${SQUARE_SIZE}px`,
  })
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
