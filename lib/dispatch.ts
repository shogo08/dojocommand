import { portfolio, roles } from './seed';
import {backlogBlocker} from './automation';
import {executionMode,buildApproved,buildPrerequisites,prepareBuildApprovals} from './build-workflows';
export function queueTask(state:any, task:any) {
 const ventures=portfolio(state);
 const mode=executionMode(task);
 if(task.kind==='goal'||mode!=='build'&&['assisted','founder'].includes(mode))throw new Error('This task requires founder actions.');
 if(mode==='build'){
  if(!buildApproved(state,task))throw new Error('Approve the build before starting it.');
  const blocked=buildPrerequisites(state,task);if(blocked)throw new Error(blocked);
  task.execution='build';
 }
 if(!ventures.some(v=>v.id===task.venture)||!roles.includes(task.agent))throw new Error('Unknown venture or agent');
 state.jobs ||= [];
 if(state.jobs.some((j:any)=>j.taskId===task.id&&['queued','running'].includes(j.status)))return false;
 const id=crypto.randomUUID();
 state.jobs.push({id,venture:task.venture,agent:task.agent,mode:mode==='build'?'build':mode==='artwork'?'artwork':'research',message:task.title+'\n'+task.brief,taskId:task.id,status:'queued',created:new Date().toISOString()});
 task.jobId=id;task.stage='Ready';
 state.activity.unshift({id:crypto.randomUUID(),text:`${task.agent} queued for ${ventures.find(v=>v.id===task.venture)?.name}`,at:new Date().toISOString()});
 return true;
}
export function dispatchReadyTransitions(next:any, previous:any){
 prepareBuildApprovals(next,previous);
 for(const task of next.tasks){const before=previous.tasks.find((t:any)=>t.id===task.id);if(task.stage==='Ready'&&(!before||before.stage!=='Ready'))queueTask(next,task);}
}
export function dispatchAutomaticBacklog(state:any, capabilities:any){
 if(state.jobs?.some((j:any)=>['queued','running'].includes(j.status)))return false;
 prepareBuildApprovals(state,state);
 const task=state.tasks.find((t:any)=>t.stage==='Backlog' && (state.automation?.backlog===true||executionMode(t)==='build') && !backlogBlocker(state,t,capabilities));
 if(!task)return false;
 queueTask(state,task);
 state.jobs[state.jobs.length-1].automatic=true;
 state.activity.unshift({id:crypto.randomUUID(),text:`Automatic backlog pickup: ${task.title}`,at:new Date().toISOString()});
 return true;
}
