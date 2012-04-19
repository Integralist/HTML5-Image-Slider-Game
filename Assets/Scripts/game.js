// 30mins 

(function (global) {
	
	var canvas = document.getElementById("game"),
		context = canvas.getContext("2d"),
		img = new Image(),
		canvas_height = 472,
		canvas_width = 760,
		canvas_grid = 4, // e.g. 4 cols x 4 rows
		piece_height = ~~(475 / canvas_grid), // quicker to use double bitwise NOT operator (http://james.padolsey.com/javascript/double-bitwise-not/) than Math.floor
		piece_width = 760 / canvas_grid,
		opening_message = "Start Game",
		text_dimensions = context.measureText(opening_message);
	
	canvas.height = canvas_height;
	canvas.width = canvas_width;
	
	img.src = "Assets/Images/photo.jpg";	
	img.onload = loadImage;
	
	function loadImage(){
		context.drawImage(img, 0, 0, canvas_width, canvas_height);
		
		// Display 'start' message to user
		context.fillStyle = "#FFF";
		context.shadowColor = "#000";
		context.shadowOffsetX = 2;
		context.shadowOffsetY = 2;
		context.shadowBlur = 2;
        context.font = "bold 25px Helvetica";
        context.fillText(opening_message, (canvas_width / 2) - text_dimensions.width, (canvas_height / 2));
        
        // Set-up a click/touch handler to start game
	};
	
}(this))