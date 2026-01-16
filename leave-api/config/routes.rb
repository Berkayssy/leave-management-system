Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Auth
      post 'auth/login', to: 'auth#login'
      post 'auth/signup', to: 'users#create'
      get 'auth/me', to: 'auth#me'
      post 'auth/logout', to: 'auth#logout'

      # Resources
      resources :users, only: [:create, :index]
      resources :leaves, except: [:new, :edit]

      # Manager routes
      get 'manager/dashboard', to: 'manager/leaves#dashboard'
      get 'manager/leaves', to: 'manager/leaves#index'
      patch 'manager/leaves/:id/approve', to: 'manager/leaves#approve'
      patch 'manager/leaves/:id/reject', to: 'manager/leaves#reject'
    end
  end
end