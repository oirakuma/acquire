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
    this.model.board.putTile(name);
    logView.append('Computer('+id+') played '+name+'.');
    
    if (this.model.board.isHotelMerged(name)) {
      var view = new MergedView({model:this.model, el:"#merged"});
      view.render();
    } else if (this.model.board.checkChain(name)) {
      var selectedColor = null;
      this.model.eachChainMarker(function(color){
        selectedColor = color;
      });
      this.model.board.setColor(name, selectedColor);
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

    this.model.players[1].tiles.push(this.model.getTile());

    if (id < 4-1) {
      setTimeout(function(){
        ai.play(id+1);
        tilesView.render();
      }, 1000);
    }
  }
})(this.self);
