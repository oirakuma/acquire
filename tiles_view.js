(function(global){
  global.TilesView = TilesView;

  function TilesView(option) {
    this.model = option.model;
    this.id = option.id;
  }

  TilesView.prototype.render = function() {
    var self = this;

    function createTile(label) {
      var td = $('<td></td>').text(label).addClass(label);
      td.click(function(){
        if ($(this).css("color") != orange) return;
        var name = $(this).text();
        playedTile = name;
        self.model.putTile(name);
        if (self.model.isHotelMerged(name)) {
          console.log("Merge!");
          renderMergedOption(self.model);
        } else if (self.model.checkChain(name)) {
          var view = new ChainMarkersView({model:self.model,id:"#chain-markers",name:name});
          view.render();
        } else {
          if (self.model.chained())
            purchaseView.render();
          else
            ai.play(1);
        }
        var name = self.model.tiles.shift();
        $("."+name).css("color", "orange").css("font-weight", "bold");
      });
      return td;
    }

    var table = $("<table></table>").attr("cellspacing",1);
    for (var i = 0; i < 12; i++) {
      var tr = $("<tr></tr>");
      for (var j = 0; j < 9; j++)
        tr.append(createTile((j+1)+chars[i]));
      table.append(tr);
    }
    $(this.id).append(table);
  }
})(this.self);
