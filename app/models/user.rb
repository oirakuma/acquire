class User < ActiveRecord::Base
  attr_accessible :session_id, :user_id, :tiles, :stocks, :cash
  belongs_to :game
  serialize :stocks
  serialize :tiles
  default_scope { order('user_id') }

  before_create do
    reset
    self.name = "user-#{self.session_id[10,4]}" rescue nil
  end

  def reset
    self.cash = 6000
    self.tiles = []
    self.stocks = Hash.new.tap{|h|
      ["red","yellow","orange","green","blue","purple","cyan"].each{|x|
        h[x] = 0
      }
    }
    self.user_id = nil
  end

  def sell(merged)
    self.stocks[merged] -= 1
    self.cash += self.game.get_price(merged)
  end

  def trade(merged, merger)
    self.stocks[merged] -= 2
    self.stocks[merger] += 1
  end
end
