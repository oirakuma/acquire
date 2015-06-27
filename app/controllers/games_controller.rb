class GamesController < ApplicationController
  def index
    @games = Game.all
    render :layout => false
  end

  def show
    @game = Game.find(params[:id])
    if @game.users.size < 3
      @game.add_user(@user)
      @game.save
    end
    respond_to do |format|
      format.html # new.html.erb
      format.json { render_json(@game) }
    end
  end

  def reset
    @game = Game.find(params[:id])
    @game.reset
    @game.save
    redirect_to games_url
  end

  def entry_name
    @user.name = params[:name]
    @user.save
    render :json => @user
  end

  def users
    @game = Game.find(params[:id])
    render :json => @game.users
  end

  def put_tile
    g = Game.find(params[:id])
    g.result = g.put_tile(params[:name])
    g.save
    render_json(g)
  end

  def build_chain
    g = Game.find(params[:id])
    g.build_chain(params[:name], params[:color])
    g.save
    render_json(g)
  end

  def purchase_stock
    g = Game.find(params[:id])
    g.purchase_stock(params[:color])
    g.save
    render_json(g)
  end

  def purchase_done
    g = Game.find(params[:id])
    g.next_user
    g.save
    render_json(g)
  end

  def sell
    g = Game.find(params[:id])
    g.sell
    g.save
    render_json(g)
  end

  def trade
    g = Game.find(params[:id])
    g.trade
    g.save
    render_json(g)
  end

  def merge_done
    g = Game.find(params[:id])
    g.result = g.merge
    g.save
    render_json(g)
  end

private

  def render_json(g)
    # 自分以外の手持ちタイル情報を消去
    g.users.select{|u|
      u.user_id != @user.user_id
    }.each{|u|
      u.tiles = nil
    }

    h = JSON.parse(g.to_json(:include => :users))
    # 株価
    h["stock_prices"] = Hash.new.tap{|h|
      Game::COLORS.each{|x|
        h[x] = g.get_price(x)
      }
    }

    h["user_id"] = @user.user_id
    h.delete("tiles")

    h["virtual_tile"] = g.virtual_tile
    h["shares"] = g.shares

    h["end"] = g.end?
    if h["end"]
      g.sell_all
    end

    h["current_user_name"] = g.current_user.name

    render :json => h
  end
end
