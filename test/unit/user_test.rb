require 'test_helper'

class UserTest < ActiveSupport::TestCase
  def test_name
    @user.name
  end

  def test_sell
    setup_tiles
    red = @user.stocks["red"]
    cash = @user.cash
    @user.sell("red")
    assert_equal red-1, @user.stocks["red"]
    assert_equal cash+200, @user.cash
  end

  def test_trade
    setup_tiles
    red = @game.current_user.stocks["red"]
    blue = @game.current_user.stocks["blue"]
    @user.trade("red","blue")
    assert_equal red-2, @game.current_user.stocks["red"]
    assert_equal blue+1, @game.current_user.stocks["blue"]
  end
end
