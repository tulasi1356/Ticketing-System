# frozen_string_literal: true

module Tickets
  class UpdateService
    def self.call(ticket_id:, permitted_attrs:)
      new(ticket_id: ticket_id, permitted_attrs: permitted_attrs).call
    end

    def initialize(ticket_id:, permitted_attrs:)
      @ticket_id = ticket_id
      @permitted_attrs = permitted_attrs
    end

    def call
      ticket = Ticket.find_by(id: @ticket_id)
      validated = PersistValidator.call_update(ticket: ticket, permitted_attrs: @permitted_attrs)
      return validated unless validated[:ok]

      Rails.logger.info("permitted_attrs: #{@permitted_attrs.to_json}")

      if ticket.update(@permitted_attrs)
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
