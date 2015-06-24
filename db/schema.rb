# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20150624045642) do

  create_table "games", :force => true do |t|
    t.integer  "status"
    t.integer  "user_id"
    t.integer  "current_user_id"
    t.string   "result"
    t.string   "name"
    t.string   "merger"
    t.string   "merged"
    t.text     "tiles"
    t.text     "placed_tiles"
    t.text     "chain_markers"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
  end

  create_table "users", :force => true do |t|
    t.string   "name"
    t.string   "session_id"
    t.string   "tiles"
    t.integer  "cash"
    t.text     "stocks"
    t.integer  "game_id"
    t.integer  "user_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

end
