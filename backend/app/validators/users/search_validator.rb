# frozen_string_literal: true

module Users
  class SearchValidator
    include ValidatorResult

    def self.call(params:)
      new(params: params).call
    end

    def initialize(params:)
      @params = params
    end

    def call
      if @params[:project_id].blank? && !Current.user.admin?
        return failure(:forbidden, error: "Forbidden")
      end

      if @params[:project_id].present?
        project = Project.find_by(id: @params[:project_id])
        return failure(:not_found, error: "Project not found") unless project

        unless Current.user.admin? || Current.user.projects.exists?(id: project.id)
          return failure(:forbidden, error: "Forbidden")
        end
      end

      { ok: true }
    end
  end
end
