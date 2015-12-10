$(document).ready(function(){
	var socket = io.connect();

	var username;
	var isArtist;
	var words;

	function redrawImage(canvasID, imageURL) {
		var canvas  = document.getElementById(canvasID);
	  	var context = canvas.getContext("2d");
		var dataURL = imageURL;
		img = new Image;
		img.onload = function () {
		    context.drawImage(img, 0, 0);
		}
		img.src = dataURL; 
	}

	// After the user enters an username and hits submit
	$('#join').click(function () {
		username = $('#username').val();
		socket.emit('welcomePlayer', {name: username});
	});

	socket.on('artistWaiting', function (data) {
		console.log('Artist Waiting...');
		isArtist = true;
		$('.initalPage').fadeOut();
		$('.header').fadeIn();
		$('.artistWaiting').fadeIn();
		$('.usernameArea').text(data.name);
	});

	socket.on('playerWaiting', function (data) {
		console.log('Player Waiting...');
		isArtist = false;
		$('.initalPage').fadeOut();
		$('.header').fadeIn();
		$('.playerWaiting').fadeIn();
		$('.usernameArea').text(data.name);
	});

	socket.on('playerList', function (data) { 
		$('.currentPlayers ul').append('<li>' + data.newPlayer.username + '</li>');
	});

	$('#startGame').click(function() {
		$.getJSON("wordCollection.json", function(responseObject, diditwork) {
	      console.log(diditwork);
	      words = responseObject.wordCollection;
	    });  // getJSON
	    words = [
	{ "word":"Cat"}, { "word":"Windmill"}, { "word":"Gingerbread"}, { "word":"Throne"}, { "word":"String"}, { "word":"Dog"}, { "word":"Stairs"}, { "word":"Frankenstein"}, { "word":"Goldfish"}, { "word":"Violin"}, { "word":"Head"}, { "word":"Football"}, { "word":"Dance"}, { "word":"Alligator"}, { "word":"Stop"}, { "word":"Swing"}, { "word":"Mailbox"}, { "word":"Spider man"}, { "word":"Puppet"}, { "word":"Penguin"}, { "word":"Shovel"}, { "word":"Popcorn"}, { "word":"Butter"}, { "word":"Haircut"}, { "word":"Shopping trolley"}, { "word":"Lipstick"}, { "word":"Soap"}, { "word":"Mop"}, { "word":"Food"}, { "word":"Glue"}, { "word":"Hot"}, { "word":"See-saw"}, { "word":"Jellyfish"}, { "word":"Scarf"}, { "word":"Seashell"}, { "word":"Rain"}, { "word":"Bike"}, { "word":"Roof"}, { "word":"Bear"}, { "word":"Elbow"}, { "word":"Earthquake"}, { "word":"Summer"}, { "word":"Snowball"}, { "word":"Guitar"}, { "word":"Alarm"}, { "word":"Volleyball"}
	];
		socket.emit('gameStarted', {words: words});
	});

	socket.on('waitForArtist', function (data) {
		$('.playerWaiting').fadeOut();
		$('.waitScreen').fadeIn();
	});

	socket.on('drawImage', function (data) {
		$('.artistWaiting').fadeOut();
		$('.drawScreen').fadeIn();
		$('.guessWord').text(data.word);
	});

	$('#submit').click(function () {
		var canvas  = document.getElementById('main');
		var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); 
		socket.emit('guessImage', {image: image});
	});

	socket.on('waitToGuess', function (data) {
		$('.drawScreen').fadeOut();
		$('.artistWaitScreen').fadeIn();
	});

	socket.on('playerGuess', function (data) {
		$('.waitScreen').fadeOut();
		$('.guessScreen').fadeIn();

		redrawImage('image', data.image);
	});

	$('#guess').click(function () {
		var answer = $('#answer').val();
		socket.emit('submitAnswer', {answer: answer});
	});

	socket.on('showAnswer', function (data) {
		$('.guessScreen').fadeOut();
		$('.solutionScreen').fadeIn();
		redrawImage('solution', data.image);

		$('#answerWord').text(data.correctAnswer);
		if(data.answerCorrect){
			$('#correct').text("RIGHT");
		} else {
			$('#correct').text("WRONG");
		}
	});

	socket.on('showPlayerGuesses', function (data) {
		redrawImage('artistSolution', data.image);
		for(var i=0; i<data.guesses.length; i++) {
			$('#allAnswers ul').append('<li>' + data.guesses[i] + '</li>');
		}
		$('.artistWaitScreen').fadeOut();
		$('.allSolutionScreen').fadeIn();
	});

	$('#nextRound').click(function () {
		console.log('nextRound');
		socket.emit('newRound');
	});

});