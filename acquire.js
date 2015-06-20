var chars = ["A","B","C","D","E","F","G","H","I","J","K","L"];
var colors = ["purple","red","blue","yellow","cyan","green","orange"];
var gray = 'rgb(128, 128, 128)';
var lightgray = 'rgb(211, 211, 211)';
var orange = 'rgb(255, 165, 0)';

//model
(function(global){
  global.Acquire = Acquire;

  function Acquire() {
    //tiles
    this.tiles = shuffle(shuffle(createTiles()));
    //players
    this.players = [];
    for (var i = 0; i < 2; i++)
      this.players[i] = new Player();
    for (var i = 1; i < this.players.length; i++) {
      for (var j = 0; j < 6; j++)
        this.players[i].tiles.push(this.tiles.shift());
    }
    //chain markers
    this.chainMarkers = {};
    for (var p in colors)
      this.chainMarkers[colors[p]] = false;
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

  Acquire.prototype.price = function(color) {
    var size = this.getHotelChainSize(color)
    console.log(size);
    if (color == "red" || color == "yellow") {
      if (size == 2) return 200;
      else if (size == 3) return 300;
      else if (size == 4) return 400;
      else if (size == 5) return 500;
      else if (size <= 10) return 600;
      else if (size <= 20) return 700;
      else if (size <= 30) return 800;
      else if (size <= 40) return 900;
      else return 1000;
    } else if (color == "orange" || color == "green" || color == "blue") {
      if (size == 2) return 300;
      else if (size == 3) return 400;
      else if (size == 4) return 500;
      else if (size == 5) return 600;
      else if (size <= 10) return 700;
      else if (size <= 20) return 800;
      else if (size <= 30) return 900;
      else if (size <= 40) return 1000;
      else return 1100;
    } else if (color == "purple" || color == "cyan") {
      if (size == 2) return 400;
      else if (size == 3) return 500;
      else if (size == 4) return 600;
      else if (size == 5) return 700;
      else if (size <= 10) return 800;
      else if (size <= 20) return 900;
      else if (size <= 30) return 1000;
      else if (size <= 40) return 1100;
      else return 1200;
    }
  }
  
  Acquire.prototype.getColor = function(name) {
    if (!name) return lightgray;
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
    if (color == lightgray || color == gray) return false;
    return color;
  }
  
  Acquire.prototype.isHotelMerged = function(name) {
    var vx = [1, -1, 0,  0];
    var vy = [0,  0, 1, -1];

    var colors = {};
    var color;
    for (var i = 0; i < vx.length; i++) {
      if (color = this.isHotelChain(this.getName(name, vx[i], vy[i])))
        colors[color] = true;
    }
    var count = 0;
    for (var p in colors)
      count += 1;
    return count >= 2;
  }

  Acquire.prototype.getHotelChainSize = function(color) {
    function parseStyle(style) {
      var ss = style.split(";");
      var h = {};
      for (var i = 0; i < ss.length-1; i++) {
        var xx = ss[i].split(":");
        h[xx[0].trim()] = xx[1].trim();
      }
      return h;
    }
    
    var tiles = $(".content td");
    var a = tiles.filter(function(){
      var style = $(this).attr("style");
      if (style) {
        var h = parseStyle(style);
        if (h["background-color"] == color)
          return true;
      }
      return false;
    });
    return a.length;
  }
  
  Acquire.prototype.checkChain = function(name) {
    var self = this;
    var color1 = this.getColor(name);
    var color2 = null;
    var vx = [1, -1, 0,  0];
    var vy = [0,  0, 1, -1];
  
    //4方向にホテルかホテルチェーンがあるかどうか調べる
    //ホテルチェーンがあった場合は吸収される（合併でないことは保証されている）
    for (var i = 0; i < vx.length; i++) {
      var name2 = self.getName(name, vx[i], vy[i]);
      if (color2 = self.isHotelChain(name2)) {
        self.setColor(name, color2);
      } else if (self.isHotel(name2)) {
        console.log("isHotel");
        return true;
      }
    }
    return false;
  }

  Acquire.prototype.chained = function() {
    for (var p in this.chainMarkers) {
      if (this.chainMarkers[p])
        return true;
    }
    return false;
  }

  Acquire.prototype.purchaseStock = function(x, color) {
    this.players[x].stocks[color] += 1;
    this.players[x].cash -= this.price(color);
  }

  function Player() {
    this.cash = 6000;
    this.stocks = {};
    this.tiles = [];
    for (var p in colors)
      this.stocks[colors[p]] = 0;
  }
  
})(this.self);

//UI
(function(global){
  global.render = render;

  var playedTile = null;

  function redirectTo(path) {
    var a = $('<a></a>');
    a.attr("href", path);
    $("#two").append(a);
    a.click();
  }

  function createButton() {
    var a = $('<a></a>').addClass("ui-btn").addClass("ui-btn-inline");
    return a;
  }

  function render(model, ai) {
    function renderStockTable() {
      var table = $('<table></table>').attr("cellspacing",1);
      var tr = $("<tr><th></th><th>Cash</th></tr>");
      for (var p in colors)
        tr.append('<th>'+colors[p]+'</th>');
      table.append(tr);
      for (var i = 0; i < model.players.length; i++) {
        tr = $("<tr></tr>");
        tr.append('<td>'+i+'</td>');
        tr.append('<td>'+model.players[i].cash+'</td>');
        for (var p in colors) {
          var x = model.players[i].stocks[colors[p]];
          tr.append($('<td>'+x+'</td>').attr("align","right"));
        }
        table.append(tr);
      }
      return table;
    }

    function renderTiles() {
      function createTile(label) {
        var td = $('<td></td>').text(label).addClass(label);
        td.click(function(){
          if ($(this).css("color") != orange) return;
          var name = $(this).text();
          playedTile = name;
          $(this).css("background-color", "gray");
          $(this).css("border", "1px outset gray");
          $(this).text("");
          if (model.isHotelMerged(name)) {
            console.log("Merge!");
            renderMergedOption(model);
          } else if (model.checkChain(name)) {
            renderSelectChain(name);
          } else {
            if (model.chained())
              renderPurchaseStocks();
          }
          var name = model.tiles.shift();
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
      $(".content").append(table);
    }

    function createChainMarker(color) {
      var a = createButton().css("background-color",color);
      a.click(function(){
        model.purchaseStock(0, color);
        $("#stocks").html(renderStockTable());
      });
      return a;
    }

    function renderPurchaseStocks() {
      var table = renderStockTable();
      $("#two").html($('<div id="stocks"></div>').append(table));

      for (var p in model.chainMarkers) {
        if (model.chainMarkers[p])
          $("#two").append(createChainMarker(p));
      }
      var a = createButton().text("Done");
      a.click(function(){
        redirectTo("#one");
      });
      $("#two").append(a);
      redirectTo("#two");
    }

    function renderSelectChain(name) {
      var table = renderStockTable();
      $("#two").html(table);
  
      for (var p in model.chainMarkers) {
        if (model.chainMarkers[p]) continue;
        var a = createButton().css("background-color", p);
        (function(color){
          a.click(function(){
            model.setColor(name, color);
            model.chainMarkers[color] = true;
            setTimeout(function(){
              redirectTo("#one");
              ai.play();
            }, 500);
          });
        })(p);
        $("#two").append(a);
      }
      redirectTo("#two");
    }

    function renderMergedOption(model) {
      var table = renderStockTable();
      $("#two").html(table);
      var a = createButton().text("Sell");
      $("#two").append(a);
      var a = createButton().text("Trade");
      $("#two").append(a);
      redirectTo("#two");
    }

    renderTiles();
    for (var i = 0; i < 6; i++) {
      var name = model.tiles.shift();
      $("."+name).css("color", "orange").css("font-weight", "bold");
    }
  }
})(this.self);

$(document).ready(function(){
  var acquire = new Acquire();
  var ai = new ComputerAI(acquire);
  render(acquire, ai);
});
