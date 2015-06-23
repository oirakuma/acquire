(function(global){
  global.TilesView = TilesView;

  function TilesView(option) {
    this.model = option.model;
    this.id = option.id;
  }

//  TilesView.prototype.mergedOption = function() {
//    var view = new MergedView({model:this.model,el:"#merged"});
//    return view.render();
//  }

  TilesView.prototype.selectHotelChainColor = function() {
    var view = new ChainMarkersView({model:this.model,el:"#chain-markers"});
    return view.render();
  }

  TilesView.prototype.getMove = function(id) {
    return this.name;
  }

  TilesView.prototype.createTile = function(name) {
    var self = this;
    var td = $('<td></td>').addClass(name).text(name);
    td.click(function(){
      self.name = $(this).text();
      var action = new Action(self.model);
      action.start(0, self);
    });
    return td;
  }

  //購入フェーズ
  TilesView.prototype.purchasePhase = function(id) {
    var self = this;

    function next() {
      if (self.model.isGameEnd()) {
        self.model.sellAll();
        $("#chain-markers").html("<h3>Game End</h3>");
        setTimeout(function(){
          stockTableView.render();
        }, 0);
        return;
      }
      self.model.pushTile(0);
      setTimeout(function(){
        tilesView.render();
      }, 0);
      setTimeout(function(){
        var action = new Action(self.model);
        var ai = new ComputerAI(self.model);
        action.start(id+1, ai);
      }, 1000);
    }

    if (self.model.countChain() > 0) {
      var view = new PurchaseView({model:self.model, el:"#purchase"});
      view.render().then(next);
    } else {
      next();
    }
  }

  TilesView.prototype.render = function() {
    var table = $("<table></table>").attr("cellspacing",1);
    for (var i = 0; i < 12; i++) {
      var tr = $("<tr></tr>");
      for (var j = 0; j < 9; j++)
        tr.append(this.createTile((j+1)+chars[i]));
      table.append(tr);
    }

    //タイルが置かれているエリアの色を変更する
    for (var p in this.model.board.tiles) {
      var td = table.find("."+p);
      td.css("background-color", this.model.board.tiles[p]);
      td.css("border", "1px outset "+this.model.board.tiles[p]);
      td.text("");
    }

    //プレイヤーのタイルを強調する
    for (var i = 0; i < this.model.players[0].tiles.length; i++) {
      var name = this.model.players[0].tiles[i];
      table.find("."+name).css("color", "orange").css("font-weight", "bold");
    }
    $(this.id).html(table);
  }
})(this.self);
