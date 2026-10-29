const {test}=require('node:test');
const assert=require('node:assert/strict');
const ts=require('typescript');
const fs=require('node:fs');
const {Client}=require('pg');
const scope={exports:{}};
new Function('exports',ts.transpileModule(fs.readFileSync('src/cms/postgres-pool.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(scope.exports);
const {postgresPoolConfig}=scope.exports;
const DATABASE_URL='postgresql://test%40user:p%40ss%3Aword@db.example.invalid:25060/pmc_cms?sslmode=require&sslmode=disable&sslrootcert=missing&sslcert=missing&sslkey=missing&application_name=cms';

test('Production CA survives node-postgres parsing and conflicting URL options are removed',()=>{
  const options=postgresPoolConfig({NODE_ENV:'production',DATABASE_URL,PG_CA_CERT:'test-ca\\nsecond-line\\n'});
  const url=new URL(options.connectionString);
  const original=new URL(DATABASE_URL);
  for(const key of ['hostname','port','pathname','username','password'])assert.equal(url[key],original[key]);
  for(const key of ['sslmode','sslrootcert','sslcert','sslkey'])assert.equal(url.searchParams.has(key),false);
  assert.equal(url.searchParams.get('application_name'),'cms');
  const client=new Client(options); // Parse only; never connect.
  assert.deepEqual(client.connectionParameters.ssl,{ca:'test-ca\nsecond-line\n',rejectUnauthorized:true});
});

test('Actual PEM newlines are preserved',()=>{
  const ca='test-ca\nsecond-line\n';
  assert.equal(postgresPoolConfig({NODE_ENV:'production',DATABASE_URL,PG_CA_CERT:ca}).ssl.ca,ca);
});

test('Development and environments without a CA retain existing connection behavior',()=>{
  assert.deepEqual(postgresPoolConfig({NODE_ENV:'development',DATABASE_URL,PG_CA_CERT:'unused'}),{connectionString:DATABASE_URL});
  assert.deepEqual(postgresPoolConfig({NODE_ENV:'production',DATABASE_URL}),{connectionString:DATABASE_URL});
});
