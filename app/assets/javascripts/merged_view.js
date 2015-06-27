var MergedView = Backbone.View.extend({
  el: "#merged",
  render: function() {
    var self = this;
    this.$el.empty();

    var virtual_tile = this.model.get("virtual_tile");
    this.$el.append("<div>仮想ユーザのタイル: "+virtual_tile+"</div>");
    var shares = this.model.get("shares");
    for (var p in shares)
      this.$el.append("<div>"+p+":"+shares[p]+"</div>");

    [["売却","sell"], ["交換","trade"]].map(function(x){
      var a = createButton().text(x[0]);
      a.css("background-color", self.model.get("merged"));
      a.click(function(){
        self.model.ajax(x[1], "POST");
      });
      self.$el.append(a);
    });

    var a = createButton().text("Done");
    this.$el.append(a);
    return new Promise(function(resolve){
      a.click(function(){
        self.$el.empty();
        resolve();
      });
    });
  }
});
