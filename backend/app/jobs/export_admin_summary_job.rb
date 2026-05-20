# frozen_string_literal: true

class ExportAdminSummaryJob < ApplicationJob
  queue_as :default

  # +board_params+ matches the board index API (project, sprint, view, filters).
  def perform(user_id, board_params = {})
    board_params = {} unless board_params.is_a?(Hash)
    board_params = board_params.stringify_keys

    user = User.find_by(id: user_id)
    return unless user&.admin?

    Current.user = user
    result = Tickets::BoardQueryService.call(params: ActionController::Parameters.new(board_params))
    unless result[:ok]
      Rails.logger.warn(
        "[ExportAdminSummaryJob] Skipping export: user_id=#{user_id} params=#{board_params.inspect} " \
        "status=#{result[:status]} body=#{result[:body].inspect}"
      )
      return
    end

    relation = result[:relation]
    project = Project.find_by(id: board_params["project_id"].to_i)

    to = ENV["EXPORT_MAIL_TO"].presence || user.email
    Rails.logger.info(
      "[ExportAdminSummaryJob] Sending export to recipient=#{to} (triggered by admin id=#{user.id}" \
      "#{ENV['EXPORT_MAIL_TO'].present? ? ', EXPORT_MAIL_TO override' : ''})"
    )

    dm = ActionMailer::Base.delivery_method
    Rails.logger.info("[ExportAdminSummaryJob] Delivery method: #{dm}")
    if dm.to_sym == :file
      loc = Rails.application.config.action_mailer.file_settings[:location]
      Rails.logger.info("[ExportAdminSummaryJob] File location: #{loc}")
      Rails.logger.warn(
        "[ExportAdminSummaryJob] Log says \"Delivered mail\" but delivery is :file — nothing is sent over the internet. " \
        "Messages go under #{loc}. Set SENDGRID_API_KEY + SENDGRID_FROM_EMAIL in backend/ticketing_api/.env and restart Sidekiq."
      )
    else
      Rails.logger.info("[ExportAdminSummaryJob] Sending email via #{dm} (SMTP).")
    end

    ExportMailer.admin_summary(user, relation, board_params, project: project).deliver_now
  ensure
    Current.user = nil
  end
end
