class CreateExams < ActiveRecord::Migration[6.0]
  def change
    create_table :exams do |t|
      t.string :class_name
      t.string :subject
      t.date :exam_date
      t.string :start_time
      t.string :end_time
      t.timestamps
    end
  end
end
