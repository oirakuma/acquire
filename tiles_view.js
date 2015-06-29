var TilesView = Backbone.View.extend({
  el: "#tiles",

  events: {
    "click td": "putTile"
  },

  putTile: function(e) {
    this.name = $(e.target).text();
    if (!_.contains(this.model.players[0].tiles, this.name)) return;
    if (this.model.canPut(0, this.name)) {
      $("#chain-markers").html("");
      var action = new Action(this.model);
      action.start(0, this);
    }
  },

  start: function() {
    $("#chain-markers").html("<h3>Your turn.</h3>");
  },

  selectHotelChainColor: function() {
    var view = new ChainMarkersView({model:this.model,el:"#chain-markers"});
    return view.render();
  },

  getMove: function(id) {
    return this.name;
  },

  //購入フェーズ
  purchasePhase: function(id) {
    var self = this;

    function next() {
      if (self.model.isGameEnd()) {
        self.model.sellAll();
        $("#chain-markers").empty();
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
  },

  render: function() {
    var table = $("<table></table>").attr("cellspacing",1);
    for (var i = 0; i < 9; i++) {
      var tr = $("<tr></tr>");
      for (var j = 0; j < 12; j++) {
        var name = (j+1)+chars[i];
        var td = $('<td></td>').addClass(name).text(name);
        tr.append(td);
      }
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
    this.$el.html(table);
  }
});
