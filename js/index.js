

/* ----------------------for dynamic card info------------------------------------------------------------------- */
/*for delegate event https://stackoverflow.com/questions/203198/event-binding-on-dynamically-created-elements */
$(document).ready(function(){
  var zindex = 10;
  
  $("#root").on('click','.card',function(e){
    e.preventDefault();

    var isShowing = false;

    if ($(this).hasClass("show")) {
      isShowing = true
    }

    if ($("#root").hasClass("showing")) {
      // a card is already in view
      $("div.card.show")
        .removeClass("show");

      if (isShowing) {
        // this card was showing - reset the grid
        $("#root")
          .removeClass("showing");
      } else {
        // this card isn't showing - get in with it
        $(this)
          .css({zIndex: zindex})
          .addClass("show");

      }

      zindex++;

    } else {
      //#root in view
      $("#root")
        .addClass("showing");
      $(this)
        .css({zIndex:zindex})
        .addClass("show");

      zindex++;
    }
    
  });
});