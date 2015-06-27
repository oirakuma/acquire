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
    service = MergeService.new(g)
    g.result = service.execute(params[:name])
    g.save
    render_json(g, service.virtual_tile, service.shares)
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
    @user.sell(g.merged)
    @user.save
    render_json(g)
  end

  def trade
    g = Game.find(params[:id])
    @user.trade(g.merged, g.merger)
    @user.save
    render_json(g)
  end

  def merge_done
    g = Game.find(params[:id])
    service = MergeService.new(g)
    g.result = service.merge
    g.save
    render_json(g)
  end

private

  def render_json(g, virtual_tile = nil, shares = nil)
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

    h["virtual_tile"] = virtual_tile
    h["shares"] = shares

    h["end"] = g.end?
    if h["end"]
      g.sell_all
    end

    h["current_user_name"] = g.current_user.name

    render :json => h
  end
end
