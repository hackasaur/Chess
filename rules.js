// Rules of chess:
  // PAWN: can move one square forward(if there is no piece already on the square)
  // can move 1 square diagonally only if there is a piece to capture and can be 
  // promoted* on the opposite last rank
  // also can move 2 squares forward on 1st move also enpassant*.
  // KING: can move 1 square in any direction unless that square is being attacked.
  // can castle*
  // It is checkmate if king is under attack and there is no square to move to.
  // BISHOP: can move and capture enemy pieces anywhere diagonally unless a piece is
  // in the way
  // ROOK: can move anywhere vertically or horizontally unless there is a piece in
  // the way. Can castle*
  // QUEEN: can move diagnolly, vertically, horizontally to any square unless
  // a piece is blocking it.
  // KNIGHT: can move to squares that are horizontally or vertically 2 squares away
  // and 1 square adjacent to that square.
  //disambiguation moves

//TODO:
  //[ ] rook-king castling
  //[ ] alternate turns of black and white
  //[ ] pawn promotion
  //[ ] add rules for capturing(also king)
  //[ ] add rules for en passant
  //[ ] make a list of moves made
  //[x] knight
  //[x] pawn can move 2 steps on it's 1st move
  //[ ] king
  //[x] queen
  //[x] rook
  //[x] bishop
  //[ ] pawn

import { alphabetOrder } from './board.js'

function rectBoardSquares(ncol, nrow){
  /*returns an array containing all the coordinates of the board*/
  let row=[]
  let board = []
  let square = ""
  for(let j=1; j<=nrow; j++){
    for(let i=1; i<=ncol; i++){
      square = `${alphabetOrder[i-1]}${j}`
      row.push(square)
    }
    board.push(row)
    row = []
  }
  return board
}

function isBoardAndPositionLegit(board, position){
  /*checks whether: square in `position` exists on the board
   and if there are duplicate values in the position or board
  throws error if not*/
  for (let row of board){
    if((new Set(row).size) !== row.length){
      throw `${board} has duplicate values`
    }

  }

  let positionAll = position.white.concat(position.black)

  if((new Set(positionAll)).size !== positionAll.length){
    throw `${position} has duplicate values`
  }

  let legit = false
  let pieceCoordinate = ""
  for(let piecePosition of positionAll){
    pieceCoordinate = (piecePosition.length === 2) ? piecePosition : piecePosition.slice(1,) //since first letter is piece name exception pawns

    legit = false
    for(let row of board){
      if(row.includes(pieceCoordinate)){
        legit = true
        break
      }
    }
  }
  if(legit === false){
    throw `isBoardAndPositionLegit:'${pieceCoordinate}' square in ${position} doees not exist on the board`
  }
}

function identifyPiece(position, piecePosition){
  /*indentifies piece from piecePosition and position then returns pieceType
  e.g. (Ke1, {white: ['Ke1',...], black: [...]}) will return "wK"*/
  let piece = {pieceLetter:'', color:''}
  let pieceLetter = ""
  pieceLetter = piecePosition.length === 2 ? 'P' : piecePosition[0]
  piece.pieceLetter = pieceLetter
  if(position.white.includes(piecePosition)){
    piece.color = "white"
  }
  else if(position.black.includes(piecePosition)){
    piece.color = "black"
  }
  else{
    throw `${piecePosition} piece was not found in the position`
  }
  return piece
}

function isSquareEmptyAllyEnemy(position, square, color){
  /*checks whether square is occupied by an enemy or ally piece or is empty
    e.g. for a positon(position of the board), square(that needs to be checked), color(color of ally) returns string "ally", "enemy", "empty"*/
  let occupied = false
  let enemyColor = returnEnemyColor(color)

  for(let piecePosition of position[color]){
    let coord = piecePosition.slice(-2,)
    if(coord === square){
      occupied=true
      break
    }
  }
  if(occupied === true){
    return "ally"
  }

  //if by an enemyColor piece
  for(let piecePosition of position[enemyColor]){
    let coord = piecePosition.slice(-2,)
    if(coord === square){
      occupied=true
      break
    }
  }
  if(occupied === true){
    return "enemy"
  }

  return "empty"
}

function returnEnemyColor(color){
  if(color === "white"){
    return "black"
  }
  else if(color === "black"){
    return "white"
  }
}

function isSquareOnBoard(board, square){
  let exists = false
  for (let row of board){
    for(let sqr of row){
      if(sqr === square){
        exists = true
        break
      }
    }
    if(exists === true){
      break
    }
  }

  return exists
}

function checkPieceOnSquareAndExists(board, position, square, color, moves){
  /*adds squares to given moves array if square is not occupied by ally and square exists.
   returns true if there is something on the square or square doesn't exist can be used 
   to end the loop*/
  let emptyAllyEnemy = isSquareEmptyAllyEnemy(position, square, color)
  if(emptyAllyEnemy === "ally"){
    return true
  }

  else if(emptyAllyEnemy === "enemy"){
    moves.push(square)
    return true
  }
  //check whether square exists on the board
  let exists = isSquareOnBoard(board, square)

  if(exists === true){
    moves.push(square)
    return false
  }
  else if(exists === false){
    return true 
  }
}

function pawnCanMove2(board, position, piecePosition, color){
  /*returns an array of squares the pawn can move to.
    e.g. ('e2', 'white', position) might return ['e3']*/

  let moves = []
  let frontSquare = ""
  let firstMove = false
  let frontSecondSquare = ""

  if(color === "white"){
    frontSquare = `${piecePosition[0]}${parseInt(piecePosition[1]) + 1}`
    if(piecePosition[1] === '2'){
      firstMove = true
      frontSecondSquare = `${piecePosition[0]}${parseInt(piecePosition[1]) + 2}`
    }
    //check if pawn can move 1 step forward if there is no piece in front of it
  }

  // when pawn is black the front square is of lower number
  else if(color === "black"){
    frontSquare = `${piecePosition[0]}${parseInt(piecePosition[1]) - 1}`
    if(piecePosition[1] === '7'){
      firstMove = true
      frontSecondSquare = `${piecePosition[0]}${parseInt(piecePosition[1]) - 2}`
    }
  }

  // let positionAll = position.white.concat(position.black)
  if(isSquareEmptyAllyEnemy(position, frontSquare, color) === "empty"){
    moves.push(frontSquare)
    if(firstMove === true){
      if(isSquareEmptyAllyEnemy(position, frontSecondSquare, color) === "empty"){
        moves.push(frontSecondSquare)
      }
    }
  }

  //check if pawn can capture 1 step right diagonally
  let letterIndex = alphabetOrder.indexOf(piecePosition[0])
  let rightFile = alphabetOrder[letterIndex+1]
  let rightDiagonalSquare = ""

  if(color === "white"){
    rightDiagonalSquare = `${rightFile}${parseInt(piecePosition[1]) + 1}`
  }
  else if(color === "black"){
    rightDiagonalSquare = `${rightFile}${parseInt(piecePosition[1]) - 1}`
  }
  if(isSquareEmptyAllyEnemy(position, rightDiagonalSquare, color) === "enemy"){
    moves.push(rightDiagonalSquare)
  } 

  let leftFile = alphabetOrder[letterIndex-1]
  let leftDiagonalSquare = `${leftFile}${parseInt(piecePosition[1]) + 1}`

  if(color === "white"){
    leftDiagonalSquare = `${leftFile}${parseInt(piecePosition[1]) + 1}`
  }
  else if(color === "black"){
    leftDiagonalSquare = `${leftFile}${parseInt(piecePosition[1]) - 1}`
  }
  if(isSquareEmptyAllyEnemy(position, leftDiagonalSquare, color) === "enemy"){
    moves.push(leftDiagonalSquare)
  }

  return moves
}

function rookCanMove2(board, position, pieceCoordinate, color){
  /*returns an array of squares the rook can move to*/
  let moves = []
  let square = ""

  //add all squares to 'moves' going up in the column, stop if another piece blocks
  for(let i = parseInt(pieceCoordinate[1]) + 1; ; i++){
    square = `${pieceCoordinate[0]}${i}`
    if(checkPieceOnSquareAndExists(board, position, square, color, moves)){
      break
    }
  }

  //add all squares to 'moves' going down in the column, stop if another piece blocks
  for(let i = parseInt(pieceCoordinate[1]) - 1; ; i--){
    square = `${pieceCoordinate[0]}${i}`
    if(checkPieceOnSquareAndExists(board, position, square, color, moves)){
      break
    }
  }

  //add all squares to 'moves' going right in the row, stop if another piece blocks
  for(let i = alphabetOrder.indexOf(pieceCoordinate[0]) + 1; ; i++){
    square = `${alphabetOrder[i]}${pieceCoordinate[1]}`
    if(checkPieceOnSquareAndExists(board, position, square, color, moves)){
      break
    }
  }

  //add all squares to 'moves' going left in the row, stop if another piece blocks
  for(let i = alphabetOrder.indexOf(pieceCoordinate[0]) - 1; ; i--){
    square = `${alphabetOrder[i]}${pieceCoordinate[1]}`
    if(checkPieceOnSquareAndExists(board, position, square, color, moves)){
      break
    }
  }

  return moves
}

function bishopCanMove2(board, position, pieceCoordinate, color){
  /*returns an array of squares the bishop can move to*/
  let moves = []
  let square = ""
  let i = 0
  let j = 0
  let n = 0

  //add all squares to 'moves' going up-right diagonally
  for(n=1;;n++){
    i = alphabetOrder.indexOf(pieceCoordinate[0]) + n
    j = parseInt(pieceCoordinate[1]) + n;
    square = `${alphabetOrder[i]}${j}`
    if(checkPieceOnSquareAndExists(board, position, square, color, moves)){
      break
    }
  }

  //add all squares to 'moves' going down-left diagonally
  for(n=1;;n++){
    i = alphabetOrder.indexOf(pieceCoordinate[0]) - n
    j = parseInt(pieceCoordinate[1]) - n;
    square = `${alphabetOrder[i]}${j}`
    if(checkPieceOnSquareAndExists(board, position, square, color, moves)){
      break
    }
  }

  //add all squares to 'moves' going up-left diagonally 
  for(n=1;;n++){
    i = alphabetOrder.indexOf(pieceCoordinate[0]) - n
    j = parseInt(pieceCoordinate[1]) + n;
    square = `${alphabetOrder[i]}${j}`
    if(checkPieceOnSquareAndExists(board, position, square, color, moves)){
      break
    }
  }

  //add all squares to 'moves' going down-right diagonally
  for(n=1;;n++){
    i = alphabetOrder.indexOf(pieceCoordinate[0]) + n
    j = parseInt(pieceCoordinate[1]) - n;
    square = `${alphabetOrder[i]}${j}`
    if(checkPieceOnSquareAndExists(board, position, square, color, moves)){
      break
    }
  }

  return moves
}

function queenCanMove2(board, position, pieceCoordinate, color){
  /*returns an array of squares the queen can move to*/

  let moves = []

  moves = rookCanMove2(board, position, pieceCoordinate, color)
  moves = moves.concat(bishopCanMove2(board, position, pieceCoordinate, color))

  return moves
}

function kingCanMove2(board, position, pieceCoordinate, color){
  /*returns an array of squares the king can move to*/

  let moves = []
  let square = ""
  let fileIndex = alphabetOrder.indexOf(pieceCoordinate[0])
  let rank = parseInt(pieceCoordinate[1])

  //the square on the right of the king
  square = `${alphabetOrder[fileIndex + 1]}${rank}`
  checkPieceOnSquareAndExists(board, position, square, color, moves)

  //the square on the left of the king
  square = `${alphabetOrder[fileIndex - 1]}${rank}`
  checkPieceOnSquareAndExists(board, position, square, color, moves)

  //the square just above the king
  square = `${alphabetOrder[fileIndex]}${rank + 1}`
  checkPieceOnSquareAndExists(board, position, square, color, moves)

  //the square just below the king
  square = `${alphabetOrder[fileIndex]}${rank - 1}`
  checkPieceOnSquareAndExists(board, position, square, color, moves)

  //the square on top-right of the king
  square = `${alphabetOrder[fileIndex + 1]}${rank + 1}`
  checkPieceOnSquareAndExists(board, position, square, color, moves)

  //the square on top-left of the king
  square = `${alphabetOrder[fileIndex - 1]}${rank + 1}`
  checkPieceOnSquareAndExists(board, position, square, color, moves)

  //the square on bottom-left of the king
  square = `${alphabetOrder[fileIndex - 1]}${rank - 1}`
  checkPieceOnSquareAndExists(board, position, square, color, moves)

  //the square on bottom-right of the king
  square = `${alphabetOrder[fileIndex + 1]}${rank - 1}`
  checkPieceOnSquareAndExists(board, position, square, color, moves)
  return moves
}

function knightCanMove2(board, position, pieceCoordinate, color){
  /*returns an array of squares the knight can move to*/

  let moves=[]
  let square = ""
  let fileIndex = alphabetOrder.indexOf(pieceCoordinate[0])
  let row = parseInt(pieceCoordinate[1])

  //2 squares above
  let shiftedRow = row + 2
  //and the square to the right
  square = `${alphabetOrder[fileIndex + 1]}${shiftedRow}`
  checkPieceOnSquareAndExists(board, position, square, color, moves)
  //and the square to the left
  square= `${alphabetOrder[fileIndex - 1]}${shiftedRow}`
  checkPieceOnSquareAndExists(board, position, square, color, moves)

  //2 squares below
  shiftedRow = row - 2
  //and the square to the right
  square = `${alphabetOrder[fileIndex + 1]}${shiftedRow}`
  checkPieceOnSquareAndExists(board, position, square, color, moves)
  //and the square to the left
  square= `${alphabetOrder[fileIndex - 1]}${shiftedRow}`
  checkPieceOnSquareAndExists(board, position, square, color, moves)

  //2 squares to the right
  let shiftedFileIndex = fileIndex + 2
  //and the square above
  square = `${alphabetOrder[shiftedFileIndex]}${row + 1}`
  checkPieceOnSquareAndExists(board, position, square, color, moves)
  //and the square below
  square= `${alphabetOrder[shiftedFileIndex]}${row - 1}`
  checkPieceOnSquareAndExists(board, position, square, color, moves)

  //2 squares to the left
  shiftedFileIndex = fileIndex - 2
  //and the square above
  square = `${alphabetOrder[shiftedFileIndex]}${row + 1}`
  checkPieceOnSquareAndExists(board, position, square, color, moves)
  //and the square below
  square= `${alphabetOrder[shiftedFileIndex]}${row - 1}`
  checkPieceOnSquareAndExists(board, position, square, color, moves)

  return moves
}

function canMove2(board, position, piecePosition){
  /*returns array of squares to which the piece can move to
    e.g. ([['a1', 'a2',..],['b1', 'b2',...],...],['Qd2', 'Ke1'...], 'Ke1', 'white') may return ['e2', 'f1','f2'...]*/
  let moves = []
  let pieceType = ""
  let pieceCoordinate = piecePosition.slice(-2,)

  pieceType = identifyPiece(position, piecePosition)
  if(typeof(pieceType) === undefined){
    console.log('canMove2: pieceType is not defined')
    return
  }

  //for pawn
  if(pieceType.pieceLetter === 'P'){
    moves = pawnCanMove2(board, position, piecePosition, pieceType.color)
  }

  //for bishop
  else if(pieceType.pieceLetter === 'B'){
    moves = bishopCanMove2(board, position, pieceCoordinate, pieceType.color) 
  }

  //for knight
  else if(pieceType.pieceLetter === 'N'){
    moves = knightCanMove2(board, position, pieceCoordinate, pieceType.color )
  }

  //for rook
  else if(pieceType.pieceLetter === 'R'){
    moves = rookCanMove2(board, position, pieceCoordinate, pieceType.color)
  }

  //for Queen
  else if(pieceType.pieceLetter === 'Q'){
    moves = queenCanMove2(board, position, pieceCoordinate, pieceType.color)
  }

  //for King
  else if(pieceType.pieceLetter === 'K'){
    moves = kingCanMove2(board, position, pieceCoordinate, pieceType.color)
  }
  return moves
}

function addMoveNotation(newPosition, lastPiecePosition, newPiecePosition, capturing, movesHistory){
  let pieceType = identifyPiece(newPosition, newPiecePosition)
  if(capturing){
    if(pieceType.pieceLetter === 'P'){
      movesHistory[pieceType.color].push(`${lastPiecePosition[0]}x${newPiecePosition}`)
      return
    }
    else{
      movesHistory[pieceType.color].push(`${newPiecePosition[0]}x${newPiecePosition.slice(1,)}`)
      return
    }
  }
  else{
    movesHistory[pieceType.color].push(newPiecePosition)
    return
  }
}

export{canMove2, rectBoardSquares, isBoardAndPositionLegit, isSquareEmptyAllyEnemy, returnEnemyColor, addMoveNotation}
