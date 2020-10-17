class Exam < ApplicationRecord

  has_many :question_papers, dependent: :destroy, autosave: true
  has_many :exam_submissions, dependent: :destroy

  CLASSES = (1..10).to_a
  SUBJECTS = [
    'English',
    'Maths',
    'Science',
    'Social Studies',
    'History',
    'Geography',
    'Hindi',
    'Marathi',
    'Sanskrit',
    'Grammar',
  ]
  TIMES = [8,9,10,11,12,1,2,3,4,5,6,7].map do |t| 
    mod = t  >= 8 && t < 12 ? 'AM' : 'PM'
    [ "#{t}:00 #{mod}", "#{t}:30 #{mod}" ]
  end.flatten + ['11:00 PM']

  scope :today, -> { where(exam_date: Date.today) }
  default_scope { order(exam_date: :desc) }

  validate :has_at_least_one_question_paper
  validate :question_papers_page_numbers_should_be_sequential
  validate :end_time_should_be_greater_than_now
  validate :no_overlapping_exam_for_same_class
  validate :end_time_should_be_greater_than_start_time
  
  def has_not_ended?
    return end_time_parsed > Time.zone.now
  end

  def end_time_parsed
    Time.zone.parse("#{exam_date.to_s} #{end_time}")
  end

  def start_time_parsed
    Time.zone.parse("#{exam_date.to_s} #{start_time}")
  end

  private

  def has_at_least_one_question_paper
    if question_papers.size == 0
      self.errors.add(:base, "No question paper uploaded")
    end
  end

  def question_papers_page_numbers_should_be_sequential
    missing_pages = (1..question_papers.size).to_a - question_papers.map(&:page_number).sort
    if !missing_pages.empty? 
      self.errors.add(:base, "Missing page number: #{missing_pages.first}.")
    end
  end

  def end_time_should_be_greater_than_now
    if !self.persisted? && !has_not_ended?
      self.errors.add(:exam_date, "Exam cannot be in the past")
    end
  end

  def no_overlapping_exam_for_same_class
    conflict_exam = self.class.where(class_name: class_name, exam_date: exam_date).where.not(id: id).find { |e| !(e.end_time > self.start_time || self.end_time > e.start_time) }
    if conflict_exam
      self.errors.add(:base, "The timing conflicts with #{conflict_exam.subject} on #{conflict_exam.exam_date.strftime("%-d %b, %Y")} (#{conflict_exam.start_time} to #{conflict_exam.end_time})")
    end
  end

  def end_time_should_be_greater_than_start_time
    if end_time_parsed <= start_time_parsed
      self.errors.add(:base, "End time should be greater than start time")
    end
  end
  
end
