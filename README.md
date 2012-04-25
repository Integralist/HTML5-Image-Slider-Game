HTML5-Image-Slider-Game
=======================

Split image into sections and in random order and let user move pieces back together again

##TODO (Urgent):
* Bug: with the first image piece moved, if you click same piece again then a different image piece is drawn back?
	* Update on bug: seems to be random?! Sometimes it never happens, other times it happens on the 2nd piece moved, other times it's the 3rd piece
* Need to look at vertical positioning of puzzle piece (currently appears to move too high/low)
	
##TODO (feature):
* Swap out setInterval for requestAnimationFrame polyfill
* Allow drag and drop (both mouse & touch events) of each individual piece (need to think about the logic for moving over other pieces)
* Create handle icons (or think up unique way to allow) for whole rows/cols to be dragged at once