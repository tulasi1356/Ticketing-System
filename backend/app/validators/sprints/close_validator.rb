# frozen_string_literal: true

module Sprints
  class CloseValidator
    include ValidatorResult

    def self.call(sprint_id:)
      new(sprint_id: sprint_id).call
    end

    def initialize(sprint_id:)
      @sprint_id = sprint_id
    end

    def call
      sprint = Sprint.find_by(id: @sprint_id)
      return failure(:not_found, error: "Sprint not found") if sprint.nil?
      unless Current.user.admin? || Current.user.projects.exists?(id: sprint.project_id)
        return failure(:forbidden, error: "Forbidden")
      end

      if sprint.tickets.any? && sprint.tickets.any? { |ticket| ticket.status != "done" }
        return failure(
          :unprocessable_entity,
          error: "Sprint is not completed because some tickets are not done",
        )
      end

      { ok: true, sprint: sprint }
    end
  end
end
