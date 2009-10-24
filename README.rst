=======
jQswipe
=======

Add swipe (or rightSwipe) and leftSwipe events to jQuery.
E.g, in the following example, swiping a task will reveal the link to remove it::

	<script src="http://code.jquery.com/jquery-latest.js" type="text/javascript"></script>
	<script src="jQswipe.js" type="text/javascript"></script>
	
	<ul id="tasks">
		<li>Task 1 <a href="#tasks">remove</a></li>
		<li>Task 2 <a href="#tasks">remove</a></li>
		<li>Task 3 <a href="#tasks">remove</a></li>
	</ul>
	
	<script type="text/javascript">
		// On click of 'complete' links, their list item are hidden,
		// but hide them for now.
		$('#tasks li > a').click(function(){
			$(this).parent().hide();
		}).hide();
		
		// On swipe, show the link.
		$('#tasks li').bind('swipe', function(){
			$(this).children('a').show();
		});
	</script>
	
By default, jQswipe only add a swipe (or leftSwipe) and a rightSwipe event, but
You can add your own swipe event by defining a validator to validate each finger
position received (on a touchmove event) and its final position (on the touchend event).
E.g., how jQswipe add the leftSwipe::

	$.jQswipe.register('leftSwipe', function(el, newPoint) {
		var diffWithStart = newPoint.diff(this.startPoint(el)),
			diffWithPrevious = newPoint.diff(this.previousPoint(el));

		// Should not be hight or too low
		if (diffWithStart.y > this.bound.maxWidth || diffWithStart.y < -this.bound.maxWidth) {
			return false;
		}

		// should not move back to the right
		if (diffWithPrevious.x > 0) {
			return false;
		}

		// If swipe ended, the swipe be long enough
		if (this.ended(el) && diffWithStart.x > -this.bound.minLength) {
			return false;
		}

		return true;
	});

$.jQswipe.register, register an event type, e.g. `rightSwipe`, with a validator, 
in this case an anonymous function which takes two arguments:

* `el` is the target element of the event,
* newPoint is an Point object to validate. It has a `x`and `y` property and a diff(`aPoint`) method.

`this` is a `Swipe` object. `this.starPoint(el)` and `this.previous(el)`
returns the first and the last point of the swipe.


