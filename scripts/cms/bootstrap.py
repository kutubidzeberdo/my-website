#!/usr/bin/env python3
"""Private local first-administrator setup. Password never enters argv/history."""
from pathlib import Path
import getpass
import json
import os
import secrets
import subprocess
import sys

if '--generate-local' in sys.argv:
    target=Path('.cms-backups/initial-admin.json')
    if target.exists():
        sys.exit('Initial credentials file already exists; refusing to overwrite it.')
    data={'username':'pmc-admin','email':'ajarapmcpr@gmail.com','password':secrets.token_urlsafe(30)}
else:
    data={'username':input('Administrator username: ').strip(),'email':input('Recovery email: ').strip(),'password':getpass.getpass('Password (8+ characters): ')}
    if data['password'] != getpass.getpass('Confirm password: '):
        sys.exit('Passwords do not match.')
result=subprocess.run(['node','--import','tsx','scripts/cms/bootstrap.ts'],input=json.dumps(data),text=True,capture_output=True)
if result.returncode:
    sys.exit('Administrator creation failed (or an account already exists). No credentials changed; inspect setup locally.')
if '--generate-local' in sys.argv:
    target.parent.mkdir(mode=0o700,exist_ok=True)
    fd=os.open(target,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
    with os.fdopen(fd,'w') as f:json.dump(data,f)
    print('Initial administrator created. Credentials saved privately in .cms-backups/initial-admin.json; change the password after first login.')
else:
    print('Initial administrator created; use the username and password you supplied at /admin.')
