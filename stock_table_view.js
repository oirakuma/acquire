(function(global){
  global.StockTableView = StockTableView;

  function StockTableView(option) {
    this.model = option.model;
    this.id = option.id;
  }

  StockTableView.prototype.render = function() {
    var table = $('<table></table>').attr("cellspacing",1);
    var tr = $("<tr><th></th><th>Cash</th></tr>");
    for (var p in colors)
      tr.append('<th>'+colors[p]+'</th>');
    table.append(tr);
    for (var i = 0; i < this.model.players.length; i++) {
      tr = $("<tr></tr>");
      tr.append('<td>'+i+'</td>');
      tr.append('<td>'+this.model.players[i].cash+'</td>');
      for (var p in colors) {
        var x = this.model.players[i].stocks[colors[p]];
        tr.append('<td>'+x+'</td>');
      }
      table.append(tr);
    }
    tr = $('<tr><td>B</td><td></td></tr>');
    for (var p in colors) {
      tr.append('<td>'+this.model.stocks[colors[p]]+'</td>');
    }
    table.append(tr);
    $(this.id).html(table);
    return table;
  }
})(this.self);
