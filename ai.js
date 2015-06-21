(function(global){
  global.ComputerAI = ComputerAI;

  function ComputerAI(model) {
    this.model = model;
  }

  function copyBoard(board) {
    var board2 = [];
    for (var i = 0; i < board.length; i++)
      board2[i] = board[i];
    return board2;
  }

  ComputerAI.prototype.play = function(id) {
    var name = this.model.players[1].tiles.shift();
    this.model.putTile(name);
    logView.append('Computer('+id+') played '+name+'.');
    
    if (this.model.isHotelMerged(name)) {
      this.model.merge();
    } else if (this.model.checkChain(name)) {
      var selectedColor = null;
      this.model.eachChainMarker(function(color){
        selectedColor = color;
      });
      this.model.setColor(name, selectedColor);
      this.model.takeChainMarker(selectedColor);
      logView.append("Computer("+id+") put "+selectedColor+" chain marker on "+name+".");
    } else {
      var selectedColor = null;
      this.model.eachChain(function(color){
        if (Math.floor(Math.random()*3) == 0)
          selectedColor = color;
      });
      if (selectedColor) {
        this.model.purchaseStock(id, selectedColor);
        logView.append("Computer("+id+") purchased "+selectedColor+".");
        stockTableView.render();
      }
    }

    var t = this.model.tiles.shift();
    this.model.players[1].tiles.push(t);

    if (id < 4-1) {
      setTimeout(function(){
        ai.play(id+1);
      }, 500);
    }
  }
})(this.self);
