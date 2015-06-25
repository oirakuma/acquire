class GamesController < ApplicationController
  def index
    @games = Game.all
    render :layout => false
  end

  def show
    @game = Game.find(params[:id])
    respond_to do |format|
      format.html # new.html.erb
      format.json { render_json(@game) }
    end
  end

  def connect
    @game = Game.find(params[:id])
    @game.add_user(@user) if @game.users.size < 3
    render_json(@game)
  end

  def reset
    @game = Game.find(params[:id])
    @game.reset
    @game.save
    redirect_to games_url
  end

  def entry_name
    session[:name] = params[:name]
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
    g.merge
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
    # 筆頭株主
    h["majors"] = Hash.new.tap{|h|
      Game::COLORS.each{|x|
        h[x] = g.majors(x)
      }
    }
    # 第２株主
    h["minors"] = Hash.new.tap{|h|
      Game::COLORS.each{|x|
        h[x] = g.minors(x)
      }
    }
    h["user_id"] = @user.user_id
    h.delete("tiles")

    render :json => h
  end
end
