"use strict";

 (function($) {
    var swipe,
    window = this;

    swipe = $.fn.swipe = function(cb) {
        $(this).bind('swipe', cb);
    };

    swipe.Point = function(x, y) {
        this.x = x;
        this.y = y;
    };

    swipe.Point.prototype.diff = function(point) {
        return {
            x: this.x - point.x,
            y: this.y - point.y
        };
    };

    swipe.Point.prototype.toString = function() {
        return 'x: ' + this.x + ', y: ' + this.y;
    };

    swipe.Point.fromTouch = function(touch) {
        return new $.fn.swipe.Point(touch.pageX, touch.pageY);
    };

    swipe.protoSwipe = {
        dataPrefix: 'events.special.swipeManager',

        bound: {
            minLength: 30,
            maxWidth: 10
        },

        start: function(el, touches) {
            var currentPoint;

            if (touches.length === 1) {
                currentPoint = $.fn.swipe.Point.fromTouch(touches[0]);
                this.cancelled(el, false);
                this.ended(el, false);
                this.startPoint(el, currentPoint);
                this.currentPoint(el, currentPoint);
            } else {
                this.cancelled(el, true);
            }
        },

        update: function(el, touches) {
            var newPoint;

            if (this.cancelled(el)) {
                return;
            }

            if (touches.length === 1) {
                this.previousPoint(el, this.currentPoint(el));
            } else {
                this.cancelled(el, true);
                return;
            }

            newPoint = $.fn.swipe.Point.fromTouch(touches[0]);
            if (this.validate(el, newPoint)) {
                this.currentPoint(el, newPoint);
            } else {
                this.cancelled(el, true);
            }
        },

        validate: function(el, newPoint) {
            // validate swipe (a right swipe by default)
            var diffWithStart = newPoint.diff(this.startPoint(el)),
                diffWithPrevious = newPoint.diff(this.previousPoint(el));

            // Should not be hight or too low
            if (diffWithStart.y > this.bound.maxWidth || diffWithStart.y < -this.bound.maxWidth) {
                return false;
            }

            // should not move back to the left
            if (diffWithPrevious.x < 0) {
                return false;
            }

            // If swipe ended, the swipe be long enough
            if (this.ended(el) && diffWithStart.x < this.bound.minLength) {
                return false;
            }

            return true;
        },

        end: function(el) {
            this.ended(el, true);
            this.cancelled(el, !this.validate(el, this.currentPoint(el)));
        },

        data: function(el, name, value) {
            var result = $(el).data(this.dataPrefix + '.' + name, value);
            if (value === undefined) {
                return result;
            }
        },

        startPoint: function(el, point) {
            return this.data(el, 'start', point);
        },

        previousPoint: function(el, point) {
            return this.data(el, 'previous', point);
        },

        currentPoint: function(el, point) {
            return this.data(el, 'current', point);
        },

        cancelled: function(el, cancelled) {
            return this.data(el, 'cancelled', cancelled);
        },

        ended: function(el, ended) {
            return this.data(el, 'ended', ended);
        },

        log: function(context, el) {
            var st = this.startPoint(el) || "undefined",
                pr = this.previousPoint(el) || "undefined",
                cu = this.previousPoint(el) || "undefined",
                log = window.console && window.console.log || function () {};
            
            
            log('[' + context + ']' +
                'start: ' + st.toString() +
                '; previous: ' + pr.toString() +
                ': current: ' + cu.toString());
        }
    };

    swipe.Swipe = function(evenType, validator) {
        var that = this;

        evenType = evenType || 'swipe';
        this.validate = validator || $.fn.swipe.protoSwipe.validate;

        this.setup = function(data, namespaces) {
            var $el = $(this);
            $el.bind('touchstart', that.startHandler);
            $el.bind('touchmove', that.moveHandler);
            $el.bind('touchcancel', that.cancelHandler);
            $el.bind('touchend', that.endHandler);
        };

        this.teardown = function(namespaces) {
            var $el = $(this);
            $el.unbind('touchstart', that.startHandler);
            $el.unbind('touchmove', that.moveHandler);
            $el.unbind('touchcancel', that.cancelHandler);
            $el.unbind('touchend', that.endHandler);
        };

        that.startHandler = function() {
            that.start(this, window.event.targetTouches);
        };

        that.moveHandler = function() {
            that.update(this, window.event.targetTouches);
        };

        that.cancelHandler = function() {
            that.cancelled(this, true);
        };

        that.endHandler = function(event) {
            that.end(this);

            if (that.cancelled(this) === false) {
                event.type = evenType;
                $.event.handle.apply(this, arguments);
            }

        };
    };

    swipe.Swipe.prototype = swipe.protoSwipe;

    $.event.special.swipe = new swipe.Swipe();
    $.event.special.rightSwipe = new swipe.Swipe('rightSwipe');
    $.event.special.leftSwipe = new swipe.Swipe('leftSwipe', function(el, newPoint) {
        var diffWithStart = newPoint.diff(this.startPoint(el)),
            diffWithPrevious = newPoint.diff(this.previousPoint(el));

        // Should not be hight or too low
        if (diffWithStart.y > this.bound.maxWidth || diffWithStart.y < -this.bound.maxWidth) {
            return false;
        }

        // should not move back to the left
        if (diffWithPrevious.x >= 0) {
            return false;
        }

        // If swipe ended, the swipe be long enough
        if (this.ended(el) && diffWithStart.x > -this.bound.minLength) {
            return false;
        }

        return true;
    });

})(jQuery);