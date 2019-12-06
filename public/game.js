// Create WebSocket connection.
const socket = new WebSocket('ws://localhost:8000/game/connection');

function send_game_choice (event) {
	var player_choice = event.target.alt;
	if (player_choice == "Rock"){
		socket.send("w1");
	}
	else if (player_choice == "Paper"){
		socket.send("w2");
	}
	else if (player_choice == "Scissors"){
		socket.send("w3");
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
			// for now just sending a leaderboard request on every loss.
			console.log("Sending leaderboard store request");
			socket.send("lBenny"); // placeholder auto name of Benny, when the modal is made it wont be
		}
	}
	else if (command === "l"){
		var placement = event.data[1];
		if (placement === "N"){
			console.log("You did not earn a spot on the leaderboards...");
		}
		else {
			console.log("Congratulations! You earned a spot on the leaderboards: " + (Number(placement)+1));
		}
	}
});

document.getElementsByClassName('player-rock')[0].addEventListener('click', send_game_choice);
document.getElementsByClassName('player-paper')[0].addEventListener('click', send_game_choice);
document.getElementsByClassName('player-scissors')[0].addEventListener('click', send_game_choice);