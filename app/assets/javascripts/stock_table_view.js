(function(global){
  global.StockTableView = StockTableView;

  function StockTableView() {
  }

  //株券の価格
  function createStockPrices(game) {
    var tr = $('<tr><td></td><td></td></tr>');
    for (var p in colors) {
      tr.append('<td>$'+game.stock_prices[colors[p]]+'</td>');
    }
    return tr;
  }

  //ホテルチェーンのサイズ
  function createChainSizes(game) {
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

  StockTableView.render = function(game) {
    var table = $('<table></table>').attr("cellspacing",1);
    if (!game) game = window.game;

    var tr = $("<tr><td><td></td></td></tr>");
    game.users.map(function(u){
      var td = $('<td>'+u.user_id+'</td>');
      if (u.user_id == game.current_user_id)
        td.css("background-color", "yellow");
      tr.append(td);
    });
    table.append(tr);

    var tr = $("<tr><td><td></td></td></tr>");
    game.users.map(function(u){
      tr.append('<td>$'+u.cash+'</td>');
    });
    table.append(tr);

    for (var p in colors) {
      var tr = $("<tr></tr>");
      //各ホテルチェーンの色
      tr.append('<th>'+colors[p]+'</th>');
      tr.append('<td>$'+game.stock_prices[colors[p]]+'</td>');
      //各プレイヤーの株券の枚数
      game.users.map(function(u){
        var td = $('<td>'+u.stocks[colors[p]]+'</td>');
        if (include(game.majors[colors[p]], u.user_id) || include(game.minors[colors[p]], u.user_id))
          td.css("font-weight", "bold");
        tr.append(td);
      });
/*      var tr = $("<tr></tr>");
      if (u.user_id == game.current_user_id)
        tr.css("background-color", "yellow");
      for (var p in colors) {
        var x = u.stocks[colors[p]];
        var td = $('<td>'+x+'</td>');
        if (include(game.majors[colors[p]], u.user_id) || include(game.minors[colors[p]], u.user_id))
          td.css("font-weight", "bold");
        tr.append(td);
      }*/
      table.append(tr);
    }

//    table.append(createChainSizes(game));
//    table.append(createStockPrices(game));
    $("#stocks").html(table);
  }
})(this.self);
