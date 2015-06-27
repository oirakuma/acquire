var colors = ["red","yellow","orange","green","blue","purple","cyan"];
var chars = ["A","B","C","D","E","F","G","H","I","J","K","L"];

var Acquire = Backbone.Model.extend({
  initialize: function(){
    this.updateAll();
  },
  updateAll: function() {
    var self = this;
    return new Promise(function(resolve){
      $.ajax({
        url: "1.json",
        type: "GET",
        success: function(o){
          self.status = "OK";
          self.set(o);
          resolve(o);
        }
      });
    });
  },
  ajax: function(name, type, data) {
    var self = this;
    return new Promise(function(resolve){
      $.ajax({
        url: "1/"+name+".json",
        type: type,
        data: data,
        success: function(o){
          self.set(o);
          resolve(o);
        }
      });
    });
  }
});

function Player(user) {
  for (var p in user)
    this[p] = user[p];
  if (this.tiles)
    this.tiles = this.tiles;
  this.stocks = this.stocks;
}

function start() {
  var acquire = new Acquire();
  stockTableView = new StockTableView({model:acquire});
  stockTableView.render();
  tilesView = new TilesView({model:acquire});
  tilesView.render();

//  $("#user").html("Your user id is "+game.user_id+".");

  timerId = setInterval(function(){
    acquire.updateAll().then(function(){
      if (acquire.get("merged")) {
        if (acquire.get("current_user_id") == acquire.get("user").user_id) return;
        if (acquire.get("user").merged) return;
        var view = new MergedView({model:acquire});
        view.render().then(function(){
          acquire.ajax("merge_done", "POST");
        });
      }
    });
  }, 1000);
}

var timerId = null;
var tilesView = null;
var logView = new LogView({el:"#log"});
var userId = null;
var game = null;
var stockTableView = null;
$(document).ready(function(){
  start();
});
