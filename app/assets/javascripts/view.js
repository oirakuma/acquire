(function(global){
  global.createButton = createButton;

  function createButton() {
    var a = $('<a></a>').addClass("ui-btn").addClass("ui-btn-inline");
    return a;
  }
})(this.self);

