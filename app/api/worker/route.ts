import {readState,writeState,database,sameOrigin} from '@/lib/store';
import {portfolio} from '@/lib/seed';
import {dispatchAutomaticBacklog} from '@/lib/dispatch';
async function heartbeat(capabilities:any){await database().prepare('INSERT INTO studio(id,payload,version) VALUES(?,?,0) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload').bind('worker',JSON.stringify({at:new Date().toISOString(),capabilities})).run();}
export async function POST(req:Request){
 if(!sameOrigin(req))return Response.json({error:'Request rejected'},{status:403});
 try{const body:any=await req.json();if(!['claim','complete','heartbeat'].includes(body.action))return Response.json({error:'Invalid action'},{status:400});await heartbeat(body.capabilities||{});if(body.action==='heartbeat')return Response.json({ok:true});
 for(let attempt=0;attempt<5;attempt++){const {state,version}=await readState();state.jobs ||= [];
 if(body.action==='claim'){
 let changed=false;const now=Date.now();for(const j of state.jobs){if(j.status==='running'&&now-Date.parse(j.started)>900000){changed=true;j.status='failed';j.error='Worker interrupted. Queue a new attempt.';const t=state.tasks.find((t:any)=>t.id===j.taskId);if(t&&t.stage==='In progress')t.stage='Ready';}}
 // One active mission across workers, even if two processes connect by mistake.
 if(state.jobs.some((j:any)=>j.status==='running')){if(changed)await writeState(state,version);return Response.json({job:null});}
 dispatchAutomaticBacklog(state,body.capabilities||{});
 const job=state.jobs.find((j:any)=>j.status==='queued');if(!job){if(changed)await writeState(state,version);return Response.json({job:null});}job.status='running';job.started=new Date().toISOString();job.claim=crypto.randomUUID();const t=state.tasks.find((t:any)=>t.id===job.taskId);if(t)t.stage='In progress';await writeState(state,version);return Response.json({job:{...job,ventureInfo:portfolio(state).find(v=>v.id===job.venture),notes:state.notes[job.venture]||'',history:state.messages.filter((m:any)=>m.venture===job.venture&&m.agent===job.agent).slice(-8)}});
 }
 const job=state.jobs.find((j:any)=>j.id===body.id);if(!job||job.claim!==body.claim)return Response.json({error:'Claim rejected'},{status:409});if(['done','failed'].includes(job.status))return Response.json({ok:true});if(typeof body.result!=='string'||body.result.length>100000)return Response.json({error:'Invalid report'},{status:400});
 job.status=body.error?'failed':'done';job.error=body.error?String(body.error).slice(0,1000):'';job.finished=new Date().toISOString();const task=state.tasks.find((t:any)=>t.id===job.taskId);if(task){task.stage=body.error?'Ready':'Review';if(!body.error){task.result=body.result;task.artifacts=Array.isArray(body.artifacts)?body.artifacts.filter((a:any)=>typeof a.name==='string'&&typeof a.url==='string'&&/^\/generated\/[a-z0-9-]{1,80}\/[0-9a-f-]{36}\/artwork-\d+\.(png|jpe?g|webp)$/.test(a.url)).slice(0,20):[];}}
 if(!body.error)state.messages.push({artifacts:Array.isArray(body.artifacts)?body.artifacts.filter((a:any)=>typeof a.name==='string'&&typeof a.url==='string'&&/^\/generated\/[a-z0-9-]{1,80}\/[0-9a-f-]{36}\/artwork-\d+\.(png|jpe?g|webp)$/.test(a.url)).slice(0,20):[],id:crypto.randomUUID(),venture:job.venture,agent:job.agent,role:'assistant',text:body.result});state.activity.unshift({id:crypto.randomUUID(),text:body.error?`Agent run failed; mission can be retried.`:`${job.agent} delivered a draft for ${portfolio(state).find(v=>v.id===job.venture)?.name}`,at:new Date().toISOString()});await writeState(state,version);return Response.json({ok:true});
 }
 return Response.json({error:'Workspace busy. Retry.'},{status:409});
 }catch(e){if((e as Error).message==='CONFLICT')return Response.json({error:'Workspace busy. Retry.'},{status:409});return Response.json({error:'Worker storage unavailable'},{status:503});}
}
