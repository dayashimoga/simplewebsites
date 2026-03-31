variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
  default     = ""
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for the custom domain (leave empty to skip domain/email/security config)"
  type        = string
  default     = ""
}

variable "custom_domain" {
  description = "Custom domain name (e.g., stackytools.xyz)"
  type        = string
  default     = ""
}

variable "contact_email" {
  description = "Destination email for contact@ and support@ forwarding"
  type        = string
  default     = "dayahere@gmail.com"
}

variable "subdomain_config" {
  description = "Map of site project names to their subdomain prefixes (e.g., picker-wheel = picker)"
  type        = map(string)
  default     = {}
}

variable "site_names" {
  description = <<EOT
List of site project names for Cloudflare Pages.
To DELETE/DESTROY a website deployment, comment it out or remove it from this list, then run `terraform apply`.
To REDEPLOY a website, add it back to this list and run `terraform apply`.
EOT
  type        = list(string)
  default = [
    "admin-dashboard",
    "age-currency-toolkit",
    "ascii-art-generator",
    "audio-trimmer",
    "awesome-free-tools",
    "aws-cost-estimator",
    "baby-face-generator",
    "bill-splitter",
    "chemistry-lab",
    "cicd-visualizer",
    "cloud-service-comparison",
    "code-explainer",
    "color-blindness-simulator",
    "color-palette-extractor",
    "css-shadow-gradient",
    "decision-matrix",
    "dev-toolkit",
    "dna-sequence-analyzer",
    "electricity-cost-calculator",
    "emoji-translator",
    "face-shape-detector",
    "festival-countdown",
    "font-pair-previewer",
    "git-command-builder",
    "glassmorphism-generator",
    "gradient-wallpaper-maker",
    "gravity-maze",
    "grocery-list",
    "habit-tracker",
    "height-comparison",
    "home-maintenance-tracker",
    "image-upscaler",
    "invoice-generator",
    "json-yaml-formatter",
    "keyboard-shortcut-finder",
    "loan-visualizer",
    "magic-8-ball",
    "mandala-drawer",
    "markdown-editor",
    "meme-generator",
    "memory-card-game",
    "mock-data-generator",
    "mood-board-generator",
    "morse-code-translator",
    "noise-meter",
    "password-toolkit",
    "pattern-blast",
    "pdf-toolkit",
    "periodic-table",
    "pet-breed-identifier",
    "picker-wheel",
    "pixel-art-maker",
    "pomodoro-timer",
    "qr-code-generator",
    "rank-everything",
    "readability-analyzer",
    "regex-tester",
    "resume-ats-checker",
    "rhythm-tap-game",
    "roman-numeral-converter",
    "screenshot-beautifier",
    "seo-meta-generator",
    "sleep-calculator",
    "smart-savings-goal",
    "solar-system-explorer",
    "soundboard-synth",
    "startup-idea-generator",
    "svg-optimizer",
    "temp-mail",
    "terraform-snippet-generator",
    "text-diff-checker",
    "timezone-scheduler",
    "trivia-quiz-game",
    "typing-speed-race",
    "uuid-generator",
    "video-compressor",
    "weather-simulator",
    "word-scramble",
    "world-clock",
    "writing-speech-studio"
  ]
}
