# frozen_string_literal: true

class ExportMailer < ApplicationMailer
  def admin_summary(user, relation, board_params, project:)
    project_name = project&.name.presence || "Project #{board_params['project_id']}"
    @body = AdminExportSummary.build_body(relation, board_params)
    ts = Time.zone.now.strftime("%Y%m%d-%H%M%S")
    attachments["ticket-export-#{ts}.csv"] = {
      mime_type: "text/csv; charset=utf-8",
      content: AdminExportSummary.csv_for_relation(relation)
    }
    to = ENV["EXPORT_MAIL_TO"].presence || user.email
    mail(
      to: to,
      subject: AdminExportSummary.mail_subject(project_name, board_params)
    )
  end
end
