import {executionMode,buildApproved,buildPrerequisites} from './build-workflows';
// Older saved missions predate explicit dependency fields.
const prerequisites: Record<string, {tasks?: string[]; todos?: string[]}> = {
 'grok-competitors-quality': {tasks: ['grok-competitors-plan', 'grok-competitors-build']},
 'grok-bids-quality': {tasks: ['grok-bids-plan', 'grok-bids-build']},
 'publishing-delivery-art': {tasks: ['publishing-artwork-prototype'], todos: ['publishing-founder-direction']},
};

export function backlogBlocker(state: any, task: any, capabilities?: any): string | null {
 if(task.kind === 'goal') return 'Venture goal · finish linked deliveries first';
 if(executionMode(task)==='build'){
  if(!buildApproved(state,task))return 'Waiting for your build approval';
  const dependency=buildPrerequisites(state,task);if(dependency)return dependency;
 }else
 if(['assisted', 'founder'].includes(task.execution) || (task.kind === 'implementation' && task.execution !== 'artwork')) return 'Build session or founder action needed';
 if(task.autoStart === false) return 'Automatic start paused for this mission';
 if(task.build || executionMode(task)!=='build'&&(task.result?.trim() || task.artifacts?.length)) return 'Existing delivery needs review';
 if(state.jobs?.some((j: any) => j.taskId === task.id && (executionMode(task)!=='build'||j.mode==='build'))) return 'Previously attempted · start another run manually';
 const parent = state.tasks.find((t: any) => t.id === task.parentId);
 if(task.parentId && !parent) return 'Parent mission missing';
 if(parent?.kind === 'goal' && !parent.planApproved) return 'Waiting for founder plan approval';
 const required = prerequisites[task.id] || {};
 const tasks = [...(required.tasks || []), ...(Array.isArray(task.dependsOn) ? task.dependsOn : [])];
 const todos = [...(required.todos || []), ...(Array.isArray(task.requiredTodoIds) ? task.requiredTodoIds : [])];
 if(tasks.some(id => !state.tasks.some((t: any) => t.id === id && t.stage === 'Done'))) return 'Waiting for prerequisite deliveries to be accepted';
 if(todos.some(id => !state.todos.some((t: any) => t.id === id && t.done))) return 'Waiting for your required actions';
 if(capabilities && !capabilities[executionMode(task)==='build'?'build':task.execution === 'artwork' ? 'artwork' : 'research']) return 'Worker capability unavailable';
 return null;
}
