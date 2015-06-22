(function(global){
  global.ComputerAI = ComputerAI;

  function ComputerAI(model) {
    this.model = model;
  }

  ComputerAI.prototype.getMove = function(id) {
    return this.model.players[id].tiles.shift();
  }

  ComputerAI.prototype.play = function(id) {
    var self = this;

    var name = this.getMove(id);
    this.model.board.putTile(name, id);
    
    //1) 吸収合併が発生
    if (this.model.board.isHotelMerged(name)) {
      var view = new MergedView({model:this.model, el:"#merged", id:id});
      view.render();
    //2) 新規チェーンの形成
    } else if (this.model.board.checkChain(name)) {
      //チェーンカラーを選択する。
      var selectedColor = null;
      this.model.eachChainMarker(function(color){
        selectedColor = color;
      });
      //チェーンを作成する。
      this.model.buildChain(id, name, selectedColor);
      //後処理して次のプレイヤーへ。
      this.afterTile(id);
    //3) チェーンの拡大またはイベントなし
    } else {
      this.afterTile(id);
    }

    this.model.pushTile(id);
  }

  ComputerAI.prototype.purchaseStocks = function(id) {
    //株券をランダムに買う
    var selectedColor = null;
    this.model.eachChain(function(color){
      if (Math.floor(Math.random()*3) == 0)
        selectedColor = color;
    });
    if (selectedColor)
      this.model.purchaseStock(id, selectedColor);
  }

  ComputerAI.prototype.afterTile = function(id) {
    var self = this;

    setTimeout(function(){
      tilesView.render();
      self.purchaseStocks(id);
      stockTableView.render();
    }, 0);

    setTimeout(function(){
      if (id < self.model.players.length-1)
        ai.play(id+1);
    }, 1000);
  }
})(this.self);
