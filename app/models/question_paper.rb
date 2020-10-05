class QuestionPaper < ApplicationRecord
  belongs_to :exam

  has_one_attached :image
  validates :image, attached: true, content_type: ['image/png', 'image/jpg', 'image/jpeg']
end
