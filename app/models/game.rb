class Game < ActiveRecord::Base
  attr_accessible :status
  has_many :users
  
  COLORS=["red","yellow","orange","green","blue","purple","cyan"]
  CHARS=["A","B","C","D","E","F","G","H","I","J","K","L"]
  VECTORS=[1, -1, 0,  0].zip([0,  0, 1, -1])

  before_create do
    self.status = 0
    self.current_user_id = 0
    self.tiles = (1..12).map{|n|
      ('A'..'I').map{|c|
        "#{n}#{c}"
      }
    }.flatten.sort_by{rand}.to_json

    self.placed_tiles = {}.to_json

    self.chain_markers = Hash.new.tap{|h|
      COLORS.each{|x|
        h[x] = false
      }
    }.to_json
  end

  def start
    tiles = JSON.parse(self.tiles)
    self.users.each{|u|
      u.tiles = tiles.slice!(0,6).to_json
      u.save
    }
    self.tiles = tiles.to_json
    self.status = 1
  end

  def put_tile(name)
    placed_tiles = JSON.parse(self.placed_tiles)
    placed_tiles[name] = "gray"
    self.placed_tiles = placed_tiles.to_json
    if hotel_merged?(name)
      return "merged"
    end

    color1 = get_color(name)
    color2 = nil
  
    # 4方向にホテルかホテルチェーンがあるかどうか調べる
    # ホテルチェーンがあった場合は吸収される（合併でないことは保証されている）
    expanded = false
    chained = false
    VECTORS.map{|vx,vy|
      name2 = get_name(name, vx, vy)
      if color2 = hotel_chain?(name2)
        expanded = true
        set_color(name, color2)
      elsif is_hotel(name2)
        chained = true
      end
    }

    if expanded
      return nil
    else
      return chained ? "chained" : nil
    end
  end

  def next_user
    tiles = JSON.parse(self.tiles)
    u = current_user
    u.tiles << tiles.shift
    u.tiles = u.tiles.to_json
    u.stocks = u.stocks.to_json
    u.save
    self.tiles = tiles.to_json
    self.current_user_id += 1
    self.current_user_id = self.current_user_id % self.users.size
  end

  def build_chain(name, color)
    set_color(name, color)
    chain_markers = JSON.parse(self.chain_markers)
    chain_markers[color] = true
    self.chain_markers = chain_markers.to_json
    u = current_user
    u.stocks[color] += 1
    u.stocks = u.stocks.to_json
    u.tiles = u.tiles.to_json
    u.save
  end

  def merge
    tiles = JSON.parse(self.placed_tiles)
    tiles[self.name] = self.merger
    tiles.select{|k,v|
      v == self.merged
    }.each{|k,v|
      tiles[k] = self.merger
    }
    self.placed_tiles = tiles.to_json
  end

  def purchase_stock(color)
    u = current_user
    u.stocks[color] += 1
    u.cash -= get_price(color)
    u.stocks = u.stocks.to_json
    u.tiles = u.tiles.to_json
    u.save
  end

  def get_price(color)
    size = get_hotel_chain_size(color)
    if color == "red" || color == "yellow"
      case size
      when 0
        0
      when 2
        200
      when 3
        300
      when 4
        400
      when 5
        500
      when 6..10
        600
      when 11..20
        700
      when 21..30
        800
      when 31..40
        900
      else
        1000
      end
    elsif color == "orange" || color == "green" || color == "blue"
      case size
      when 0
        0
      when 2
        300
      when 3
        400
      when 4
        500
      when 5
        600
      when 6..10
        700
      when 11..20
        800
      when 21..30
        900
      when 31..40
        1000
      else
        1100
      end
    elsif color == "purple" || color == "cyan"
      case size
      when 0
        0
      when 2
        400
      when 3
        500
      when 4
        600
      when 5
        700
      when 6..10
        800
      when 11..20
        900
      when 21..30
        1000
      when 31..40
        1100
      else
        1200
      end
    end
  end

  def hotel_merged?(name)
    colors = {}
    # 4方向のホテルチェーンの色を数える。
    VECTORS.map{|vx,vy|
      if color = hotel_chain?(get_name(name, vx, vy))
        colors[color] = true
      end
    }
    if colors.size >= 2
      colors.keys.each{|k|
        colors[k] = get_hotel_chain_size(k)
      }
      a = colors.sort_by{|k,v|v}.reverse
      # [["yellow", 7], ["red", 5], ["blue", 3]]
      self.name = name
      self.merger = a[0][0]
      self.merged = a[1][0]
    end
    return colors.size >= 2
  end

  def sell
    u = current_user
    u.stocks[self.merged] -= 1
    u.stocks = u.stocks.to_json
    u.tiles = u.tiles.to_json
    u.cash += get_price(self.merged)
    u.save
  end

  def trade
    u = current_user
    u.stocks[self.merged] -= 2
    u.stocks[self.merger] += 2
    u.stocks = u.stocks.to_json
    u.tiles = u.tiles.to_json
    u.save
  end

private

  def current_user
    u = self.users[self.current_user_id]
    u.stocks = JSON.parse(u.stocks)
    u.tiles = JSON.parse(u.tiles)
    u
  end

  def set_color(name, color)
    if get_color(name) == "gray"
      tiles = JSON.parse(self.placed_tiles)
      tiles[name] = color
      self.placed_tiles = tiles.to_json
      VECTORS.each{|vx,vy|
        set_color(get_name(name, vx, vy), color)
      }
    end
  end

  def get_name(name, vx, vy)
    n = name.to_i
    c = CHARS.index(name[-1])
    n += vx
    c += vy
    if n < 1 || n > 12 || c < 0 || c >= 9
      return nil
    else
      return "#{n}#{CHARS[c]}"
    end
  end

  def is_hotel(name)
    get_color(name) == "gray"
  end

  def get_color(name)
    placed_tiles = JSON.parse(self.placed_tiles)
    placed_tiles[name]
  end

  def hotel_chain?(name)
    if !get_color(name) || get_color(name) == "gray"
      return false
    else
      return get_color(name)
    end
  end

  def get_hotel_chain_size(color)
    JSON.parse(self.placed_tiles).select{|k,v|
      v == color
    }.size
  end
end
