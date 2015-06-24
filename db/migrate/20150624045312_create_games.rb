class CreateGames < ActiveRecord::Migration
  def change
    create_table :games do |t|
      t.integer :status
      t.integer :user_id
      t.integer :current_user_id
      t.string :result
      t.string :name
      t.string :merger
      t.string :merged
      t.text :tiles
      t.text :placed_tiles
      t.text :chain_markers

      t.timestamps
    end
  end
end
