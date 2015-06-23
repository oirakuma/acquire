(function(global){
  global.PurchaseView = PurchaseView;

  function PurchaseView(option) {
    for (var p in option)
      this[p] = option[p];
  }

  PurchaseView.prototype.render = function() {
    var self = this;
    var count = 0;

    function createChainMarker(color) {
      var a = createButton().css("background-color",color);
//      a.text(self.model.price(color));
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

    $(self.el).append('<h3>Purchase stocks.</h3>');
    this.model.eachChain(function(color){
      $(self.el).append(createChainMarker(color));
    });

    return new Promise(function(resolve){
      var a = createButton().text("Done").addClass("ui-mini");
      a.click(function(){
        $(self.el).empty();
        resolve("OK");
      });
      $(self.el).append(a);
    });
  }
})(this.self);
