class AddManagerNotesToLeaves < ActiveRecord::Migration[8.1]
  def change
    add_column :leaves, :manager_notes, :text
  end
end
