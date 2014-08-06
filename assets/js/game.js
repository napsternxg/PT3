var xBoard = 0;
var oBoard = 0;
var begin = true;
var context;
var width, height;
var xOffset = 0;
var yOffset = 0;

var playPositions = [[-1, -1], [-1, -1]];
var currPos = 0;
var currPlayer = -1;
var selectedPositions = 0;

function paintBoard() {
	var board = document.getElementById('board');

	width = board.width;
	height = board.height;
	context = board.getContext('2d');

	context.beginPath();
	context.strokeStyle = '#000';
	context.lineWidth = 4;

	context.moveTo((width / 3), 0);
	context.lineTo((width / 3), height);

	context.moveTo((width / 3) * 2, 0);
	context.lineTo((width / 3) * 2, height);

	context.moveTo(0, (height / 3));
	context.lineTo(width, (height / 3));

	context.moveTo(0, (height / 3) * 2);
	context.lineTo(width, (height / 3) * 2);

	context.stroke();
	context.closePath();

	/**
	// Uncomment to enable play with AI.
	if (begin) {
	var ini = Math.abs(Math.floor(Math.random() * 9 - 0.1));
	markBit(1 << ini, 'O');
	begin = false;
	} else {
	begin = true;
	}
	 **/
	//$('#playerPos > tbody:last').append('<tr><td>Player ' + currPlayer + '</td><td></td><td></td><td></td><td></td><td></td></tr>');
	nextPlayer();
}

function checkWinner(board) {

	var result = false;

	if (((board | 0x1C0) == board) || ((board | 0x38) == board) ||
		((board | 0x7) == board) || ((board | 0x124) == board) ||
		((board | 0x92) == board) || ((board | 0x49) == board) ||
		((board | 0x111) == board) || ((board | 0x54) == board)) {

		result = true;
	}
	return result;
}

function paintX(x, y, strokeColor) {

	context.beginPath();
	if (typeof strokeColor === 'undefined'){
		strokeColor = '#ff0000';
		}
	context.strokeStyle = strokeColor;
	context.lineWidth = 4;

	var offsetX = (width / 3) * 0.1;
	var offsetY = (height / 3) * 0.1;

	var beginX = x * (width / 3) + offsetX;
	var beginY = y * (height / 3) + offsetY;

	var endX = (x + 1) * (width / 3) - offsetX * 2;
	var endY = (y + 1) * (height / 3) - offsetY * 2;

	context.moveTo(beginX, beginY);
	context.lineTo(endX, endY);

	context.moveTo(beginX, endY);
	context.lineTo(endX, beginY);

	context.stroke();
	context.closePath();
}

function paintO(x, y, strokeColor) {

	context.beginPath();
	if (typeof strokeColor === 'undefined'){
		strokeColor = '#0000ff';
		}
	context.strokeStyle = strokeColor;
	context.lineWidth = 4;

	var offsetX = (width / 3) * 0.1;
	var offsetY = (height / 3) * 0.1;

	var beginX = x * (width / 3) + offsetX;
	var beginY = y * (height / 3) + offsetY;

	var endX = (x + 1) * (width / 3) - offsetX * 2;
	var endY = (y + 1) * (height / 3) - offsetY * 2;

	context.arc(beginX + ((endX - beginX) / 2), beginY + ((endY - beginY) / 2), (endX - beginX) / 2, 0, Math.PI * 2, true);

	context.stroke();
	context.closePath();
}

var playerPaintFuncts = [paintO, paintX];

function clearPlayerPosition(posX, posY){
	if(posX < 0 || posY < 0 || posX > 2 || posY > 2){
		return false;
	}
	playerPaintFuncts[currPlayer](posX, posY, '#ffffff');
}


function clickHandler(e) {
	var mouseX,
	mouseY;
	if (e.offsetX) {
		mouseX = e.offsetX;
		mouseY = e.offsetY;
	} else if (e.layerX) {
		mouseX = e.layerX;
		mouseY = e.layerY;
	}

	var y = Math.floor(mouseY / (height / 3));
	var x = Math.floor(mouseX / (width / 3));
	console.log("ClientX: %s, Width/3: %s, X: %s, MouseX: %s", e.clientX, width / 3, x, mouseX);
	console.log("ClientY: %s, Height/3: %s, Y: %s, MouseY: %s", e.clientY, height / 3, y, mouseY);
	
	var lastPosition = [playPositions[currPos][0], playPositions[currPos][1]];
	
	playPositions[currPos][0] = x;
	playPositions[currPos][1] = y;
	
	clearPlayerPosition(lastPosition[0], lastPosition[1]);
	playerPaintFuncts[currPlayer](x,y,'#D9EDF7');

	currPos = (currPos + 1) % 2;
	var cols = $('#playerPos > tbody:last > tr:last > td');
	$(cols[1 + (currPos * 2) + 0]).text(x);
	$(cols[1 + (currPos * 2) + 1]).text(y);
	selectedPositions += 1;

	
}

function checkNobody() {
	if ((xBoard | oBoard) == 0x1FF) {
		//alert('Nobody won!!');
		showResult(-1);
		restart();
		return true;
	}
	return false;
}

function restart() {
	context.clearRect(0, 0, width, height);
	xBoard = 0;
	oBoard = 0;
	currPlayer = -1;
	currPos = 0;
	selectedPositions = 0;
	playPositions = [[-1, -1], [-1, -1]]
	$("#playerPos > tbody:last > tr").remove();
	//$('#playerPos > tbody:last').append('<tr><td>Player '+currPlayer+'</td><td></td><td></td><td></td><td></td></tr>');
	paintBoard();

}

function isEmpty(xBoard, oBoard, bit) {
	return (((xBoard & bit) == 0) && ((oBoard & bit) == 0));
}

function simulate(oBoard, xBoard) {

	var ratio = 0;

	var bit = 0;
	for (var i = 0; i < 9; i++) {

		var cBit = 1 << i;

		if (isEmpty(xBoard, oBoard, cBit)) {

			if (checkWinner(oBoard | cBit)) {
				bit = cBit;
				break;
			} else if (checkWinner(xBoard | cBit)) {
				bit = cBit;
			}
		}
	}

	if (bit == 0) {
		for (var i = 0; i < 9; i++) {
			var cBit = 1 << i;

			if (isEmpty(xBoard, oBoard, cBit)) {
				var result = think(oBoard, xBoard, 'X', 0, 1)
					if (ratio == 0 || ratio < result) {
						ratio = result;
						bit = cBit;
					}
			}
		}
	}
	return bit;
}

function think(oBoard, xBoard, player, bit, ratio) {

	if (player == 'O') {
		oBoard = oBoard | bit;
	} else {
		xBoard = xBoard | bit;
	}

	if (checkWinner(oBoard)) {
		ratio *= 1.1;
		return ratio;

	} else if (checkWinner(xBoard)) {

		ratio *= 0.7;
		return ratio;

	} else {
		var best = 0;
		ratio *= 0.6;

		for (var i = 0; i < 9; i++) {

			if (isEmpty(xBoard, oBoard, 1 << i)) {

				var newRatio = think(oBoard, xBoard, player == 'O' ? 'X' : 'O', 1 << i, ratio);

				if (best == 0 || best < newRatio) {
					best = newRatio;
				}
			}
		}

		return best;
	}
}

function markBit(markBit, player) {

	var bit = 1;
	var posX = 0,
	posY = 0;
	while ((markBit & bit) == 0) {
		bit = bit << 1;
		posX++;
		if (posX > 2) {
			posX = 0;
			posY++;
		}
	}

	if (player == 'O') {
		oBoard = oBoard | bit;
		paintO(posX, posY);
	} else {
		xBoard = xBoard | bit;
		paintX(posX, posY);
	}
}

function play() {
	var bestBit = simulate(oBoard, xBoard);

	markBit(bestBit, 'O');

}

function showResult(player) {
	if(player === 1 || player === 0){
		$("#result").text("Congratulations player " + player + ", you won.");
	}
	else{
		$("#result").text("Nobody won.");
	}
	
	$("#resultModal").modal('show');
}

function nextPlayer(){
	currPlayer = (currPlayer + 1) % 2;
	 $('#playerPos > tbody:last').append('<tr><td>Player '+currPlayer+'</td><td></td><td></td><td></td><td></td><td></td></tr>');
	 $('#current-player').text("Player "+currPlayer+"'s turn.");
	selectedPositions = 0;
	playPositions = [[-1, -1], [-1, -1]]
	}

var playerIcons = ['O', 'X'];
function toss() {
	if (selectedPositions < 2){
		alert("Please select atleast 2 positions and then click toss.");
		return false;
		}
	/**
		Clear last position which were selected during decision making.
	**/
	clearPlayerPosition(playPositions[0][0], playPositions[0][1]);
	clearPlayerPosition(playPositions[1][0], playPositions[1][1]);
	
	var tossVal = Math.random() < 0.5 ? 0 : 1;
	$("#tossVal").text(tossVal);
	$('#playerPos > tbody:last > tr:last > td:last').text(tossVal);
	var x = playPositions[tossVal][0];
	var y = playPositions[tossVal][1];

	var bit = (1 << x + (y * 3));

	if (isEmpty(xBoard, oBoard, bit)) {

		//markBit(bit, 'X');
		markBit(bit, playerIcons[currPlayer]);

		if (!checkNobody()) {
			if (checkWinner(xBoard)) {

				//alert('You win!!');
				showResult(currPlayer);
				restart();

			} else {
				//Uncomment below to play with AI.
				// play();
				if (!checkNobody()) {
					if (checkWinner(oBoard)) {
						//alert('Loser!!');
						showResult(currPlayer);
						restart();
					}
					else{
						nextPlayer();
						}
				}
			}
		}
	}

}