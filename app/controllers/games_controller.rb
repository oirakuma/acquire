class GamesController < ApplicationController
  # GET /games
  # GET /games.json
  def index
    @games = Game.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @games }
    end
  end

  # GET /games/1
  # GET /games/1.json
  def show
    @game = Game.find(params[:id])
    u = @game.users.where(:session_id => session[:session_id]).first_or_create(:user_id => @game.users.size)
    @game.user_id = u.user_id

    case @game.status
    when 0
      if @game.users.size == 2
        @game.start
      end
    end

    @game.users.reject{|u|
      u.session_id == session[:session_id]
    }.each{|u|
      u.tiles = nil
    }

    @game.save
    respond_to do |format|
      format.html # show.html.erb
      format.json { render_json(@game) }
    end
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

  # PUT /games/1
  # PUT /games/1.json
  def update
    @game = Game.find(params[:id])
    u = @game.users.where(:session_id => session[:session_id]).first
    @game.placed_tiles = placed_tiles.to_json
    @game.save
    render :json => @game
  end

  # DELETE /games/1
  # DELETE /games/1.json
  def destroy
    @game = Game.find(params[:id])
    @game.destroy

    respond_to do |format|
      format.html { redirect_to games_url }
      format.json { head :no_content }
    end
  end

  def put_tile
    g = Game.find(params[:id])
    chained = g.put_tile(params[:name])
    g.result = chained
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

private

  def render_json(g)
    h = JSON.parse(g.to_json(:include => :users))
    h["stock_prices"] = Hash.new.tap{|h|
      Game::COLORS.each{|x|
        h[x] = g.get_price(x)
      }
    }
    render :json => h
  end
end
