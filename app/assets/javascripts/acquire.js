var colors = ["red","yellow","orange","green","blue","purple","cyan"];
var chars = ["A","B","C","D","E","F","G","H","I","J","K","L"];

//model
(function(global){
  global.Acquire = Acquire;

  function Acquire() {
  }

  Acquire.prototype.ajax = function(name, type) {
    return new Promise(function(resolve){
      $.ajax({
        url: "1/"+name+".json",
        type: type,
        success: function(o){
          resolve(o);
        }
      });
    });
  }

  Acquire.prototype.getUsers = function() {
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
  }

  Acquire.prototype.isGameEnd = function() {
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
    return false;
  }

  function Player(user) {
    for (var p in user)
      this[p] = user[p];
    if (this.tiles)
      this.tiles = this.tiles;
    this.stocks = this.stocks;
  }
})(this.self);

function start(game) {
  StockTableView.render(game);
  tilesView = new TilesView({model:acquire,id: "#tiles"});
  tilesView.render();
  tilesView.start();

  $("#user").html("Your user id is "+game.user_id+".");

  timerId = setInterval(function(){
    acquire.getTiles().then(function(game){ 
      StockTableView.render(game);
    });
    tilesView.render();
  }, 1000);
}

var timerId = null;
var tilesView = null;
var logView = new LogView({el:"#log"});
var userId = null;
var game = null;
var acquire = new Acquire();
acquire.ajax("connect").then(start, "GET");
