#!/usr/bin/env python3
"""Verify CMS connectivity AND password enforcement without printing secrets."""
from pathlib import Path
from urllib.parse import urlparse, unquote
import os
import secrets
import subprocess
import sys

values = {}
for line in Path('.env.local').read_text().splitlines():
    if '=' in line and not line.lstrip().startswith('#'):
        key, value = line.split('=', 1)
        values[key.strip()] = value.strip()
u = urlparse(values['DATABASE_URL'])
if (u.hostname, u.port, u.username, u.path) != ('127.0.0.1', 5433, 'pmc_app', '/pmc_cms'):
    sys.exit('Unexpected CMS target; refusing to test another database.')
env = os.environ.copy()
env.update(PGHOST=u.hostname, PGPORT=str(u.port), PGUSER=unquote(u.username), PGDATABASE=u.path[1:], PGPASSWORD=unquote(u.password), PGCONNECT_TIMEOUT='5')
cmd = ['/usr/local/opt/postgresql@17/bin/psql', '-X', '-w', '-At', '-c', 'SELECT current_user, current_database(), inet_server_port();']
good = subprocess.run(cmd, env=env, capture_output=True, text=True)
if good.returncode:
    sys.exit('Configured application connection failed; details suppressed to protect secrets.')
env['PGPASSWORD'] = secrets.token_hex(32)
bad = subprocess.run(cmd, env=env, capture_output=True, text=True)
if bad.returncode == 0:
    sys.exit('BLOCKED: an incorrect password was accepted. Configure scoped SCRAM rules before continuing.')
if 'password authentication failed' not in bad.stderr:
    sys.exit('Incorrect-password connection failed for an unverified reason; inspect authentication locally.')
print('PASS: configured credentials connect to pmc_app / pmc_cms / 5433; incorrect password is rejected.')
