// Tell tweenjs to use RequestAnimationFrame, results in much smoother animations
createjs.Ticker.timingMode = createjs.Ticker.RAF;

var app = new Vue({
    el: '#app',

    data: function () {
        return {
            width          : 300,
            height         : 300,
            offset         : 0,
            swipeDirection : 0,

            sections: [
                { color: '#050D9E', pages: [
                    { title: chance.name(), content: chance.paragraph({sentences: 1}) },
                    { title: chance.name(), content: chance.paragraph({sentences: 1}) },
                    { title: chance.name(), content: chance.paragraph({sentences: 1}) },
                    { title: chance.name(), content: chance.paragraph({sentences: 1}) }
                ]},
                { color: '#FF661B', pages: [
                    { title: chance.name(), content: chance.paragraph({sentences: 1}) },
                    { title: chance.name(), content: chance.paragraph({sentences: 1}) },
                    { title: chance.name(), content: chance.paragraph({sentences: 1}) },
                    { title: chance.name(), content: chance.paragraph({sentences: 1}) }
                ]},
                { color: '#00C4B3', pages: [
                    { title: chance.name(), content: chance.paragraph({sentences: 1}) },
                    { title: chance.name(), content: chance.paragraph({sentences: 1}) },
                    { title: chance.name(), content: chance.paragraph({sentences: 1}) },
                    { title: chance.name(), content: chance.paragraph({sentences: 1}) }
                ]},
                { color: '#000000', pages: [
                    { title: chance.name(), content: chance.paragraph({sentences: 1}) },
                    { title: chance.name(), content: chance.paragraph({sentences: 1}) },
                    { title: chance.name(), content: chance.paragraph({sentences: 1}) },
                    { title: chance.name(), content: chance.paragraph({sentences: 1}) }
                ]}
            ]
        }
    },

    methods: {

        getOffsetValue: function(index) {
            // If this card is the bottom card, have it come in ontop of the deck
            if (index === 0) {
                if (this.swipeDirection > 0) {
                    return this.offset - this.height;
                } else {
                    return -this.height;
                }
            }

            // If this card is the top card, have it reveal the card underneath
            if (index === this.sections.length - 1 && this.swipeDirection < 0) {
                return this.offset;
            }

            // This card is not the first or the last, so it stays in place
            return 0;
        },

        onResize: function() {
            this.width  = $(window).width();
            this.height = $(window).height();
        },

        onTouchMove: function(ev) {
            this.offset         = ev.deltaY / 3;
            this.swipeDirection = ev.deltaY < 0 ? -1 : 1;
        },

        onTouchEnd: function(ev) {
            // If the user has not dragged more than 30% of the screen height
            if (Math.abs(ev.deltaY) <= this.height * 0.3) {

                // Move the page back to 0
                createjs.Tween
                    .get(this)
                    .to({offset:0}, 200);

            // If the user has dragged the page more than 30% of the screen height
            } else {

                // Find the direction they moved in
                this.swipeDirection = ev.deltaY < 0 ? -1 : 1;

                // Move the page further in that direction, until its off screen
                createjs.Tween
                    .get(this)
                    .to({ offset:this.swipeDirection * this.height }, 200)
                    .call(this.onAfterTransition.bind(this));
            }
        },

        onAfterTransition: function() {
            // Now that the page is vertically off-screen, re-arrange the card deck

            if (this.swipeDirection > 0) {
                this.sections.push(this.sections.shift());
            } else {
                this.sections.unshift(this.sections.pop());
            }

            // Re-set the card to be back at 0 vertical offset
            this.offset = 0;
        }
    },

    ready: function () {
        var self = this;

        // Bind resize event to the view model
        this.onResize();
        $(window).on('resize', self.onResize.bind(this));

        // Initialize the horizontal carousel (handles horizontal paging)
        $(this.$el).find('.owl-carousel').owlCarousel({
            items      : 1,
            margin     : 0,
            nav        : false,
            loop       : true,
            autoheight : true
        });

        // Initialize the touch controller (handles vertical paging)
        var mc = new Hammer(this.$el);
        mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        mc.on("panup pandown", this.onTouchMove.bind(this));
        mc.on("panend pancancel", this.onTouchEnd.bind(this));
    }
});
