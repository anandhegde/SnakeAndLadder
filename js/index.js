var currentUser = 1;
//variable to give user's an id

var userCount = 0;

var Board = function(){
	this.rows = 8;
	this.columns = 8;
	this.snakes = [];
	this.ladders = [];
	this.boardNumbers = [];
	this.result = false;
	this.whoHasWon = null;
	function initializeBoard(boardObject){
		for(let i = 0; i < boardObject.rows; i++){
			boardObject.boardNumbers[i] = [];
			for(let j = 0; j < boardObject.rows; j++){
				boardObject.boardNumbers[i][j] = (i * boardObject.rows) + j + 1;
			}
		}
		console.log(boardObject.boardNumbers)
	}
	function initializeSnakes(boardObject){
		let maxForStart = (boardObject.rows * boardObject.columns) - 1;
		let minForStart = boardObject.columns + 1;
		for(let i = 0; i < 5; i++){
			let snakePosition = {};
			let start = randomNumber(minForStart, maxForStart);
			while(true){
				let arr = boardObject.snakes.filter((item) => (item["start"] == start || item["end"] == start));
				if(arr.length == 0){
					break;
				} else {
					start = randomNumber(minForStart, maxForStart);
				}
			}
			let maxForEnd = start - (start % boardObject.columns);
			if(start % boardObject.columns == 0){
				maxForEnd = maxForEnd - 8;
			}
			let end = randomNumber(1, maxForEnd);
			while(true){
				let arr = boardObject.snakes.filter((item) => (item["start"] == end || item["end"] == end));
				if(end != start && arr.length == 0){
					break;
				} else {
					end = randomNumber(1, maxForEnd);
				}
			}
			let row = Math.floor(start / boardObject.columns);
			if(start % boardObject.columns == 0){
				row = row -1;
			}
			let column = (start % boardObject.columns) - 1;
			if(column < 0){
				column = boardObject.columns -1 ;
			}
			boardObject.boardNumbers[row][column] = end;
			snakePosition["start"] = start;
			snakePosition["end"] = end;
			snakePosition["row"] = row;
			snakePosition["column"] = column;
			boardObject.snakes.push(snakePosition);
		}
	}

	function initializeLadders(boardObject){
		let maxForStart = (boardObject.rows * boardObject.columns) - boardObject.columns - 1;
		let minForStart = 2;
		for(let i = 0; i < 5; i++){
			let ladderPosition = {};
			let start = randomNumber(minForStart, maxForStart);
			while(true){
				let arr = boardObject.ladders.filter((item) => (item["start"] == start || item["end"] == start));
				let posPresentInSnake = boardObject.snakes.filter((item) => (item["start"] == start || item["end"] == start));
				if(arr.length == 0 && posPresentInSnake.length == 0){
					break;
				} else {
					start = randomNumber(minForStart, maxForStart);
				}
			}
			let minForEnd = start + (boardObject.columns - (start % boardObject.columns)) + 1;
			let end = randomNumber(minForEnd, boardObject.columns * boardObject.rows);
			while(true){
				let arr = boardObject.ladders.filter((item) => (item["start"] == end || item["end"] == end));
				let posPresentInSnake = boardObject.snakes.filter((item) => (item["start"] == end || item["end"] == end));
				if(end != start && arr.length == 0 && posPresentInSnake.length == 0){
					break;
				} else {
					end =  randomNumber(minForEnd, boardObject.columns * boardObject.rows);
				}
			}
			let row = Math.floor(start / boardObject.columns);
			if(start % boardObject.columns == 0){
				row = row -1;
			}
			let column = (start % boardObject.columns) - 1;
			if(column < 0){
				column = boardObject.columns -1 ;
			}
			boardObject.boardNumbers[row][column] = end;
			ladderPosition["start"] = start;
			ladderPosition["end"] = end;
			ladderPosition["row"] = row;
			ladderPosition["column"] = column;
			boardObject.ladders.push(ladderPosition);
		}
	}

	function show(boardObject){
		let append = "";

		for(let i = boardObject.rows - 1; i >= 0; i--){
			append += "<tr>";
			if(i % 2 == 0)
			{
				for(let j = 0; j < boardObject.columns; j++){
					let snakePresent = boardObject.snakes.filter((item) => item["row"] == i && item["column"] == j);
					let ladderPresent = boardObject.ladders.filter((item) => item["row"] == i && item["column"] == j);
					if(snakePresent.length > 0){
						append += `<td class="snake">${boardObject.boardNumbers[i][j]}</td>`;
					} else if(ladderPresent.length > 0) {
						append += `<td class="ladder">${boardObject.boardNumbers[i][j]}</td>`;
					} else {
						append += `<td>${boardObject.boardNumbers[i][j]}</td>`;
					}
				}
			} else {
				for(let j = boardObject.columns - 1; j >= 0; j--){
					let snakePresent = boardObject.snakes.filter((item) => item["row"] == i && item["column"] == j);
					let ladderPresent = boardObject.ladders.filter((item) => item["row"] == i && item["column"] == j);
					if(snakePresent.length > 0){
						append += `<td class="snake">${boardObject.boardNumbers[i][j]}</td>`;
					} else if(ladderPresent.length > 0) {
						append += `<td class="ladder">${boardObject.boardNumbers[i][j]}</td>`;
					} else {
						append += `<td>${boardObject.boardNumbers[i][j]}</td>`;
					}
				}
			}
			append += "</tr>";
		}


		$("#board").append(append);

	}

	initializeBoard(this);
	initializeSnakes(this);
	initializeLadders(this);
	show(this);
	this.movePosition= function(userObject, dice){
		let self = this;
		//get the new position value by adding dice value to old position value
		let position = this.boardNumbers[userObject.row][userObject.column] + dice;
		//get the new row value
		let row = Math.floor(position / this.columns);
		if(position % this.columns == 0){
			row -= 1;
		}
		//get new column value
		let column = (position % this.columns) - 1;
		if(position % this.columns == 0){
			column = this.columns - 1;
		}
		if(row >= this.rows){
			$("#message").text(`can't move, try next time user ${userObject.id}`).removeClass("hide");
		} else {
			//if there is ladder or snake in the new position
			let supposedValue = (row * this.colums) + (column + 1);
			if( supposedValue != this.boardNumbers[row][column]){
				let value = this.boardNumbers[row][column];
				row = Math.floor(value / this.columns);
				if( value % this.columns == 0) {
					column = this.columns - 1;
					row = row - 1;
				} else {
					column = (value % this.columns) - 1;
				}
			}
			changeTableCellColor(this.rows, this.columns, userObject.row, userObject.column, "#7E7474")
			userObject.row = row;
			userObject.column = column;

			//changeTableCellColor(this.rows, this.columns, row, column, userObject.color);
			// user has won the game
			if(row == (this.rows-1) && column == (this.columns-1)) {
				this.result = true;
				userObject.won = true;
				this.whoHasWon = userObject;
			}
		}
	}
}

var User = function(){
	this.row = 0;
	this.column = 0;
	this.won = false;
	this.id = ++userCount;
	this.color = getRandomColor();
}

User.prototype.rollDice = function(callback){
	let dice = randomNumber(1, 6);
	$("#diceValue").text(`Player ${this.id} got ${dice}`).show();
	board.movePosition(this, dice);
	callback();
}

var board = new Board();
var user1 = new User();
var user2 = new User();
var userArray = [user1, user2];

//set the color of cell in the beginning
for(let user of userArray){
	setColorOnTop(user);
	changeTableCellColor(board.rows, board.columns, user.row, user.column, user.color);
}

//set the button's value
$("#rollDice").text("Player 1's turn");

$("#rollDice").on("click", function(){
	$("#message").addClass("hide");
	userArray[currentUser - 1].rollDice(function(){
		for(let user of userArray){
			changeTableCellColor(board.rows, board.columns, user.row, user.column, user.color);
		}
		if(board.result){
			$("#message").text(`Player ${board.whoHasWon.id} won the game`).removeClass("hide");
			$("#rollDice").hide();
		} else {
			currentUser = (currentUser % userArray.length) + 1;
			let textOnButton = `Player ${currentUser}'s turn`;
			$("#rollDice").text(textOnButton);
		}
	});
})

function randomNumber(min, max){
	return Math.floor(Math.random() * ( max - min)) + min;
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function changeTableCellColor(totalRows, totalColumns, row, column, color){
	$("table tr").each(function(i, tableRow){
		if(i == (totalRows - row - 1)){
			$(tableRow).find("td").each(function(index, rowColumn){
				if(row % 2 == 0){
					if(column == index){
						$(rowColumn).css("background-color", color)
					}
				} else {
					if((totalColumns - column - 1) == index){
						$(rowColumn).css("background-color", color)
					}
				}
			})
		}
	})
}

function setColorOnTop(user){
	let addDiv = `	<div class="col-md-2">
						<span class="icon-20 vertical-align" style="background-color:${user.color}"></span>
						<span class="vertical-align">Player ${user.id}</span>
					</div>
				`
	$("#showPlayer").append(addDiv);
}