# frozen_string_literal: true

# After a ticket is saved or deleted, bump a single cache number for that project.
# Board stats use that number in the cache key so old counts are not reused.
module BumpsProjectBoardCache
  extend ActiveSupport::Concern

  included do
    after_commit :bump_board_stats_cache!, on: %i[create update destroy]
  end

  class_methods do
    def board_stats_generation_cache_key(project_id)
      "ticket_board_stats_gen/#{project_id}"
    end
  end

  private

  def bump_board_stats_cache!
    return if project_id.blank?

    Rails.cache.write(self.class.board_stats_generation_cache_key(project_id), Time.current.to_f)
  end
end
