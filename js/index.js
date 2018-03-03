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
	var _stateOfUsers = [];
	function initializeBoard(boardObject){
		//0th position will be the home
		boardObject.boardNumbers[0] = 0;
		for(let i = 1; i <= boardObject.rows * boardObject.columns; i++){
			boardObject.boardNumbers[i] = i;
		}
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
			boardObject.boardNumbers[start] = end;
			snakePosition["start"] = start;
			snakePosition["end"] = end;
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
			boardObject.boardNumbers[start] = end;
			ladderPosition["start"] = start;
			ladderPosition["end"] = end;
			boardObject.ladders.push(ladderPosition);
		}
	}

	function show(boardObject){
		let append = "";
		//board is row column shape
		for(let i = boardObject.rows; i > 0; i--){
			append += "<tr>";
			let num;
			for(let j = 1; j <= boardObject.columns; j++){
				if(i % 2 == 0){
					num = (boardObject.rows*i) - (j-1);
				} else {
					num = (boardObject.rows * (i-1)) + j;
				}
				append += generateTableCell(boardObject, num);
			}
			append += "</tr>";
		}
		$("#board").append(append);
	}

	function generateTableCell(boardObject, num){
		let cell = "";
		let snakePresent = boardObject.snakes.filter((item) => item["start"] == num);
		let ladderPresent = boardObject.ladders.filter((item) => item["start"] == num);
		if(snakePresent.length > 0){
			cell += `<td class="snake">${snakePresent[0]["end"]}</td>`;
		} else if(ladderPresent.length > 0) {
			cell += `<td class="ladder">${ladderPresent[0]["end"]}</td>`;
		} else {
			cell += `<td>${num}</td>`;
		}
		return cell;
	}

	initializeBoard(this);
	initializeSnakes(this);
	initializeLadders(this);
	show(this);
	this.movePosition= function(userObject, dice){
		let self = this;
		changeTableCellColor(this.rows, this.columns, userObject.position, "#7E7474");
		//get the new position value by adding dice value to old position value
		let position = this.boardNumbers[userObject.position] + dice;
		if(position >= (this.rows * this.columns)){
			userObject.position = this.boardNumbers[this.boardNumbers.length - 1];
			this.result = true;
			userObject.won = true;
			this.whoHasWon = userObject;
		} else {
			userObject.position = this.boardNumbers[position];
		}
		changeTableCellColor(this.rows, this.columns, userObject.position, userObject.color);
	}

	this.setStateOfUsers = function(usersArray, currentUserIndex, currentDiceValue){
		let arr = [];
		for(let index in userArray){
			let obj = {};
			obj["id"] = userArray[index].id;
			obj["position"] = userArray[index].position;
			obj["color"] = userArray[index].color;
			if(index == currentUserIndex){
				obj["dirty"] = true;
				obj["diceValue"] = currentDiceValue;
			}
			arr.push(obj);
		}
		_stateOfUsers.push(arr);
	}

	this.replay = function(){
		for(let index in _stateOfUsers){
			(function(index, boardObject){
				setTimeout(() => {
					if(index == 0) {
						for(let userStateObject of _stateOfUsers[index]){
							delete(allUserColors[userStateObject.id]);
							setHomeColor();
							if(userStateObject["dirty"]) {
								$("#diceValue").text(`Player ${userStateObject["id"]} got ${userStateObject.diceValue}`).show();
							}
							changeTableCellColor(boardObject.rows, boardObject.columns, userStateObject.position, userStateObject.color);
						}
					} else {
						// for removing the user's previous position
						for(let userStateObject of _stateOfUsers[index - 1]){
							changeTableCellColor(boardObject.rows, boardObject.columns, userStateObject.position, "#7E7474");
						}
						//setting the user's position
						for(let userStateObject of _stateOfUsers[index]){
							delete(allUserColors[userStateObject.id]);
							setHomeColor();
							if(userStateObject["dirty"]) {
								$("#diceValue").text(`Player ${userStateObject["id"]} got ${userStateObject.diceValue}`).show();
							}
							if(index == (_stateOfUsers.length-1)) {
								$("#message").text(`Player ${userStateObject["id"]} won the game`).removeClass("hide");
							}
							changeTableCellColor(boardObject.rows, boardObject.columns, userStateObject.position, userStateObject.color);
						}
					}
				}, index * 1000);
			})(index, this);
		}
	}
}

var User = function(){
	this.position = 0;
	this.won = false;
	this.id = ++userCount;
	this.color = getRandomColor();
}

User.prototype.rollDice = function(callback){
	let dice = randomNumber(1, 6);
	$("#diceValue").text(`Player ${this.id} got ${dice}`).show();
	board.movePosition(this, dice);
	delete(allUserColors[this.id])
	callback(dice);
}

var board = new Board();
var user1 = new User();
var user2 = new User();
var user3 = new User();
var userArray = [user1, user2];
var allUserColors = {};
//set the color of cell in the beginning
for(let user of userArray){
	setColorOnTop(user);
	allUserColors[user.id] = user.color;
}

//set the homeDivision
function setHomeColor(){
	let colors = "";
	for(let id in allUserColors) {
		colors += allUserColors[id] + ",";
	}
	colors = colors.substring(0, colors.length - 1);
	if(colors.length > 0){
		$("#home").css('background', `${colors}`);
		$("#home").css('background', `linear-gradient(to right,${colors})`);
	} else {
		$("#home").css('background', `white`);
	}
}

setHomeColor();

$("#rollDice").on("click", function(){
	$("#message").addClass("hide");
	userArray[currentUser - 1].rollDice(function(diceValue){
		setHomeColor();
		for(let user of userArray){
			changeTableCellColor(board.rows, board.columns, user.position, user.color);
		}

		//set the stateofboard
		board.setStateOfUsers(userArray, currentUser-1, diceValue);

		if(board.result){
			$("#message").text(`Player ${board.whoHasWon.id} won the game`).removeClass("hide");
			$("#rollDice").hide();
			$("#replay").removeClass("hide");
			$("#restart").removeClass("hide");
		} else {
			currentUser = (currentUser % userArray.length) + 1;
			let textOnButton = `Player ${currentUser}'s turn`;
			$("#rollDice").text(textOnButton);
		}
	});
});

$("#replay").on("click", function(){
	$("#message").addClass("hide");
	$("#diceValue").hide();

	for(let user of userArray){
		allUserColors[user.id] = user.color;
	}
	setHomeColor();
	//for removing the existing user position and setting all the user position to 0,0
	for(let user of userArray){
		changeTableCellColor(board.rows, board.columns, user.position, "#7E7474");
	}
	board.replay();
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
  if(color === "#FFFFFF"){
  	return getRandomColor();
  } else {
  	return color;
  }
}

function changeTableCellColor(totalRows, totalColumns, position, color){
	if(position != 0){
		position = parseInt(position);
		//get the row value on the board
		let row = Math.ceil(position / totalColumns) - 1;
		//get new column value on the board
		let column = (position % totalColumns) - 1;
		if(position % totalColumns == 0){
			column = totalColumns - 1;
		}
		if(row % 2 == 1){
			column = totalColumns - column - 1;
		}
		console.log(`row ${row} column ${column}`)
		$("table tr").each(function(i, tableRow){
			if(i == (totalRows - row - 1)){
				$(tableRow).find("td").each(function(index, rowColumn){
					if(column == index){
						$(rowColumn).css("background-color", color)
					}
				})
			}
		})
	}
}

function setColorOnTop(user){
	let addDiv = `	<div class="col-md-2">
						<span class="square-20 vertical-align" style="background-color:${user.color}"></span>
						<span class="vertical-align">Player ${user.id}</span>
					</div>
				`
	$("#showPlayer").append(addDiv);
}

$("#restart").on("click", function(){
	location.reload();
})