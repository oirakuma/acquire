class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :name
      t.string :session_id
      t.string :tiles
      t.integer :cash
      t.text :stocks
      t.integer :game_id, :default => nil
      t.integer :user_id, :default => nil

      t.timestamps
    end
  end
end
