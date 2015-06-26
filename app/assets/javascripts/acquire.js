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

  /*Acquire.prototype.getUsers = function() {
    return this.ajax("users", "GET");
  }

  Acquire.prototype.getTiles = function() {
    return new Promise(function(resolve){
      $.ajax({
        url: "1.json",
        type: "GET",
        success: function(users){
          resolve(users);
        }
      });
    });
  }

  Acquire.prototype.sell = function(x) {
    return this.ajax("sell", "POST");
  }

  Acquire.prototype.trade = function(x) {
    return this.ajax("trade", "POST");
  }*/

    //41を越えるホテルチェーンができていればゲーム終了
/*    var self = this;
    var b = false;
    this.eachChain(function(color){
      if (self.board.getHotelChainSize(color) >= 41)
        b = true;
    });
    if (b) return true;
    //すべてのホテルチェーンが11以上ならゲーム終了
    for (var p in colors) {
      if (self.board.getHotelChainSize(colors[p]) < 11)
        return false;
    }
    return true;*/

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
    acquire.updateAll();
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
