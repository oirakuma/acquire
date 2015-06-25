(function(global){
  global.StockTableView = StockTableView;

  function StockTableView(option) {
    for (var p in option)
      this[p] = option[p];
  }

  //株券の価格
  StockTableView.prototype.createStockPrices = function(game) {
    var tr = $('<tr><td></td><td></td></tr>');
    for (var p in colors) {
      tr.append('<td>$'+game.stock_prices[colors[p]]+'</td>');
    }
    return tr;
  }

  //ホテルチェーンのサイズ
  StockTableView.prototype.createChainSizes = function() {
    var tr = $('<tr><td></td><td></td></tr>');
    for (var p in colors) {
      var tiles = game.placed_tiles;
      var count = 0;
      for (var q in tiles) {
        if (tiles[q] == colors[p])
          count++;
      }
      tr.append('<td>'+count+'</td>');
    }
    return tr;
  }

  function include(array, x) {
    for (var p in array)
      if (array[p] == x)
        return true;
    return false;
  }

  StockTableView.prototype.render = function(game) {
    var self = this;
    if (!game) game = window.game;

    var table = $('<table></table>').attr("cellspacing",1);

    //各ホテルチェーンの色
    var tr = $("<tr><th></th><th></th></tr>");
    for (var p in colors)
      tr.append('<th>'+colors[p]+'</th>');
    table.append(tr);

    //各プレイヤーの株券の枚数
    this.model.getUsers().then(function(users){
      users.map(function(u){
        var tr = $("<tr></tr>");
        if (u.user_id == game.current_user_id)
          tr.css("background-color", "yellow");
        tr.append('<td>'+u.user_id+'</td>');
        tr.append('<td>$'+u.cash+'</td>');
        for (var p in colors) {
          var x = u.stocks[colors[p]];
          var td = $('<td>'+x+'</td>');
          if (include(game.majors[colors[p]], u.user_id) || include(game.minors[colors[p]], u.user_id))
            td.css("font-weight", "bold");
          tr.append(td);
        }
        table.append(tr);
      });
    }).then(function(){
      table.append(self.createChainSizes());
      table.append(self.createStockPrices(game));
      $(self.id).html(table);
    });
  }
})(this.self);
