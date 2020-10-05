class ExamsController < ApplicationController
  before_action :set_exam, only: [:edit, :update, :destroy]

  http_basic_authenticate_with name: "admin", password: "saralaram", except: :for_today

  # GET /exams
  # GET /exams.json
  def index
    @exams = Exam.all
  end

  # GET /exams/new
  def new
    @exam = Exam.new
  end

  # GET /exams/1/edit
  def edit
  end

  def for_today
    exams = Exam.today.where(class_name: params[:class_name]).select(&:has_not_ended?)

    render json: { exams: exams.map { |exam| { subject: "#{exam.subject} #{exam.start_time} - #{exam.end_time}", id: exam.id } } }
  end

  # POST /exams
  # POST /exams.json
  def create
    @exam = Exam.new(exam_params)
    set_question_papers

    respond_to do |format|
      if @exam.save
        format.html { redirect_to exams_url, notice: 'Exam was successfully created.' }
      else
        format.html { render :new }
      end
    end
  end

  # PATCH/PUT /exams/1
  # PATCH/PUT /exams/1.json
  def update
    respond_to do |format|
      if @exam.update(exam_params)
        format.html { redirect_to exams_url, notice: 'Exam was successfully updated.' }
      else
        format.html { render :edit }
      end
    end
  end

  # DELETE /exams/1
  # DELETE /exams/1.json
  def destroy
    @exam.destroy
    respond_to do |format|
      format.html { redirect_to exams_url, notice: 'Exam was successfully deleted.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_exam
      @exam = Exam.find(params[:id])
    end

    def set_question_papers
      return if params[:question_papers].nil?
      @exam.question_papers.reload
      params[:question_papers].each do |page_number, image|
        next if image.blank?
        qp = @exam.question_papers.find_or_initialize_by(page_number: page_number)
        qp.image = image
      end
    end

    # Only allow a list of trusted parameters through.
    def exam_params
      params.fetch(:exam, {}).permit(:class_name, :subject, :exam_date, :start_time,  :end_time)
    end
end
