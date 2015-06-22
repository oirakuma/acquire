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
      self.model.players[0].stocks[self.model.board.merged]--;
      self.model.players[0].cash += self.model.price(self.model.board.merged);
      stockTableView.render();
    });
    $(this.el).append(a);

    var a = createButton().text("Trade").css("background-color", this.model.board.merged);
    a.click(function(){
      self.model.players[0].stocks[self.model.board.merged] -= 2;
      self.model.players[0].stocks[self.model.board.merger] += 1;
      stockTableView.render();
    });
    $(this.el).append(a);
 
    var a = createButton().text("Done");
    a.click(function(){
      $(self.el).empty();
      self.model.merge();
      setTimeout(function(){
        ai.play(1);
      }, 500);
    });
    $(this.el).append(a);
  }
})(this.self);
