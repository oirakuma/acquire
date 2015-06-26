var TilesView = Backbone.View.extend({
  el: "#tiles",
  initialize: function(){
    this.model.on('change', this.render, this);
  },
  selectHotelChainColor: function() {
    var view = new ChainMarkersView({model:this.model});
    return view.render();
  },

  buildChain: function(name, color) {
    var data = [
      "name="+name,
      "color="+color
    ].join("&");
    return this.model.ajax("build_chain", "POST", data);
  },

  //購入フェーズ
  purchasePhase: function() {
    var self = this;

    function next() {
      if (self.model.get("end"))
        return;
      self.model.ajax("purchase_done", "POST");
    }

    var chained = false;
    for (var p in this.model.get("chain_markers")) {
      if (this.model.get("chain_markers")[p])
        chained = true;
    }
    if (chained) {
      var view = new PurchaseView({model:this.model, el:"#purchase"});
      view.render().then(next);
    } else {
      next();
    }
  },

  putTile: function(e, ui) {
    var self = this;
    var name = $(e.target).text();
    console.log(name);
    this.model.ajax("put_tile", "POST", "name="+name).then(function(result){
      if (!result) return;

      if (self.model.get("result") == "merged") {
        var view = new MergedView({model:self.model});
        view.render().then(function(){
          self.model.ajax("merge_done", "POST").then(function(){
            self.purchasePhase();
          });
        });
      } else if (self.model.get("result") == "chained") {
        self.selectHotelChainColor().then(function(color){
          self.buildChain(name, color).then(function(){
            self.purchasePhase();
          });
        });
      } else {
        self.purchasePhase();
      }
    });
  },

  events: {
    "click td": "putTile"
  },

  createTile: function(name) {
    var self = this;
    var td = $('<td></td>').addClass(name).text(name);
    return td;
  },

  render: function() {
    var self = this;
    if (self.model.status != "OK") return;

    var table = $("<table></table>").attr("cellspacing",1);
    for (var i = 0; i < 9; i++) {
      var tr = $("<tr></tr>");
      for (var j = 0; j < 12; j++)
        tr.append(self.createTile((j+1)+chars[i]));
      table.append(tr);
    }

    //タイルが置かれているエリアの色を変更する
    var tiles = self.model.get("placed_tiles");
    for (var p in tiles) {
      var td = table.find("."+p);
      td.css("background-color", tiles[p]);
      td.css("border", "1px outset "+tiles[p]);
      td.text("");
    }

    //プレイヤーのタイルを強調する
    self.model.get("users")[self.model.get("user_id")].tiles.map(function(name){
      table.find("."+name).css("color", "orange").css("font-weight", "bold");
    });
    this.$el.html(table);
  }
});
