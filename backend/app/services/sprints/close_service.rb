module Sprints
    class CloseService
        def self.call(current_user:, sprint_id:)
            new(current_user: current_user, sprint_id: sprint_id).call
        end

        def initialize(current_user:, sprint_id:)
            @current_user = current_user
            @sprint_id = sprint_id
        end

        def call
            sprint = Sprint.find_by(id: @sprint_id)
            return failure(:not_found, error: "Sprint not found") if sprint.nil?
            return failure(:forbidden, error: "Forbidden") unless @current_user.admin? || @current_user.projects.exists?(id: sprint.project_id)

            #  check all the tickets in the sprint are done
            if sprint.tickets.any? && sprint.tickets.any? { |ticket| ticket.status != "done" }
                return failure(:unprocessable_entity, error: "Sprint is not completed because some tickets are not done")
            end

            sprint.update(status: :completed)
            { ok: true, sprint: sprint }
        end

        private

        def failure(status, error: nil, errors: nil)
            body = {}
            body[:error] = error if error
            body[:errors] = errors if errors
            { ok: false, status: status, body: body }
        end
    end
end