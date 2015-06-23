(function(global){
  global.Action = Action;

  function Action(model) {
    this.model = model;
  }

  Action.prototype.mergedOption = function() {
    //全員がマージオプションを行う

    //人用のインタフェースを返却する
    var view = new MergedView({model:this.model,el:"#merged"});
    return view.render();
  }

  Action.prototype.start = function(id, ai) {
    var name = ai.getMove(id);
    this.model.board.putTile(name, id);
    setTimeout(function(){
      tilesView.render();
      stockTableView.render();
    }, 0);
  
    //==== 1-3のどの場合にも最後に ai.purchasePhase が実行される ====

    //1) 吸収合併が発生
    if (this.model.board.isHotelMerged(name)) {
      this.model.shareToStockholders();
      this.mergedOption().then(function(){
        ai.model.merge();
        ai.purchasePhase(id);
      });
    //2) 新規チェーンの形成
    } else if (this.model.board.checkChain(name)) {
      ai.selectHotelChainColor().then(function(color){
        ai.model.buildChain(id, name, color);
        setTimeout(function(){
          stockTableView.render();
          tilesView.render();
        }, 0);
        ai.purchasePhase(id);
      });
    //3) イベントなし
    } else {
      ai.purchasePhase(id);
    }
  }
})(this.self);
