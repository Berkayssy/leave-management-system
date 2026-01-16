module Api::V1
  class UsersController < ApplicationController
    skip_before_action :authenticate_request, only: [:create]
    before_action :require_admin_role!, only: [:index]
    
    # GET /api/v1/users
    def index
      users = User.all.map do |user|
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          leaves_count: user.leaves.count,
          pending_leaves: user.leaves.where(status: 'pending').count
        }
      end
      
      render json: users
    end
    
    # POST /api/v1/users
    def create
      user = User.new(user_params)
      user.role = 'employee'

      if user.save
        token = generate_token(user)
        render json: { user: user, token: token }, status: :created
      else
        render json: user.errors, status: :unprocessable_entity
      end
    end
    
    private
    def generate_token(user)
      payload = { user_id: user.id }
      JWT.encode(payload, Rails.application.credentials.secret_key_base)
    end
    
    def require_admin_role!
      unless current_user&.role == 'admin'
        render json: { error: 'Requires admin role' }, status: :forbidden
      end
    end
    
    def user_params
      params.require(:user).permit(:name, :email, :password, :password_confirmation, :role)
    end
  end
end