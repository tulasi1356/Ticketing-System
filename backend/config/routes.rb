Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"

  # Controllers live under `app/controllers/api/v1/*` as `Api::V1::*Controller`.
  namespace :api do
    namespace :v1 do
      resources :sessions, only: [:create]

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
        resources :comments, only: [:index, :create]
      end

      get "comments", to: "comments#index"
      post "comments", to: "comments#create"

      post "attachments/upload", to: "attachments#create"
      get "attachments/disk/:filename", to: "attachments#show_disk", constraints: { filename: /[^\/]+/ }
    end
  end

  # URLs saved before `/api/v1` (e.g. JSON `attachment_urls` or `<img src="/attachments/disk/...">`).
  get "attachments/disk/:filename", to: "api/v1/attachments#show_disk", constraints: { filename: /[^\/]+/ }
end
