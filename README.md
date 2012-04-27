HTML5-Image-Slider-Game
=======================

Split image into puzzle pieces (and display in random order) and let user move pieces back together again.

Works on mobile and desktop devices devices (using mouse and touch events).

##TODO (Bugs):
* Figure out issue with 'random' number generated within Array length range resulting in undefined (might already be fixed).
* Clicking too quickly onto moving piece causes an error (so disable click/touch while animating and re-instate afterwards)
* Clicking on empty space causes an error
* Look at try/catch statement and remove
	
##TODO (feature):
* Swap out setInterval for requestAnimationFrame polyfill
* Allow drag and drop (both mouse & touch events) of each individual piece (need to think about the logic for moving over other pieces)
* Create handle icons (or think up unique way to allow) for whole rows/cols to be dragged at once