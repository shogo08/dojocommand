import assert from 'node:assert/strict';
import {mkdtemp,writeFile,mkdir,symlink,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {verificationEvent,verifiedFiles} from './build-runner.mjs';
const event=(command,exit_code)=>({type:'item.completed',item:{type:'command_execution',command,exit_code}});
assert.ok(verificationEvent([event('node verify.mjs',0)]));
assert.ok(verificationEvent([event("/bin/zsh -lc 'node verify.mjs'",0)]));
assert.ok(verificationEvent([event('cd /tmp/project && node verify.mjs',0)]));
assert.equal(verificationEvent([event('echo node verify.mjs',0)]),undefined);
assert.ok(verificationEvent([event("/bin/zsh -lc 'cat > a <<EOF\nvalue\nEOF\nnode verify.mjs'",0)]));
assert.equal(verificationEvent([event("/bin/zsh -lc 'cat > a <<EOF\nnode verify.mjs'",0)]),undefined);
assert.equal(verificationEvent([event('node verify.mjs',0),event('node verify.mjs',1)]),undefined);
assert.ok(verificationEvent([event('node verify.mjs',1),event('node verify.mjs',0)]));
const tmp=await mkdtemp(path.join(os.tmpdir(),'dojo-build-check-'));
try{
 const project=path.join(tmp,'project');await mkdir(project);await writeFile(path.join(project,'app.mjs'),'export const value=1;');await writeFile(path.join(project,'verify.mjs'),'');
 assert.equal((await verifiedFiles(project,['app.mjs','verify.mjs'])).length,2);
 await assert.rejects(()=>verifiedFiles(project,['../outside.mjs','verify.mjs']));
 await writeFile(path.join(tmp,'outside.mjs'),'');await symlink(path.join(tmp,'outside.mjs'),path.join(project,'escape.mjs'));
 await assert.rejects(()=>verifiedFiles(project,['escape.mjs','verify.mjs']));
 await assert.rejects(()=>verifiedFiles(project,['app.mjs']));
 await assert.rejects(()=>verifiedFiles(project,['missing.mjs','verify.mjs']));
}finally{await rm(tmp,{recursive:true,force:true});}
console.log('Build delivery checks passed: actual files, path containment, missing files, real verification events and failed checks.');
