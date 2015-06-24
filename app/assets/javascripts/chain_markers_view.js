(function(global){
  global.ChainMarkersView = ChainMarkersView;

  function ChainMarkersView(option) {
    for (var p in option)
      this[p] = option[p];
  }

  ChainMarkersView.prototype.render = function() {
    var self = this;
    $(self.el).append('<h3>Select a chain marker.</h3>');
    return new Promise(function(resolve){
      self.model.eachChainMarker(function(color){
        var a = createButton().css("background-color", color);
        a.click(function(){
          $(self.el).empty();
          resolve(color);
        });
        $(self.el).append(a);
      });
    });
  }
})(this.self);
