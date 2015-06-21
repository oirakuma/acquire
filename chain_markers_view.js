(function(global){
  global.ChainMarkersView = ChainMarkersView;

  function ChainMarkersView(option) {
    for (var p in option)
      this[p] = option[p];
  }

  ChainMarkersView.prototype.render = function() {
    var self = this;
    $(self.id).append('<div>Select a chain marker.</div>');
    for (var p in self.model.chainMarkers) {
      if (self.model.chainMarkers[p]) continue;
      var a = createButton().css("background-color", p);
      (function(color){
        a.click(function(){
          self.model.setColor(self.name, color);
          self.model.chainMarkers[color] = true;
          setTimeout(function(){
            $(self.id).empty();
            ai.play();
          }, 500);
        });
      })(p);
      $(self.id).append(a);
    }
  }
})(this.self);
