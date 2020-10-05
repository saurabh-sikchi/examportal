class StudentsController < ApplicationController
  include StudentGetter
  before_action :get_current_student

  def new
  end

  def create
    @exam = Exam.find_by(id: params[:exam_id])
    redirect_to new_exam_submission_url if @exam.nil?

    if Time.zone.now < @exam.start_time_parsed - 2.minutes
      redirect_to root_url, notice: "The exam has not started yet"
      return
    end
    
    @student.assign_attributes(student_params)


    respond_to do |format|
      if @student.save
        set_current_student
        set_exam
        format.html { redirect_to new_exam_submission_url }
      else
        format.html { render :new }
      end
    end
  end

  private

  def set_current_student
    cookies.permanent.signed[:student] = @student.id
  end

  def set_exam
    cookies.signed[:exam_id] = { value: @exam.id, expires: 4.hours }
  end

  def student_params
    params.fetch(:student, {}).permit(:name, :class_name)
  end

end
