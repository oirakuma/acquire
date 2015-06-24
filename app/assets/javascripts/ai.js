(function(global){
  global.ComputerAI = ComputerAI;

  function ComputerAI(model) {
    this.model = model;
  }

  ComputerAI.prototype.getMove = function(id) {
    for (var i = 0; i < this.model.players[id].tiles.length; i++) {
      var name = this.model.players[id].tiles[i];
      if (this.model.canPut(id, name))
        return this.model.players[id].tiles.splice(i, 1)[0];
    }
    console.log("ERROR!");
    return null;
  }

  ComputerAI.prototype.selectHotelChainColor = function() {
    //チェーンカラーを選択する。
    var selectedColor = null;
    this.model.eachChainMarker(function(color){
      selectedColor = color;
    });
    this.chainCreated = selectedColor;
    return new Promise(function(resolve){
      resolve(selectedColor);
    });
  }

  ComputerAI.prototype.purchasePhase = function(id) {
    //新規チェーンを作成したならそこの株券を3枚購入する。
    if (this.chainCreated) {
      for (var i = 0; i < 3; i++)
        this.model.purchaseStock(id, this.chainCreated);
    //そうでないなら株券をランダムに購入するかもしれない
    } else {
      var selectedColor = null;
      this.model.eachChain(function(color){
        if (Math.floor(Math.random()*3) == 0)
          selectedColor = color;
      });
      if (selectedColor)
        this.model.purchaseStock(id, selectedColor);
    }
    setTimeout(function(){
      stockTableView.render();
    }, 0);

    //タイルを1枚引く
    this.model.pushTile(id);

    //次のコンピュータプレイヤーがいれば1秒後に開始する
    var self = this;
    if (id < self.model.players.length-1) {
      setTimeout(function(){
        var action = new Action(self.model);
        action.start(id+1, self);
      }, 1000);
    } else {
      tilesView.start();
    }
  }
})(this.self);
