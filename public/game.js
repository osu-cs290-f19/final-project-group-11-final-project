// Create WebSocket connection.
const socket = new WebSocket('ws://localhost:8000/game/connection');

var selected = null;
var enemySelected = null;
var selectionClickable = true;

function highlightElements (){
	// this function will highlight elements based on what is selected.
}

function updateWinstreak (winstreak){
	// this function will update our visible winstreak.
}

function gameFinish (){
	// this function will pop up the game finished modal and will update it.
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
	}
}

// Connection opened
socket.addEventListener('open', function (event) {
	// create connection with server
    socket.send('s');
	
});

// Listen for messages
socket.addEventListener('message', function (event) {
    console.log('Message from server ', event.data);
	
	var command = event.data[0];
	if (command === "g"){
		var outcome = event.data[1];
		if (outcome === "l"){
			// lost game, #TODO show modal
			console.log("Sending leaderboard store request");
			
			if (selected == "ROCK"){
				enemySelected = "PAPER";
			}
			else if (selected == "PAPER"){
				enemySelected = "SCISSORS";
			}
			else if (selected == "SCISSORS"){
				enemySelected = "ROCK";
			}
			
			socket.send("r"); // placeholder auto name of Benny, when the modal is made it wont be
			
		}
	}
	else if (command === "l"){
		var placement = event.data[1];
		if (placement === "N"){
			console.log("You did not earn a spot on the leaderboards...");
		}
		else {
			console.log("Congratulations! You earned a spot on the leaderboards: " + (Number(placement)+1));
			socket.send("lBenny"); //save leaderboard spot, #TODO get name from input box
		}
	}
});

document.getElementById('player-rock').addEventListener('click', send_game_choice);
document.getElementById('player-paper').addEventListener('click', send_game_choice);
document.getElementById('player-scissors').addEventListener('click', send_game_choice);