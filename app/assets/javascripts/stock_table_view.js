var StockTableView = Backbone.View.extend({
  el: "#stocks",
  initialize: function(){
    this.model.on('change', this.render, this);
  },
  render: function() {
    function include(array, x) {
      for (var p in array)
        if (array[p] == x)
          return true;
      return false;
    }

    if (this.model.status != "OK") return;
    var self = this;
    var table = $('<table></table>').attr("cellspacing",1);

    var tr = $("<tr><td><td></td></td></tr>");
    this.model.get("users").map(function(u){
      var td = $('<td>'+u.user_id+'</td>');
      if (u.user_id == self.model.current_user_id)
        td.css("background-color", "yellow");
      tr.append(td);
    });
    table.append(tr);

    var tr = $("<tr><td><td></td></td></tr>");
    this.model.get("users").map(function(u){
      tr.append('<td>$'+u.cash+'</td>');
    });
    table.append(tr);

    for (var p in colors) {
      var tr = $("<tr></tr>");
      //各ホテルチェーンの色
      tr.append('<th>'+colors[p]+'</th>');
      tr.append('<td>$'+this.model.get("stock_prices")[colors[p]]+'</td>');
      //各プレイヤーの株券の枚数
      this.model.get("users").map(function(u){
        var td = $('<td>'+u.stocks[colors[p]]+'</td>');
        if (include(self.model.get("majors")[colors[p]], u.user_id) || include(self.model.get("minors")[colors[p]], u.user_id))
          td.css("font-weight", "bold");
        tr.append(td);
      });
      table.append(tr);
    }

    this.$el.html(table);
    return this;
  }
});
