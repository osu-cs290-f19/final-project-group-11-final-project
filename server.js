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

function generate_bot_choice (choices){
	// generate the bot choice based on what the player has chosen in the current session.
	var rock_chance = 0;
	var paper_chance = 0;
	var scissors_chance = 0;
	
	for (var i = 0; i < choices.length; i++){
		if (choices[i] == 0){
			rock_chance += 1;
			paper_chance += 1;
			scissors_chance += 1;
		}
		else if (choices[i] == 1){
			// player chose rock in the past, increase the odds of bot choosing paper
			paper_chance += 3;
		}
		else if (choices[i] == 2){
			// player chose paper in the past, increase the odds of bot choosing scissors
			scissors_chance += 3;
		}
		else if (choices[i] == 3){
			// player chose scissors in the past, increase the odds of bot choosing rock
			rock_chance += 3;
		}
	}
	
	var random_value = Math.floor(Math.random() * 27);
	if (random_value < rock_chance){
		return 1
	}
	else if (random_value < rock_chance + paper_chance){
		return 2
	}
	else {
		return 3
	}
}

/////END////////////////--Game Functions--/////////////////////////////////////////////

/////START//////////////--Websocket Functions--////////////////////////////////////////

app.ws('/game/connection', function(ws, req) {
	var winstreak = 0; // winstreak of the current connected user.
	var highstreak = 0; // holds the players high winstreak
	var choices = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // stores history of player choices for our bot
	ws.on('message', function(msg) {
		var command = msg[0];
		if (command === "s"){
			// connection created with this message.
			win_streak = 0; // reset the winstreak on a new game.
		}
		else if (command === "w"){
			// client is sending their weapon choice.
			var bot_choice = generate_bot_choice(choices); // get the choice of the bot
			player_choice = msg[1]; // get the player choice from the message
			choices.unshift(player_choice); // add the player choice to the history of player choices
			choices.pop(); // remove the oldest history of player choice
			if (bot_choice == 1) {
				//bot choice of rock
				if (player_choice == 2){
					// player chose paper and beat rock
					winstreak += 1;
					if (winstreak > highstreak){
						highstreak = winstreak; // save this winstreak in case user send leaderboard request
					}
					ws.send('gw');
				}
				else if (player_choice == 3){
					// player chose scissors and lost to rock
					if (winstreak > highstreak){
						highstreak = winstreak; // save this winstreak in case user send leaderboard request
					}
					winstreak = 0; // reset our winstreak
					ws.send('gl'); // send game lost message to client
				}
				else {
					// player chose rock and tied to rock
					ws.send('gt'); // send game tie message to client
				}
			}
			else if (bot_choice == 2) {
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
			var name = msg.substring(1); // grab the users name from the message
			var placement = check_leaderboard(highstreak); // see if the user scored high enough for the leaderboard
			if (placement >= 0){
				// if the user scored high enough for the leaderboard then save their name to the leaderboard.
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
			highstreak = 0; // reset highstreak
		}
		else if (command === "r"){
			// client is requesting leaderboard postion, send back their position, N if no position
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
	// set our default page to index.html, served through handlebars
	res.status(200).render('index');
});

app.get('/game', function(req, res, next){
	// serve game page through handlebars
	res.status(200).render('game');
});

app.get('/leaderboard', function(req, res, next){
	// serve leaderboard page through handlebars
	clonedLeaderboard = leaderboard.slice(0);
	for (var i = 0; i < clonedLeaderboard.length; i++){
		// add a rank attribute to each JSON object in order to meet handlebars requirements
		clonedLeaderboard['rank'] = i+1;
	}
	res.status(200).render('leaderboard', {
		// render each leaderboard row
		highscoreData: clonedLeaderboard
	});
});

app.get('/about', function(req, res, next){
	// serve about page through handlebars
	res.status(200).render('about');
});

app.get('*', function (req, res, next){
	// if requested routing does not exist, serve 404 page through handlebars
	res.status(404).render('404');
});

//////End///////////////--File Hosting--///////////////////////////////////////////////

/////--SERVER START--//////////////////////////

SERVER_PORT = process.env.PORT; // this is the port that the server will listen on.
// set with PORT environment variable.

if (SERVER_PORT == undefined){
	// If the PORT variable does not exist, default to port 8000
	SERVER_PORT = 8000; // The game actually requires port 8000.
}

app.listen(SERVER_PORT, function (){
	console.log("Server has started and is listening on port " + SERVER_PORT);
})
