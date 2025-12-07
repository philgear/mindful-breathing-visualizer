require_relative 'lib/mindful_breathing/version'

Gem::Specification.new do |spec|
  spec.name          = "mindful_breathing"
  spec.version       = MindfulBreathing::VERSION
  spec.authors       = ["Mindful Dev"]
  spec.email         = ["dev@mindful.example"]

  spec.summary       = "A CLI for mindful breathing exercises."
  spec.description   = "Visualizes Box, Diaphragmatic, and Alternate Nostril breathing in the terminal."
  spec.homepage      = "https://github.com/philgear/mindful-breathing-visualizer"
  spec.license       = "MIT"
  spec.required_ruby_version = Gem::Requirement.new(">= 2.4.0")

  spec.files         = Dir.chdir(File.expand_path('..', __FILE__)) do
    `git ls-files -z`.split("\x0").reject { |f| f.match(%r{^(test|spec|features)/}) }
  end
  spec.bindir        = "exe"
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
