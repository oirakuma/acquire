require 'test_helper'

class UserTest < ActiveSupport::TestCase
  def setup
    @user = users(:one)
  end
  
  def test_name
    @user.name
  end
end
