class User < ApplicationRecord
    has_secure_password
    has_many :leaves, dependent: :destroy, class_name: 'Leave'

    validates :name, :email, presence: true
    validates :email, uniqueness: true
    validates :password, confirmation: true
    validates :password_confirmation, presence: true
    validates :role, inclusion: { in: %w[employee manager admin] }

    def manager?
      role == 'manager'
    end
    def admin?
      role == 'admin'
    end
    def employee?
      role == 'employee'
    end
end
