class Student < ApplicationRecord
  validates :name, presence: { message: "Name is required" }
  validates :class_name, inclusion: { in: Exam::CLASSES.map(&:to_s), message: 'Please select a valid class' }
end
