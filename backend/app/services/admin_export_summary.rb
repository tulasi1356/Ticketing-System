# frozen_string_literal: true

require "csv"

class AdminExportSummary
  class << self
    def mail_subject(project_name, board_params)
      base = "Ticket export — #{project_name}"
      return "#{base} (filtered)" if filters_active?(board_params)

      base
    end

    def build_body(relation, board_params)
      project = Project.find_by(id: board_params["project_id"].to_i)
      parts = []
      parts << "Ticket system export"
      parts << "Generated at: #{Time.zone.now.iso8601}"
      parts << ""
      parts << "=== Scope ==="
      parts.concat(scope_lines(project, board_params))
      parts << "Tickets in this export: #{relation.count}"
      parts << ""

      if filters_active?(board_params)
        parts << "=== Active filters ==="
        parts.concat(filter_description_lines(board_params))
        parts << ""
      end

      parts << "=== Tickets (summary) ==="
      parts << "project | sprint | ticket | status | priority | assignee | title"
      relation.includes(:project, :sprint, :assignee).find_each do |t|
        p = t.project
        s = t.sprint
        a = t.assignee
        parts << [
          p&.name,
          s&.name,
          "##{t.id}",
          t.status,
          t.priority,
          a&.name,
          t.title.to_s.truncate(80)
        ].join(" | ")
      end
      parts << ""

      if project
        parts << "=== Project: #{project.name} (id=#{project.id}) ==="
        parts << "Description: #{project.description}"
        parts << ""

        counts = relation.group(:status).count
        parts << "Tickets by status (within this export):"
        Ticket.statuses.each_key do |status|
          int_key = Ticket.statuses[status]
          n = counts[int_key] || 0
          parts << "  #{status}: #{n}"
        end
        parts << ""

        parts << "Sprints (project):"
        project.sprints.order(:id).each do |sp|
          parts << "  - #{sp.name} | #{sp.start_date}..#{sp.end_date} | sprint_status=#{sp.status}"
        end
        parts << ""
      end

      parts.join("\n")
    end

    def csv_for_relation(relation)
      CSV.generate(headers: true, write_headers: true) do |csv|
        csv << %w[
          project_id
          project_name
          sprint_id
          sprint_name
          sprint_status
          sprint_start_date
          sprint_end_date
          ticket_id
          title
          ticket_status
          priority
          issue_type
          assignee_id
          assignee_name
          assignee_email
          ticket_start_date
          ticket_end_date
        ]

        relation.includes(:project, :sprint, :assignee).find_each do |t|
          sp = t.sprint
          pr = t.project
          a = t.assignee
          csv << [
            pr&.id,
            pr&.name,
            sp&.id,
            sp&.name,
            sp&.status,
            sp&.start_date&.iso8601,
            sp&.end_date&.iso8601,
            t.id,
            t.title,
            t.status,
            t.priority,
            t.issue_type,
            a&.id,
            a&.name,
            a&.email,
            t.start_date&.iso8601,
            t.end_date&.iso8601
          ]
        end
      end
    end

    def filters_active?(p)
      return false if p.blank?

      p = p.stringify_keys
      q = p["q"].to_s.strip
      return true if q.present?

      return true if Array(p["priorities"]).reject(&:blank?).any?
      return true if Array(p["statuses"]).reject(&:blank?).any?

      ids = Array(p["assignee_ids"]).flat_map { |v| v.to_s.split(",") }.map { |s| s.strip.to_i }.reject(&:zero?)
      return true if ids.any?

      return true if p["date_from"].present? || p["date_to"].present?

      false
    end

    private

    def scope_lines(project, board_params)
      p = board_params.stringify_keys
      view = (p["board_view"].presence || "sprint").to_s
      lines = []
      lines << "Project: #{project&.name || "id=#{p['project_id']}"} (id=#{p['project_id']})"
      lines << "Board view: #{view}"

      case view
      when "sprint"
        sid = p["sprint_id"].to_i
        sp = sid.positive? ? Sprint.find_by(id: sid) : nil
        lines << "Sprint: #{sp&.name || sid} (id=#{sid})"
      when "all"
        lines << "Sprint: all sprints in project"
      when "mine"
        lines << "Sprint: tickets assigned to exporting admin (current user in job)"
      when "backlog"
        lines << "Sprint: backlog (no sprint)"
      end
      lines
    end

    def filter_description_lines(board_params)
      p = board_params.stringify_keys
      lines = []
      lines << "Search (title): #{p['q']}" if p["q"].to_s.strip.present?

      pr = Array(p["priorities"]).reject(&:blank?).map(&:to_s).uniq
      lines << "Priorities: #{pr.join(', ')}" if pr.any?

      st = Array(p["statuses"]).reject(&:blank?).map(&:to_s).uniq
      lines << "Statuses: #{st.join(', ')}" if st.any?

      ids = Array(p["assignee_ids"]).flat_map { |v| v.to_s.split(",") }.map { |s| s.strip.to_i }.reject(&:zero?).uniq
      if ids.any?
        names = User.where(id: ids).pluck(:id, :name).to_h
        label = ids.map { |id| names[id].present? ? "#{names[id]} (#{id})" : id.to_s }.join(", ")
        lines << "Assignees: #{label}"
      end

      lines << "Date overlap from: #{p['date_from']}" if p["date_from"].present?
      lines << "Date overlap to: #{p['date_to']}" if p["date_to"].present?
      lines << "(none — full board scope)" if lines.empty?
      lines
    end
  end
end
