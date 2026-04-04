# ========================================
# Cloudflare Pages Projects
# ========================================
resource "cloudflare_pages_project" "sites" {
  for_each          = toset(var.site_names)
  account_id        = var.cloudflare_account_id
  name              = each.key
  production_branch = "main"

  build_config {
    build_command   = "npm run build"
    destination_dir = "dist"
  }

  deployment_configs {
    production {
      compatibility_date = "2024-01-01"
    }
    preview {
      compatibility_date = "2024-01-01"
    }
  }
}

locals {
  # Automatically generate subdomain prefixes for every site (defaults to the site name)
  # Allows overriding specific prefixes via var.subdomain_config
  computed_subdomains = {
    for site in var.site_names : site => lookup(var.subdomain_config, site, site)
  }
}

# ========================================
# Custom Subdomains (automatically generated for all sites)
# ========================================
resource "cloudflare_pages_domain" "subdomains" {
  for_each     = var.custom_domain != "" ? local.computed_subdomains : {}
  account_id   = var.cloudflare_account_id
  project_name = each.key
  domain       = "${each.value}.${var.custom_domain}"
  depends_on   = [cloudflare_pages_project.sites]
}

resource "cloudflare_record" "subdomain_cnames" {
  for_each = var.cloudflare_zone_id != "" ? local.computed_subdomains : {}
  zone_id  = var.cloudflare_zone_id
  name     = each.value
  content  = cloudflare_pages_project.sites[each.key].subdomain
  type     = "CNAME"
  proxied  = true
}


