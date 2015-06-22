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
    a.click(function(){
      $(self.el).empty();
      self.model.merge();
      setTimeout(function(){
        if (this.id < this.model.players.length-1)
          ai.play(this.id+1);
      }, 1000);
    });
    $(this.el).append(a);
  }
})(this.self);
