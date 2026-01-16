Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'https://leave-management-system-chi-nine.vercel.app', 'http://localhost:3000'
    
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
      credentials = true
  end
end