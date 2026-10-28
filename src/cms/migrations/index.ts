import * as migration_20261027_081756_initial_cms from './20261027_081756_initial_cms';
import * as migration_20261027_092030_admin_editor_and_session_policy from './20261027_092030_admin_editor_and_session_policy';
import * as migration_20261027_112506_phase42_live_content from './20261027_112506_phase42_live_content';
import * as migration_20261028_083709_phase43_optional_english from './20261028_083709_phase43_optional_english';

export const migrations = [
  {
    up: migration_20261027_081756_initial_cms.up,
    down: migration_20261027_081756_initial_cms.down,
    name: '20261027_081756_initial_cms',
  },
  {
    up: migration_20261027_092030_admin_editor_and_session_policy.up,
    down: migration_20261027_092030_admin_editor_and_session_policy.down,
    name: '20261027_092030_admin_editor_and_session_policy',
  },
  {
    up: migration_20261027_112506_phase42_live_content.up,
    down: migration_20261027_112506_phase42_live_content.down,
    name: '20261027_112506_phase42_live_content',
  },
  {
    up: migration_20261028_083709_phase43_optional_english.up,
    down: migration_20261028_083709_phase43_optional_english.down,
    name: '20261028_083709_phase43_optional_english'
  },
];
