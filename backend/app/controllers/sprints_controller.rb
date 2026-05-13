# frozen_string_literal: true

class SprintsController < ApplicationController
  before_action :require_current_user

  def create
    result = Sprints::CreateService.call(params: params)
    if result[:ok]
      render json: result[:sprint], status: :created
    else
      render json: result[:body], status: result[:status]
    end
  end

  def index
    scope =
      if current_user.admin?
        Sprint.all
      else
        Sprint.where(project_id: current_user.projects.select(:id))
      end

    if params[:project_id].present?
      pid = params[:project_id].to_i
      unless current_user.admin? || current_user.projects.exists?(id: pid)
        return render json: { errors: ["Project not found"] }, status: :not_found
      end
      scope = scope.where(project_id: pid)
    end

    render json: scope, status: :ok
  end

  def close
    result = Sprints::CloseService.call(sprint_id: params[:id].to_i)
    if result[:ok]
      render json: result[:sprint], status: :ok
    else
      render json: result[:body], status: result[:status]
    end
  end

  private
end
