(function(global){
  global.PurchaseView = PurchaseView;

  function PurchaseView(option) {
    for (var p in option)
      this[p] = option[p];
  }

  PurchaseView.prototype.render = function() {
    var self = this;

    function createChainMarker(color) {
      var a = createButton().css("background-color",color);
      a.click(function(){
        self.model.purchaseStock(0, color);
        stockTableView.render();
      });
      return a;
    }

    for (var p in this.model.chainMarkers) {
      if (this.model.chainMarkers[p])
        $(self.el).append(createChainMarker(p));
    }
    var a = createButton().text("Done");
    $(self.el).append(a);
  }
})(this.self);
