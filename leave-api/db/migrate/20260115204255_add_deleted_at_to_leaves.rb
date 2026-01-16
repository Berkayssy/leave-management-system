class AddDeletedAtToLeaves < ActiveRecord::Migration[8.1]
  def change
    add_column :leaves, :deleted_at, :datetime
  end
end
