// Knight Moves!
//
// Board Representation:
// This project switches between two types of chess notation for squares.
//  1) Human readable (e.g. a1, d4)
//  2) Computer 0x88 (0x00, 0x33)
// See https://www.chessprogramming.org/0x88 for details about 0x88 notation.
//
// Variable Naming:
// When variables are in computer 0x88 notation, the c prefix is used
// (e.g. cSquare, cOffset). When squares are in human readable notation, no
// prefixes are used (e.g. square).

'use strict';

// Constants.
var SQUARE_SIZE = 49; // TODO(cogan): calculate via function.

let PIECE_OFFSETS = {
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
  let fileVal = cFile & 0x0F;
  return String.fromCharCode(97 + fileVal);
}

function toHumanSquare(cSquare) {
  let f = toHumanFile(cSquare);
  let r = toHumanRank(cSquare);
  return f + r;
}

function toComputerRank(rank) {
  return rank - 1;
}

function toComputerFile(file) {
  return file[0].charCodeAt() - 97;
}

function toComputerSquare(square) {
  let f = toComputerFile(square[0]);
  let r = toComputerRank(square[1]);
  return 16 * r + f;
}

function isBlackPiece(piece) {
  return piece.search(/^b/) === 0;
}

function isWhitePiece(piece) {
  return piece.search(/^w/) === 0;
}

function isCapturable(board, squareOfPiece) {
  let position = board.position();
  for (let square in position) {
    let piece = position[square];
    if (!isBlackPiece(piece)) {
      continue;
    }

    let moves = generateAttackedSquares(board, piece, square);
    for (let move of moves) {
      if (move['to'] == squareOfPiece) {
        return move;
      }
    }
  }
}

function generateAllAttackedSquares(board) {
  let attackedSquares = new Set();

  let position = board.position();
  for (let square in position) {
    let piece = position[square];
    if (!isBlackPiece(piece)) {
      continue;
    }

    let moves = generateAttackedSquares(board, piece, square);
    for (let move of moves) {
      attackedSquares.add(move['to'])
    }
  }
  return [...attackedSquares];
}

function generateAttackedSquares(board, piece, square) {
  let moves = [];

  let pieceType = piece[1].toLowerCase();
  let cSquare = toComputerSquare(square);

  let cPosition = Object.fromEntries(
      Object.entries(board.position())
      .map(([k, v]) => [toComputerSquare(k), v]));

  // TODO(cogan): add pawn logic later.
  if (pieceType == 'p') {
    return;
  }

  for (let j = 0, len = PIECE_OFFSETS[pieceType].length; j < len; j++) {
    let cOffset = PIECE_OFFSETS[pieceType][j];
    let cOffsetSquare = cSquare;

    while (true) {
      cOffsetSquare += cOffset
      if (cOffsetSquare & 0x88) {
        break;
      }

      let pieceOnSquare = cPosition[cOffsetSquare];
      if (pieceOnSquare !== undefined) {
        moves.push({
          'from': square,
          'to': toHumanSquare(cOffsetSquare),
        });
        break;
      }

      moves.push({
        'from': square,
        'to': toHumanSquare(cOffsetSquare),
      });
    }
  }
  return moves;
}

function getRandomSquare() {
  let rank = Math.floor(Math.random() * 8) + 1;
  let fileNumeric = Math.floor(Math.random() * 8) + 1;
  let file = String.fromCharCode(fileNumeric + 96);
  return file + rank;
}

function getRandomSquareExcluding(excludedSquares) {
  let square = getRandomSquare();
  while (excludedSquares.includes(square)) {
    square = getRandomSquare();
  }
  return square;
}

function calculateKnightPath(board, start, dest) {
  let cStart = toComputerSquare(start);
  let cDest = toComputerSquare(dest);

  let blackAttackedSquares = generateAllAttackedSquares(board);

  let cBlackAttackedSquares = blackAttackedSquares.map(
    square => toComputerSquare(square));

  let queue = [];
  queue.push([cStart]);

  while (queue.length !== 0) {
    let queueEntry = queue.pop();
    let cSquare = queueEntry[queueEntry.length - 1];
    for (let j = 0, len = PIECE_OFFSETS['n'].length; j < len; j++) {
      let cOffset = PIECE_OFFSETS['n'][j];
      let cOffsetSquare = cSquare + cOffset;
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
        let path = queueEntry.map(cSquare => toHumanSquare(cSquare));
        return path;
      }

      // otherwise, keep searching.
      let newEntry = queueEntry.slice();
      newEntry.push(cOffsetSquare);
      queue.push(newEntry);
    }
  }
  return 'impossible'
}

function encodeGameState(board, flagLocation) {
  let gameState = {}
  gameState.position = board.position();
  gameState.flag = flagLocation;
  return btoa(JSON.stringify(gameState));
}

function decodeGameState(encodedGameState) {
  return JSON.parse(atob(encodedGameState));
}
