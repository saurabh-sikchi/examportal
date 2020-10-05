class CreateQuestionPapers < ActiveRecord::Migration[6.0]
  def change
    create_table :question_papers do |t|
      t.references :exam, null: false, foreign_key: true
      t.integer :page_number

      t.timestamps
    end
  end
end
