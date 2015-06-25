(function(global){
  global.MergedView = MergedView;

  function MergedView(option) {
    for (var p in option)
      this[p] = option[p];
  }

  MergedView.prototype.render = function() {
    var self = this;
    
    var a = createButton().text("Sell");
    a.css("background-color", game.merged);
    a.click(function(){
      self.model.sell(0).then(function(game){
        StockTableView.render(game);
      });
    });
    $(this.el).append(a);

    var a = createButton().text("Trade").css("background-color", game.merged);
    a.click(function(){
      self.model.trade(0).then(function(game){
        StockTableView.render(game);
      });
    });
    $(this.el).append(a);
 
    var a = createButton().text("Done");
    $(this.el).append(a);
    return new Promise(function(resolve){
      a.click(function(){
        $(self.el).empty();
        resolve();
      });
    });
  }
})(this.self);
