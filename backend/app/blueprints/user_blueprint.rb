# frozen_string_literal: true

class UserBlueprint < Blueprinter::Base
  identifier :id

  # Board list: matches previous tickets#index assignee shape
  view :board do
    fields :name, :email
  end

  # Single ticket: matches previous create/update assignee shape
  view :detail do
    fields :name, :email, :role
  end
end
