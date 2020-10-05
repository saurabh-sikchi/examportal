class AnswerPaper < ApplicationRecord
  belongs_to :exam_submission

  has_one_attached :image
  validates :image, attached: true, content_type: ['image/png', 'image/jpg', 'image/jpeg']
end
