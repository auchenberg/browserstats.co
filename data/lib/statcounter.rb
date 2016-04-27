require 'csv'

class StatCounter < Hash
  def initialize(path)
    self[:statcounter] = {
      browser_country: {
        browser_names: {},
        results: []
      }
    }

    Dir.glob(File.join(path, 'statcounter/*.csv')) do |file|
      kind, year, month = file.scan(/([a-z]+)-[a-z]+-(\d+)-(\d+)/).first

      csv = CSV.read(file)

      # skip header
      csv.shift

      data_point = {
        year: year.to_i,
        month: month.to_i
      }

      csv.each do |row|
        key, *values = row
        val =  values.map(&:to_i).inject { |a, v| a + v } / values.size

        next if val == 0

        slug = key.downcase.strip.gsub(/[^\w]+/, ' ').gsub(' ', '-')
        self[:statcounter][:browser_country][:browser_names][slug] = key

        data_point[key] = val
      end

      self[:statcounter][:browser_country][:results] << data_point
    end
  end
end
