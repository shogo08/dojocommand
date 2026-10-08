import {queueTask} from '@/lib/dispatch';
import {readState,writeState,sameOrigin} from '@/lib/store';
import {portfolio,roles} from '@/lib/seed';
export async function POST(req:Request){
 if(!sameOrigin(req))return Response.json({error:'Request rejected'},{status:403});
 try{const body=await req.json();const {state,version}=await readState();const venture=portfolio(state).find(v=>v.id===body.venture);if(!venture||!roles.includes(body.agent)||typeof body.message!=='string'||body.message.length>10000)return Response.json({error:'Invalid agent request'},{status:400});
 state.jobs ||= [];let task:any;
 if(body.taskId){task=state.tasks.find((t:any)=>t.id===body.taskId&&t.venture===venture.id);if(!task||!['Backlog','Ready'].includes(task.stage))return Response.json({error:'Only backlog or ready missions can be started.'},{status:409});if(state.jobs.some((j:any)=>j.taskId===task.id&&['queued','running'].includes(j.status)))return Response.json({error:'This mission is already queued.'},{status:409});}
 if(task){queueTask(state,task);await writeState(state,version);return Response.json({id:task.jobId,queued:true});}
 const id=crypto.randomUUID();state.jobs.push({id,mode:body.mode==='artwork'?'artwork':'research',venture:venture.id,agent:body.agent,message:task?task.title+'\n'+task.brief:body.message,taskId:task?.id,status:'queued',created:new Date().toISOString()});if(task){task.jobId=id;task.stage='Ready';}else state.messages.push({id:crypto.randomUUID(),venture:venture.id,agent:body.agent,role:'user',text:body.message});state.activity.unshift({id:crypto.randomUUID(),text:`${body.agent} queued for ${venture.name}`,at:new Date().toISOString()});await writeState(state,version);return Response.json({id,queued:true});
 }catch(e){return Response.json({error:(e as Error).message==='CONFLICT'?'Workspace changed. Refresh and retry.':'Could not queue the mission.'},{status:409});}}
