(function(global){
  global.ChainMarkersView = ChainMarkersView;

  function ChainMarkersView(option) {
    for (var p in option)
      this[p] = option[p];
  }

  ChainMarkersView.prototype.render = function() {
    var self = this;
    $(self.el).append('<div>Select a chain marker.</div>');
    self.model.eachChainMarker(function(color){
      var a = createButton().css("background-color", color);
      a.click(function(){
        self.model.buildChain(0, self.name, color);
        $(self.el).empty();
        stockTableView.render();
        purchaseView.render();
      });
      $(self.el).append(a);
    });
  }
})(this.self);
