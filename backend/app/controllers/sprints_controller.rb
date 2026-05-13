class SprintsController < ApplicationController

    before_action :require_current_user

def create
        result = Sprints::CreateService.call(current_user: current_user, params: params)
        if result[:ok]
            render json: result[:sprint], status: :created
        else
            render json: result[:body], status: result[:status]
        end
    end


    def index
        sprints =
            if current_user.admin?
                Sprint.all
            else
                Sprint.where(project_id: current_user.projects.select(:id))
            end

        render json: sprints, status: :ok
    end


    def get_sprint_by_project_id
        sprints = Sprint.where(project_id: params[:project_id])
        render json: sprints, status: :ok
    end

    def close
        result = Sprints::CloseService.call(current_user: current_user, sprint_id: params[:sprint_id])
        if result[:ok]
            render json: result[:sprint], status: :ok
        else
            render json: result[:body], status: result[:status]
        end
    end

    private
end