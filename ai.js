(function(global){
  global.ComputerAI = ComputerAI;

  function ComputerAI(model) {
    this.model = model;
  }

  ComputerAI.prototype.getMove = function(id) {
    return this.model.players[id].tiles.shift();
  }

  ComputerAI.prototype.selectHotelChainColor = function() {
    //チェーンカラーを選択する。
    var selectedColor = null;
    this.model.eachChainMarker(function(color){
      selectedColor = color;
    });
    return new Promise(function(resolve){
      resolve(selectedColor);
    });
  }

  ComputerAI.prototype.purchasePhase = function(id) {
    //株券をとりあえずランダムに購入する
    var selectedColor = null;
    this.model.eachChain(function(color){
      if (Math.floor(Math.random()*3) == 0)
        selectedColor = color;
    });
    if (selectedColor) {
      this.model.purchaseStock(id, selectedColor);
      setTimeout(function(){
        stockTableView.render();
      }, 0);
    }

    //タイルを1枚引く
    this.model.pushTile(id);

    //次のコンピュータプレイヤーがいれば1秒後に開始する
    var self = this;
    if (id < self.model.players.length-1) {
      setTimeout(function(){
        var action = new Action(self.model);
        action.start(id+1, self);
      }, 1000);
    }
  }
})(this.self);
