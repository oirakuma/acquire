class MergeService
  attr_reader :virtual_tile, :shares

  def initialize(game)
    @game = game
  end

  # 指定したタイルを置く
  # 戻り値：merged, chained, nil
  def execute(name)
#    return "false" unless @game.current_user.tiles.include?(name)

    @game.name = name
    @game.placed_tiles[name] = "gray"

    if hotel_merged?(name)
      h = get_majors(@game.merged)
      price = @game.get_price(@game.merged)
      if h["majors"]
        @shares = share_to_stockholders(h, "majors", price*15, price*10, {})
      end
      return "merged"
    end

    # 4方向にホテルかホテルチェーンがあるかどうか調べる
    # ホテルチェーンがあった場合は吸収される（合併でないことは保証されている）
    expanded = false
    chained = false
    Game::VECTORS.map{|vx,vy|
      name2 = @game.get_name(name, vx, vy)
      if color2 = @game.hotel_chain?(name2)
        expanded = true
        @game.set_color(name, color2)
      elsif @game.is_hotel(name2)
        chained = true
      end
    }

    if expanded
      return nil
    else
      return chained ? "chained" : nil
    end
  end

  def merge
    # チェーンマーカーを返す
    @game.chain_markers[@game.merged] = false
    # 置いたタイルの色を変更する。
    @game.placed_tiles[@game.name] = "gray"
    @game.set_color(@game.name, @game.merger)
    # 吸収されるホテルチェーンのタイルの色を変更する。
    @game.placed_tiles.select{|k,v|
      v == @game.merged
    }.each{|k,v|
      @game.placed_tiles[k] = @game.merger
    }
    if hotel_merged?(@game.name)
      @game.users.each{|u|
        u.merged = false
        u.save
      }
      return true
    else
      return false
    end
  end

private

  def hotel_merged?(name)
    colors = {}
    # 4方向のホテルチェーンの色を数える。
    Game::VECTORS.map{|vx,vy|
      if color = @game.hotel_chain?(@game.get_name(name, vx, vy))
        colors[color] = true
      end
    }
    if colors.size >= 2
      colors.keys.each{|k|
        colors[k] = @game.get_hotel_chain_size(k)
      }
      a = colors.sort_by{|k,v|v}.reverse
      # [["yellow", 7], ["red", 5], ["blue", 3]]
      @game.name = name
      @game.merger = a[0][0]
      @game.merged = a[1][0]
    end
    colors.size >= 2
  end

  def get_majors(color)
    values = @game.users.map{|u|
      u.stocks[color]
    }
    if @game.users.size <= 2
      @virtual_tile = @game.tiles[rand(@game.tiles.size)]
      values << @virtual_tile.to_i
    end
    max_value = values.max

    Hash.new.tap{|h|
      h["majors"] = @game.users.select{|u|
        u.stocks[color] == max_value
      } if max_value > 0

      values.delete(max_value)
      second_value = values.max
      h["minors"] = @game.users.select{|u|
        u.stocks[color] == second_value
      } if second_value && second_value > 0
    }
  end

  def share_to_stockholders(h, type, amount1, amount2, res)
    users = h[type]
    if !users || users.size == 0
      nil
    elsif users.size >= 2
      users.each{|u|
        res[u.name] = amount1/users.size
        u.cash += amount1/users.size
        u.save
      }
    else
      u = users.first
      res[u.name] = amount2
      u.cash += amount2
      u.save
      res = share_to_stockholders(h, "minors", amount2/2, amount2/2, res) if type == "majors"
    end
    res
  end
end
