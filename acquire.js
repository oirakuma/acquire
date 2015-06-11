var tiles = null;
var chars = ["A","B","C","D","E","F","G","H","I","J","K","L"];

function indexOfChar(c) {
  for (var i = 0; i < chars.length; i++)
    if (chars[i] == c)
      return i;
  return -1;
}

function createArea(n, c) {
  return '<td class="'+n+c+'">'+n+c+'</td>';
//  return '<div class="tile '+n+c+'"></div>';
}

function createTile(label) {
  var a = $('<a href="#" data-role="button" data-inline="true">'+label+'</a>');
  a.click(function(){
    var label = $(this).text();
    var dst = $(".content ."+label);
    dst.css("background-color", "gray");
    checkChain(label);
    $(this).text(tiles.shift());
  });
  return a;
}

function getColor(name) {
  if (!name) return 'rgb(0, 0, 0)';
  return $(".content ."+name).css("background-color");
}

function setColor(name, color) {
  return $(".content ."+name).css("background-color", color);
}

function initialize() {
  tiles = [];
  var table = $("<table></table>");
  for (var i = 0; i < 12; i++) {
    var tr = $("<tr></tr>");
    for (var j = 0; j < 9; j++) {
      var tile = createArea(j+1, chars[i]);
      tr.append(tile);
      tiles.push((j+1)+chars[i]);
    }
    table.append(tr);
  }
  $(".content").append(table);
  tiles.sort(function(){
    return Math.random()-0.5;
  });
  tiles.sort(function(){
    return Math.random()-0.5;
  });
 
  $(".ui a").click(function(){
    var label = $(this).text();
    var dst = $(".content ."+label);
    dst.css("background-color", "gray");
    checkChain(label);
    $(this).text(tiles.shift());
  });

  $(".ui a").map(function(){
    $(this).text(tiles.shift());
  });
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
  if (color != 'rgb(0, 0, 0)' && color != 'rgb(211, 211, 211)')
    return color;
  return null;
}

var afterSelectedHotelChain = null;

function selectHotelChain(callback) {
  afterSelectedHotelChain = callback;
  setTimeout(function(){
    $.mobile.changePage('#two', {transition: 'slide'});
  }, 1000);
}

function showPage(name, callback) {
  $(name+" a").click(function(){
    var color = $(this).text();
    setTimeout(function(){
      callback(color);
    }, 1000);
  });
  setTimeout(function(){
    $.mobile.changePage(name, {transition: 'slide'});
  }, 1000);
}

function checkChain(name) {
  var color1 = getColor(name);
  var color2 = null;
  if (color2 = isHotel(getName(name, +1, 0))) {
    showPage('#two', function(color){
      setColor(name, color);
      setColor(getName(name, +1, 0), color);
    });
  }
  if (color2 = isHotel(getName(name, -1, 0))) {
    showPage('#two', function(color){
      setColor(name, color);
      setColor(getName(name, -1, 0), color);
    });
  }
  if (color2 = isHotel(getName(name, 0, +1))) {
    showPage('#two', function(color){
      setColor(name, color);
      setColor(getName(name, 0, +1), color);
    });
  }
  if (color2 = isHotel(getName(name, 0, -1))) {
    showPage('#two', function(color){
      setColor(name, color);
      setColor(getName(name, 0, -1), color);
    });
  }
}

function reset() {
  initialize();
}

$(document).ready(function(){
  initialize();
  $(document).page();
});

setTimeout(function(){
}, 2000);
