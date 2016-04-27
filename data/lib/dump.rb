require 'lib/w3counter'
require 'lib/statcounter'

class Dump < Hash
  def initialize(path)
    self.merge!(W3Counter.new(path))
    self.merge!(StatCounter.new(path))
  end
end
