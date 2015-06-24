(function(global){
  global.StockTableView = StockTableView;

  function StockTableView(option) {
    this.model = option.model;
    this.id = option.id;
  }

  //株券の価格
  StockTableView.prototype.createStockPrices = function() {
    var tr = $('<tr><td></td><td></td></tr>');
    for (var p in colors) {
      tr.append('<td>$'+this.model.price(colors[p])+'</td>');
    }
    return tr;
  }

  //ホテルチェーンのサイズ
  StockTableView.prototype.createChainSizes = function() {
    var tr = $('<tr><td></td><td></td></tr>');
    for (var p in colors) {
      tr.append('<td>'+this.model.board.getHotelChainSize(colors[p])+'</td>');
    }
    return tr;
  }

  StockTableView.prototype.render = function(game) {
    var self = this;
    if (!game) game = window.game;

    //筆頭株主と第２株主をマークする
    var majors = {};
    var minors = {};
    for (var p in colors) {
      (function(color){
        var values = self.model.players.map(function(player){
          return player.stocks[color];
        }).sort().reverse();
        if (values[0] > 0)
          majors[colors[p]] = values[0];
        if (values[1] > 0)
          minors[colors[p]] = values[1];
      })(colors[p]);
    }
    console.log(majors);
    console.log(minors);

    var table = $('<table></table>').attr("cellspacing",1);
    var tr = $("<tr><th></th><th></th></tr>");
    for (var p in colors)
      tr.append('<th>'+colors[p]+'</th>');
    table.append(tr);

    //ホテルチェーンのサイズ
//    var tr = $("<tr><th></th><th></th></tr>");
//    for (var p in colors)
//      tr.append('<td>'+this.model.board.getHotelChainSize(colors[p])+'</td>');
//    table.append(tr);

    //各プレイヤーの株券の枚数
//    for (var i = 0; i < this.model.players.length; i++) {
    game.users.map(function(u){
      tr = $("<tr></tr>");
      tr.append('<td>'+u.user_id+'</td>');
      tr.append('<td>$'+u.cash+'</td>');
      for (var p in colors) {
        var x = JSON.parse(u.stocks)[colors[p]];
        var td = $('<td>'+x+'</td>');
        if (x == majors[colors[p]] || x == minors[colors[p]])
          td.css("font-weight", "bold");
        tr.append(td);
      }
      table.append(tr);
    });

    //株券の残り枚数
//    tr = $('<tr><td></td><td></td></tr>');
//    for (var p in colors) {
//      tr.append('<td>'+this.model.stocks[colors[p]]+'</td>');
//    }
//    table.append(tr);

    table.append(this.createChainSizes());
    table.append(this.createStockPrices());

    $(this.id).html(table);
    return table;
  }
})(this.self);
