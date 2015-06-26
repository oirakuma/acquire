class CreateGames < ActiveRecord::Migration
  def change
    create_table :games do |t|
      t.integer :status
      t.integer :current_user_id
      t.string :result
      t.string :name
      t.string :merger
      t.string :merged
      t.string :chain_markers
      t.text :tiles
      t.text :placed_tiles

      t.timestamps
    end
  end
end
