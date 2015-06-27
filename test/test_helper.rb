require 'simplecov'
SimpleCov.start 'rails'

ENV["RAILS_ENV"] = "test"
require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.(yml|csv) for all tests in alphabetical order.
  #
  # Note: You'll currently still have to declare fixtures explicitly in integration tests
  # -- they do not yet inherit this setting
  fixtures :all

  # Add more helper methods to be used by all tests here...

  def setup
    @game = Game.new
    @game.save

    @user = User.create(:session_id => "test")
    @game.add_user @user
    @game.add_user User.create
    @game.save
  end

private

  def setup_tiles
    @game.placed_tiles["1A"] = "red"
    @game.placed_tiles["2A"] = "red"

    @game.placed_tiles["4A"] = "blue"
    @game.placed_tiles["5A"] = "blue"
    @game.placed_tiles["6A"] = "blue"
  end
end
