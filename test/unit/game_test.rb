require 'test_helper'

class GameTest < ActiveSupport::TestCase
  def test_reset
    @game.reset
    assert_equal 0, @game.users.size
  end

  def test_put_tile
    t = @user.tiles.first
    service = MergeService.new(@game)
    assert_nil service.execute(t)
  end

  def test_get_price
    ["red","orange","purple"].zip([200,300,400]).each{|color,price|
      @game.placed_tiles["1A"] = color
      @game.placed_tiles["2A"] = color
      assert_equal price, @game.get_price(color)
      @game.placed_tiles["3A"] = color
      assert_equal price+100, @game.get_price(color)
    }
    @game.placed_tiles["4A"] = "purple"
    assert_equal 600, @game.get_price("purple")
    @game.placed_tiles["5A"] = "purple"
    assert_equal 700, @game.get_price("purple")
    @game.placed_tiles["6A"] = "purple"
    assert_equal 800, @game.get_price("purple")
    10.times{|i|
      @game.placed_tiles["#{i+1}B"] = "purple"
    }
    assert_equal 900, @game.get_price("purple")
    10.times{|i|
      @game.placed_tiles["#{i+1}C"] = "purple"
    }
    assert_equal 1000, @game.get_price("purple")
    10.times{|i|
      @game.placed_tiles["#{i+1}D"] = "purple"
    }
    assert_equal 1100, @game.get_price("purple")
    10.times{|i|
      @game.placed_tiles["#{i+1}E"] = "purple"
    }
    assert_equal 1200, @game.get_price("purple")
  end

  def test_purchase_stock
    @game.placed_tiles["1A"] = "red"
    @game.placed_tiles["2A"] = "red"
    @game.purchase_stock("red")
    assert_equal 5800, @user.cash
  end

  def test_build_chain
    @game.placed_tiles["1A"] = "gray"
    @game.placed_tiles["2A"] = "gray"
    @game.build_chain("2A", "red")
    assert @game.placed_tiles["1A"] == "red"
    assert @game.placed_tiles["2A"] == "red"
  end

  def test_end
    assert_equal false, @game.end?

    @game.chain_markers["red"] = true
    (1..10).map{|n|
      ('A'..'E').map{|c|
        @game.placed_tiles["#{n}#{c}"] = "red"
      }
    }
    assert @game.end?

    @game.placed_tiles = {}
    Game::COLORS.zip('A'..'G').each{|color,c|
      (1..11).map{|n|
        @game.placed_tiles["#{n}#{c}"] = color
      }
    }
    assert @game.end?
  end

  def test_sell_all
    @game.sell_all
  end

  def test_next_user
    assert 0, @game.current_user_id
    @game.next_user
    assert 1, @game.current_user_id
    @game.next_user
    assert 0, @game.current_user_id
  end

  def test_hotel_chain
    @game.placed_tiles["1A"] = "red"
    assert_not_equal false, @game.hotel_chain?("1A")
  end
end
