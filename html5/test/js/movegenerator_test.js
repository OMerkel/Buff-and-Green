/**
 * @file movegenerator_test.js
 * @author Oliver Merkel, <Merkel(dot)Oliver(at)web(dot)de>
 * @date 2016 December 24th
 *
 * @section LICENSE
 *
 * Copyright (c) 2016 Oliver Merkel <Merkel(dot)Oliver(at)web(dot)de>
 * All rights reserved.
 *
 * Released under the MIT license.
 * See file named LICENSE being part of the repository.
 * 
 * @section DESCRIPTION
 *
 * @brief Tests related to the move generator only.
 * 
 * Tests related specifically to the move generator.
 * This checks if the correct moves come from generator
 * according to the rules for a given fixed board situation.
 * The moves are not simulated on board. Correctness of
 * the board is checked in board_test.js instead.
 */

QUnit.module("Move Generator Tests");

QUnit.test( "Check boardString2bitBoard on initial board", function( assert ) {
  var boardString =
    ' w w w w' +
    'w w w w ' +
    ' w w w w' +
    '# # # # ' +
    ' # # # #' +
    'r r r r ' +
    ' r r r r' +
    'r r r r ';
  var actual = Board.boardString2bitBoard(boardString);
  assert.ok( actual.red.checker == 4095, "Red checkers should have value 4095." );
  assert.ok( actual.white.checker == 4095 << 20, "White checkers should have value 4095 << 20." );
  assert.ok( actual.red.king == 0, "Red kings should have value 0." );
  assert.ok( actual.white.king == 0, "White kings should have value 0." );
});

QUnit.test( "Check available moves on initial board", function( assert ) {
  var board = new Board();
  board.init();
  var actual = board.getActions();
  var expected = [
    {
      "from": 9,
      "piece": "checker",
      "to": 14
    },
    {
      "from": 9,
      "piece": "checker",
      "to": 13
    },
    {
      "from": 10,
      "piece": "checker",
      "to": 15
    },
    {
      "from": 10,
      "piece": "checker",
      "to": 14
    },
    {
      "from": 11,
      "piece": "checker",
      "to": 16
    },
    {
      "from": 11,
      "piece": "checker",
      "to": 15
    },
    {
      "from": 12,
      "piece": "checker",
      "to": 16
    }
  ];
  assert.propEqual( actual, expected, "There are seven available moves expected for red player." );
});

QUnit.test( "Captures preferred over moves", function( assert ) {
  var boardString =
    ' w w w w' +
    'w w w w ' +
    ' w # w w' +
    '# w # # ' +
    ' r # # #' +
    '# r r r ' +
    ' r r r r' +
    'r r r r ';
  var bitBoard = Board.boardString2bitBoard(boardString);
  var RED = 0, WHITE = 1;
  var board = new Board();
  board.set( bitBoard, RED );
  var actual = board.getActions();
  var expected = [
    {
      "capture": 19,
      "from": 16,
      "piece": "checker",
      "to": 23
    }
  ];
  assert.propEqual( actual, expected, "Red checker captures 19 from 16 to 23!" );
});

QUnit.test( "Two captures for the two white checkers.", function( assert ) {
  var boardString =
    ' w w w w' +
    'w w w w ' +
    ' w r w w' +
    '# # # # ' +
    ' # # # #' +
    '# r r r ' +
    ' r r r r' +
    'r r r r ';
  var bitBoard = Board.boardString2bitBoard(boardString);
  var RED = 0, WHITE = 1;
  var board = new Board();
  board.set( bitBoard, WHITE );
  var actual = board.getActions();
  var expected = [
    {
      "capture": 23,
      "from": 26,
      "piece": "checker",
      "to": 19
    },
    {
      "capture": 23,
      "from": 27,
      "piece": "checker",
      "to": 18
    }
  ];
  assert.propEqual( actual, expected, "Passed!" );
});

QUnit.test( "Two available captures for one red checker.", function( assert ) {
  var boardString =
    ' w w w w' +
    'w # # w ' +
    ' # w # w' +
    'w w w # ' +
    ' # r # r' +
    'r r # # ' +
    ' # r r r' +
    'r r r r ';
  var bitBoard = Board.boardString2bitBoard(boardString);
  var RED = 0, WHITE = 1;
  var board = new Board();
  board.set( bitBoard, RED );
  var actual = board.getActions();
  var expected = [
    {
      "capture": 19,
      "from": 15,
      "piece": "checker",
      "to": 24
    },
    {
      "capture": 18,
      "from": 15,
      "piece": "checker",
      "to": 22
    }
  ];
  assert.propEqual( actual, expected, "Passed!" );
});

QUnit.test( "Capture backwards for red checker.", function( assert ) {
  var boardString =
    ' # w w w' +
    '# w # w ' +
    ' # w # w' +
    'w w # r ' +
    ' # # w #' +
    'r r # # ' +
    ' r r r r' +
    'r # r r ';
  var bitBoard = Board.boardString2bitBoard(boardString);
  var RED = 0, WHITE = 1;
  var board = new Board();
  board.set( bitBoard, RED );
  var actual = board.getActions();
  var expected = [
    {
      "capture": 14,
      "from": 17,
      "piece": "checker",
      "to": 10
    }
  ];
  assert.propEqual( actual, expected, "Passed!" );
});

QUnit.test( "Capture backwards and forwards for red checker.", function( assert ) {
  var boardString =
    ' w w w w' +
    '# # # # ' +
    ' # w w w' +
    'w w # r ' +
    ' # # w #' +
    'r r # # ' +
    ' r r r r' +
    'r # r r ';
  var bitBoard = Board.boardString2bitBoard(boardString);
  var RED = 0, WHITE = 1;
  var board = new Board();
  board.set( bitBoard, RED );
  var actual = board.getActions();
  var expected = [
    {
      "capture": 14,
      "from": 17,
      "piece": "checker",
      "to": 10
    },
    {
      "capture": 22,
      "from": 17,
      "piece": "checker",
      "to": 26
    }
  ];
  assert.propEqual( actual, expected, "Passed!" );
});

QUnit.test( "Normal moves for red king.", function( assert ) {
  var boardString =
    ' # # # w' +
    '# # # # ' +
    ' # R # #' +
    '# # # # ' +
    ' # # # #' +
    '# # # # ' +
    ' # # # #' +
    '# # # # ';
  var bitBoard = Board.boardString2bitBoard(boardString);
  var RED = 0, WHITE = 1;
  var board = new Board();
  board.set( bitBoard, RED );
  var actual = board.getActions();
  var expected = [
    {
      "from": 23,
      "piece": "king",
      "to": 27
    },
    {
      "from": 23,
      "piece": "king",
      "to": 32
    },
    {
      "from": 23,
      "piece": "king",
      "to": 26
    },
    {
      "from": 23,
      "piece": "king",
      "to": 30
    },
    {
      "from": 23,
      "piece": "king",
      "to": 19
    },
    {
      "from": 23,
      "piece": "king",
      "to": 16
    },
    {
      "from": 23,
      "piece": "king",
      "to": 12
    },
    {
      "from": 23,
      "piece": "king",
      "to": 18
    },
    {
      "from": 23,
      "piece": "king",
      "to": 14
    },
    {
      "from": 23,
      "piece": "king",
      "to": 9
    },
    {
      "from": 23,
      "piece": "king",
      "to": 5
    }
  ];
  assert.propEqual( actual, expected, "Passed!" );
});

QUnit.test( "Normal moves for white king.", function( assert ) {
  var boardString =
    ' # # # R' +
    '# # # # ' +
    ' # W # #' +
    '# # # # ' +
    ' # # r #' +
    '# # # r ' +
    ' # # # #' +
    '# # # # ';
  var bitBoard = Board.boardString2bitBoard(boardString);
  var RED = 0, WHITE = 1;
  var board = new Board();
  board.set( bitBoard, WHITE );
  var actual = board.getActions();
  var expected = [
    {
      "from": 23,
      "piece": "king",
      "to": 27
    },
    {
      "from": 23,
      "piece": "king",
      "to": 32
    },
    {
      "from": 23,
      "piece": "king",
      "to": 26
    },
    {
      "from": 23,
      "piece": "king",
      "to": 30
    },
    {
      "from": 23,
      "piece": "king",
      "to": 19
    },
    {
      "from": 23,
      "piece": "king",
      "to": 16
    },
    {
      "from": 23,
      "piece": "king",
      "to": 12
    },
    {
      "from": 23,
      "piece": "king",
      "to": 18
    }
  ];
  assert.propEqual( actual, expected, "Passed!" );
});

QUnit.test( "Normal moves for two white kings.", function( assert ) {
  var boardString =
    ' # # # R' +
    '# W # # ' +
    ' # W # #' +
    '# # # # ' +
    ' # # r #' +
    '# # # r ' +
    ' # # # #' +
    '# # # # ';
  var bitBoard = Board.boardString2bitBoard(boardString);
  var RED = 0, WHITE = 1;
  var board = new Board();
  board.set( bitBoard, WHITE );
  var actual = board.getActions();
  var expected = [
    {
      "from": 23,
      "piece": "king",
      "to": 26
    },
    {
      "from": 23,
      "piece": "king",
      "to": 30
    },
    {
      "from": 23,
      "piece": "king",
      "to": 19
    },
    {
      "from": 23,
      "piece": "king",
      "to": 16
    },
    {
      "from": 23,
      "piece": "king",
      "to": 12
    },
    {
      "from": 23,
      "piece": "king",
      "to": 18
    },
    {
      "from": 27,
      "piece": "king",
      "to": 32
    },
    {
      "from": 27,
      "piece": "king",
      "to": 31
    },
    {
      "from": 27,
      "piece": "king",
      "to": 24
    },
    {
      "from": 27,
      "piece": "king",
      "to": 20
    }
  ];
  assert.propEqual( actual, expected, "Passed!" );
});
