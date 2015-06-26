class ApplicationController < ActionController::Base
#  protect_from_forgery
  before_action :authenticate
  before_action :authorize, :only => [:put_tile]

  def authenticate
    @user = User.where(:session_id => session[:session_id]).first_or_create
  end

  def authorize
    @game = Game.find(params[:id])
    if @user.user_id != @game.current_user_id
      render :json => false
    end
  end
end
