HTML5-Image-Slider-Game
=======================

Split image into puzzle pieces (and display in random order) and let user move pieces back together again.

Works on mobile and desktop devices devices (using mouse and touch events).

##TODO (Bug):
* If you click on the same puzzle piece twice in a row then the piece moves back but a different piece is displayed?
    * Note: this is random (e.g. it doesn't always happen with first puzzle piece)
	
##TODO (feature):
* Swap out setInterval for requestAnimationFrame polyfill
* Allow drag and drop (both mouse & touch events) of each individual piece (need to think about the logic for moving over other pieces)
* Create handle icons (or think up unique way to allow) for whole rows/cols to be dragged at once