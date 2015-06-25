(function(global){
  global.TilesView = TilesView;

  function TilesView(option) {
    this.model = option.model;
    this.id = option.id;
  }

  TilesView.prototype.start = function() {
  }

  TilesView.prototype.selectHotelChainColor = function(game) {
    var view = new ChainMarkersView({model:this.model,el:"#chain-markers"});
    return view.render(game);
  }

  TilesView.prototype.mergedOption = function() {
    var view = new MergedView({model:this.model,el:"#merged"});
    return view.render();
  }

  TilesView.prototype.getMove = function(id) {
    return this.name;
  }

  function putTile(name) {
    return new Promise(function(resolve){
      $.ajax({
        url: "/games/1/put_tile.json",
        type: "POST",
        data: "name="+name,
        success: function(game){
          resolve(game);
        }
      });
    });
  }

  function mergeDone() {
    $.ajax({
      url: "/games/1/merge_done.json",
      type: "POST"
    });
  }

  function buildChain(name, color) {
    return new Promise(function(resolve){
      var data = [
        "name="+name,
        "color="+color
      ].join("&");
      $.ajax({
        url: "/games/1/build_chain.json",
        type: "POST",
        data: data,
        success: function(game){
          resolve(game);
        }
      });
    });
  }

  TilesView.prototype.createTile = function(name) {
    var self = this;
    var td = $('<td></td>').addClass(name).text(name);
    td.click(function(){
      self.name = $(this).text();
      $("#chain-markers").html("");
      putTile(name).then(function(game){
        if (!game) return;
        window.game = game;
        tilesView.render();
        clearTimeout(timerId);
        if (game.result == "merged") {
          self.mergedOption().then(function(){
            mergeDone();
            self.purchasePhase(game);
          });
        } else if (game.result == "chained") {
          self.selectHotelChainColor(game).then(function(color){
            buildChain(name, color).then(function(game){
              self.purchasePhase(game);
            });
          });
        } else {
          self.purchasePhase(game);
        }
      });
    });
    return td;
  }

  //購入フェーズ
  TilesView.prototype.purchasePhase = function(game) {
    var self = this;

    function next() {
      if (self.model.isGameEnd()) {
        self.model.sellAll();
        $("#chain-markers").empty();
        setTimeout(function(){
          StockTableView.render(game);
        }, 0);
        return;
      }
      $.ajax({
        url: "/games/1/purchase_done",
        type: "POST"
      });
      timerId = setInterval(function(){
        self.model.getTiles().then(function(game){
          StockTableView.render(game);
        });
        tilesView.render();
      }, 1000);
    }

    var chained = false;
    for (var p in game.chain_markers) {
      if (game.chain_markers[p])
        chained = true;
    }
    if (chained) {
      var view = new PurchaseView({model:self.model, el:"#purchase"});
      view.render(game).then(next);
    } else {
      next();
    }
  }

  TilesView.prototype.render = function() {
    var self = this;
    this.model.getTiles().then(function(game){
      window.game = game;
      var table = $("<table></table>").attr("cellspacing",1);
      for (var i = 0; i < 9; i++) {
        var tr = $("<tr></tr>");
        for (var j = 0; j < 12; j++)
          tr.append(self.createTile((j+1)+chars[i]));
        table.append(tr);
      }
  
      //タイルが置かれているエリアの色を変更する
      var tiles = game.placed_tiles;
      for (var p in tiles) {
        var td = table.find("."+p);
        td.css("background-color", tiles[p]);
        td.css("border", "1px outset "+tiles[p]);
        td.text("");
      }
  
      //プレイヤーのタイルを強調する
      game.users[game.user_id].tiles.map(function(name){
        table.find("."+name).css("color", "orange").css("font-weight", "bold");
      });
      $(self.id).html(table);
    });
  }
})(this.self);
