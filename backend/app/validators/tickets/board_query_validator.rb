# frozen_string_literal: true

module Tickets
  class BoardQueryValidator
    include ValidatorResult

    def self.call(params:)
      new(params: params).call
    end

    def initialize(params:)
      @params = params
    end

    # On success returns context for building the relation (avoids duplicating param parsing).
    def call
      project_id = @params[:project_id].presence&.to_i
      if project_id.blank? || project_id <= 0
        return failure(:unprocessable_entity, error: "project_id is required")
      end

      unless Project.exists?(id: project_id)
        return failure(:not_found, error: "Project not found")
      end

      unless Current.user.admin? || Current.user.projects.exists?(id: project_id)
        return failure(:forbidden, error: "Forbidden")
      end

      board_view = (@params[:board_view].presence || "sprint").to_s
      sprint_id = nil

      case board_view
      when "sprint"
        sprint_id = @params[:sprint_id].presence&.to_i
        if sprint_id.blank? || sprint_id <= 0
          return failure(:unprocessable_entity, error: "sprint_id is required for sprint board_view")
        end
        unless Sprint.exists?(id: sprint_id, project_id: project_id)
          return failure(:not_found, error: "Sprint not found for this project")
        end
      when "all", "mine", "backlog"
        # valid
      else
        return failure(:unprocessable_entity, error: "Invalid board_view")
      end

      {
        ok: true,
        context: {
          project_id: project_id,
          board_view: board_view,
          sprint_id: sprint_id,
        },
      }
    end
  end
end
