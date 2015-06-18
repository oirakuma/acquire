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

  ComputerAI.prototype.play = function() {
    var board = $(".content td").map(function(){
      return $(this).css("background-color");
    });
    console.log(this.model.players[1].tiles);
    var t = this.model.players[1].tiles.shift();

    var dst = $(".content ."+t);
    dst.css("background-color", "gray");
    $("#log").append('<div>Computer played '+t+'.</div>');
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
      var color = this.model.chainMarkers.splice(0, 1);
      this.model.setColor(t, color);
      $("#log").append("<div>Computer put "+color+" chain marker on "+t+".</div>");
    }
    var t = this.model.tiles.shift();
    this.model.players[1].tiles.push(t);
  }
})(this.self);
