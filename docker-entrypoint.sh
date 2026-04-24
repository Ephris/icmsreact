#!/usr/bin/env sh
set -eu

# Ensure Apache has exactly one MPM enabled. Some base images/environments can
# end up with multiple mpm_* modules enabled, which prevents Apache from starting.
rm -f /etc/apache2/mods-enabled/mpm_*.load /etc/apache2/mods-enabled/mpm_*.conf || true
a2enmod mpm_prefork >/dev/null 2>&1 || true

exec apache2-foreground

