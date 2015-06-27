class Game < ActiveRecord::Base
  attr_accessible :status
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
