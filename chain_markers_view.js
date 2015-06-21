(function(global){
  global.ChainMarkersView = ChainMarkersView;

  function ChainMarkersView(option) {
    for (var p in option)
      this[p] = option[p];
  }

  ChainMarkersView.prototype.render = function() {
    var self = this;
    $(self.el).append('<div>Select a chain marker.</div>');
    for (var p in self.model.chainMarkers) {
      if (self.model.chainMarkers[p]) continue;
      var a = createButton().css("background-color", p);
      (function(color){
        a.click(function(){
          self.model.buildChain(self.name, color);
          $(self.el).empty();
          stockTableView.render();
          purchaseView.render();
        });
      })(p);
      $(self.el).append(a);
    }
  }
})(this.self);
