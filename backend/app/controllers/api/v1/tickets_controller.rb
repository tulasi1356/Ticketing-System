# frozen_string_literal: true

module Api::V1
  class TicketsController < ApplicationController
    include Pagy::Method

    before_action :require_current_user
    before_action :require_admin!, only: [:export]

    def create
      result = Tickets::CreateService.call(params: params)
      if result[:ok]
        ticket = result[:ticket]
        render json: TicketBlueprint.render_as_hash(ticket, view: :detail), status: :created
      else
        render json: result[:body], status: result[:status]
      end
    end

    def update
      result = Tickets::UpdateService.call(
        ticket_id: params[:id],
        permitted_attrs: ticket_update_params
      )
      if result[:ok]
        ticket = result[:ticket]
        render json: TicketBlueprint.render_as_hash(ticket, view: :detail), status: :ok
      else
        render json: result[:body], status: result[:status]
      end
    end

    def index
      result = Tickets::BoardQueryService.call(params: params)
      unless result[:ok]
        render json: result[:body], status: result[:status]
        return
      end

      page = params[:page].presence&.to_i
      page = 1 if page.nil? || page < 1

      Rails.logger.info("result[:relation]: #{result[:relation].to_sql}")

      @pagy, records = pagy(:offset, result[:relation], page: page, limit: 8)

      render json: {
        tickets: TicketBlueprint.render_as_hash(records, view: :board),
        meta: {
          page: @pagy.page,
          per_page: @pagy.limit,
          total: @pagy.count,
          total_pages: @pagy.pages,
          has_more: @pagy.page < @pagy.pages
        },
        stats: result[:stats]
      }, status: :ok
    end

    def export
      job = ExportAdminSummaryJob.perform_later(current_user.id, params[:project_id])
      render json: {
        message: "Export queued. You will receive an email with a CSV attachment shortly.",
        job_id: job.job_id
      }, status: :accepted
    end

    private

    def ticket_update_params
      params.permit(
        :title,
        :description,
        :status,
        :priority,
        :issue_type,
        :assignee_id,
        :sprint_id,
        :start_date,
        :end_date,
        attachment_urls: []
      )
    end
  end
end
