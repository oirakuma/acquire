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
      var count = 0;
      a.click(function(){
        if (count >= 3) {
          alert("You can purchase 3");
          return;
        }
        count++;
        self.model.purchaseStock(0, color);
        stockTableView.render();
      });
      return a;
    }

    $(self.el).append('<p>Purchase stocks.</p>');
    for (var p in this.model.chainMarkers) {
      if (this.model.chainMarkers[p])
        $(self.el).append(createChainMarker(p));
    }
    var a = createButton().text("Done");
    a.click(function(){
      $(self.el).empty();
      setTimeout(function(){
        ai.play(1);
      }, 500);
    });
    $(self.el).append(a);
  }
})(this.self);
