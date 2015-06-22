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

  ComputerAI.prototype.play = function(id) {
    var self = this;

    var name = this.getMove(id);
    tilesView.play(id, name);
  }

  ComputerAI.prototype.purchasePhase = function(id) {
    var self = this;
    //株券をとりあえずランダムに買う
    var selectedColor = null;
    this.model.eachChain(function(color){
      if (Math.floor(Math.random()*3) == 0)
        selectedColor = color;
    });
    if (selectedColor)
      this.model.purchaseStock(id, selectedColor);
    setTimeout(function(){
      if (id < self.model.players.length-1)
        ai.play(id+1);
    }, 1000);
  }
})(this.self);
