module Api::V1
  class AuthController < ApplicationController
    skip_before_action :authenticate_request, only: [:login]
    
    def login
      email = params[:email] || params.dig(:auth, :email)
      password = params[:password] || params.dig(:auth, :password)
      
      user = User.find_by(email: email)
      
      if user && user.authenticate(password)
        payload = { 
          user_id: user.id,
          exp: 24.hours.from_now.to_i
        }
        token = JWT.encode(payload, Rails.application.secret_key_base, 'HS256')
        
        render json: { 
          token: token, 
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email,
            role: user.role 
          } 
        }, status: :ok
      else
        render json: { error: 'Invalid credentials' }, status: :unauthorized
      end
    end
    
    # Current user info
    def me
      render json: {
        user: {
          id: current_user.id,
          name: current_user.name,
          email: current_user.email,
          role: current_user.role
        }
      }
    end
    
    # Logout (client-side token silme)
    def logout
      render json: { message: 'Logged out successfully' }
    end
  end
end