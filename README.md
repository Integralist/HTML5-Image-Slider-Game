HTML5-Image-Slider-Game
=======================

Split image into puzzle pieces (and display in random order) and let user move pieces back together again.

Works on mobile and desktop devices devices (using mouse and touch events).

##TODO (Bugs):
* Clicking too quickly onto moving piece causes an error (so disable click/touch while animating and re-instate afterwards)
    * I can't seem to replicate this often at all (it seemed to happen once in a blue moon)?
	
##TODO (feature):
* Swap out setInterval for requestAnimationFrame polyfill
* Allow drag and drop (both mouse & touch events) of each individual piece (need to think about the logic for moving over other pieces)
* Create handle icons (or think up unique way to allow) for whole rows/cols to be dragged at once