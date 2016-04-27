require 'nokogiri'
require 'json'

results = {
  w3counter: {
    web_browser_market_share: {
      browser_names: {},
      results: []
    }
  }
}

Dir.glob('dump/*.html') do |file|
  doc = Nokogiri::HTML(File.open(file))

  wbms = doc.xpath('/html/body/div[4]/div/div/div[2]/div[1]/div')
  bars = wbms.xpath('div[contains(@class,"bar")]')

  year, month = file.scan(/\d+/)

  data_point = {
    year: year.to_i,
    month: month.to_i
  }

  bars.each do |bar|
    key = bar.xpath('div[contains(@class, "lab")]').first.content
    val = bar.xpath('div[contains(@class, "value")]').first.content.to_f

    slug = key.downcase.strip.gsub(/[^\w]+/, ' ').gsub(' ', '-')
    results[:w3counter][:web_browser_market_share][:browser_names][slug] = key

    data_point[key] = val
  end

  results[:w3counter][:web_browser_market_share][:results] << data_point
end

puts results.to_json
