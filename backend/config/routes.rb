Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"


  resources :users, only: [:index, :create, :update, :destroy] do
    collection do
      get :find_by_email
      get :search
    end
  end

 
  resources :projects, only: [:index, :create, :show, :update, :destroy] do
    member do
      post :assign_users_to_project
    end
  end


  resources :sprints, only: [:index, :create] do
    member do
      post :close
    end
  end


  resources :tickets, only: [:index, :create, :update] do
    collection do
      post :export
    end
  end

  post "attachments/upload", to: "attachments#create"
  get "attachments/disk/:filename", to: "attachments#show_disk", constraints: { filename: /[^\/]+/ }

  resources :comments, only: [:index, :create]

end
