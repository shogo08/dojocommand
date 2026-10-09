import {mkdirSync,writeFileSync,existsSync,unlinkSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const action=process.argv[2]||'status';
const domain=`gui/${process.getuid()}`;
const agents=path.join(os.homedir(),'Library','LaunchAgents');
const logs=path.join(project,'.dojo-service');
const labels=['com.dojo.command.server','com.dojo.command.worker'];
const xml=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function plist(label,mode){return `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict>
<key>Label</key><string>${label}</string>
<key>ProgramArguments</key><array><string>${xml(process.execPath)}</string><string>${xml(path.join(project,'scripts','dojo-service.mjs'))}</string><string>${mode}</string></array>
<key>WorkingDirectory</key><string>${xml(project)}</string>
<key>EnvironmentVariables</key><dict><key>PATH</key><string>${xml(path.dirname(process.execPath))}:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin</string></dict>
<key>RunAtLoad</key><true/><key>KeepAlive</key><true/><key>ThrottleInterval</key><integer>15</integer>
<key>StandardOutPath</key><string>${xml(path.join(logs,mode+'.log'))}</string>
<key>StandardErrorPath</key><string>${xml(path.join(logs,mode+'.log'))}</string>
</dict></plist>\n`;}
function ctl(args,optional=false){try{return execFileSync('/bin/launchctl',args,{encoding:'utf8',stdio:['ignore','pipe','pipe']});}catch(e){if(!optional)throw Error(e.stderr?.toString()||e.message);return '';}}
if(action==='plan'){
 mkdirSync(logs,{recursive:true});
 for(let i=0;i<labels.length;i++)writeFileSync(path.join(logs,labels[i]+'.plist'),plist(labels[i],i?'worker':'server'));
 console.log('Prepared login services in',logs);
}else if(action==='install'){
 // Hand over an existing manual worker only when it belongs to this checkout.
 const workerRoot=existsSync(path.join(project,'worker','worker.mjs'))?path.join(project,'worker'):path.join(project,'..','dojo-worker');
 let pid;try{pid=execFileSync('/usr/sbin/lsof',['-t','-nP','-iTCP:5174','-sTCP:LISTEN'],{encoding:'utf8'}).trim();}catch{}
 if(pid && /^\d+$/.test(pid)){
  const cwd=execFileSync('/usr/sbin/lsof',['-a','-p',pid,'-d','cwd','-Fn'],{encoding:'utf8'}).split('\n').find(line=>line.startsWith('n'))?.slice(1);
  if(path.resolve(cwd||'/')===path.resolve(workerRoot)){
   process.kill(Number(pid),'SIGTERM');
   console.log('Waiting for the manual worker to finish its current mission…');
   let exited=false;for(let i=0;i<620;i++){try{process.kill(Number(pid),0);}catch{exited=true;break;}await delay(1000);}
   if(!exited)throw Error('Manual worker still running. Try installation after its current mission ends.');
  }else throw Error('Port 5174 belongs to another checkout. Stop that worker before installation.');
 }
 mkdirSync(agents,{recursive:true});mkdirSync(logs,{recursive:true});
 for(let i=0;i<labels.length;i++){const file=path.join(agents,labels[i]+'.plist');ctl(['bootout',domain+'/'+labels[i]],true);writeFileSync(file,plist(labels[i],i?'worker':'server'));ctl(['bootstrap',domain,file]);console.log('Enabled:',labels[i]);}
}else if(action==='remove'){
 for(const label of labels){ctl(['bootout',domain+'/'+label],true);const file=path.join(agents,label+'.plist');if(existsSync(file))unlinkSync(file);console.log('Removed:',label);}
}else if(action==='status'){
 for(const label of labels)console.log(ctl(['print',domain+'/'+label],true)||`${label}: not installed`);
}else throw Error('Use plan, install, status or remove');
