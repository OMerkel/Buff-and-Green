/**
 * @file board.js
 * @author Oliver Merkel, <Merkel(dot)Oliver(at)web(dot)de>
 * @date 2016 December 24th
 *
 * @section LICENSE
 *
 * Copyright (c) 2017 Oliver Merkel <Merkel(dot)Oliver(at)web(dot)de>
 * All rights reserved.
 *
 * Released under the MIT license.
 * See file named LICENSE being part of the repository.
 * 
 * @section DESCRIPTION
 *
 * @brief Board Class.
 * 
 * The Board class holds a data model specific to the
 * Buff and Green implementation of Checkers / Draughts.
 * This includes a move generator finding valid moves
 * according to the game rules for the situation as
 * given in the data model. State transitions and board
 * updates are done by performing actions representing
 * the moves.
 */

Board.DIAGONALS = [
  { // 0 (offboard)
    se: [],
    sw: [],
    ne: [],
    nw: []
  },
  { // 1
    se: [],
    sw: [],
    ne: [ 5],
    nw: [ 6, 10, 15, 19, 24, 28]
  },
  { // 2
    se: [],
    sw: [],
    ne: [ 6, 9, 13],
    nw: [ 7, 11, 16, 20]
  },
  { // 3
    se: [],
    sw: [],
    ne: [ 7, 10, 14, 17, 21],
    nw: [ 8, 12]
  },
  { // 4
    se: [],
    sw: [],
    ne: [ 8, 11, 15, 18, 22, 25, 29],
    nw: []
  },
  { // 5
    se: [],
    sw: [ 1],
    ne: [],
    nw: [ 9, 14, 18, 23, 27, 32]
  },
  { // 6
    se: [ 1],
    sw: [ 2],
    ne: [ 9, 13],
    nw: [ 10, 15, 19, 24, 28]
  },
  { // 7
    se: [ 2],
    sw: [ 3],
    ne: [ 10, 14, 17, 21],
    nw: [ 11, 16, 20]
  },
  { // 8
    se: [ 3],
    sw: [ 4],
    ne: [ 11, 15, 18, 22, 25, 29],
    nw: [ 12]
  },
  { // 9
    se: [ 5],
    sw: [ 6, 2],
    ne: [ 13],
    nw: [ 14, 18, 23, 27, 32]
  },
  { // 10
    se: [ 6, 1],
    sw: [ 7, 3],
    ne: [ 14, 17, 21],
    nw: [ 15, 19, 24, 28]
  },
  { // 11
    se: [ 7, 2],
    sw: [ 8, 4],
    ne: [ 15, 18, 22, 25, 29],
    nw: [ 16, 20]
  },
  { // 12
    se: [ 8, 3],
    sw: [],
    ne: [ 16, 19, 23, 26, 30],
    nw: []
  },
  { // 13
    se: [],
    sw: [ 9, 6, 2],
    ne: [],
    nw: [ 17, 22, 26, 31]
  },
  { // 14
    se: [ 9, 5],
    sw: [ 10, 7, 3],
    ne: [ 17, 21],
    nw: [ 18, 23, 27, 32]
  },
  { // 15
    se: [ 10, 6, 1],
    sw: [ 11, 8, 4],
    ne: [ 18, 22, 25, 29],
    nw: [ 19, 24, 28]
  },
  { // 16
    se: [ 11, 7, 2],
    sw: [ 12],
    ne: [ 19, 23, 26, 30],
    nw: [ 20]
  },
  { // 17
    se: [ 13],
    sw: [ 14, 10, 7, 3],
    ne: [ 21],
    nw: [ 22, 26, 31]
  },
  { // 18
    se: [ 14, 9, 5],
    sw: [ 15, 11, 8, 4],
    ne: [ 22, 25, 29],
    nw: [ 23, 27, 32]
  },
  { // 19
    se: [ 15, 10, 6, 1],
    sw: [ 16, 12],
    ne: [ 23, 26, 30],
    nw: [ 24, 28]
  },
  { // 20
    se: [ 16, 11, 7, 2],
    sw: [],
    ne: [ 24, 27, 31],
    nw: []
  },
  { // 21
    se: [],
    sw: [ 17, 14, 10, 7, 3],
    ne: [],
    nw: [ 25, 30]
  },
  { // 22
    se: [ 17, 13],
    sw: [ 18, 15, 11, 8, 4],
    ne: [ 25, 29],
    nw: [ 26, 31]
  },
  { // 23
    se: [ 18, 14, 9, 5],
    sw: [ 19, 16, 12],
    ne: [ 26, 30],
    nw: [ 27, 32]
  },
  { // 24
    se: [ 19, 15, 10, 6, 1],
    sw: [ 20],
    ne: [ 27, 31],
    nw: [ 28]
  },
  { // 25
    se: [ 21],
    sw: [ 22, 18, 15, 11, 8, 4],
    ne: [ 29],
    nw: [ 30]
  },
  { // 26
    se: [ 22, 17, 13],
    sw: [ 23, 19, 16, 12],
    ne: [ 30],
    nw: [ 31]
  },
  { // 27
    se: [ 23, 18, 14, 9, 5],
    sw: [ 24, 20],
    ne: [ 31],
    nw: [ 32]
  },
  { // 28
    se: [ 24, 19, 15, 10, 6, 1],
    sw: [],
    ne: [ 32],
    nw: []
  },
  { // 29
    se: [],
    sw: [ 25, 22, 18, 15, 11, 8, 4],
    ne: [],
    nw: []
  },
  { // 30
    se: [ 25, 21],
    sw: [ 26, 23, 19, 16, 12],
    ne: [],
    nw: []
  },
  { // 31
    se: [ 26, 22, 17, 13],
    sw: [ 27, 24, 20],
    ne: [],
    nw: []
  },
  { // 32
    se: [ 27, 23, 18, 14, 9, 5],
    sw: [ 28],
    ne: [],
    nw: []
  }
];

Board.RED = 'red';
Board.WHITE = 'white';
Board.COLOR = [ Board.RED, Board.WHITE ];
Board.CHECKER = 'checker';
Board.KING = 'king';
Board.DIRECTION = [ 'nw', 'ne', 'sw', 'se' ];

function Board() {}

Board.prototype.init = function() {
  this.piece = { red: { checker: 4095, king: 0 },
    white: { checker: 4095 << 20, king: 0 } };
  this.active = 0; // red
  this.forcedCapturePos = 0;
};

Board.prototype.copy = function() {
  result = new Board();
  result.set( {
    red: { checker: this.piece.red.checker, king: this.piece.red.king },
    white: { checker: this.piece.white.checker, king: this.piece.white.king }
  }, this.active, this.forcedCapturePos );
  return result;
};

Board.prototype.set = function( piece, active, forcedCapturePos ) {
  this.piece = piece;
  this.active = active;
  this.forcedCapturePos = forcedCapturePos;
};

Board.prototype.getActions = function() {
  return this.forcedCapturePos > 0 ?
    this.generateCapture( this.forcedCapturePos ) :
    ( 0 == this.active ?
    this.generateRedMoves() : this.generateWhiteMoves() );
};

Board.prototype.generateCapture = function( pos ) {
  var capture = [];
  if ( this.isColorPiece( Board.RED, Board.CHECKER, pos ) ) {
    this.generateRedCaptureChecker( capture, pos );
  }
  if ( this.isColorPiece( Board.WHITE, Board.CHECKER, pos ) ) {
    this.generateWhiteCaptureChecker( capture, pos );
  }
  return capture;
}

Board.prototype.generateRedCaptureChecker = function( capture, pos ) {
  if ( pos > 8 ) {
    if ( Board.DIAGONALS[pos].sw.length > 1 ) {
      if ( this.isColor( Board.WHITE, Board.DIAGONALS[pos].sw[0] ) &&
        this.isEmptySquare( Board.DIAGONALS[pos].sw[1] ) ) {
        capture[capture.length] = {
          piece: 'checker', capture: Board.DIAGONALS[pos].sw[0],
          from: pos, to: Board.DIAGONALS[pos].sw[1]
        };
      }
    }
    if ( Board.DIAGONALS[pos].se.length > 1 ) {
      if ( this.isColor( Board.WHITE, Board.DIAGONALS[pos].se[0] ) &&
        this.isEmptySquare( Board.DIAGONALS[pos].se[1] ) ) {
        capture[capture.length] = {
          piece: 'checker', capture: Board.DIAGONALS[pos].se[0],
          from: pos, to: Board.DIAGONALS[pos].se[1]
        };
      }
    }
  }
  if ( pos < 25 ) {
    if ( Board.DIAGONALS[pos].nw.length > 1 ) {
      if ( this.isColor( Board.WHITE, Board.DIAGONALS[pos].nw[0] ) &&
        this.isEmptySquare( Board.DIAGONALS[pos].nw[1] ) ) {
        capture[capture.length] = {
          piece: 'checker', capture: Board.DIAGONALS[pos].nw[0],
          from: pos, to: Board.DIAGONALS[pos].nw[1]
        };
      }
    }
    if ( Board.DIAGONALS[pos].ne.length > 1 ) {
      if ( this.isColor( Board.WHITE, Board.DIAGONALS[pos].ne[0] ) &&
        this.isEmptySquare( Board.DIAGONALS[pos].ne[1] ) ) {
        capture[capture.length] = {
          piece: 'checker', capture: Board.DIAGONALS[pos].ne[0],
          from: pos, to: Board.DIAGONALS[pos].ne[1] };
      }
    }
  }
};

Board.prototype.generateRedMoves = function() {
  var move = [], capture = [];
  for(var pos=1; pos<=32; ++pos) {
    if ( this.isColorPiece( Board.RED, Board.CHECKER, pos ) ) {
      this.generateRedCaptureChecker( capture, pos );
      if ( pos < 29 && 0 == capture.length ) {
        if ( Board.DIAGONALS[pos].nw.length > 0 ) {
          if ( this.isEmptySquare( Board.DIAGONALS[pos].nw[0] ) ) {
            move[move.length] = { piece: 'checker',
              from: pos, to: Board.DIAGONALS[pos].nw[0] };
          }
        }
        if ( Board.DIAGONALS[pos].ne.length > 0 ) {
          if ( this.isEmptySquare( Board.DIAGONALS[pos].ne[0] ) ) {
            move[move.length] = { piece: 'checker',
              from: pos, to: Board.DIAGONALS[pos].ne[0] };
          }
        }
      }
    }
    else if ( this.isColorPiece( Board.RED, Board.KING, pos ) ) {
      for(var d=0; d<4; ++d) {
        direction = Board.DIRECTION[d];
        if ( Board.DIAGONALS[pos][direction].length > 0 ) {
          var obstacles = 0;
          var obstacleToCapture = 0;
          var skip = false;
          for (var i=0; i<Board.DIAGONALS[pos][direction].length && obstacles < 2 && !skip; ++i) {
            if (this.isEmptySquare( Board.DIAGONALS[pos][direction][i] )) {
              if (obstacles < 1) {
                move[move.length] = { piece: 'king',
                  from: pos, to: Board.DIAGONALS[pos][direction][i] };
              }
              else {
                capture[capture.length] = {
                  piece: 'king', capture: obstacleToCapture,
                  from: pos, to: Board.DIAGONALS[pos][direction][i]
                };
              }
            }
            else if (this.isColor( Board.WHITE, Board.DIAGONALS[pos][direction][i] )){
              ++obstacles;
              obstacleToCapture = Board.DIAGONALS[pos][direction][i];
            }
            else {
              skip = true;
            }
          }
        }
      }
    }
  }
  return 0 == capture.length ? move : capture;
};

Board.prototype.generateWhiteCaptureChecker = function( capture, pos ) {
  if ( pos > 8 ) {
    if ( Board.DIAGONALS[pos].sw.length > 1 ) {
      if ( this.isColor( Board.RED, Board.DIAGONALS[pos].sw[0] ) &&
        this.isEmptySquare( Board.DIAGONALS[pos].sw[1] ) ) {
        capture[capture.length] = {
          piece: 'checker', capture: Board.DIAGONALS[pos].sw[0],
          from: pos, to: Board.DIAGONALS[pos].sw[1]
        };
      }
    }
    if ( Board.DIAGONALS[pos].se.length > 1 ) {
      if ( this.isColor( Board.RED, Board.DIAGONALS[pos].se[0] ) &&
        this.isEmptySquare( Board.DIAGONALS[pos].se[1] ) ) {
        capture[capture.length] = {
          piece: 'checker', capture: Board.DIAGONALS[pos].se[0],
          from: pos, to: Board.DIAGONALS[pos].se[1]
        };
      }
    }
  }
  if ( pos < 25 ) {
    if ( Board.DIAGONALS[pos].nw.length > 1 ) {
      if ( this.isColor( Board.RED, Board.DIAGONALS[pos].nw[0] ) &&
        this.isEmptySquare( Board.DIAGONALS[pos].nw[1] ) ) {
        capture[capture.length] = {
          piece: 'checker', capture: Board.DIAGONALS[pos].nw[0],
          from: pos, to: Board.DIAGONALS[pos].nw[1]
        };
      }
    }
    if ( Board.DIAGONALS[pos].ne.length > 1 ) {
      if ( this.isColor( Board.RED, Board.DIAGONALS[pos].ne[0] ) &&
        this.isEmptySquare( Board.DIAGONALS[pos].ne[1] ) ) {
        capture[capture.length] = {
          piece: 'checker', capture: Board.DIAGONALS[pos].ne[0],
          from: pos, to: Board.DIAGONALS[pos].ne[1]
        };
      }
    }
  }
};

Board.prototype.generateWhiteMoves = function() {
  var move = [], capture = [];
  for(var pos=1; pos<=32; ++pos) {
    if ( this.isColorPiece( Board.WHITE, Board.CHECKER, pos ) ) {
      this.generateWhiteCaptureChecker( capture, pos );
      if ( pos > 4 && 0 == capture.length ) {
        if ( Board.DIAGONALS[pos].sw.length > 0 ) {
          if ( this.isEmptySquare( Board.DIAGONALS[pos].sw[0] ) ) {
            move[move.length] = { piece: 'checker',
              from: pos, to: Board.DIAGONALS[pos].sw[0] };
          }
        }
        if ( Board.DIAGONALS[pos].se.length > 0 ) {
          if ( this.isEmptySquare( Board.DIAGONALS[pos].se[0] ) ) {
            move[move.length] = { piece: 'checker',
              from: pos, to: Board.DIAGONALS[pos].se[0] };
          }
        }
      }
    }
    else if ( this.isColorPiece( Board.WHITE, Board.KING, pos ) ) {
      for(var d=0; d<4; ++d) {
        direction = Board.DIRECTION[d];
        if ( Board.DIAGONALS[pos][direction].length > 0 ) {
          var obstacles = 0;
          var obstacleToCapture = 0;
          var skip = false;
          for (var i=0; i<Board.DIAGONALS[pos][direction].length && obstacles < 2 && !skip; ++i) {
            if (this.isEmptySquare( Board.DIAGONALS[pos][direction][i] )) {
              if (obstacles < 1) {
                move[move.length] = { piece: 'king',
                  from: pos, to: Board.DIAGONALS[pos][direction][i] };
              }
              else {
                // captures
                capture[capture.length] = {
                  piece: 'king', capture: obstacleToCapture,
                  from: pos, to: Board.DIAGONALS[pos][direction][i]
                };
              }
            }
            else if (this.isColor( Board.RED, Board.DIAGONALS[pos][direction][i] )){
              ++obstacles;
              obstacleToCapture = Board.DIAGONALS[pos][direction][i];
            }
            else {
              skip = true;
            }
          }
        }
      }
    }
  }
  return 0 == capture.length ? move : capture;
};

Board.prototype.isColorPiece = function( color, piece, pos ) {
  return this.piece[color][piece] & ( 1 << (pos-1) );
};

Board.prototype.isColor = function( color, pos ) {
  return (this.piece[color].checker | this.piece[color].king) &
    ( 1 << (pos-1) );
};

Board.prototype.isEmptySquare = function( pos ) {
  return !((this.piece.red.checker | this.piece.red.king |
    this.piece.white.checker | this.piece.white.king) &
    ( 1 << (pos-1) ));
};

Board.prototype.doAction = function( action ) {
  this.piece[Board.COLOR[this.active]][action.piece] ^= ( 1 << (action.from-1) );
  this.piece[Board.COLOR[this.active]][action.piece] ^= ( 1 << (action.to-1) );
  if(action.hasOwnProperty('capture')) {
    var opponent = Board.COLOR[1-this.active];
    var piece = this.isColorPiece( opponent, Board.KING, action.capture ) ?
      Board.KING : Board.CHECKER;
    this.piece[opponent][piece] ^= ( 1 << (action.capture-1) );
    if( 0 == this.generateCapture(action.to).length ) {
      this.forcedCapturePos = 0;
      this.promote(action.to);
      this.nextPlayer();
    } else {
      this.forcedCapturePos = action.to;
    }
    
  } else {
    this.promote(action.to);
    this.nextPlayer();
  }
};

Board.prototype.promote = function( pos ) {
  if (pos < 5 && this.isColorPiece(Board.WHITE, Board.CHECKER, pos)) {
    this.piece.white.checker ^= ( 1 << (pos-1) );
    this.piece.white.king ^= ( 1 << (pos-1) );
  } else if (pos > 28 && this.isColorPiece(Board.RED, Board.CHECKER, pos)) {
    this.piece.red.checker ^= ( 1 << (pos-1) );
    this.piece.red.king ^= ( 1 << (pos-1) );
  };
};

Board.prototype.nextPlayer = function() {
  this.active = 1 - this.active;
};

Board.prototype.getState = function() {
  var board = '';
  for(var pos=1; pos<=32; ++pos) {
    board += this.isColorPiece( Board.WHITE, Board.CHECKER, pos ) ? 'w' : (
      this.isColorPiece( Board.WHITE, Board.KING, pos ) ? 'W' : (
      this.isColorPiece( Board.RED, Board.CHECKER, pos ) ? 'r' : (
      this.isColorPiece( Board.RED, Board.KING, pos ) ? 'R' : '-' )));
  }
  return { square: board, turn: this.active,
    actions: this.getActions() };
};

Board.boardString2bitBoard = function( boardString ) {
  var red = 0, white = 0;
  var piece = { red: { checker: 0, king: 0 }, white: { checker: 0, king: 0 } };
  for(var n=0; n<boardString.length/2; ++n ) {
    var c = boardString.charAt(n*2+(0 == (Math.floor(n/4)%2) ? 1 : 0));
    var shiftBy = (n<boardString.length/2-1 ? 1 : 0)
    piece.red.checker = (piece.red.checker + ('r' == c ? 1 : 0)) << shiftBy;
    piece.red.king = (piece.red.king + ('R' == c ? 1 : 0)) << shiftBy;
    piece.white.checker = (piece.white.checker + ('w' == c ? 1 : 0)) << shiftBy;
    piece.white.king = (piece.white.king + ('W' == c ? 1 : 0)) << shiftBy;
  }
  return piece;
};

Board.boardString2squareString = function( boardString ) {
  var result = '';
  for (var n=boardString.length-1; n>=0; --n) {
    var a = boardString.charAt(n);
    result = result + ( '#' == a ? '-' : ' ' == a ? '' : a );
  }
  return result;
}
