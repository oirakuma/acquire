var MergedView = Backbone.View.extend({
  el: "#merged",
  render: function() {
    var self = this;

    [["売却","sell"], ["交換","trade"]].map(function(x){
      var a = createButton().text(x[0]);
      a.css("background-color", self.model.get("merged"));
      a.click(function(){
        self.model.ajax(x[1], "POST");
      });
      $(self.el).append(a);
    });

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
