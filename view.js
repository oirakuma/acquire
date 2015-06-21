(function(global){
  global.render = render;
  global.createButton = createButton;
  global.redirectTo = redirectTo;

  var playedTile = null;

  function redirectTo(path) {
    var a = $('<a></a>');
    a.attr("href", path);
    $("#two").append(a);
    a.click();
  }

  function createButton() {
    var a = $('<a></a>').addClass("ui-btn").addClass("ui-btn-inline");
    return a;
  }

  function render(model, ai) {
    for (var i = 0; i < 6; i++) {
      var name = model.tiles.shift();
      $("."+name).css("color", "orange").css("font-weight", "bold");
    }
  }
})(this.self);

