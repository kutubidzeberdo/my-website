#!/usr/bin/env python3
"""Create only the new PMC database on PostgreSQL 17:5433; never overwrite secrets."""
from pathlib import Path
from urllib.parse import quote
import os
import re
import secrets
import subprocess
import sys

PSQL = '/usr/local/opt/postgresql@17/bin/psql'
BASE = [PSQL, '-X', '-w', '-h', '127.0.0.1', '-p', '5433', '-U', 'giorgi', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1']

def query(sql):
    result = subprocess.run(BASE + ['-At'], input=sql, text=True, capture_output=True)
    if result.returncode:
        sys.exit('Database operation failed. Details suppressed to protect credentials; inspect the database state before retrying.')
    return result.stdout.strip()

path = Path('.env.local')
existing = path.read_text() if path.exists() else ''
for name in ['.env', '.env.local', '.env.development', '.env.development.local']:
    p = Path(name)
    if p.exists() and re.search(r'^\s*(?:export\s+)?(?:DATABASE_URL|PAYLOAD_SECRET)\s*=', p.read_text(), re.M):
        sys.exit('Existing CMS settings found; refusing to replace credentials.')
if os.environ.get('DATABASE_URL') or os.environ.get('PAYLOAD_SECRET'):
    sys.exit('Existing CMS environment variables found; refusing to replace credentials.')
version = query('SHOW server_version_num;')
if not version.isdigit() or not 170000 <= int(version) < 180000:
    sys.exit('Refusing to operate on a server other than PostgreSQL 17.')
if query("SELECT 1 FROM pg_roles WHERE rolname='pmc_app';") or query("SELECT 1 FROM pg_database WHERE datname='pmc_cms';"):
    sys.exit('Role or database already exists; no changes made. Inspect rather than overwrite.')
password = secrets.token_hex(32)
# Generated hexadecimal password has no SQL metacharacters. SQL is supplied via
# stdin, never command arguments, files, application logs or tool output.
query("SET password_encryption = 'scram-sha-256'; CREATE ROLE pmc_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD '" + password + "';")
query('CREATE DATABASE pmc_cms OWNER pmc_app;')
url = 'postgresql://pmc_app:' + quote(password, safe='') + '@127.0.0.1:5433/pmc_cms'
fd = os.open(path, os.O_WRONLY | os.O_APPEND | os.O_CREAT, 0o600)
with os.fdopen(fd, 'a') as stream:
    stream.write(('\n' if existing and not existing.endswith('\n') else '') + 'DATABASE_URL=' + url + '\nPAYLOAD_SECRET=' + secrets.token_hex(48) + '\n')
os.chmod(path, 0o600)
print('Created pmc_app and pmc_cms on PostgreSQL 17:5433; saved local secrets without displaying them.')
