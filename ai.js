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
    var t = this.model.players[1].tiles.shift();
    this.model.putTile(t);
    logView.append('Computer played '+t+'.');
    if (this.model.isHotelMerged(t)) {
      console.log("Merged!");
      var maxSize = null;
      var maxColor = null;
      for (var p in colors) {
        var size = this.model.getHotelChainSize(colors[p]);
        if (maxSize == null || size > maxSize) {
          maxSize = size;
          maxColor = p;
        }
        console.log(maxColor);
      }
    } else if (this.model.checkChain(t)) {
      for (var color in this.model.chainMarkers) {
        if (!this.model.chainMarkers[p])
          break;
      }
      this.model.setColor(t, color);
      $("#log").append("<div>Computer put "+color+" chain marker on "+t+".</div>");
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
