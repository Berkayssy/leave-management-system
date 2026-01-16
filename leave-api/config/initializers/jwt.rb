module JWTSecret
  def self.secret_key
    Rails.application.secret_key_base
  end
end