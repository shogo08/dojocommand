import { portfolio, roles } from './seed';
export function queueTask(state:any, task:any) {
 const ventures=portfolio(state);
 if(task.kind==='goal'||['assisted','founder'].includes(task.execution))throw new Error('This task needs actual implementation, not the report worker.');
 if(!ventures.some(v=>v.id===task.venture)||!roles.includes(task.agent))throw new Error('Unknown venture or agent');
 state.jobs ||= [];
 if(state.jobs.some((j:any)=>j.taskId===task.id&&['queued','running'].includes(j.status)))return false;
 const id=crypto.randomUUID();
 state.jobs.push({id,venture:task.venture,agent:task.agent,mode:task.execution==='artwork'?'artwork':'research',message:task.title+'\n'+task.brief,taskId:task.id,status:'queued',created:new Date().toISOString()});
 task.jobId=id;task.stage='Ready';
 state.activity.unshift({id:crypto.randomUUID(),text:`${task.agent} queued for ${ventures.find(v=>v.id===task.venture)?.name}`,at:new Date().toISOString()});
 return true;
}
export function dispatchReadyTransitions(next:any, previous:any){
 for(const task of next.tasks){const before=previous.tasks.find((t:any)=>t.id===task.id);if(task.stage==='Ready'&&(!before||before.stage!=='Ready'))queueTask(next,task);}
}
