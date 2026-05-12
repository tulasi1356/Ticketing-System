# frozen_string_literal: true

class TicketBlueprint < Blueprinter::Base
  identifier :id

  fields :assignee_id,
         :attachment_urls,
         :created_at,
         :description,
         :end_date,
         :issue_type,
         :priority,
         :project_id,
         :sprint_id,
         :start_date,
         :status,
         :title,
         :updated_at

  view :board do
    include_view :default
    association :assignee, blueprint: UserBlueprint, view: :board
  end

  view :detail do
    include_view :default
    association :assignee, blueprint: UserBlueprint, view: :detail
  end
end
