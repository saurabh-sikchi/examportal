Rails.application.routes.draw do
  resources :exams, except: :show do
    collection do
      get :for_today
    end

    member do
      get 'submissions', to: 'exam_submissions#index'
    end
  end

  resources :students, only: :create
  root to: 'students#new'
  get '/students', to: redirect('/')

  get 'submitted', to: 'exam_submissions#show'
  get 'take_exam', to: 'exam_submissions#new', as: :new_exam_submission
  resources :exam_submissions, only: :create
  get '/exam_submissions', to: redirect('/take_exam')

  get '/admin', to: redirect('/exams')
end
