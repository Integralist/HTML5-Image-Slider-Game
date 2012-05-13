#HTML5-Image-Slider-Game

Split image into puzzle pieces (and display in random order) and let user move pieces back together again.

Works on mobile and desktop devices devices (using mouse and touch events).

You can also change the setting of the game to make it easier by allowing illegal puzzle pieces (e.g. pieces NOT directly around an empty space) to be moved.

##TODO (Bugs):
* touch device issues:
    * animation of pieces (on iOS) isn't correct (e.g. clearRect) as you can see thin lines where puzzle piece not removed properly
	
##TODO (feature):
* Swap out setInterval for requestAnimationFrame polyfill