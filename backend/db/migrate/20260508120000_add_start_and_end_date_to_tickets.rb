class AddStartAndEndDateToTickets < ActiveRecord::Migration[8.1]
  def change
    add_column :tickets, :start_date, :date unless column_exists?(:tickets, :start_date)
    add_column :tickets, :end_date, :date unless column_exists?(:tickets, :end_date)
  end
end
