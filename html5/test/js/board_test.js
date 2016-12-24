/**
 * @file board_test.js
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
 * @brief Tests related to board, pieces, and rules of movement.
 * 
 * Tests related to basic functions of board, and movement of pieces.
 * Board situations are set up, and whole sequences of moves for sample
 * situations are simulated. The correct handling of active player and
 * availability of moves are checked if appropriate.
 */

QUnit.module("Board Tests");

QUnit.test( "Check available moves on initial board", function( assert ) {
  var board = new Board();
  board.init();
  var actions = board.getActions();
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
  assert.propEqual( actions, expected, "There are seven available moves expected for red player." );
  board.doAction(actions[2]);
  var state = board.getState();
  var boardString =
    ' w w w w' +
    'w w w w ' +
    ' w w w w' +
    '# # # # ' +
    ' # r # #' +
    'r r # r ' +
    ' r r r r' +
    'r r r r ';
  expected = Board.boardString2squareString(boardString);
  assert.equal( state.square, expected, 'Red checker moved from 10 to 15.');
});

QUnit.test( "Red checker captures 19 from 16 onto 23.", function( assert ) {
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
  var actions = board.getActions();
  var expected = [
    {
      "capture": 19,
      "from": 16,
      "piece": "checker",
      "to": 23
    }
  ];
  assert.propEqual( actions, expected, "Red checker can capture 19 from 16 onto 23!" );
  board.doAction(actions[0]);
  var state = board.getState();
  boardString =
    ' w w w w' +
    'w w w w ' +
    ' w r w w' +
    '# # # # ' +
    ' # # # #' +
    '# r r r ' +
    ' r r r r' +
    'r r r r ';
  expected = Board.boardString2squareString(boardString);
  assert.equal( state.square, expected, 'Red checker captured 19 from 16 onto 23!');
});

QUnit.test( "Just check if specific red checker on 16 is able to capture.", function( assert ) {
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
  var actions = board.generateCapture( 16 );
  var actual = 0 < actions.length;
  var expected = true;
  assert.equal( actual, expected, 'Red checker on 16 is able to capture!');
  expected = [
    {
      "capture": 19,
      "from": 16,
      "piece": "checker",
      "to": 23
    }
  ];
  assert.propEqual( actions, expected, "Red checker can capture 19 from 16 onto 23!" );
  board.doAction(actions[0]);
  var state = board.getState();
  boardString =
    ' w w w w' +
    'w w w w ' +
    ' w r w w' +
    '# # # # ' +
    ' # # # #' +
    '# r r r ' +
    ' r r r r' +
    'r r r r ';
  expected = Board.boardString2squareString(boardString);
  assert.equal( state.square, expected, 'Red checker captured 19 from 16 onto 23!');
  actions = board.generateCapture( 16 );
  actual = 0 < actions.length;
  expected = false;
  assert.equal( actual, expected, 'Red checker on 23 is not able to capture!');
});

QUnit.test( "Just check if specific white checker on 19 is able to capture.", function( assert ) {
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
  board.set( bitBoard, WHITE );
  var actions = board.generateCapture( 19 );
  var actual = 0 < actions.length;
  var expected = true;
  assert.equal( actual, expected, 'White checker on 19 is able to capture!');
  expected = [
    {
      "capture": 16,
      "from": 19,
      "piece": "checker",
      "to": 12
    }
  ];
  assert.propEqual( actions, expected, "White checker can capture 16 from 19 onto 12!" );
  board.doAction(actions[0]);
  var state = board.getState();
  boardString =
    ' w w w w' +
    'w w w w ' +
    ' w # w w' +
    '# # # # ' +
    ' # # # #' +
    'w r r r ' +
    ' r r r r' +
    'r r r r ';
  expected = Board.boardString2squareString(boardString);
  assert.equal( state.square, expected, 'White checker captured 16 from 19 onto 12!');
  actions = board.generateCapture( 12 );
  actual = 0 < actions.length;
  expected = false;
  assert.equal( actual, expected, 'White checker on 12 is not able to capture!');
});

QUnit.test( "Logically track consecutive capture by white checker.", function( assert ) {
  var boardString =
    ' # w # #' +
    '# r # # ' +
    ' # # # #' +
    '# r r r ' +
    ' # # # #' +
    '# # # r ' +
    ' # # # #' +
    '# # # r ';
  var bitBoard = Board.boardString2bitBoard(boardString);
  var RED = 0, WHITE = 1;
  var board = new Board();
  board.set( bitBoard, WHITE );
  var actions = board.getActions();
  var expected = [
    {
      "capture": 27,
      "from": 31,
      "piece": "checker",
      "to": 24
    }
  ];
  assert.propEqual( actions, expected, "White checker must capture 27 from 31 onto 24!" );
  board.doAction(actions[0]);
  actions = board.getActions();
  expected = [
    {
      "capture": 19,
      "from": 24,
      "piece": "checker",
      "to": 15
    }
  ];
  assert.propEqual( actions, expected, "White checker can capture 19 from 24 onto 15!" );
  board.doAction(actions[0]);
  actions = board.getActions();
  expected = [
    {
      "capture": 18,
      "from": 15,
      "piece": "checker",
      "to": 22
    }
  ];
  assert.propEqual( actions, expected, "White checker can capture 18 from 15 onto 22!" );
  board.doAction(actions[0]);
  actions = board.getActions();
  expected = [
    {
      "capture": 17,
      "from": 22,
      "piece": "checker",
      "to": 13
    }
  ];
  assert.propEqual( actions, expected, "White checker can capture 17 from 22 onto 13!" );
  board.doAction(actions[0]);
  actions = board.getActions();
  expected = [
    {
      "capture": 9,
      "from": 13,
      "piece": "checker",
      "to": 6
    }
  ];
  assert.propEqual( actions, expected, "White checker can capture 9 from 13 onto 6!" );
  board.doAction(actions[0]);
  var state = board.getState();
  boardString =
    ' # # # #' +
    '# # # # ' +
    ' # # # #' +
    '# # # # ' +
    ' # # # #' +
    '# # # # ' +
    ' # # w #' +
    '# # # r ';
  expected = Board.boardString2squareString(boardString);
  assert.equal( state.square, expected, 'White checker captured 9 from 13 onto 6! Now it is red player\'s turn.');
  actions = board.getActions();
  expected = [
    {
      "capture": 6,
      "from": 1,
      "piece": "checker",
      "to": 10
    }
  ];
  assert.propEqual( actions, expected, "Next Player. Red checker can capture 6 from 1 onto 10!" );
  board.doAction(actions[0]);
  state = board.getState();
  boardString =
    ' # # # #' +
    '# # # # ' +
    ' # # # #' +
    '# # # # ' +
    ' # # # #' +
    '# # r # ' +
    ' # # # #' +
    '# # # # ';
  expected = Board.boardString2squareString(boardString);
  assert.equal( state.square, expected, 'Red checker remaining on 10!');
  actions = board.getActions();
  expected = [];
  assert.propEqual( actions, expected, 'No move remaining for white player! Last valid move from red player. Red player wins!' );
});

QUnit.test( "White checker promotes to king after capture.", function( assert ) {
  var boardString =
    ' # # # #' +
    '# # # # ' +
    ' # # # #' +
    '# # w # ' +
    ' # # # #' +
    '# # # w ' +
    ' # # r #' +
    'r # # # ';
  var bitBoard = Board.boardString2bitBoard(boardString);
  var RED = 0, WHITE = 1;
  var board = new Board();
  board.set( bitBoard, WHITE );
  var actions = board.getActions();
  var expected = [
    {
      "capture": 6,
      "from": 9,
      "piece": "checker",
      "to": 2
    }
  ];
  assert.propEqual( actions, expected, "White checker must capture 6 from 9 onto 2!" );
  board.doAction(actions[0]);
  var state = board.getState();
  boardString =
    ' # # # #' +
    '# # # # ' +
    ' # # # #' +
    '# # w # ' +
    ' # # # #' +
    '# # # # ' +
    ' # # # #' +
    'r # W # ';
  expected = Board.boardString2squareString(boardString);
  assert.equal( state.square, expected, 'White promoted to king!');
  actions = board.getActions();
  expected = [
    {
      "from": 4,
      "piece": "checker",
      "to": 8
    }
  ];
  assert.propEqual( actions, expected, "Red checker can move from 4 to 8." );
  board.doAction(actions[0]);
  state = board.getState();
  boardString =
    ' # # # #' +
    '# # # # ' +
    ' # # # #' +
    '# # w # ' +
    ' # # # #' +
    '# # # # ' +
    ' r # # #' +
    '# # W # ';
  expected = Board.boardString2squareString(boardString);
  assert.equal( state.square, expected, 'Red checker moved to 8!');
});

QUnit.test( "White checker does not promote to king although reaching opponent base row since it must continue to capture backwards.", function( assert ) {
  var boardString =
    ' # # # #' +
    '# # # # ' +
    ' # # # #' +
    '# # w # ' +
    ' # # # #' +
    '# # # w ' +
    ' # r r #' +
    '# # # # ';
  var bitBoard = Board.boardString2bitBoard(boardString);
  var RED = 0, WHITE = 1;
  var board = new Board();
  board.set( bitBoard, WHITE );
  var actions = board.getActions();
  var expected = [
    {
      "capture": 6,
      "from": 9,
      "piece": "checker",
      "to": 2
    }
  ];
  assert.propEqual( actions, expected, "White checker must capture 6 from 9 onto 2!" );
  board.doAction(actions[0]);
  actions = board.getActions();
  expected = [
    {
      "capture": 7,
      "from": 2,
      "piece": "checker",
      "to": 11
    }
  ];
  assert.propEqual( actions, expected, "No promotion to king. White checker must capture 7 from 2 onto 11!" );
  board.doAction(actions[0]);
  var state = board.getState();
  boardString =
    ' # # # #' +
    '# # # # ' +
    ' # # # #' +
    '# # w # ' +
    ' # # # #' +
    '# w # # ' +
    ' # # # #' +
    '# # # # ';
  expected = Board.boardString2squareString(boardString);
  assert.equal( state.square, expected, 'White checker did not promote to king!');
  expected = 0;
  assert.equal( state.turn, expected, 'Red player\'s turn.');
  actions = board.getActions();
  expected = [];
  assert.propEqual( actions, expected, "No remaining move for red. Last legal move by white. White wins!" );
});

QUnit.test( "Variant 1: If capture possible then red must capture. No need to capture longest path.", function( assert ) {
  var boardString =
    ' # # # #' +
    '# # # # ' +
    ' # # # #' +
    '# # w # ' +
    ' # # # #' +
    '# # w # ' +
    ' r r r #' +
    '# # # # ';
  var bitBoard = Board.boardString2bitBoard(boardString);
  var RED = 0, WHITE = 1;
  var board = new Board();
  board.set( bitBoard, WHITE );
  var actions = board.getActions();
  var expected = [
    {
      "capture": 7,
      "from": 10,
      "piece": "checker",
      "to": 3
    },
    {
      "capture": 6,
      "from": 10,
      "piece": "checker",
      "to": 1
    }
  ];
  assert.propEqual( actions, expected, "White checker can either capture 6 from 10 onto 1 or capture 7 from 10 onto 3!" );
  board.doAction(actions[1]);
  actions = board.getActions();
  expected = [
    {
      "from": 7,
      "piece": "checker",
      "to": 11
    },
    {
      "from": 7,
      "piece": "checker",
      "to": 10
    },
    {
      "from": 8,
      "piece": "checker",
      "to": 12
    },
    {
      "from": 8,
      "piece": "checker",
      "to": 11
    }
  ];
  assert.propEqual( actions, expected, "White captured 6 from 10 to 1. Promotion to king. Now it is red's turn. Red can answer in 4 different ways." );
  var state = board.getState();
  boardString =
    ' # # # #' +
    '# # # # ' +
    ' # # # #' +
    '# # w # ' +
    ' # # # #' +
    '# # # # ' +
    ' r r # #' +
    '# # # W ';
  expected = Board.boardString2squareString(boardString);
  assert.equal( state.square, expected, 'White checker did promote to king!');
  expected = RED;
  assert.equal( state.turn, expected, 'Red player\'s turn.');
});

QUnit.test( "Variant 2: White must capture and decides to capture longest line. Piece does not promote and still needs to continue capturing until no further capture available. Then it is red's turn.", function( assert ) {
  var boardString =
    ' # # # #' +
    '# # # # ' +
    ' # # # #' +
    '# # w # ' +
    ' # # # #' +
    '# # w # ' +
    ' r r r #' +
    '# # # # ';
  var bitBoard = Board.boardString2bitBoard(boardString);
  var RED = 0, WHITE = 1;
  var board = new Board();
  board.set( bitBoard, WHITE );
  var actions = board.getActions();
  var expected = [
    {
      "capture": 7,
      "from": 10,
      "piece": "checker",
      "to": 3
    },
    {
      "capture": 6,
      "from": 10,
      "piece": "checker",
      "to": 1
    }
  ];
  assert.propEqual( actions, expected, "White checker can either capture 6 from 10 onto 1 or capture 7 from 10 onto 3!" );
  board.doAction(actions[0]);
  var state = board.getState();
  boardString =
    ' # # # #' +
    '# # # # ' +
    ' # # # #' +
    '# # w # ' +
    ' # # # #' +
    '# # # # ' +
    ' r # r #' +
    '# w # # ';
  expected = Board.boardString2squareString(boardString);
  assert.equal( state.square, expected, 'White captured 7 from 10 to 3. It does not promote here.');
  expected = WHITE;
  assert.equal( state.turn, expected, 'It is still white player\'s turn.');
  actions = board.getActions();
  expected = [
    {
      "capture": 8,
      "from": 3,
      "piece": "checker",
      "to": 12
    }
  ];
  assert.propEqual( actions, expected, "White must continue to capture 8 from 3 onto 12." );
  board.doAction(actions[0]);
  var state = board.getState();
  boardString =
    ' # # # #' +
    '# # # # ' +
    ' # # # #' +
    '# # w # ' +
    ' # # # #' +
    'w # # # ' +
    ' # # r #' +
    '# # # # ';
  expected = Board.boardString2squareString(boardString);
  assert.equal( state.square, expected, 'White captured 8 from 3 to 12.');
  expected = RED;
  assert.equal( state.turn, expected, 'Red player\'s turn.');
  actions = board.getActions();
  expected = [
    {
      "from": 6,
      "piece": "checker",
      "to": 10
    },
    {
      "from": 6,
      "piece": "checker",
      "to": 9
    }
  ];
  assert.propEqual( actions, expected, "Red can either move from 6 onto 10 or from 6 onto 9." );  
});
