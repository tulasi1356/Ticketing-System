# frozen_string_literal: true

# Shared `{ ok:, status:, body: }` failure shape used by services and validators.
module ValidatorResult
  private

  def failure(status, error: nil, errors: nil)
    body = {}
    body[:error] = error if error
    body[:errors] = errors if errors
    { ok: false, status: status, body: body }
  end
end
