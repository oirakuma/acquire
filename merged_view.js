(function(global){
  global.MergedView = MergedView;

  function MergedView(option) {
    for (var p in option)
      this[p] = option[p];
  }

  MergedView.prototype.render = function() {
    var a = createButton().text("Sell");
    $(this.el).append(a);
    var a = createButton().text("Trade");
    $(this.el).append(a);
  }
})(this.self);
