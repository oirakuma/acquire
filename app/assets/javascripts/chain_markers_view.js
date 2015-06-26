function eachChainMarker(hash, f) {
  for (var p in hash)
    if (!hash[p])
      f(p);
}

var ChainMarkersView = Backbone.View.extend({
  el: "#chain-markers",
  render: function() {
    var self = this;
    $(self.el).append('<h3>Select a chain marker.</h3>');
    return new Promise(function(resolve){
      eachChainMarker(self.model.get("chain_markers"), function(color){
        var a = createButton().css("background-color", color);
        a.click(function(){
          $(self.el).empty();
          resolve(color);
        });
        $(self.el).append(a);
      });
    });
  }
});
