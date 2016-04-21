require 'nokogiri'
require 'json'

results = Hash.new { |h,k| h[k] = Hash.new(&h.default_proc) }

Dir.glob('dump/*.html') do |file|
  doc = Nokogiri::HTML(File.open(file))

  wbms = doc.xpath('/html/body/div[4]/div/div/div[2]/div[1]/div')
  bars = wbms.xpath('div[contains(@class,"bar")]')

  year, month = file.scan(/\d+/)

  bars.each do |bar|
    key = bar.xpath('div[contains(@class, "lab")]').first.content
    val = bar.xpath('div[contains(@class, "value")]').first.content.to_f

    results[year][month][key] = val
  end
end

puts results.to_json
