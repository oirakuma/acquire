require 'test_helper'

class GamesControllerTest < ActionController::TestCase
  setup do
    session[:session_id] = "test"
  end

  test "sould rest" do
    post :reset, :id => @game
    assert_redirected_to games_url
  end

  test "sould entry name" do
    post :entry_name, :name => "test"
    assert_not_nil assigns(:user).name
  end

  test "should disconnect" do
    assert_difference("@game.users.count", -1) do
      get :disconnect, :id => @game
    end
  end

  test "should put tile" do
    post :put_tile, :name => "1A", :id => @game
  end

  test "should build chain" do
    post :build_chain, :name => "1A", :color => "red", :id => @game
  end

  test "should purchase_done" do
    post :purchase_done, :id => @game
  end

  test "should sell" do
    @game.merged = "red"
    @game.save
    post :sell, :id => @game
  end

  test "should trade" do
    @game.merged = "red"
    @game.merger = "blue"
    @game.save
    post :trade, :id => @game
  end

  test "should merge done" do
    post :merge_done, :id => @game

    @game.name ="1A"
    @game.save
    @game.users.each{|u|
      u.merged = true
      u.save
    }
    post :merge_done, :id => @game
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:games)
  end

  test "should purchase stock" do
    post :purchase_stock, :color => "red", :id => @game
  end

  test "should show game" do
    get :show, id: @game
    assert_response :success
  end
end
