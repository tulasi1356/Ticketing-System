class ApplicationController < ActionController::API
  include ActionController::Cookies

  # HttpOnly cookie set on login/sign-up; not readable from JS.
  SESSION_JWT_COOKIE = "ticketing_session_jwt"

  before_action :assign_current_user_context

  private

  def assign_current_user_context
    Current.user = current_user
  end

  def current_user
    return @current_user if defined?(@current_user)

    @current_user = user_from_bearer_token || user_from_session_cookie
  end

  def user_from_bearer_token
    auth = request.headers["Authorization"].to_s
    return nil unless auth.start_with?("Bearer ")

    token = auth.delete_prefix("Bearer ").strip
    user_from_jwt_string(token)
  end

  def user_from_session_cookie
    token = cookies[SESSION_JWT_COOKIE].presence
    user_from_jwt_string(token)
  end

  def user_from_jwt_string(token)
    return nil if token.blank?

    payload = JsonWebToken.decode(token)
    return nil if payload.blank?

    uid = payload[:sub]
    User.find_by(id: uid) if uid.present?
  end

  def set_session_jwt_cookie(token)
    cookies[SESSION_JWT_COOKIE] = {
      value: token,
      httponly: true,
      secure: Rails.env.production?,
      same_site: :lax,
      path: "/",
      max_age: JsonWebToken::ACCESS_TOKEN_TTL.to_i
    }
  end

  def clear_session_jwt_cookie!
    cookies.delete(SESSION_JWT_COOKIE, path: "/", same_site: :lax)
  end

  # Deprecated: prefer Authorization Bearer JWT from /api/v1/sessions.
  # def user_from_legacy_header
  #   user_id = request.headers["X-User-Id"].presence
  #   user_id ? User.find_by(id: user_id) : nil
  # end

  def require_current_user
    return if current_user

    render json: { error: "Unauthorized" }, status: :unauthorized
  end

  def require_admin!
    return if current_user&.admin?

    render json: { error: "Forbidden" }, status: :forbidden
  end
end
