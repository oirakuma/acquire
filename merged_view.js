(function(global){
  global.MergedView = MergedView;

  function MergedView(option) {
    for (var p in option)
      this[p] = option[p];
  }

  MergedView.prototype.render = function() {
    console.log("merged: "+this.model.board.merged);
    console.log("merger: "+this.model.board.merger);
    var self = this;
    
    var a = createButton().text("Sell");
    a.css("background-color", this.model.board.merged);
    a.click(function(){
      self.model.sell(0);
      stockTableView.render();
    });
    $(this.el).append(a);

    var a = createButton().text("Trade").css("background-color", this.model.board.merged);
    a.click(function(){
      self.model.trade(0);
      stockTableView.render();
    });
    $(this.el).append(a);
 
    var a = createButton().text("Done");
    $(this.el).append(a);
    return new Promise(function(resolve){
      a.click(function(){
        $(this.el).empty();
        resolve();
      });
    });
  }
})(this.self);
