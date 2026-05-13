# frozen_string_literal: true

module Tickets
  class PersistValidator
    include ValidatorResult

    def self.call_create(attrs:)
      new.validate_create(attrs)
    end

    def self.call_update(ticket:, permitted_attrs:)
      new.validate_update(ticket, permitted_attrs)
    end

    def validate_create(attrs)
      project = Project.find_by(id: attrs[:project_id])
      return failure(:not_found, error: "Project not found") if project.nil?
      unless Current.user.admin? || Current.user.projects.exists?(id: project.id)
        return failure(:forbidden, error: "Forbidden")
      end

      err = assignee_must_be_project_member_failure(project, attrs[:assignee_id])
      return err if err

      sprint = Sprint.find_by(id: attrs[:sprint_id])
      return failure(:not_found, error: "Sprint not found") if sprint.nil?

      if sprint.status == "completed"
        return failure(
          :unprocessable_entity,
          error: "Sprint is already completed, so you cannot create tickets for it",
        )
      end

      if sprint.end_date < Date.today
        return failure(
          :unprocessable_entity,
          error: "Sprint is already completed, so you cannot create tickets for it",
        )
      end

      if sprint.start_date >= attrs[:start_date].to_date && sprint.end_date <= attrs[:end_date].to_date
        return failure(
          :unprocessable_entity,
          error: "Start date must be after or equal to sprint start date and end date must be before or equal to sprint end date",
        )
      end

      { ok: true, sprint: sprint }
    end

    def validate_update(ticket, permitted_attrs)
      return failure(:not_found, error: "Ticket not found") if ticket.nil?
      unless Current.user.admin? || Current.user.projects.exists?(id: ticket.project_id)
        return failure(:forbidden, error: "Forbidden")
      end

      err = assignee_must_be_project_member_failure(ticket.project, permitted_attrs[:assignee_id])
      return err if err

      sprint_data = Sprint.find_by(id: permitted_attrs[:sprint_id])
      if sprint_data.present? && sprint_data.end_date < Date.today
        return failure(
          :unprocessable_entity,
          error: "Sprint is already completed, so you cannot update tickets for it",
        )
      end

      if sprint_data.present? && sprint_data.start_date > ticket.start_date && sprint_data.end_date < ticket.end_date
        return failure(
          :unprocessable_entity,
          error: "Start date must be after or equal to sprint start date and end date must be before or equal to sprint end date",
        )
      end

      { ok: true }
    end

    private

    def assignee_must_be_project_member_failure(project, assignee_id)
      return nil if assignee_id.blank?
      return nil if project.users.exists?(id: assignee_id)

      failure(:unprocessable_entity, error: "Assignee must be a member of this project")
    end
  end
end
