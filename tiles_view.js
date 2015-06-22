(function(global){
  global.TilesView = TilesView;

  function TilesView(option) {
    this.model = option.model;
    this.id = option.id;
  }

  TilesView.prototype.createTile = function(label) {
    var self = this;

    var td = $('<td></td>').addClass(label);
    var color = null;
    if (color = self.model.board.getColor(label))
      td.css("background-color", color).css("border", "1px outset "+color);
    else
      td.text(label);
    for (var i = 0; i < self.model.players[0].tiles.length; i++) {
      if (self.model.players[0].tiles[i] == label)
        td.css("color", "orange").css("font-weight", "bold");
    }
    td.click(function(){
      //コメントアウトするとどこでもタイルを置ける
//        if ($(this).css("color") != orange) return;
      var name = $(this).text();
      self.model.board.putTile(name);
      logView.append('You played '+name+'.');
      if (self.model.board.isHotelMerged(name)) {
        var view = new MergedView({model:self.model,el:"#merged"});
        view.render();
      } else if (self.model.board.checkChain(name)) {
        var view = new ChainMarkersView({model:self.model,el:"#chain-markers",name:name
        });
        view.render();
      } else if (self.model.chained()) {
        purchaseView.render();
      } else {
        setTimeout(function(){
          ai.play(1);
        }, 1000);
      }
      self.model.players[0].tiles.push(self.model.getTile());
      self.render();
    });
    return td;
  }

  TilesView.prototype.render = function() {
    var table = $("<table></table>").attr("cellspacing",1);
    for (var i = 0; i < 12; i++) {
      var tr = $("<tr></tr>");
      for (var j = 0; j < 9; j++)
        tr.append(this.createTile((j+1)+chars[i]));
      table.append(tr);
    }
    $(this.id).html(table);
  }
})(this.self);
