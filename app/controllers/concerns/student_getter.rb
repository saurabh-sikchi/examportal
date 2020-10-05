module StudentGetter
  extend ActiveSupport::Concern

  private

  def get_current_student
    @student = Student.find_by(id: cookies.signed[:student]) || Student.new
  end
end