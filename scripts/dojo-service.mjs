import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mode=process.argv[2];
if(!['server','worker'].includes(mode))throw Error('Expected server or worker');
const worker=existsSync(path.join(project,'worker','worker.mjs'))?path.join(project,'worker','worker.mjs'):path.join(project,'..','dojo-worker','worker.mjs');
let stopped=false, child;
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function healthy(url){try{const r=await fetch(url,{signal:AbortSignal.timeout(3000)});if(!r.ok)return false;const b=await r.json();return url.endsWith('/health')?b.service==='dojo-worker':!!b.state?.tasks;}catch{return false;}}
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{stopped=true;child?.kill(signal);});
while(!stopped){
 const url=mode==='server'?'http://127.0.0.1:5173/api/studio':'http://127.0.0.1:5174/health';
 if(await healthy(url)){await sleep(10000);continue;}
 if(mode==='worker'&&!await healthy('http://127.0.0.1:5173/api/studio')){await sleep(5000);continue;}
 console.log(new Date().toISOString(), 'Starting DOJO',mode);
 child=spawn(process.execPath,mode==='server'?[path.join(project,'scripts','run-framework.mjs'),'dev']:[worker,'--local-preview'],{cwd:mode==='server'?project:path.dirname(worker),stdio:'inherit'});
 await new Promise(resolve=>{child.once('error',e=>{console.error(e.message);resolve();});child.once('exit',resolve);});
 child=null;
 if(!stopped)await sleep(15000);
}
