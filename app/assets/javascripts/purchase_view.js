(function(global){
  global.PurchaseView = PurchaseView;

  function PurchaseView(option) {
    for (var p in option)
      this[p] = option[p];
  }

  function purchaseStock(color) {
    return new Promise(function(resolve){
      $.ajax({
        url: "/games/1/purchase_stock.json",
        type: "POST",
        data: "color="+color,
        success: function(game){
          resolve(game);
        }
      });
    });
  }

  PurchaseView.prototype.render = function(game) {
    var self = this;
    var count = 0;

    function createChainMarker(color) {
      var a = createButton().css("background-color",color);
      a.click(function(){
        if (count >= 3) {
          alert("You can't purchase over 3.");
          return;
        }
        count++;
        purchaseStock(color).then(function(game){
          StockTableView.render(game);
        });
      });
      return a;
    }

    $(self.el).append('<h3>Purchase stocks.</h3>');
    for (var p in game.chain_markers) {
      if (game.chain_markers[p])
        $(self.el).append(createChainMarker(p));
    }

    return new Promise(function(resolve){
      var a = createButton().text("Done");
      a.click(function(){
        $(self.el).empty();
        resolve("OK");
      });
      $(self.el).append(a);
    });
  }
})(this.self);
