// Prevent the screen from scrolling on mobile when we are trying to play.
$('#board').bind('touchmove', function(e) {
    e.preventDefault();
});
