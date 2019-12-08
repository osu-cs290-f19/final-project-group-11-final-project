// Create WebSocket connection.
const socket = new WebSocket('ws://localhost:8000/game/connection');

var selected = null;
var enemySelected = null;
var selectionClickable = true;

var winstreakVar = 0;

function makeSelectionClickable (){
	// callback function to prevent accidental spam of selection.
	selectionClickable = true;
	
	var enemyRock = document.getElementById('benny-rock');
	var enemyPaper = document.getElementById('benny-paper');
	var enemyScissors = document.getElementById('benny-scissors');
	
	var playerRock = document.getElementById('player-rock');
	var playerPaper = document.getElementById('player-paper');
	var playerScissors = document.getElementById('player-scissors');
	
	enemyRock.classList.remove('highlighted');
	enemyPaper.classList.remove('highlighted');
	enemyScissors.classList.remove('highlighted');
	
	playerRock.classList.remove('highlighted');
	playerPaper.classList.remove('highlighted');
	playerScissors.classList.remove('highlighted');
}

function highlightElements (){
	// this function will highlight elements based on what is selected.
	var enemyRock = document.getElementById('benny-rock');
	var enemyPaper = document.getElementById('benny-paper');
	var enemyScissors = document.getElementById('benny-scissors');
	
	var playerRock = document.getElementById('player-rock');
	var playerPaper = document.getElementById('player-paper');
	var playerScissors = document.getElementById('player-scissors');
	
	enemyRock.classList.remove('highlighted');
	enemyPaper.classList.remove('highlighted');
	enemyScissors.classList.remove('highlighted');
	
	playerRock.classList.remove('highlighted');
	playerPaper.classList.remove('highlighted');
	playerScissors.classList.remove('highlighted');
	
	if (selected !== null){
		if (selected == "ROCK"){
			playerRock.classList.add('highlighted');
		}
		else if (selected == "PAPER"){
			playerPaper.classList.add('highlighted');
		}
		else {
			playerScissors.classList.add('highlighted');
		}
	}
	if (enemySelected !== null){
		if (enemySelected == "ROCK"){
			enemyRock.classList.add('highlighted');
		}
		else if (enemySelected == "PAPER"){
			enemyPaper.classList.add('highlighted');
		}
		else {
			enemyScissors.classList.add('highlighted');
		}
	}
}

function updateWinstreak (winstreak){
	// this function will update our visible winstreak.
	var winStreakCounter = document.getElementById('win-streak-counter');
	winStreakCounter.textContent = winstreak;
}

function gameFinish (outcome){
	// this function will pop up the game finished modal and will update it.
	var outcomePopup = document.getElementById('outcome-popup');
	var outcomePopupText = document.getElementById('outcome-text');
	
	outcomePopup.classList.remove('hidden');
	if (outcome == "LOSS"){
		outcomePopupText.textContent = "You lost!"
	}
	else if (outcome == "WIN"){
		outcomePopupText.textContent = "You Won!"
	}
	else if (outcome == "TIE"){
		outcomePopupText.textContent = "You Tied!"
	}
	
	setTimeout(makeSelectionClickable, 1500);
}

function showHighscoreInputModal(placement){
	// this function will pop up after the game finishes and the player earns a highscore
	var modalBackdrop = document.getElementById('modal-backdrop');
	var highscoreModal = document.getElementById('submit-highscore-modal');
	var leaderboardPlacementText = document.getElementById('leaderboard-placement-text');
	
	modalBackdrop.classList.remove('hidden');
	highscoreModal.classList.remove('hidden');
	
	leaderboardPlacementText.textContent = "Congratulations! Your win-streak qualifies for the leaderboard! Your place: " + placement;
}

function hideHighscoreInputModal(event){
	var modalBackdrop = document.getElementById('modal-backdrop');
	var highscoreModal = document.getElementById('submit-highscore-modal');
	
	modalBackdrop.classList.add('hidden');
	highscoreModal.classList.add('hidden');
}

function submitHighscore(event){
	// this function will send our highscore to the server.
	var userName = document.getElementById('playerName-input').value.trim();
	if (userName){
		socket.send("l" + userName); //save leaderboard spot, #TODO get name from input box
		hideHighscoreInputModal();
	}
	else {
		alert("Please enter a name first!");
	}
}

function send_game_choice (event) {
	if (selectionClickable){
		var player_choice = event.target.alt;
		if (player_choice == "Rock"){
			selected = "ROCK";
			socket.send("w1");
		}
		else if (player_choice == "Paper"){
			selected = "PAPER";
			socket.send("w2");
		}
		else if (player_choice == "Scissors"){
			selected = "SCISSORS";
			socket.send("w3");
		}
		highlightElements();
		selectionClickable = false;
	}
}

// Connection opened
socket.addEventListener('open', function (event) {
	// create connection with server
    socket.send('s');
	
});

// Listen for messages
socket.addEventListener('message', function (event) {
	
	var command = event.data[0];
	if (command === "g"){
		var outcome = event.data[1];
		if (outcome === "l"){
			// lost game, #TODO show modal
			
			if (selected == "ROCK"){
				enemySelected = "PAPER";
			}
			else if (selected == "PAPER"){
				enemySelected = "SCISSORS";
			}
			else if (selected == "SCISSORS"){
				enemySelected = "ROCK";
			}
			winstreakVar = 0;
			updateWinstreak(winstreakVar);
			gameFinish("LOSS");
			socket.send("r"); // requests placement
			
		}
		else if (outcome === "w"){
			if (selected == "ROCK"){
				enemySelected = "SCISSORS";
			}
			else if (selected == "PAPER"){
				enemySelected = "ROCK";
			}
			else if (selected == "SCISSORS"){
				enemySelected = "PAPER";
			}
			winstreakVar += 1;
			updateWinstreak(winstreakVar);
			gameFinish("WIN");
		}
		else {
			enemySelected = selected;
			gameFinish("TIE");
		}
	}
	else if (command === "l"){
		var placement = event.data[1];
		if (placement === "N"){
			// no placement
		}
		else {
			showHighscoreInputModal(Number(placement)+1);
		}
	}
});

document.getElementById('player-rock').addEventListener('click', send_game_choice);
document.getElementById('player-paper').addEventListener('click', send_game_choice);
document.getElementById('player-scissors').addEventListener('click', send_game_choice);
document.getElementById('modal-submit').addEventListener('click', submitHighscore);
document.getElementById('modal-cancel').addEventListener('click', hideHighscoreInputModal);
document.getElementById('modal-close').addEventListener('click', hideHighscoreInputModal);