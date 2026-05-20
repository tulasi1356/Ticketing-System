# frozen_string_literal: true

class JsonWebToken
  ALGORITHM = "HS256"
  ACCESS_TOKEN_TTL = 7.days

  class << self
    def encode(user_id)
      now = Time.current.to_i
      payload = {
        sub: user_id,
        iat: now,
        exp: now + ACCESS_TOKEN_TTL.to_i
      }
      JWT.encode(payload, secret, ALGORITHM)
    end

    # Returns indifferent-access hash or nil if invalid / expired.
    def decode(token)
      decoded = JWT.decode(token, secret, true, { algorithm: ALGORITHM })
      decoded.first.with_indifferent_access
    rescue JWT::ExpiredSignature, JWT::DecodeError, JWT::VerificationError
      nil
    end

    private

    def secret
      ENV.fetch("JWT_SECRET_KEY", Rails.application.secret_key_base)
    end
  end
end
