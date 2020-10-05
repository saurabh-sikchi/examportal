class CreateAnswerPapers < ActiveRecord::Migration[6.0]
  def change
    create_table :answer_papers do |t|
      t.integer :page_number
      t.references :exam_submission, null: false, foreign_key: true

      t.timestamps
    end
  end
end
