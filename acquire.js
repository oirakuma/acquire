(function(global){
var tiles = null;
var chars = ["A","B","C","D","E","F","G","H","I","J","K","L"];
var colors = ["purple","red","blue","yellow","cyan","green","orange"];
var chainMarkers = null;
var players = null;

function indexOfChar(c) {
  for (var i = 0; i < chars.length; i++)
    if (chars[i] == c)
      return i;
  return -1;
}

function createArea(n, c) {
  return $('<td></td>').text(n+c).addClass(n+c);
}

function getColor(name) {
  if (!name) return 'rgb(0, 0, 0)';
  return $(".content ."+name).css("background-color");
}

function setColor(name, color) {
  return $(".content ."+name).css("background-color", color);
}

function Player() {
  this.cash = 6000;
  this.stocks = {};
  for (var p in colors)
    this.stocks[colors[p]] = 0;
}

function initialize() {
  function createTable() {
    var table = $("<table></table>").attr("cellspacing",1);
    for (var i = 0; i < 12; i++) {
      var tr = $("<tr></tr>");
      for (var j = 0; j < 9; j++)
        tr.append(createArea(j+1, chars[i]));
      table.append(tr);
    }
    return table;
  }

  function createTiles() {
    var ts = [];
    for (var i = 0; i < 12; i++) {
      for (var j = 0; j < 9; j++)
        ts.push((j+1)+chars[i]);
    }
    return ts;
  }

  $(".content").append(createTable());
  tiles = createTiles().sort(function(){
    return Math.random()-0.5;
  });
 
  $(".ui .tile").click(function(){
    var label = $(this).text();
    var dst = $(".content ."+label);
    dst.css("background-color", "gray");
    checkChain(label);
    $(this).text(tiles.shift());
  });

  $(".ui .tile").map(function(){
    $(this).text(tiles.shift());
  });

  chainMarkers = [];
  for (var p in colors)
    chainMarkers.push(colors[p]);

  //player
  players = [];
  for (var i = 0; i < 4; i++)
    players[i] = new Player();

  var table = $("<table></table>");
  var tr = $("<tr></tr>");
  for (var p in colors)
    tr.append('<th>'+colors[p]+'</th>');
  table.append(tr);
  for (var i = 0; i < 4; i++) {
    tr = $("<tr></tr>");
    for (var p in colors) {
      var x = players[i].stocks[colors[p]];
      tr.append('<td align="right">'+x+'</td>');
    }
    table.append(tr);
  }
  $("#stocks .ui-content").append(table);
}

function getName(name, vx, vy) {
  var n = parseInt(name[0]);
  var c = indexOfChar(name[1]);
  n += vx;
  c += vy;
  if (n < 1 || n > 9 || c < 0 || c >= 12) return null;
  return n+chars[c];
}

function isHotel(name) {
  var color = getColor(name);
  console.log(color);
  return color == 'rgb(128, 128, 128)';
}

function isHotelChain(name) {
  var color = getColor(name);
  if (color != 'rgb(0, 0, 0)' && color != 'rgb(128, 128, 128)')
    return color;
  return false;
}

function isHotelMerged(name) {
}

function removeChainMarker(color) {
  for (var i = 0; i < chainMarkers.length; i++) {
    if (chainMarkers[i] == color) {
      console.log(i);
      chainMarkers.splice(i, 1);
      return;
    }
  }
}

function selectHotelChain(callback) {
  console.log("selectHotelChain()");
  $("#tiles").hide();
  $("#chain-markers").html("<fieldset><legend>チェーンマーカー</legend></fieldset>").show();
  for (var p in chainMarkers) {
    var a = $('<a href="#" class="ui-btn ui-btn-inline"></a>');
    a.css("background-color", colors[p]);
    a.addClass(colors[p]);
    a.click(function(){
      var color = $(this).attr("class").split(" ")[2];
      removeChainMarker(color);
      $("#chain-markers").hide();
      $("#tiles").show();
      setTimeout(function(){
        callback(color);
      }, 500);
    });
    $("#chain-markers").append(a);
  }
}

function checkChain(name) {
  var color1 = getColor(name);
  var color2 = null;
  var vx = [1, -1, 0,  0];
  var vy = [0,  0, 1, -1];

  for (var i = 0; i < vx.length; i++) {
    (function(i){
      if (color2 = isHotelChain(getName(name, vx[i], vy[i]))) {
        setColor(name, color2);
      } else if (isHotel(getName(name, vx[i], vy[i]))) {
        console.log("isHotel");
        selectHotelChain(function(color){
          setColor(name, color);
          setColor(getName(name, vx[i], vy[i]), color);
        });
      }
    })(i);
  }
}

$(document).ready(function(){
  initialize();
});
})(this.self);
