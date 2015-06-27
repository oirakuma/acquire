class JsonBuilder
  def initialize(game, user, virtual_tile, shares)
    @game = game
    @user = user
    @virtual_tile = virtual_tile
    @shares = shares
  end

  def execute
    h = JSON.parse(@game.to_json(:include => :users))
    # 株価
    h["stock_prices"] = Hash.new.tap{|h|
      Game::COLORS.each{|x|
        h[x] = @game.get_price(x)
      }
    }

    h["user_id"] = @user.user_id
    h["user"] = @user
    h.delete("tiles")

    h["virtual_tile"] = @virtual_tile
    h["shares"] = @shares

    h["end"] = @game.end?
    if h["end"]
      @game.sell_all
    end

    h["current_user_name"] = @game.current_user.name
    h
  end
end
