class ExamSubmission < ApplicationRecord
  belongs_to :exam
  belongs_to :student

  has_many :answer_papers, autosave: true, dependent: :destroy

  validate :has_at_least_one_answer_paper
  validate :answer_papers_page_numbers_should_be_sequential

  private

  def has_at_least_one_answer_paper
    if answer_papers.size == 0
      self.errors.add(:base, "No answer paper uploaded")
    end
  end

  def answer_papers_page_numbers_should_be_sequential
    missing_pages = (1..answer_papers.size).to_a - answer_papers.map(&:page_number).sort
    if !missing_pages.empty? 
      self.errors.add(:base, "Missing page number: #{missing_pages.first}.")
    end
  end

end
