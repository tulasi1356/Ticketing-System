# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

# Read more: https://github.com/cyu/rack-cors

# Browsers send `credentials: "include"` for httpOnly session cookies; `origins "*"` is incompatible.
raw_origins = ENV["CORS_ALLOWED_ORIGINS"].presence || "http://localhost:5173,http://127.0.0.1:5173"
allowed_origins = raw_origins.split(",").map(&:strip).reject(&:blank?)

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*allowed_origins)

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
