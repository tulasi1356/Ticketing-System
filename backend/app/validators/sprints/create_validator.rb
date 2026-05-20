# frozen_string_literal: true

module Sprints
  # Input checks for sprint creation (dates, project existence, access).
  # Returns the same contract as CreateService for failures: `{ ok: false, status:, body: }`.
  class CreateValidator
    include ValidatorResult

    def self.call(permitted:)
      new(permitted: permitted).call
    end

    def initialize(permitted:)
      @permitted = permitted
    end

    def call
      if @permitted[:start_date].to_date < Date.today
        return failure(:unprocessable_entity, error: "Start date must be in the future")
      end

      if @permitted[:end_date].to_date < Date.today
        return failure(:unprocessable_entity, error: "End date must be in the future")
      end

      project = Project.find_by(id: @permitted[:project_id])
      return failure(:not_found, error: "Project not found") if project.nil?
      unless Current.user.admin? || Current.user.projects.exists?(id: project.id)
        return failure(:forbidden, error: "Forbidden")
      end

      { ok: true }
    end
  end
end
