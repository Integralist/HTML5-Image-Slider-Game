(function (global) {
	
	// Set-up variables that will be used throughout this script.
	// Because of variable 'hoisting' I like to keep all vars as near to the top of the program as possible.
	var doc = global.document,
	    canvas = doc.getElementById("game"),
		context = canvas.getContext("2d"),
		dragCanvas = doc.createElement("canvas"),
		dragCanvasContext = dragCanvas.getContext("2d"),
		img = new Image(),
		canvas_height,
		canvas_width,
		canvas_grid = 4, // e.g. 4 cols x 4 rows
		piece_height,
		piece_width,
		opening_message = "Start Game",
		text_dimensions = context.measureText(opening_message),
		puzzle_squares = [],
		puzzle_randomised,
		empty_space,
		drag = true,
		eventObject;
	
	img.src = "Assets/Images/photo.jpg";	
	img.onload = function(){
        // Once image is loaded we can start calculating dimensions of puzzle
        piece_height = ~~(this.height / canvas_grid); // I prefer to use bitwise operator rather than Math.floor (see: http://james.padolsey.com/javascript/double-bitwise-not/)
		piece_width = this.width / canvas_grid;
		canvas_height = piece_height * canvas_grid;
        canvas_width = piece_width * canvas_grid;
        canvas.height = dragCanvas.height = canvas_height;
    	canvas.width = dragCanvas.width = canvas_width;
    	
    	// The dragCanvas will appear on top of the normal canvas (when we're dragging a puzzle piece)
    	dragCanvas.className = "drag-canvas";
    	dragCanvasContext.globalAlpha = .9;
    	doc.body.appendChild(dragCanvas);
    	
    	// Note: for the image I used the height of each puzzle piece was a float and not an integer.
		// This caused complications with moving puzzle pieces that aren't a round number.
		// So I rounded the height of each puzzle piece to make the movement easier.
		// This meant I had to re-set the height of the 'original' image (which is displayed as a reference to how the image should look)
		document.getElementsByTagName("img")[0].height = canvas_height;
		
		// Now we can load the image onto the canvas
        loadImageOntoCanvas();
	};
	
	function clearCanvas(){
	   // This is a trick whereby resizing the <canvas> element causes the drawing space to be cleared
	   // Easier than using the API's clearRect() method
	   // e.g. context.clearRect(0, 0, canvas_width, canvas_height);
	   canvas.width = canvas.width;
	}
	
	function loadImageOntoCanvas(){
		context.drawImage(img, 0, 0, canvas_width, canvas_height);
		context.save();
		
		// Display 'start' message to user
		context.fillStyle = "#FFF";
		context.shadowColor = "#000";
		context.shadowOffsetX = 2;
		context.shadowOffsetY = 2;
		context.shadowBlur = 2;
        context.font = "bold 25px Helvetica";
        context.fillText(opening_message, (canvas_width / 2) - text_dimensions.width, (canvas_height / 2));
        
        // Initialise the game
        canvas.addEventListener("click", init, false); // some touch devices delay 'click' event up to 300ms
        canvas.addEventListener("touchstart", init, false);
	};
	
	// We first, remove event handler(s) and then we clear the canvas 
	// Then we loop through all the puzzle pieces and build a map of co-ordinates
    // Then we shuffle the puzzle pieces
    // Then we loop through the puzzle pieces again (but this time they'll be in a random order) as we place each piece of the puzzle onto the canvas
    // Note: I find 'while' loops cleaner to read than for loops
	function init(){
        canvas.removeEventListener("click", init, false);
        canvas.removeEventListener("touchstart", init, false);
        clearCanvas();
        
        // Remove shadow (otherwise all puzzle pieces would get shadow applied to them)
        context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;
	   
        var x_coord = 0,
            y_coord = 0,
            counter = 0,
            loop_length = canvas_grid * canvas_grid,
            random_piece,
            random_number,
            removed_piece;
        
        // I didn't want to have to repeat the majority of the loop code twice.
        // So I wrapped the loop in a function and then branch off when necessary.
        // The loop is called twice in this program. First time is to split the image into 'pieces', the second time is to display them on the Canvas in a random order.
        function loop (should_draw) {
            var should_draw = should_draw || false;
            
            while (counter < loop_length) {
                if (!should_draw) {
                    puzzle_squares.push({
                        x: x_coord,
                        y: y_coord
                    });
                }
                
                if (should_draw) {
                    // Make sure shuffled array has reference (drawnOnCanvasX, drawnOnCanvasY) to where the puzzle piece has been drawn (randomly) onto the canvas
                    puzzle_randomised[counter].drawnOnCanvasX = puzzle_squares[counter].x;
                    puzzle_randomised[counter].drawnOnCanvasY = puzzle_squares[counter].y;
                    
//console.log("Piece " + counter + ": (puzzle_randomised[counter].x, puzzle_randomised[counter].y) ", puzzle_randomised[counter].x, puzzle_randomised[counter].y, " draw onto canvas at position: (puzzle_squares[counter].x, puzzle_squares[counter].y)", puzzle_squares[counter].x, puzzle_squares[counter].y);
                    // Draw puzzle slice
                    context.drawImage(img, puzzle_randomised[counter].x, puzzle_randomised[counter].y, piece_width, piece_height, puzzle_squares[counter].x, puzzle_squares[counter].y, piece_width, piece_height);
                }
            
                // Increment x positioning on each interation
                x_coord += piece_width;
                
                // Only increment the height once we've reached the end of each row
                if (x_coord >= canvas_width) {
                    x_coord = 0;
                    y_coord += piece_height;
                }
                
                counter++;
            }
            
            // Reset
            counter = 0;
            x_coord = 0;
            y_coord = 0;
        }
        
        function shuffle (array) {
            // This function uses the "Fisher–Yates" shuffle (see: http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
            // Following shuffle code was modified from _Underscore's "shuffle" method.
            var shuffled = [], 
                rand,
                counter = 0;
                
            array.forEach(function (value, index, array) {
                if (index == 0) {
                    shuffled[0] = value;
                } else {
                    rand = ~~(Math.random() * (index + 1)); // I prefer to use bitwise operator rather than Math.floor (see: http://james.padolsey.com/javascript/double-bitwise-not/)
                    shuffled[index] = shuffled[rand];
                    shuffled[rand] = value;
                }
            });
            
            return shuffled;
        }
        
        // Build map of co-ordinates
        loop();
        
        // Randomise puzzle pices
        puzzle_randomised = shuffle(puzzle_squares);
        
        // Draw puzzle pieces
        loop(true);
        
        // Randomly select a puzzle piece to remove (so user can move other pieces around)
        random_number = Math.round(Math.random()*puzzle_randomised.length-1);
        
        // The result sometimes can equal -1
        if (random_number < 0) {
            random_number = 0;
        }
        
        random_piece = puzzle_randomised[random_number];
        
        // Remove the random piece from the Array also
        removed_piece = puzzle_randomised.splice(random_number, 1);
        
        // Remove randomly selected piece (so there is one empty space in the puzzle for a user to start moving another piece into)
        context.clearRect(random_piece.drawnOnCanvasX, random_piece.drawnOnCanvasY, piece_width, piece_height);
        
        // Keep track of empty space
        empty_space = {
            x: random_piece.drawnOnCanvasX,
            y: random_piece.drawnOnCanvasY
        };
        
//console.log("puzzle_squares: ", puzzle_squares);        
//console.log("puzzle_randomised: ", puzzle_randomised);
                
        // Let the user interact with the interface
        canvas.addEventListener("click", movePiece, false);
        
        canvas.addEventListener("mousedown", checkDrag, false);
        canvas.addEventListener("touchstart", checkDrag, false);
        
        canvas.addEventListener("mouseup", stopDrag, false);
        canvas.addEventListener("touchend", stopDrag, false);
	}
	
	function startDrag (e) {
        var selected_piece,
            i = puzzle_randomised.length,
            // Firefox only recognised properties pageX/Y
            eventX = e.offsetX || e.pageX, 
            eventY = e.offsetY || e.pageY;
        
        // The user could be using a 'mouse' or 'touch' device so I named these global properties very generically
        // The reason they're global is so that we can reset them from outside this function
		global.user_positionX = eventX - (piece_width / 2),
        global.user_positionY = eventY - (piece_height / 2);
        
        eventObject = {
            handleEvent: function (e) {
                dragPiece(e, selected_piece);
            }
        };
        
        // Find the piece that was clicked on
        selected_piece = findSelectedPuzzlePiece(i, eventX, eventY);
        
        // Remove the piece from the canvas now we know which piece it is
        context.clearRect(selected_piece.drawnOnCanvasX, selected_piece.drawnOnCanvasY, piece_width, piece_height);
        
        // Now display the 'drag' canvas (e.g. the canvas used for just "drag and drop" of the selected puzzle piece)
        dragCanvas.className = "drag-canvas is-active";
        
        // Now draw the selected piece onto the drag canvas
        dragCanvasContext.drawImage(img, selected_piece.x, selected_piece.y, piece_width, piece_height, global.user_positionX, global.user_positionY, piece_width, piece_height);
        
        // I use an event object rather than specifying a listener because I want to be able to pass through extra arguments to the listener.
        // I could have used an anonymous function to wrap call to 'dragPiece' and pass through arguments that way, but then you can't remove a listener when it's set-up via an anonymous function
        dragCanvas.addEventListener("mousemove", eventObject, false);
        dragCanvas.addEventListener("touchmove", eventObject, false);
	}
	
	function dragPiece (e, selected_piece) {
        // Firefox only recognised properties pageX/Y
        var eventX = e.offsetX || e.pageX, 
            eventY = e.offsetY || e.pageY;
        
        // Remove the piece from the canvas before we start drawing it again
        dragCanvasContext.clearRect(global.user_positionX, global.user_positionY, piece_width, piece_height);
        
        // Update global mouse position
        global.user_positionX = eventX - (piece_width / 2),
        global.user_positionY = eventY - (piece_height / 2);
        
        // Re-draw puzzle piece in new position
        dragCanvasContext.drawImage(img, selected_piece.x, selected_piece.y, piece_width, piece_height, global.user_positionX, global.user_positionY, piece_width, piece_height);
	}
	
	function stopDrag (e) {
        drag = false; // this is used to tell if the user is dragging or doing a single click
        
        canvas.removeEventListener("mousemove", eventObject, false);
        canvas.removeEventListener("touchmove", eventObject, false);
        
        console.log("mouse up event triggered!");
        
        // TEMP TIMEOUT TO SIMILATE OTHER CODE BEING RUN
        global.setTimeout(function(){
            // Now this function is finished we'll reset the drag variable back to true
            drag = true;
            
            // Re-apply the event listeners
            canvas.addEventListener("click", movePiece, false);
            canvas.addEventListener("mousedown", checkDrag, false);
            canvas.addEventListener("touchstart", checkDrag, false);
        }, 1000);
	}
	
	function checkDrag (e) {
        // Check if we need to be "drag & dropping" (or just animating puzzle piece clicked on)
        if (e.type === "mousedown") {
            // Prevent function from executing more than once at a time
            canvas.removeEventListener("mousedown", checkDrag, false);
            canvas.removeEventListener("touchstart", checkDrag, false);
            
            // Check if we are going to be dragging a puzzle piece or not
            // If the user still hasn't "released" their mouse-click/touch after 150ms then we'll start dragging
            global.setTimeout(function(){
                if (drag) {
                    canvas.removeEventListener("click", movePiece, false);
                    startDrag(e);
                }
            }, 150);
        }
    }
    
    function findSelectedPuzzlePiece (i, eventX, eventY) {
        while (i--) {
            // Make sure we haven't selected the current empty space
            if (eventX >= empty_space.x && eventX <= (empty_space.x + piece_width) && eventY >= empty_space.y && eventY <= (empty_space.y + piece_height)) {
                return false;
            }
            
            if (eventX >= puzzle_randomised[i].drawnOnCanvasX && eventX <= (puzzle_randomised[i].drawnOnCanvasX + piece_width) && eventY >= puzzle_randomised[i].drawnOnCanvasY && eventY <= (puzzle_randomised[i].drawnOnCanvasY + piece_height)) {
                return puzzle_randomised[i];
            }
        }
    }
    
    function movePiece (e) {
        var i = puzzle_randomised.length,
            j = 4,
            selected_piece,
            potential_spaces,
            // Firefox only recognised properties pageX/Y
            eventX = e.offsetX || e.pageX, 
            eventY = e.offsetY || e.pageY,
            pieceMovedX,
            pieceMovedY,
            moveAmount = 10,
            interval,
            coord,
            direction, 
            storeSelectedX, 
            storeSelectedY;
        
        // Find the piece that was clicked on
        selected_piece = findSelectedPuzzlePiece(i, eventX, eventY);
        
        // If no piece found then just bail out of this function
        if (!selected_piece) {
            return;
        }
	   
        // Move piece into available empty space.
        // There are 4 potential spaces around the selected piece which it can move in (diagonal doesn't count - as we're not worrying about the 'drag and drop' yet)
        // So loop through each of them checking to see if any of their co-ordinates match the empty space
        // If they do match then move the selected piece into that space and set the selected piece to be the new empty space
        potential_spaces = [
            {
                x: selected_piece.drawnOnCanvasX,
                y: selected_piece.drawnOnCanvasY - piece_height
            },
            {
                x: selected_piece.drawnOnCanvasX - piece_width,
                y: selected_piece.drawnOnCanvasY
            },
            {
                x: selected_piece.drawnOnCanvasX + piece_width,
                y: selected_piece.drawnOnCanvasY
            },
            {
                x: selected_piece.drawnOnCanvasX,
                y: selected_piece.drawnOnCanvasY + piece_height
            }
        ];
        
        // Check if we can move the selected piece into the empty space (e.g. can only move selected piece up, down, left and right, not diagonally)
//console.log("Empty space: ", empty_space.x, empty_space.y);
//console.log("Selected: ", selected_piece.drawnOnCanvasX, selected_piece.drawnOnCanvasY);
        while (j--) {
            if (potential_spaces[j].x === empty_space.x && potential_spaces[j].y === empty_space.y) {
//console.log("Found space to move puzzle into on iteration " + j + ": ", potential_spaces[j].x, potential_spaces[j].y);
                // We then loop through the shuffled puzzle order looking for the piece that was selected by the user
                while (i--) {
/*
console.group("While Loop");
    console.log("puzzle_randomised["+i+"].drawnOnCanvasX: ", puzzle_randomised[i].drawnOnCanvasX);
    console.log("puzzle_randomised["+i+"].drawnOnCanvasY: ", puzzle_randomised[i].drawnOnCanvasY);
    console.log("puzzle_randomised["+i+"].x: ", puzzle_randomised[i].y);
    console.log("puzzle_randomised["+i+"].y: ", puzzle_randomised[i].y);
    console.log("selected_piece.drawnOnCanvasX: ", selected_piece.drawnOnCanvasX);
    console.log("selected_piece.drawnOnCanvasY: ", selected_piece.drawnOnCanvasY);
console.groupEnd();
*/
                    if (puzzle_randomised[i].drawnOnCanvasX === selected_piece.drawnOnCanvasX && 
                        puzzle_randomised[i].drawnOnCanvasY === selected_piece.drawnOnCanvasY) {
//console.log("Found puzzle image to be drawn into empty space: ", puzzle_randomised[i].drawnOnCanvasX, puzzle_randomised[i].drawnOnCanvasY);
//console.log("When we move the piece we actually are drawing (from the original image) slice: ", puzzle_randomised[i].x, puzzle_randomised[i].y);
                        
                        // We'll keep track of how far the piece has moved
                        pieceMovedX = selected_piece.drawnOnCanvasX;
                        pieceMovedY = selected_piece.drawnOnCanvasY;
                        
                        // We'll also keep track of the original selected piece as we'll need these co-ordinates for resetting the empty space
                        storeSelectedX = selected_piece.drawnOnCanvasX;
                        storeSelectedY = selected_piece.drawnOnCanvasY;
                        
                        interval = global.setInterval(function animate (piece_to_move) {
                        
                            // Clear the space where the selected piece is currently
                            context.clearRect(pieceMovedX, pieceMovedY, piece_width, piece_height);
                        	
                        	// We don't want to move the x/y co-ordinates if they're already the same
	                        if (pieceMovedX !== empty_space.x) {
	                        	coord = "x";
	                        	// Check which direction the piece needs to move in
	                        	if (pieceMovedX > empty_space.x) {
	                        		direction = 0;
	                        		pieceMovedX -= moveAmount;
	                        	} else {
	                        		direction = 1;
	                        		pieceMovedX += moveAmount;
	                        	}
	                        	
	                        } else if (pieceMovedY !== empty_space.y) {
	                        	coord = "y";
	                        	// Check which direction the piece needs to move in
	                        	if (pieceMovedY > empty_space.y) {
	                        		direction = 0;
	                        		pieceMovedY -= moveAmount;
	                        	} else {
	                        		direction = 1;
	                        		pieceMovedY += moveAmount;
	                        	}
	                        }
	                        
	                        if (direction && coord === "x" && pieceMovedX >= empty_space.x || 
	                        	direction && coord === "y" && pieceMovedY >= empty_space.y || 
	                        	!direction && coord === "x" && pieceMovedX <= empty_space.x || 
	                        	!direction && coord === "y" && pieceMovedY <= empty_space.y) {
	                        	
	                        	global.clearInterval(interval);
	                        	
	                        	// Draw one last time directly into the empty space
	                        	// Note: I was finding that because of the loop interation sometimes the y position would be -2 or 2+ but I decided that near enough the position drawing directly into the empty space the user wont even notice
                                context.drawImage(img, piece_to_move.x, piece_to_move.y, piece_width, piece_height, empty_space.x, empty_space.y, piece_width, piece_height);
	                        	
	                        	// Also update the drawnOnCanvasX/Y properties so they reflect the last place on the canvas they were drawn
		                        piece_to_move.drawnOnCanvasX = empty_space.x;
		                        piece_to_move.drawnOnCanvasY = empty_space.y;
		                        
		                        // Reset the empty space co-ordinates to be where the image we've just moved was.
		                        empty_space.x = storeSelectedX;
		                        empty_space.y = storeSelectedY;
		                        
		                        // Re-apply the event listeners
                                canvas.addEventListener("mousedown", checkDrag, false);
                                canvas.addEventListener("touchstart", checkDrag, false);
	                        	
                            } else {
                                // Then redraw it into the empty space
                                context.drawImage(img, piece_to_move.x, piece_to_move.y, piece_width, piece_height, pieceMovedX, pieceMovedY, piece_width, piece_height);
                            }
                        	
                        }, 6, puzzle_randomised[i]);
                        
                        /*
                        // Clear the space where the selected piece is currently
                        context.clearRect(selected_piece.x, selected_piece.y, piece_width, piece_height);
                        
                        // Then redraw it into the empty space
                        context.drawImage(img, puzzle_randomised[i].x, puzzle_randomised[i].y, piece_width, piece_height, empty_space.x, empty_space.y, piece_width, piece_height);
                        
                        // Also update the drawnOnCanvasX/Y properties so they reflect the last place on the canvas they were drawn
                        puzzle_randomised[i].drawnOnCanvasX = empty_space.x;
                        puzzle_randomised[i].drawnOnCanvasY = empty_space.y;
                        
                        // Reset the empty space co-ordinates to be where the image we've just moved was.
                        empty_space.x = selected_piece.x;
                        empty_space.y = selected_piece.y;
                        */
                                                
                        break;
                    }
                }
                
                break;
            }
        }
	}
	
}(this))