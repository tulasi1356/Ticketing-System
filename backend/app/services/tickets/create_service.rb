# frozen_string_literal: true

module Tickets
  class CreateService
    def self.call(params:)
      new(params: params).call
    end

    def initialize(params:)
      @params = params
    end

    def call
      attrs = @params.permit(
        :title,
        :description,
        :status,
        :issue_type,
        :priority,
        :project_id,
        :sprint_id,
        :assignee_id,
        :start_date,
        :end_date
      )

      validated = PersistValidator.call_create(attrs: attrs)
      return validated unless validated[:ok]

      sprint = validated[:sprint]
      Rails.logger.info("sprint: #{sprint.to_json}")

      ticket = Ticket.new(attrs)
      if ticket.save
        ticket.reload
        { ok: true, ticket: ticket }
      else
        failure(:unprocessable_entity, errors: ticket.errors.full_messages)
      end
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
