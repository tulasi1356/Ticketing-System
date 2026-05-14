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

      token = JsonWebToken.encode(user.id)
      set_session_jwt_cookie(token)
      render json: { user: user.for_api }, status: :ok
    end

    def current
      return render json: { error: "Unauthorized" }, status: :unauthorized unless current_user

      render json: { user: current_user.for_api }, status: :ok
    end

    def destroy
      clear_session_jwt_cookie!
      head :no_content
    end

    private

    def session_params
      params.permit(:email, :password)
    end
  end
end
