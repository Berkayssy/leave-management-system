class ApplicationController < ActionController::API
    before_action :authenticate_request

    attr_reader :current_user

    private
  
    def authenticate_request
        header = request.headers['Authorization']

        if header
            begin
                token = header.split(' ').last
                decoded = JWT.decode(token, Rails.application.secret_key_base, true, algorithm: 'HS256')
                @current_user = User.find(decoded[0]['user_id'])
            rescue JWT::DecodeError, ActiveRecord::RecordNotFound
                render_unauthorized('Invalid token')
            end
        else
            render_unauthorized('Missing token')
        end
    end

    def render_unauthorized(message)
        render json: { error: message }, status: :unauthorized  
    end

    def require_role(role)
        unless current_user&.role == role.to_s
            render json: { error: "Requires #{role} role" }, status: :forbidden
        end
    end

    def manager?
        current_user&.role == 'manager' || current_user&.role == 'admin'
    end

    def admin?
        current_user&.role == 'admin'
    end
end