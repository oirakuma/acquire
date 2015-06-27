var MergedView = Backbone.View.extend({
  el: "#merged",
  render: function() {
    var self = this;
 
    var a = createButton().text("Sell");
    a.css("background-color", this.model.get("merged"));
    a.click(function(){
      self.model.ajax("sell", "POST");
    });
    $(this.el).append(a);

    var a = createButton().text("Trade");
    a.css("background-color", this.model.get("merged"));
    a.click(function(){
      self.model.ajax("trade", "POST");
    });
    $(this.el).append(a);
 
    var a = createButton().text("Done");
    $(this.el).append(a);
    return new Promise(function(resolve){
      a.click(function(){
        $(self.el).empty();
        resolve();
      });
    });
  }
});
