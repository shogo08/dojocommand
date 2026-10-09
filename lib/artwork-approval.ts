export function artworkApprovalBlocker(task:any, jobs:any[]=[]):string|null {
 if(task.stage !== 'Review')return task.stage === 'Done' ? 'Artwork already approved.' : 'Wait for the artwork to reach Review.';
 if(jobs.some(j=>j.taskId===task.id && ['queued','running'].includes(j.status)))return 'The artwork agent is still working.';
 // The original publishing pack requires twelve finished pages and a cover.
 const required=task.requiredArtifactCount || (task.id==='publishing-delivery-art'?13:1);
 if(!task.artifacts?.length)return 'No generated files have been delivered yet.';
 if(task.artifacts.length<required)return `This deliverable needs ${required} files; ${task.artifacts.length} delivered so far.`;
 return null;
}

export function approveArtwork(task:any, jobs:any[], notes:string, at=new Date().toISOString()) {
 const blocker=artworkApprovalBlocker(task,jobs);
 if(blocker)throw Error(blocker);
 const files=task.artifacts.map((a:any)=>`${a.name}: ${a.url}`).join('\n');
 return {...task,stage:'Done',approval:{at,notes:notes.trim(),artifactUrls:task.artifacts.map((a:any)=>a.url)},evidence:`Founder approved the attached artwork on ${at}.\n${files}${notes.trim()?'\nReview notes: '+notes.trim():''}`};
}
