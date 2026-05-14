# frozen_string_literal: true

module Api::V1
  class UsersController < ApplicationController
    before_action :require_current_user, except: [:create]
    before_action :require_admin!, only: [:index, :update, :destroy]
    before_action :set_user, only: [:update, :destroy]

    def index
      render json: User.all.map(&:for_api), status: :ok
    end

    def find_by_email
      user = User.find_by(email: params[:email].to_s.strip.downcase)
      if user
        render json: user.for_api, status: :ok
      else
        render json: { error: "User not found" }, status: :not_found
      end
    end

    def create
      user = build_user
      if user.save
        render json: {
          user: user.for_api,
          token: JsonWebToken.encode(user.id)
        }, status: :created
      else
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      if @user.update(user_attributes_for_update)
        render json: @user.for_api, status: :ok
      else
        render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def search
      result = Users::SearchService.call(params: params)
      unless result[:ok]
        render json: result[:body], status: result[:status]
        return
      end

      render json: result[:users].as_json(only: [:id, :name, :email]), status: :ok
    end

    def destroy
      if @user.destroy
        render json: { message: "User deleted successfully" }, status: :ok
      else
        render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def set_user
      @user = User.find(params[:id])
    end

    def build_user
      User.new(user_attributes_for_create)
    end

    def user_attributes_for_create
      params.permit(:name, :email, :password).merge(role: resolved_role)
    end

    def user_attributes_for_update
      attrs = params.permit(:name, :email, :password).to_h
      attrs[:role] = normalize_role(params[:role]) if params.key?(:role)
      attrs[:role] = :admin if bootstrap_admin_email?(params[:email].to_s.strip.downcase)
      attrs
    end

    # Default :normal. Bootstrap admin emails are always :admin. Otherwise explicit
    # admin ("admin" or 1) maps to :admin.
    def resolved_role
      email = params[:email].to_s.strip.downcase
      return :admin if bootstrap_admin_email?(email)

      normalize_role(params[:role])
    end

    def normalize_role(role_param)
      return :normal if role_param.blank?

      (role_param.to_s == "admin" || role_param.to_i == 1) ? :admin : :normal
    end

    def bootstrap_admin_email?(email)
      %w[admin@gmail.com admin@yopmail.com].include?(email)
    end
  end
end