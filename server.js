/* Server javascript file for our final project: Rock-paper-scissors site
 *
 *
 *
 *
 */

// Imports

var express = require('express');
var process = require('process');

// End Imports


//////Start/////////////--File Hosting--///////////////////////////////////////////////

var app = express();
var expressWs = require('express-ws')(app); // this is used for our game connections

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

/////START//////////////--Websocket Functions--////////////////////////////////////////

app.ws('/game/connection', function(ws, req) {
  ws.on('message', function(msg) {
    console.log(msg);
	ws.send(msg);
  });
  console.log('socket', req.testing);
});

/////END////////////////--Websocket Functions--////////////////////////////////////////

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
