(function(global){
  global.ChainMarkersView = ChainMarkersView;

  function ChainMarkersView(option) {
    for (var p in option)
      this[p] = option[p];
  }

  function eachChainMarker(hash, f) {
    for (var p in hash)
      if (!hash[p])
        f(p);
  }

  ChainMarkersView.prototype.render = function(game) {
    var self = this;
    $(self.el).append('<h3>Select a chain marker.</h3>');
    return new Promise(function(resolve){
      eachChainMarker(game.chain_markers, function(color){
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
