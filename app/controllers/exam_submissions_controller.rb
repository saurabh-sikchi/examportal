class ExamSubmissionsController < ApplicationController
  include StudentGetter
  before_action :hide_default_header, except: :index
  before_action :get_current_student, except: :index
  before_action :get_exam, except: :index
  before_action :redirect_if_no_student_or_exam, except: :index

  http_basic_authenticate_with name: "admin", password: "saralaram", only: :index

  def index
    @exam = Exam.find_by(id: params[:id])
    redirect_to exams_url, notice: 'There was an error. Please contact admin.' if @exam.nil?
    @exam_submissions = @exam.exam_submissions
  end

  def show
    @exam_submission = ExamSubmission.find_by(id: cookies.signed[:exam_submission_id])
    redirect_to root_url if @exam_submission.nil?
  end

  def new
    @exam_submission = ExamSubmission.find_by(exam: @exam, student: @student)
    redirect_to root_url, notice: "Your submission has already been recorded for this exam." unless @exam_submission.nil?
  end

  def create

    if Time.zone.now > @exam.end_time_parsed + 20.minutes
      redirect_to root_url, notice: "The submission was too late, so it was not recorded."
      return
    end

    @exam_submission = ExamSubmission.new(student: @student, exam: @exam)
    
    set_answer_papers

    if @exam_submission.save
      cookies.signed[:exam_submission_id] = { value: @exam_submission.id, expires: 20.minutes }
      h = { success: true, redirect_to: submitted_url }
    else
      h = { success: false, error: @exam_submission.errors[:base].try(:first) }
    end
    
    render json: h, status: :ok
  end

  private

  def redirect_if_no_student_or_exam
    redirect_to root_url if @exam.nil? || !@student.persisted?
  end

  def get_exam
    @exam = Exam.find_by(id: cookies.signed[:exam_id])
  end

  def hide_default_header
    @hide_default_header = true
  end

  def set_answer_papers
    return if params[:answer_papers].nil?
    @exam_submission.answer_papers.reload
    params[:answer_papers].each do |page_number, image|
      next if image.blank?
      ap = @exam_submission.answer_papers.find_or_initialize_by(page_number: page_number)
      ap.image = image
    end
  end
end
