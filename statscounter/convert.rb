require 'csv'
require 'json'

results = Hash.new { |h,k| h[k] = Hash.new(&h.default_proc) }

Dir.glob('dump/*.csv') do |file|
  year, month = file.scan(/\d+/)

  csv = CSV.read(file)

  # skip header
  csv.shift

  csv.each do |row|
    key, *values = row
    val =  values.map(&:to_i).inject { |a, v| a + v } / values.size

    results[year][month][key] = val
  end
end

puts results.to_json
