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
    var name = this.model.players[id].tiles.shift();
    this.model.board.putTile(name, id);
    
    if (this.model.board.isHotelMerged(name)) {
      var view = new MergedView({model:this.model, el:"#merged"});
      view.render();
    } else if (this.model.board.checkChain(name)) {
      var selectedColor = null;
      this.model.eachChainMarker(function(color){
        selectedColor = color;
      });
      this.model.buildChain(id, name, selectedColor);
      setTimeout(function(){
        tilesView.render();
      }, 0);
    } else {
      setTimeout(function(){
        tilesView.render();
      }, 0);
      //株券を買う
      var selectedColor = null;
      this.model.eachChain(function(color){
        if (Math.floor(Math.random()*3) == 0)
          selectedColor = color;
      });
      if (selectedColor) {
        this.model.purchaseStock(id, selectedColor);
        logView.append("Computer("+id+") purchased "+selectedColor+".");
        setTimeout(function(){
          stockTableView.render();
        }, 0);
      }
    }

    this.model.players[id].tiles.push(this.model.getTile());

    if (id < this.model.players.length-1) {
      setTimeout(function(){
        ai.play(id+1);
      }, 1000);
    }
  }
})(this.self);
