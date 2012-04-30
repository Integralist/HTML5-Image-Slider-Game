#HTML5-Image-Slider-Game

Split image into puzzle pieces (and display in random order) and let user move pieces back together again.

Works on mobile and desktop devices devices (using mouse and touch events).

**Checkout the drag and drop branch - still being worked on**

##TODO (Bugs - "drag & drop" branch):
* drag and drop co-ordinates are off slightly (so feel too jumpy)
* Mobile devices aren't handling the drag and drop (once the drag canvas is positioned above the original canvas the touch interaction switches to the containing window and not the drag canvas?)

##TODO:
* Work out when all the pieces are in the correct place and signal to the user that the game is finished
* JShint the shiznit out of the code (hopefully wont be too tragic)
	
##TODO (feature):
* Create handle icons (or think up unique way to allow) for whole rows/cols to be dragged at once
* Swap out setInterval for requestAnimationFrame polyfill