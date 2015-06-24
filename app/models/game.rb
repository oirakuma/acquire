class Game < ActiveRecord::Base
  attr_accessible :status
  has_many :users
  
  CHARS=["A","B","C","D","E","F","G","H","I","J","K","L"]

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
      ["red","yellow","orange","green","blue","purple","cyan"].each{|x|
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

    color1 = get_color(name)
    color2 = nil
    vxs = [1, -1, 0,  0];
    vys = [0,  0, 1, -1];
  
    # 4方向にホテルかホテルチェーンがあるかどうか調べる
    # ホテルチェーンがあった場合は吸収される（合併でないことは保証されている）
    expanded = false;
    hoteled = false;
    vxs.zip(vys).map{|vx,vy|
      name2 = get_name(name, vx, vy)
      if color2 = is_hotel_chain(name2)
        expanded = true
        set_color(name, color2)
      elsif is_hotel(name2)
        hoteled = true
      end
    }
    if expanded
      return false
    else
      return hoteled
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

private

  def current_user
    u = self.users[self.current_user_id]
    u.stocks = JSON.parse(u.stocks)
    u.tiles = JSON.parse(u.tiles)
    u
  end

  def set_color(name, color)
    if get_color(name) == "gray"
      placed_tiles = JSON.parse(self.placed_tiles)
      placed_tiles[name] = color
      self.placed_tiles = placed_tiles.to_json
      set_color(get_name(name,  1, 0), color)
      set_color(get_name(name, -1, 0), color)
      set_color(get_name(name, 0,  1), color)
      set_color(get_name(name, 0, -1), color)
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

  def is_hotel_chain(name)
    if get_color(name) == "lightgray" || get_color(name) == "gray"
      return false
    else
      return get_color(name)
    end
  end
end
