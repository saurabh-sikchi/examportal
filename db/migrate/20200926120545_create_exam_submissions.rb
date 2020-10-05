class CreateExamSubmissions < ActiveRecord::Migration[6.0]
  def change
    create_table :exam_submissions do |t|
      t.references :exam, null: false, foreign_key: true
      t.references :student, null: false, foreign_key: true

      t.timestamps
    end
  end
end
