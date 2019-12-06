/* Server javascript file for our final project: Rock-paper-scissors site
 *
 *
 *
 *
 */

// Imports

var express = require('express');
var process = require('process');

var app = express();
var expressWs = require('express-ws')(app); // this is used for our game connections

var leaderboard = require('./leaderboard.json');

// End Imports

/////START//////////////--Game Functions--/////////////////////////////////////////////

function check_leaderboard (streak){
	console.log("Checking streak of: " + streak);
	for (var i = 0; i < leaderboard.length; i++){
		if (leaderboard[i].streak < streak){
			return i
		}
	}
	return -1
}

/////END////////////////--Game Functions--/////////////////////////////////////////////

/////START//////////////--Websocket Functions--////////////////////////////////////////

app.ws('/game/connection', function(ws, req) {
	var winstreak = 0; // winstreak of the current connected user.
	var highstreak = 0;
	ws.on('message', function(msg) {
		var command = msg[0];
		console.log(command);
		if (command === "s"){
			// connection created with this message.
			win_streak = 0; // reset the winstreak on a new game.
		}
		else if (command === "w"){
			// client is sending their weapon choice.
			bot_choice = Math.floor(Math.random() * 99); // random integer between 0 and 98.
			player_choice = msg[1];
			
			if (bot_choice < 33) {
				//bot choice of rock
				if (player_choice == 2){
					winstreak += 1;
					if (winstreak > highstreak){
						highstreak = winstreak;
					}
					ws.send('gw');
				}
				else if (player_choice == 3){
					if (winstreak > highstreak){
						highstreak = winstreak;
					}
					winstreak = 0;
					ws.send('gl');
				}
				else {
					ws.send('gt');
				}
			}
			else if (bot_choice < 66) {
				//bot choice of paper
				if (player_choice == 3){
					winstreak += 1;
					if (winstreak > highstreak){
						highstreak = winstreak;
					}
					ws.send('gw');
				}
				else if (player_choice == 1){
					if (winstreak > highstreak){
						highstreak = winstreak;
					}
					winstreak = 0;
					ws.send('gl');
				}
				else {
					ws.send('gt');
				}
			}
			else {
				//bot choice of scissors
				if (player_choice == 1){
					winstreak += 1;
					if (winstreak > highstreak){
						highstreak = winstreak;
					}
					ws.send('gw');
				}
				else if (player_choice == 2){
					if (winstreak > highstreak){
						highstreak = winstreak;
					}
					winstreak = 0;
					ws.send('gl');
				}
				else {
					ws.send('gt');
				}
			}
		}
		else if (command === "l"){
			console.log("Store leaderboard request");
			//client is trying to save to leaderboard.
			var name = msg.substring(1);
			var placement = check_leaderboard(highstreak);
			console.log("Placement of: " + placement);
			if (placement >= 0){
				leaderboard.splice(placement, 0, {
					name: name,
					streak: highstreak
				});
				leaderboard.splice(10, 1);
				ws.send("l"+placement);
			}
			else {
				ws.send("lN");
			}
			highstreak = 0;
		}
	});
});

/////END////////////////--Websocket Functions--////////////////////////////////////////

//////Start/////////////--File Hosting--///////////////////////////////////////////////

app.get('/', function(req, res, next){
	// set our default page to index.html
	res.status(200).sendFile(__dirname + "/public/index.html");
});


app.use(express.static('public')); // any files in public can be requested and will be returned.

app.get('*', function (req, res, next){
	// if the file requested does not have a get setup or is not static we send the 404.html page
	// and the status of 404. 
	// ATM 404.html doesn't exist.
	res.status(404).sendFile(__dirname + "/public/404.html");
});

//////End///////////////--File Hosting--///////////////////////////////////////////////

/////--SERVER START--//////////////////////////

SERVER_PORT = process.env.PORT; // this is the port that the server will listen on.
// set with PORT environment variable.

if (SERVER_PORT == undefined){
	// If the PORT variable does not exist, default to port 8000
	SERVER_PORT = 8000;
}

app.listen(SERVER_PORT, function (){
	console.log("Server has started and is listening on port " + SERVER_PORT);
})
