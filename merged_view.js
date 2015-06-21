(function(global){
  global.MergedView = MergedView;

  function MergedView(option) {
    for (var p in option)
      this[p] = option[p];
  }

  MergedView.prototype.render = function() {
    console.log("merged: "+this.model.merged);
    console.log("merger: "+this.model.merger);
    var self = this;
    
    var a = createButton().text("Sell");
    a.click(function(){
      self.model.players[0].stocks[self.model.merged]--;
      self.model.players[0].cash += self.model.price(self.model.merged);
      stockTableView.render();
    });
    $(this.el).append(a);

    var a = createButton().text("Trade");
    a.click(function(){
      self.model.players[0].stocks[self.model.merged] -= 2;
      self.model.players[0].stocks[self.model.merger] += 1;
      stockTableView.render();
    });
    $(this.el).append(a);
 
    var a = createButton().text("Done");
    a.click(function(){
      $(self.el).empty();
      self.model.merge();
    });
    $(this.el).append(a);
  }
})(this.self);
