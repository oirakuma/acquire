class User < ActiveRecord::Base
  attr_accessible :name, :session_id, :user_id, :tiles, :stocks, :cash
  belongs_to :game
  serialize :stocks
  serialize :tiles

  before_create do
    self.cash = 6000
    self.tiles = [].to_json
    self.stocks = Hash.new.tap{|h|
      ["red","yellow","orange","green","blue","purple","cyan"].each{|x|
        h[x] = 0
      }
    }
  end
end
