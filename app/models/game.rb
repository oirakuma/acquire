class Game < ActiveRecord::Base
  attr_accessible :status
  attr_reader :virtual_tile, :shares
  has_many :users
  serialize :placed_tiles
  serialize :chain_markers
  serialize :tiles
  
  COLORS=["red","yellow","orange","green","blue","purple","cyan"]
  CHARS=["A","B","C","D","E","F","G","H","I","J","K","L"]
  VECTORS=[1, -1, 0,  0].zip([0,  0, 1, -1])

  before_create do
    reset
  end

  def reset
    self.status = 0
    self.current_user_id = 0
    self.tiles = (1..12).map{|n|
      ('A'..'I').map{|c|
        "#{n}#{c}"
      }
    }.flatten.sort_by{rand}
    self.placed_tiles = {}
    self.chain_markers = Hash[COLORS.map{|x|[x,false]}]
    self.users.each{|u|
      u.reset
      u.save
    }
    self.users = []
  end

  def add_user(u)
    return false if self.users.size >= 3
    unless u.user_id
      u.user_id = self.users.size
      u.tiles = self.tiles.slice!(0,6)
    end
    self.users << u
    true
  end

  def put_tile(name)
#    return "false" unless current_user.tiles.include?(name)

    self.placed_tiles[name] = "gray"

    if hotel_merged?(name)
      h = get_majors(self.merged)
      price = get_price(self.merged)
      @shares = share_to_stockholders(h["majors"], price*15, price*10, {})
      @shares = share_to_stockholders(h["minors"], price*5, price*5, @shares)
      return "merged"
    end

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
    u = current_user
    u.tiles << self.tiles.shift
    u.save
    self.current_user_id += 1
    self.current_user_id = self.current_user_id % self.users.size
  end

  def build_chain(name, color)
    set_color(name, color)
    self.chain_markers[color] = true
    u = current_user
    u.stocks[color] += 1
    u.save
  end

  def merge
    # チェーンマーカーを返す
    self.chain_markers[self.merged] = false
    # 置いたタイルの色を変更する。
    self.placed_tiles[self.name] = "gray"
    set_color(self.name, self.merger)
    # 吸収されるホテルチェーンのタイルの色を変更する。
    self.placed_tiles.select{|k,v|
      v == self.merged
    }.each{|k,v|
      self.placed_tiles[k] = self.merger
    }
    hotel_merged?(self.name)
  end

  def purchase_stock(color)
    u = current_user
    u.stocks[color] += 1
    u.cash -= get_price(color)
    u.save
  end

  def get_price(color)
    size = get_hotel_chain_size(color)
    if color == "red" || color == "yellow"
      get_price_by_size(size)
    elsif color == "orange" || color == "green" || color == "blue"
      size == 0 ? 0 : 100+get_price_by_size(size)
    elsif color == "purple" || color == "cyan"
      size == 0 ? 0 : 200+get_price_by_size(size)
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
    colors.size >= 2
  end

  def sell
    u = current_user
    u.stocks[self.merged] -= 1
    u.cash += get_price(self.merged)
    u.save
  end

  def trade
    u = current_user
    u.stocks[self.merged] -= 2
    u.stocks[self.merger] += 2
    u.save
  end

  def get_majors(color)
    values = self.users.map{|u|
      u.stocks[color]
    }
    if self.users.size == 2
      @virtual_tile = self.tiles[rand(self.tiles.size)]
      values << @virtual_tile.to_i
    end
    max_value = values.max
    return [] if max_value == 0

    Hash.new.tap{|h|
      h["majors"] = self.users.select{|u|
        u.stocks[color] == max_value
      }

      values.delete(max_value)
      second_value = values.max
      return [] if second_value == 0
      h["minors"] = self.users.select{|u|
        u.stocks[color] == second_value
      }
    }
  end

  def end?
    # 41を越えるホテルチェーンができていたらゲーム終了
    return true if self.chain_markers.select{|k,v|v}.any?{|k,v|
      get_hotel_chain_size(k) >= 41
    }
    # すべてのホテルチェーンが11以上ならゲーム終了
    return true if self.chain_markers.all?{|k,v|
      get_hotel_chain_size(k) >= 11
    }
    return false
  end

  def sell_all
    self.users.each{|u|
      u.stocks.each{|k,v|
        u.cash += get_price(k)*v
        u.stocks[k] = 0
      }
      u.save
    }
  end

  def current_user
    self.users[self.current_user_id]
  end

private

  def share_to_stockholders(users, amount1, amount2, h)
    if users.size == 0
      nil
    elsif users.size >= 2
      users.each{|u|
        h[u.name] = amount1/users.size
        u.cash += amount1/users.size
        u.save
      }
    else
      u = users.first
      h[u.name] = amount2
      u.cash += amount2
      u.save
    end
    h
  end

  def get_price_by_size(size)
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
  end

  def set_color(name, color)
    if get_color(name) == "gray"
      self.placed_tiles[name] = color
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
    self.placed_tiles[name]
  end

  def hotel_chain?(name)
    if !get_color(name) || get_color(name) == "gray"
      return false
    else
      return get_color(name)
    end
  end

  def get_hotel_chain_size(color)
    self.placed_tiles.select{|k,v|
      v == color
    }.size
  end
end
