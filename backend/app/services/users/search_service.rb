# frozen_string_literal: true

module Users
  class SearchService
    def self.call(params:)
      new(params: params).call
    end

    def initialize(params:)
      @params = params
    end

    def call
      validated = SearchValidator.call(params: @params)
      return validated unless validated[:ok]

      query = @params[:query]

      es_query =
        if query.present?
          {
            multi_match: {
              query: query,
              type: "bool_prefix",
              fields: [
                "name^2",
                "name._2gram",
                "name._3gram",
                "email",
                "email._2gram",
                "email._3gram"
              ]
            }
          }
        else
          { match_all: {} }
        end

      scoped_query =
        if @params[:project_id].present?
          project = Project.find_by(id: @params[:project_id])
          member_ids = project.users.ids.map(&:to_s)
          return { ok: true, users: [] } if member_ids.empty?

          {
            bool: {
              must: [es_query],
              filter: [{ ids: { values: member_ids } }]
            }
          }
        else
          es_query
        end

      response = User.search(query: scoped_query)
      users = response.records.to_a
      { ok: true, users: users }
    end
  end
end
