# frozen_string_literal: true

module Api::V1
  class SessionsController < ApplicationController
    def create
      email = session_params[:email].to_s.strip.downcase
      password = session_params[:password].to_s
      user = User.find_by(email: email)

      unless user&.authenticate(password)
        return render json: { error: "Invalid email or password" }, status: :unauthorized
      end

      render json: {
        user: user.for_api,
        token: JsonWebToken.encode(user.id)
      }, status: :ok
    end

    private

    def session_params
      params.permit(:email, :password)
    end
  end
end
