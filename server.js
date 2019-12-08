/* Server javascript file for our final project: Rock-paper-scissors site
 *
 *
 *
 *
 */

// Imports

var express = require('express');
var process = require('process');
var exphbs = require("express-handlebars")
var fs = require('fs');

var app = express();
app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
var expressWs = require('express-ws')(app); // this is used for our game connections

var leaderboard = require('./leaderboard.json');

// End Imports

/////START//////////////--Game Functions--/////////////////////////////////////////////

function check_leaderboard (streak){
	for (var i = 0; i < leaderboard.length; i++){
		if (leaderboard[i].playerScore < streak){
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
			//client is trying to save to leaderboard.
			var name = msg.substring(1);
			var placement = check_leaderboard(highstreak);
			if (placement >= 0){
				leaderboard.splice(placement, 0, {
					playerName: name,
					playerScore: highstreak
				});
				leaderboard.splice(10, 1);
				fs.writeFile(__dirname + "/leaderboard.json",
							 JSON.stringify(leaderboard, undefined, 2), 
							 function (err){
								 if (err){
									console.log("File save error");
								 }
							 });
			}
			highstreak = 0;
		}
		else if (command === "r"){
			// client is requesting leaderboard postion
			var placement = check_leaderboard(highstreak);
			if (placement >= 0){
				ws.send("l"+placement);
			}
			else {
				ws.send("lN");
			}
		}
	});
});

/////END////////////////--Websocket Functions--////////////////////////////////////////

//////Start/////////////--File Hosting--///////////////////////////////////////////////

app.use(express.static('public')); // any files in public can be requested and will be returned.

app.get('/', function(req, res, next){
	// set our default page to index.html
	res.status(200).render('index');
});

app.get('/game', function(req, res, next){
	res.status(200).render('game');
});

app.get('/leaderboard', function(req, res, next){
	clonedLeaderboard = leaderboard.slice(0);
	for (var i = 0; i < clonedLeaderboard.length; i++){
		clonedLeaderboard['rank'] = i+1;
	}
	res.status(200).render('leaderboard', {
		highscoreData: clonedLeaderboard
	});
});

app.get('/about', function(req, res, next){
	res.status(200).render('about');
});

app.get('*', function (req, res, next){
	// if the file requested does not have a get setup or is not static we send the 404.html page
	// and the status of 404. 
	// ATM 404.html doesn't exist.
	res.status(404).render('404');
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
