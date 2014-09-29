// Polyfill for requestAnimationFrame which I've modified from Paul Irish's original
// See: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
(function (global) {
	var lastTime = 0,
		vendors = ['ms', 'moz', 'webkit', 'o'];
	
	for (var x = 0; x < vendors.length && !global.requestAnimationFrame; ++x) {
		global.requestAnimationFrame = global[vendors[x]+'RequestAnimationFrame'];
		global.cancelAnimationFrame = global[vendors[x]+'CancelAnimationFrame'] || global[vendors[x]+'CancelRequestAnimationFrame'];
	}
	
	global.nativeRAF = !!global.requestAnimationFrame; // store reference to whether it was natively supported or not (later we need to change increment value depending on if setInterval or requestAnimationFrame is used)

	if (!global.requestAnimationFrame) {
		global.requestAnimationFrame = function (callback, element) {
			
			var currTime = new Date().getTime(),
				timeToCall = Math.max(0, 16 - (currTime - lastTime)),
				id = global.setTimeout(function(){ 
					callback(currTime + timeToCall);
				}, timeToCall);
			
			lastTime = currTime + timeToCall;
			
			return id;
			
		};
	}

	if (!global.cancelAnimationFrame) {
		global.cancelAnimationFrame = function (id) {
			clearTimeout(id);
		};
	}
}(this));

(function (global) {
	
	// Because of variable 'hoisting' I like to keep all vars as near to the top of the program as possible.
	// Following variables are related to the creation of the canvas' and specific configuration
	var doc = global.document,
		canvas = doc.getElementById("game"),
		context = canvas.getContext("2d"),
		dragCanvas = doc.createElement("canvas"),
		dragCanvasContext = dragCanvas.getContext("2d"),
		img = new Image(),
		canvas_height,
		canvas_width,
		//canvas_grid = 4, // e.g. 4 cols x 4 rows
		canvas_grid = 3,// I change this to try the grid fix
		piece_height,
		piece_width,
		opening_message = "Start Game",
		text_dimensions = context.measureText(opening_message),
	// Following variables are related to the puzzle pieces
		puzzle_squares = [],
		puzzle_randomised,
		empty_space,
		current_piece,
		removed_piece,
		random_number,
	// Following variables are related to moving puzzle pieces around
		drag = true,
		eventObject,
		eventsMap  = {
			select: "click",
			down: "mousedown",
			up: "mouseup",
			move: "mousemove"
		},
		touchSupported = false,
		event_moving = false,
		upTriggered = false,
		wasJustDragging = false,
		allow_input = doc.getElementById("allow");
	
	// We have a set API for handling events that typically map to mouse events
	// But if the device supports touch events then we'll use those instead
	if ("ontouchstart" in global) {
        touchSupported = true;
        eventsMap  = {
            select: "touchstart",
            down: "touchstart",
            up: "touchend",
            move: "touchmove"
        };
    }
	
	img.src = "Assets/Images/photo.jpg";	
	img.onload = function(){
        // Once image is loaded we can start calculating dimensions of puzzle
        piece_height = ~~(this.height / canvas_grid); // I prefer to use bitwise operator rather than Math.floor (see: http://james.padolsey.com/javascript/double-bitwise-not/)
		piece_width = this.width / canvas_grid;
		canvas_height = piece_height * canvas_grid;
        canvas_width = piece_width * canvas_grid;
        canvas.height = dragCanvas.height = canvas_height;
    	canvas.width = dragCanvas.width = canvas_width;
    	
    	// The dragCanvas is always displayed over the bottom canvas.
    	// All interaction happens on the top canvas.
    	// All puzzle pieces are drawn on the bottom canvas.
    	// Top canvas handles the dragging a specific puzzle piece.
    	dragCanvas.className = "drag-canvas";
    	dragCanvasContext.globalAlpha = .9;
    	doc.body.appendChild(dragCanvas);
		
		// Now we can load the image onto the canvas
        loadImageOntoCanvas();
	};
	
	function clearCanvas (c) {
	   // This is a trick whereby resizing the <canvas> element causes the drawing space to be cleared
	   // Easier than using the API's clearRect() method
	   // e.g. context.clearRect(0, 0, canvas_width, canvas_height);
	   c.width = c.width;
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
        dragCanvas.addEventListener(eventsMap.select, init, false);
	}
	
	// We first, remove event handler(s) and then we clear the canvas 
	// Then we loop through all the puzzle pieces and build a map of co-ordinates
    // Then we shuffle the puzzle pieces
    // Then we loop through the puzzle pieces again (but this time they'll be in a random order) as we place each piece of the puzzle onto the canvas
    // Note: I find 'while' loops cleaner to read than for loops
	function init(){
        dragCanvas.removeEventListener(eventsMap.select, init, false);
        clearCanvas(canvas);
        
        // Remove shadow (otherwise all puzzle pieces would get shadow applied to them)
        context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;
	   
        var x_coord = 0,
            y_coord = 0,
            counter = 0,
            loop_length = canvas_grid * canvas_grid,
            random_piece;
        
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
        
        // Let the user interact with the interface
        dragCanvas.addEventListener(eventsMap.down, checkDrag, false);
        dragCanvas.addEventListener(eventsMap.up, toggleDragCheck, false);
	}
	
	function highlightEmptySpace(){
        // We need to first clear any 'highlight' already drawn in this empty space/
        // This is because this function could be called multiple times 
        // (as it's being referenced from within a mousemove/touchmove listener)
        context.clearRect(empty_space.x, empty_space.y, piece_width, piece_height);
        
        context.beginPath();
            context.rect(empty_space.x + 2, empty_space.y + 2, piece_width - 4, piece_height - 4);
            context.fillStyle = "#C00";
            context.fill();
            context.lineWidth = 4;
            context.strokeStyle = "yellow";
            context.stroke();
        context.closePath();
	}
	
	function putPieceBack(){
		clearCanvas(dragCanvas);
		context.drawImage(img, current_piece.x, current_piece.y, piece_width, piece_height, current_piece.drawnOnCanvasX, current_piece.drawnOnCanvasY, piece_width, piece_height);
		context.clearRect(empty_space.x, empty_space.y, piece_width, piece_height); // this is in case the user triggers the empty space to be highlighted, but the user fails to complete the dropping of the puzzle piece into the empty space
		upTriggered = false;
	}
	
	function startDrag (e) {
        var selected_piece,
            i = puzzle_randomised.length,
            potential_spaces,
            // Firefox only recognised properties pageX/Y
            eventX = e.offsetX || e.pageX, 
            eventY = e.offsetY || e.pageY;
        
        function setUp(){
	        // Remove the piece from the canvas now we know which piece it is
	        context.clearRect(selected_piece.drawnOnCanvasX, selected_piece.drawnOnCanvasY, piece_width, piece_height);
	        
	        // Now draw the selected piece onto the drag canvas
	        dragCanvasContext.drawImage(img, selected_piece.x, selected_piece.y, piece_width, piece_height, global.user_positionX, global.user_positionY, piece_width, piece_height);
	        
	        // I use an event object rather than specifying a listener because I want to be able to pass through extra arguments to the listener.
	        // I could have used an anonymous function to wrap call to 'dragPiece' and pass through arguments that way, but then you can't remove a listener when it's set-up via an anonymous function
	        dragCanvas.addEventListener(eventsMap.move, eventObject, false);
	        
	        // Keep track of move event
	        event_moving = true;
        }
        
        // The user could be using a 'mouse' or 'touch' device so I named these global properties very generically
        // The reason they're global is so that we can reset them from outside this function
		global.user_positionX = eventX - (piece_width / 2);
        global.user_positionY = eventY - (piece_height / 2);
        
        eventObject = {
            handleEvent: function (e) {
                dragPiece(e, selected_piece);
            }
        };
        
        // Find the piece that was clicked on
        current_piece = selected_piece = findSelectedPuzzlePiece(i, eventX, eventY);
        
        // Check to see if we want to allow illegal drag and drop (i.e. moving of a piece that's not immediately around the empty space)
        if (!allow_input.checked) {
	        
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
	        var j = potential_spaces.length;
	        // Check if we can move the selected piece into the empty space (e.g. can only move selected piece up, down, left and right, not diagonally)
	        // We use a labelled statement to break out of the outer loop once a match is found within the inner loop
	        outer_loop:
	        while (j--) {
	        	if (potential_spaces[j].x === empty_space.x && potential_spaces[j].y === empty_space.y) {
	        		// We then loop through the shuffled puzzle order looking for the piece that was selected by the user
	        		while (i--) {
	        			if (puzzle_randomised[i].drawnOnCanvasX === selected_piece.drawnOnCanvasX && 
	        				puzzle_randomised[i].drawnOnCanvasY === selected_piece.drawnOnCanvasY) {
	         				
	         				selected_piece = puzzle_randomised[i];
	         				setUp();
	         				break outer_loop;
	         				
	        			}
	        		}
	        	}
	        }
	        
	        // User must have clicked on an item that couldn't have been moved
	        if (j < 0) {
		        event_moving = true; // this is so when the mouseup/touchend event is triggered we can catch this error out inside toggleDragCheck() which otherwise would reset drag=false and cause problems with the user's next interaction
	        	resetOptions();
	        }
	        
        } else {	        
	        setUp();	        
        }
	}
	
	function dragPiece (e, selected_piece) {
		// Firefox only recognised properties pageX/Y
        var eventX = e.offsetX || e.pageX, 
            eventY = e.offsetY || e.pageY,
            storeSelectedX = selected_piece.drawnOnCanvasX,
            storeSelectedY = selected_piece.drawnOnCanvasY,
            halfWidth = piece_width / 2,
            halfHeight = piece_height / 2;
            
        // Remove the piece from the canvas before we start drawing it again
        dragCanvasContext.clearRect(global.user_positionX, global.user_positionY, piece_width, piece_height);
        
        // Update global mouse position
        global.user_positionX = eventX - halfWidth;
        global.user_positionY = eventY - halfHeight;
        
        // If a part of the dragged puzzle piece is over a small portion of the empty space (20px inside of the empty space) 
        // then highlight the empty space so the user knows they can drop there (should be pretty obvious but never-the-less it's a nice indication)
        if (global.user_positionX <= empty_space.x + (piece_width - 20) && 
            global.user_positionY <= empty_space.y + (piece_height - 20) && 
            global.user_positionY + piece_height >= empty_space.y + 20 && 
            global.user_positionX + piece_width >= empty_space.x + 20) {
            highlightEmptySpace();
        } else {
            context.clearRect(empty_space.x, empty_space.y, piece_width, piece_height);
        }
        
        // Check if mouse is over the empty space or not
        if ((eventX >= empty_space.x && eventX < (empty_space.x + piece_width)) && (eventY >= empty_space.y && eventY < (empty_space.y + piece_height))) {
            // If it is then clear event listeners
            // Stop tracking move event
            // re-draw puzzle piece in empty space (there is really only one space to drop the piece so we can force this 'drop' action)
            // then update co-ordinates
            // call stopDrag() to reset interface for next interaction
            dragCanvas.removeEventListener(eventsMap.move, eventObject, false);
            event_moving = false;
            context.drawImage(img, selected_piece.x, selected_piece.y, piece_width, piece_height, empty_space.x, empty_space.y, piece_width, piece_height);
            selected_piece.drawnOnCanvasX = empty_space.x;
            selected_piece.drawnOnCanvasY = empty_space.y;
            empty_space.x = storeSelectedX;
            empty_space.y = storeSelectedY;
            stopDrag();
        } else {	
            // Otherwise we keep drawing the selected puzzle piece until it's ready to be dropped
            dragCanvasContext.drawImage(img, selected_piece.x, selected_piece.y, piece_width, piece_height, global.user_positionX, global.user_positionY, piece_width, piece_height);
        }
	}
	
	// This function is called when the user released their click (e.g. mouseup/touchend)
	// The reason for that is so if the user clicks quickly then they obviously don't want to 'drag' the puzzle piece (they just want it to move itself) 
	function toggleDragCheck (e) {
		upTriggered = true;
		
		// If the user releases while piece is moving but the piece hasn't yet been placed then stop the drag
		// And move the piece back into the empty space it came from
		if (upTriggered && event_moving) {
			upTriggered = false;
			event_moving = false;
			stopDrag();
			putPieceBack();
		} else {
			drag = false;
		}
	}
	
	function stopDrag(){
        dragCanvas.removeEventListener(eventsMap.move, eventObject, false);
        dragCanvas.removeEventListener(eventsMap.up, toggleDragCheck, false); // this prevents 'release' being triggered and causing problems with users next interaction (e.g. if the user wants to 'drag' again - without this set they wouldn't be able to as the release causes toggleDragCheck to be called which sets drag = false!)
        wasJustDragging = true;
        resetOptions();
        if (checkIfGameFinished()) {
        	drawBackMissingPiece();
        }
	}
	
	function checkDrag (e) {
        dragCanvas.removeEventListener(eventsMap.down, checkDrag, false);
        
        // Check if we are going to be dragging a puzzle piece or not
        // If the user still hasn't "released" their mouse-click/touch after 150ms then we'll start dragging
        global.setTimeout(function(){
            if (drag) {
                startDrag(e);
            } else {
                movePiece(e);
            }
        }, 150);
    }
    
    function resetOptions(){
	    // We only want to execute a delay for re-applying the listeners when the prior action was a 'drag and drop'
        if (wasJustDragging) {
	        // Re-apply the event listeners.
	        // But wait half a second before re-applying.
		    // This is because otherwise it'll be called immediately and the next user interaction will be broken
		    global.setTimeout(function(){
		        dragCanvas.addEventListener(eventsMap.down, checkDrag, false);
		        dragCanvas.addEventListener(eventsMap.up, toggleDragCheck, false);
		    }, 500);
		} else {
			dragCanvas.addEventListener(eventsMap.down, checkDrag, false);
		}
        
        // Make sure drag is reset to true so we can check whether the user wants to "drag & drop"
        drag = true;
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
    
    function checkIfGameFinished(){
	    // Insert the removed puzzle piece back into a copy of the current state of the puzzle Array
	    // We don't want to insert it back into the actual puzzle_randomised Array in case the game isn't over
	    // So we'll copy that Array and insert into the copied Array and we'll check against that
	    
	    var copied_puzzle_randomised = puzzle_randomised.slice(0);
	    	copied_puzzle_randomised.splice(random_number, 0, removed_piece[0]);
	    	complete = false;
	    
	    complete = copied_puzzle_randomised.every(function (item, index, array) {
		    if (item.drawnOnCanvasX === item.x && item.drawnOnCanvasY === item.y) {
		    	return true;
		    } 
		    // The final piece is actually the missing piece so we check the x/y against the empty_space x/y
		    else if (item.x === empty_space.x && item.y === empty_space.y) {
			    return true;
			} else {
			    return false;
		    }
	    });
	    
	    return complete;
    }
    
    function drawBackMissingPiece(){
	    context.drawImage(img, empty_space.x, empty_space.y, piece_width, piece_height, empty_space.x, empty_space.y, piece_width, piece_height);
	    alert("Congratulations! The game is complete");
    }
    
    function movePiece (e) {
        var i = puzzle_randomised.length,
            selected_piece,
            potential_spaces,
            // Firefox only recognised properties pageX/Y
            eventX = e.offsetX || e.pageX, 
            eventY = e.offsetY || e.pageY,
            pieceMovedX,
            pieceMovedY,
            moveAmount = (nativeRAF) ? 20 : 10, // setInterval worked fine when moving by 10 but rAF could do with up'ing the number of pixels per movement
            interval,
            coord,
            direction, 
            storeSelectedX, 
            storeSelectedY,
            foundPieceForAnimation;
        
        // Find the piece that was clicked on
        selected_piece = findSelectedPuzzlePiece(i, eventX, eventY);
        
        // We're resetting to false now we're moving the puzzle piece automatically
        wasJustDragging = false;
        
        // If no piece found (or user clicked on 'empty space') then don't continue
        // But we need to reset some settings ready for next user interaction
        if (!selected_piece) {
            resetOptions();
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
        var j = potential_spaces.length;
        function raf(){
	        // We call requestAnimationFrame as it was modelled on setTimeout rather than setInterval
	        interval = global.requestAnimationFrame(raf);
	        
	        // Start the actual animation
	        animate(foundPieceForAnimation);
        }
        
        function animate (piece_to_move) {
	        
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

				global.cancelAnimationFrame(interval);
				
				// Draw one last time directly into the empty space
        		// Note: I was finding that because of the loop interation sometimes the y position would be -2 or 2+ but I decided that near enough the position drawing directly into the empty space the user wont even notice
        		context.drawImage(img, piece_to_move.x, piece_to_move.y, piece_width, piece_height, empty_space.x, empty_space.y, piece_width, piece_height);

        		// Also update the drawnOnCanvasX/Y properties so they reflect the last place on the canvas they were drawn
        		piece_to_move.drawnOnCanvasX = empty_space.x;
        		piece_to_move.drawnOnCanvasY = empty_space.y;

        		// Reset the empty space co-ordinates to be where the image we've just moved was.
        		empty_space.x = storeSelectedX;
        		empty_space.y = storeSelectedY;

        		resetOptions();

        		if (checkIfGameFinished()) {
        			drawBackMissingPiece();
        		}
        	} else {
	        	// Then redraw it into the empty space
        		context.drawImage(img, piece_to_move.x, piece_to_move.y, piece_width, piece_height, pieceMovedX, pieceMovedY, piece_width, piece_height);
        	}

        }
        
        // Check if we can move the selected piece into the empty space (e.g. can only move selected piece up, down, left and right, not diagonally)
        while (j--) {
            if (potential_spaces[j].x === empty_space.x && potential_spaces[j].y === empty_space.y) {
                // We then loop through the shuffled puzzle order looking for the piece that was selected by the user
                while (i--) {
                    if (puzzle_randomised[i].drawnOnCanvasX === selected_piece.drawnOnCanvasX && 
                        puzzle_randomised[i].drawnOnCanvasY === selected_piece.drawnOnCanvasY) {
                        
                        // We'll keep track of how far the piece has moved
                        pieceMovedX = selected_piece.drawnOnCanvasX;
                        pieceMovedY = selected_piece.drawnOnCanvasY;
                        
                        // We'll also keep track of the original selected piece as we'll need these co-ordinates for resetting the empty space
                        storeSelectedX = selected_piece.drawnOnCanvasX;
                        storeSelectedY = selected_piece.drawnOnCanvasY;
                        
                        // Animate the piece into place
                        foundPieceForAnimation = puzzle_randomised[i]; // had to store in var rather than pass as an argument as requestAnimationFrame doesn't have any way to pass an argument :-(
                        raf();
                                                
                        break;
                    }
                }
                
                break;
            }
        }
        
        // User must have clicked on an item that couldn't have been moved
        if (j < 0) {
            resetOptions();
        }
	}
	
}(this));