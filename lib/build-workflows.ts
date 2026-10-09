export const approvedPlanBuilds:Record<string,string[]>={
 'grok-competitors-plan':['grok-competitors-build'],
 'grok-bids-plan':['grok-bids-build'],
};
export function executionMode(task:any){return task.execution==='assisted'&&task.kind!=='goal'&&!['publishing-delivery-etsy','publishing-delivery-amazon','publishing-delivery-launch'].includes(task.id)?'build':task.execution;}
export function buildPrerequisites(state:any,task:any):string|null{
 const linkedPlan=Object.entries(approvedPlanBuilds).find(([,ids])=>ids.includes(task.id))?.[0];
 const dependencies=[...(task.dependsOn||[]),...(linkedPlan?[linkedPlan]:[]),...(task.id==='publishing-delivery-qc'?['publishing-delivery-art']:[])];
 if(dependencies.some(id=>!state.tasks.some((t:any)=>t.id===id&&t.stage==='Done')))return 'Waiting for the approved plan or prerequisite deliveries';
 if((task.id==='publishing-delivery-automation'&& !state.todos.some((t:any)=>t.id==='publishing-founder-direction'&&t.done))||(task.requiredTodoIds||[]).some((id:string)=>!state.todos.some((t:any)=>t.id===id&&t.done)))return 'Waiting for your required actions';
 if(task.parentId){const parent=state.tasks.find((t:any)=>t.id===task.parentId);if(!parent)return 'Parent mission missing';if(parent.kind==='goal'&&!parent.planApproved)return 'Waiting for founder plan approval';}
 return null;
}
export function buildApproved(state:any,task:any){
 return task.buildApproved===true||(task.parentId&&state.tasks.some((t:any)=>t.id===task.parentId&&t.kind==='goal'&&t.planApproved))||Object.entries(approvedPlanBuilds).some(([plan,ids])=>ids.includes(task.id)&&state.tasks.some((t:any)=>t.id===plan&&t.stage==='Done'));
}
export function linkedBuilds(state:any,report:any){return state.tasks.filter((t:any)=>executionMode(t)==='build'&&((approvedPlanBuilds[report.id]||[]).includes(t.id)||t.approvedReportId===report.id));}
export function prepareBuildApprovals(state:any,previous:any){
 for(const task of state.tasks){
  if(executionMode(task)!=='build')continue;
  task.execution='build';
  if(buildApproved(state,task)&&!task.buildApproved){task.buildApproved=true;task.buildApprovedAt=new Date().toISOString();}
  if(task.buildApproved&&!task.buildApprovedAt)task.buildApprovedAt=new Date().toISOString();
 }
}
export function buildCompletionBlocker(task:any,jobs:any[]=[]){
 if(task.stage!=='Review')return 'Wait for the build delivery to reach Review.';
 if(jobs.some(j=>j.taskId===task.id&&['queued','running'].includes(j.status)))return 'Build is still running.';
 if(!task.build?.files?.length||task.build?.verification?.exitCode!==0||!task.build?.downloadUrl)return 'Actual project files and passing verification are required.';
 return null;
}
