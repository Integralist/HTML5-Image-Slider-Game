HTML5-Image-Slider-Game
=======================

Split image into sections and in random order and let user move pieces back together again

##TODO (Urgent):
* Bug: with the first image piece moved, if you click same piece again then a different image piece is drawn back?
* Need to look at how better to clearRect of previous image position as there are thin lines visible where it hasn't been cleared correctly.
* Need to make sure that the final position isn't over (as the y co-ordinates are a float rather than an integer).
	
##TODO (feature):
* Swap out setInterval for requestAnimationFrame polyfill
* Allow drag and drop (both mouse & touch events) of each individual piece (need to think about the logic for moving over other pieces)
* Create handle icons (or think up unique way to allow) for whole rows/cols to be dragged at once