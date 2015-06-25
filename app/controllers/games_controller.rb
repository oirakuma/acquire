class GamesController < ApplicationController
  # GET /games
  # GET /games.json
  def index
    @games = Game.all

    respond_to do |format|
      format.html { render :layout => false }
      format.json { render json: @games }
    end
  end

  # GET /games/1
  # GET /games/1.json
  def show
    @game = Game.find(params[:id])
    respond_to do |format|
      format.html # new.html.erb
      format.json { render_json(@game) }
    end
  end

  def connect
    @game = Game.find(params[:id])
    unless @user.user_id
      @user.user_id = @game.users.size
      @user.tiles = @game.tiles.slice!(0,6)
    end
    @game.users << @user

    @game.save
    render_json(@game)
  end

  # GET /games/new
  # GET /games/new.json
  def new
    @game = Game.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @game }
    end
  end

  # GET /games/1/edit
  def edit
    @game = Game.find(params[:id])
  end

  # POST /games
  # POST /games.json
  def create
    @game = Game.new(params[:game])

    respond_to do |format|
      if @game.save
        format.html { redirect_to @game, notice: 'Game was successfully created.' }
        format.json { render json: @game, status: :created, location: @game }
      else
        format.html { render action: "new" }
        format.json { render json: @game.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /games/1
  # DELETE /games/1.json
  def destroy
    @game = Game.find(params[:id])
    @game.reset

    respond_to do |format|
      format.html { redirect_to games_url }
      format.json { head :no_content }
    end
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

    render :json => h
  end
end
