# frozen_string_literal: true

module Sprints
  class CloseService
    def self.call(sprint_id:)
      new(sprint_id: sprint_id).call
    end

    def initialize(sprint_id:)
      @sprint_id = sprint_id
    end

    def call
      validated = CloseValidator.call(sprint_id: @sprint_id)
      return validated unless validated[:ok]

      sprint = validated[:sprint]
      sprint.update(status: :completed)
      { ok: true, sprint: sprint }
    end
  end
end
