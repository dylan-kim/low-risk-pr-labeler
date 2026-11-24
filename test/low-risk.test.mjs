// Runs the action script against mocked PRs: node test/low-risk.test.mjs
import { execSync } from 'child_process';
const wf = new URL('../action.yml', import.meta.url).pathname;
const body = execSync(`ruby -ryaml -e 'puts YAML.load_file(ARGV[0])["runs"]["steps"][0]["with"]["script"]' ${wf}`).toString();
const fn = new Function('github','context','core','process', `return (async()=>{${body}})()`);
async function run({ labelExists = true, labelColor, user = {login:'alice',type:'User'}, draft=false, merged=12, files }) {
  const calls = []; let summary;
  const github = {
    rest: { search: { issuesAndPullRequests: async () => ({ data: { total_count: merged } }) },
            pulls: { listFiles: 'lf' },
            issues: { getLabel: async () => { if (!labelExists) throw {status:404}; }, createLabel: async a => calls.push('create:'+a.color), addLabels: async a => calls.push('add'), removeLabel: async a => { calls.push('remove'); throw {status:404}; } } },
    paginate: async () => files,
  };
  const core = { summary: { addHeading(h){summary=h;return this}, addList(l){summary+=' '+l.join('; ');return this}, write(){} } };
  await fn(github, { payload:{ pull_request:{ number:1, draft, user } }, repo:{owner:'o',repo:'r'} }, core, { env: labelColor ? { LABEL_COLOR: labelColor } : {} });
  return { calls, summary };
}
const f = (filename, changes, previous_filename) => ({ filename, changes, previous_filename });
const cases = [
  ['ok', {files:[f('src/A.java',300), f('package-lock.json',5000)]}, 'add'],
  ['too big', {files:[f('src/A.java',1000)]}, 'remove'],
  ['flyway', {files:[f('src/main/resources/db/migration/V3__x.sql',2)]}, 'remove'],
  ['flyway root', {files:[f('V3__x.sql',2)]}, 'remove'],
  ['bpmn', {files:[f('proc/order.bpmn20.xml',2)]}, 'remove'],
  ['renamed away from migration', {files:[f('old/x.sql',0,'db/migration/V1__a.sql')]}, 'remove'],
  ['newbie', {merged:2, files:[f('a.ts',1)]}, 'remove'],
  ['exactly 3', {merged:3, files:[f('a.ts',1)]}, 'add'],
  ['bot', {user:{login:'dependabot[bot]',type:'Bot'}, files:[f('a.ts',1)]}, 'remove'],
  ['draft', {draft:true, files:[f('a.ts',1)]}, 'remove'],
  ['creates missing label green', {labelExists:false, files:[f('a.ts',1)]}, 'create:0E8A16 add'],
  ['custom colour, # stripped', {labelExists:false, labelColor:'#ff0000', files:[f('a.ts',1)]}, 'create:ff0000 add'],
  ['generated', {files:[f('build/generated/X.java',5000)]}, 'add'],
];
let bad = 0;
for (const [name, args, want] of cases) {
  const { calls, summary } = await run(args);
  const pass = calls.join(' ') === want; if (!pass) bad++;
  console.log(pass ? 'PASS' : 'FAIL', name, '->', summary);
}
process.exit(bad);
