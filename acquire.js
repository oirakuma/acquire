var chars = ["A","B","C","D","E","F","G","H","I","J","K","L"];
var colors = ["purple","red","blue","yellow","cyan","green","orange"];
var gray = 'rgb(128, 128, 128)';
var black = 'rgb(0, 0, 0)';

//model
(function(global){
  global.Acquire = Acquire;

  function Acquire() {
    //players
    this.players = [];
    for (var i = 0; i < 4; i++)
      this.players[i] = new Player();
    //tiles
    this.tiles = shuffle(createTiles());
    //chain markers
    this.chainMarkers = [];
    for (var p in colors)
      this.chainMarkers.push(colors[p]);
  }

  function createTiles() {
    var ts = [];
    for (var i = 0; i < 12; i++) {
      for (var j = 0; j < 9; j++)
        ts.push((j+1)+chars[i]);
    }
    return ts;
  }
  
  function shuffle(a) {
    return a.sort(function(){
      return Math.random()-0.5;
    });
  }
  
  Acquire.prototype.getColor = function(name) {
    if (!name) return black;
    return $(".content ."+name).css("background-color");
  }
  
  //隣接するホテルの色も変更する
  Acquire.prototype.setColor = function(name, color) {
    if (this.getColor(name) == gray) {
      $(".content ."+name).css("background-color", color);
      this.setColor(this.getName(name,  1, 0), color);
      this.setColor(this.getName(name, -1, 0), color);
      this.setColor(this.getName(name, 0,  1), color);
      this.setColor(this.getName(name, 0, -1), color);
    }
  }

  function indexOfChar(c) {
    for (var i = 0; i < chars.length; i++)
      if (chars[i] == c)
        return i;
    return -1;
  }
  
  Acquire.prototype.getName = function(name, vx, vy) {
    var n = parseInt(name[0]);
    var c = indexOfChar(name[1]);
    n += vx;
    c += vy;
    if (n < 1 || n > 9 || c < 0 || c >= 12) return null;
    return n+chars[c];
  }
  
  Acquire.prototype.isHotel = function(name) {
    var color = this.getColor(name);
    return color == gray;
  }

  Acquire.prototype.isHotelChain = function(name) {
    var color = this.getColor(name);
    if (color != black && color != gray)
      return color;
    return false;
  }
  
  Acquire.prototype.isHotelMerged = function(name) {
    var vx = [1, -1, 0,  0];
    var vy = [0,  0, 1, -1];

    var colors = {};
    var color;
    for (var i = 0; i < 4; i++) {
      if (color = this.isHotelChain(this.getName(name, vx[i], vy[i])))
        colors[color] = true;
    }
    var count = 0;
    for (var p in colors)
      count += 1;
    return count >= 2;
  }
  
  Acquire.prototype.removeChainMarker = function(color) {
    for (var i = 0; i < this.chainMarkers.length; i++) {
      if (this.chainMarkers[i] == color) {
        console.log(i);
        this.chainMarkers.splice(i, 1);
        return;
      }
    }
  }
  
  Acquire.prototype.checkChain = function(name) {
    var self = this;
    var color1 = this.getColor(name);
    var color2 = null;
    var vx = [1, -1, 0,  0];
    var vy = [0,  0, 1, -1];
  
    for (var i = 0; i < vx.length; i++) {
      if (color2 = self.isHotelChain(self.getName(name, vx[i], vy[i]))) {
        self.setColor(name, color2);
      } else if (self.isHotel(self.getName(name, vx[i], vy[i]))) {
        console.log("isHotel");
        return true;
      }
    }
    return false;
  }
  
  function Player() {
    this.cash = 6000;
    this.stocks = {};
    for (var p in colors)
      this.stocks[colors[p]] = 0;
  }
  
})(this.self);

//UI
(function(global){
  global.render = render;

  function render(model) {
    function createArea(label) {
      return $('<td></td>').text(label).addClass(label);
    }
  
    function renderBoard() {
      var table = $("<table></table>").attr("cellspacing",1);
      for (var i = 0; i < 12; i++) {
        var tr = $("<tr></tr>");
        for (var j = 0; j < 9; j++)
          tr.append(createArea((j+1)+chars[i]));
        table.append(tr);
      }
      $(".content").append(table);
    }
  
    function renderStocks() {
      var table = $("<table></table>");
      var tr = $("<tr></tr>");
      for (var p in colors)
        tr.append('<th>'+colors[p]+'</th>');
      table.append(tr);
      for (var i = 0; i < 4; i++) {
        tr = $("<tr></tr>");
        for (var p in colors) {
          var x = model.players[i].stocks[colors[p]];
          tr.append('<td align="right">'+x+'</td>');
        }
        table.append(tr);
      }
      $("#stocks .ui-content").append(table);
    }
  
    renderBoard();
    renderStocks(model);

    $(".ui .tile").click(function(){
      var label = $(this).text();
      var dst = $(".content ."+label);
      dst.css("background-color", "gray");
      if (model.isHotelMerged(label)) {
        console.log("Merged!");
        selectMergedOption(model, function(color){
          console.log(color);
        });
      }
      else if (model.checkChain(label)) {
        selectHotelChain(model, function(color){
          model.setColor(label, color);
        });
      }
      $(this).text(model.tiles.shift());
    });
  
    $(".ui .tile").map(function(){
      $(this).text(model.tiles.shift());
    });
  }

  function selectMergedOption(model, callback) {
    callback(null);
  }
  
  function selectHotelChain(model, callback) {
    console.log("selectHotelChain()");
    $("#tiles").hide();
    $("#chain-markers").html("<fieldset><legend>チェーンマーカー</legend></fieldset>").show();
    for (var p in model.chainMarkers) {
      var a = $('<a href="#" class="ui-btn ui-btn-inline"></a>');
      a.css("background-color", colors[p]);
      a.addClass(colors[p]);
      a.click(function(){
        var color = $(this).attr("class").split(" ")[2];
        model.removeChainMarker(color);
        $("#chain-markers").hide();
        $("#tiles").show();
        setTimeout(function(){
          callback(color);
        }, 500);
      });
      $("#chain-markers").append(a);
    }
  }
  
})(this.self);

$(document).ready(function(){
  var acquire = new Acquire();
  render(acquire);
});
