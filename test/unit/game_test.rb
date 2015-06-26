require 'test_helper'

class GameTest < ActiveSupport::TestCase
  def setup
    @game = Game.new
    @game.save

    @user = User.create
    @game.add_user @user
    @game.add_user User.create
    @game.save

    assert_equal 2, @game.users.size
  end

  def test_reset
    @game.reset
    assert_equal 0, @game.users.size
  end

  def test_put_tile
    t = @user.tiles.first
    assert_nil @game.put_tile(t)
  end

  def test_get_price
    @game.placed_tiles["1A"] = "red"
    @game.placed_tiles["2A"] = "red"
    assert_equal 200, @game.get_price("red")
    @game.placed_tiles["3A"] = "red"
    assert_equal 300, @game.get_price("red")
  end

  def test_purchase_stock
    @game.placed_tiles["1A"] = "red"
    @game.placed_tiles["2A"] = "red"
    @game.purchase_stock("red")
    assert_equal 5800, @user.cash
  end
end
