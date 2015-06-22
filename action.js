(function(global){
  global.Action = Action;

  function Action(model) {
    this.model = model;
  }

  Action.prototype.start = function(id, ai) {
    var self = ai;
    var name = self.getMove(id);
    self.model.board.putTile(name, id);
    setTimeout(function(){
      tilesView.render();
    }, 0);
  
    //1) 吸収合併が発生
    if (self.model.board.isHotelMerged(name)) {
      self.mergedOption().then(function(){
        self.model.merge();
        self.purchasePhase(id);
      });
    //2) 新規チェーンの形成
    } else if (self.model.board.checkChain(name)) {
      self.selectHotelChainColor().then(function(color){
        self.model.buildChain(id, name, color);
        stockTableView.render();
        self.purchasePhase(id);
      });
    //3) イベントなし
    } else {
      self.purchasePhase(id);
    }
  }
})(this.self);
