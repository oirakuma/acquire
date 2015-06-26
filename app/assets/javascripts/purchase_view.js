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
      a.click(function(){
        if (count >= 3) {
          alert("You can't purchase over 3.");
          return;
        }
        count++;
        self.model.ajax("purchase_stock", "POST", "color="+color);
      });
      return a;
    }

    $(self.el).append('<h3>Purchase stocks.</h3>');
    for (var p in this.model.get("chain_markers")) {
      if (this.model.get("chain_markers")[p])
        $(this.el).append(createChainMarker(p));
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
