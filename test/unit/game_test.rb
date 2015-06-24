require 'test_helper'

class GameTest < ActiveSupport::TestCase
  def setup
    @game = Game.new
    @game.save
    @game.users << User.new
    @game.users << User.new
    @game.start
    @game.save
  end

  def test_1
    @game.put_tile("1A")
    @game.put_tile("2A")
    @game.build_chain("1A", "red")
    assert_equal 200, @game.get_price("red")
    @game.purchase_stock("red")
    assert_equal 5800, @game.users.first.cash
  end
end
