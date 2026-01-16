class CreateLeaves < ActiveRecord::Migration[8.1]
  def change
    create_table :leaves do |t|
      t.date :start_date
      t.date :end_date
      t.string :leave_type
      t.text :reason
      t.string :status
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
