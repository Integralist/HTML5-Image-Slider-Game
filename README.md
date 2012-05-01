#HTML5-Image-Slider-Game

Split image into puzzle pieces (and display in random order) and let user move pieces back together again.

Works on mobile and desktop devices devices (using mouse and touch events).

**Checkout the drag and drop branch - still being worked on**

##TODO (Bugs - "drag & drop" branch):
* touch device issues:
    * touch devices don't like switch to 2nd canvas element (which is used for drag and drop) - so touchmove focus is lost.
      I tried working around this by triggering a touchmove event but that didn't help (test on an iPad and you'll see what I mean)
    * animation of pieces isn't correct (e.g. clearRect) as you can see thin lines where puzzle piece not removed properly

##TODO:
* When dropping over an area that isn't the empty space, move the piece back to it's original spot
* Work out when all the pieces are in the correct place and signal to the user that the game is finished
* JShint the shiznit out of the code (hopefully wont be too tragic)
	
##TODO (feature):
* Create handle icons (or think up unique way to allow) for whole rows/cols to be dragged at once
* Swap out setInterval for requestAnimationFrame polyfill