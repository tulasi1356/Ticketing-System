# frozen_string_literal: true

module Tickets
  class BoardQueryService
    def self.call(params:)
      new(params: params).call
    end

    def initialize(params:)
      @params = params
    end

    def call
      checked = BoardQueryValidator.call(params: @params)
      return checked unless checked[:ok]

      ctx = checked[:context]
      relation = build_relation(ctx)
      rel = relation[:relation]
      project_id = ctx[:project_id]
      stats = cached_stats_for(rel, project_id)
      { ok: true, relation: rel, stats: stats }
    end

    private

    def build_relation(ctx)
      project_id = ctx[:project_id]
      board_view = ctx[:board_view]
      sprint_id = ctx[:sprint_id]

      scope = Ticket.includes(:assignee).where(project_id: project_id)

      case board_view
      when "sprint"
        scope = scope.where(sprint_id: sprint_id)
      when "all"
        # scoped to project only
      when "mine"
        scope = scope.where(assignee_id: Current.user.id)
      when "backlog"
        scope = scope.where(sprint_id: nil)
      end

      scope = apply_ticket_filters(scope, project_id)
      { ok: true, relation: scope.order(priority: :desc, id: :asc) }
    end

    def apply_ticket_filters(scope, project_id)
      if @params[:q].present?
        term = "%#{ActiveRecord::Base.sanitize_sql_like(@params[:q].to_s.downcase)}%"
        scope = scope.where("LOWER(tickets.title) LIKE ?", term)
      end

      priorities = enum_tokens_param(@params[:priorities], Ticket.priorities.keys)
      scope = scope.where(priority: priorities) if priorities.any?

      statuses = enum_tokens_param(@params[:statuses], Ticket.statuses.keys)
      scope = scope.where(status: statuses) if statuses.any?

      assignee_ids = integer_list_param(@params[:assignee_ids])
      if assignee_ids.any?
        allowed = Project.find(project_id).user_ids
        filtered = assignee_ids & allowed
        scope = scope.where(assignee_id: filtered)
      end

      from = @params[:date_from].presence
      to = @params[:date_to].presence
      if from.present? || to.present?
        range_start = from || "1000-01-01"
        range_end = to || "9999-12-31"
        scope = scope.where.not(start_date: nil).where.not(end_date: nil)
        scope = scope.where(
          "NOT (tickets.end_date < ? OR tickets.start_date > ?)",
          range_start,
          range_end
        )
      end

      scope
    end

    def cached_stats_for(relation, project_id)
      gen = Rails.cache.read(Ticket.board_stats_generation_cache_key(project_id)) || 0
      filters = board_stats_filters_key
      Rails.logger.info("filters: #{filters}")
      Rails.cache.fetch(["ticket_board_stats", project_id, gen, filters], expires_in: 5.minutes) do
        stats_for(relation)
      end
    end

    def board_stats_filters_key
      prio = enum_tokens_param(@params[:priorities], Ticket.priorities.keys).sort.join(",")
      stat = enum_tokens_param(@params[:statuses], Ticket.statuses.keys).sort.join(",")
      assigns = integer_list_param(@params[:assignee_ids]).sort.join(",")
      [
        (@params[:board_view].presence || "sprint"),
        @params[:sprint_id].to_s,
        @params[:q].to_s.downcase.strip,
        prio,
        stat,
        assigns,
        @params[:date_from].to_s,
        @params[:date_to].to_s,
        Current.user.id
      ].join("|")
    end

    def stats_for(relation)
      Rails.logger.info("Entering stats_for")
      {
        total: relation.count,
        todo: relation.where(status: :todo).count,
        done: relation.where(status: :done).count,
        high_priority: relation.where(priority: :high).count
      }
    end

    def enum_tokens_param(raw, allowed_keys)
      keys = allowed_keys.map(&:to_s)
      tokens = coalesce_string_list(raw).map(&:strip).map(&:downcase).reject(&:blank?)
      tokens.uniq.select { |t| keys.include?(t) }
    end

    def coalesce_string_list(raw)
      case raw
      when Array
        raw.flat_map { |v| v.to_s.split(",") }
      when String
        raw.split(",")
      else
        []
      end
    end

    def integer_list_param(raw)
      coalesce_string_list(raw).map { |s| s.strip.to_i }.reject { |n| n <= 0 }.uniq
    end
  end
end
