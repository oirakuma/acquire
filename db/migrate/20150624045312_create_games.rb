class CreateGames < ActiveRecord::Migration
  def change
    create_table :games do |t|
      t.integer :status
      t.integer :result
      t.integer :user_id
      t.integer :current_user_id
      t.text :tiles
      t.text :placed_tiles
      t.text :chain_markers

      t.timestamps
    end
  end
end
