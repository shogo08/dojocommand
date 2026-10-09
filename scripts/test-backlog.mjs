import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import ts from 'typescript';
const tmp=await mkdtemp(path.join(os.tmpdir(),'dojo-dispatch-'));
try{
 for(const name of ['seed','automation','dispatch']){
  let source=await readFile(new URL(`../lib/${name}.ts`,import.meta.url),'utf8');
  source=source.replaceAll("'./seed'","'./seed.mjs'").replaceAll("'./automation'","'./automation.mjs'");
  await writeFile(path.join(tmp,name+'.mjs'),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
 }
 const {dispatchAutomaticBacklog}=await import(path.join(tmp,'dispatch.mjs'));
 const make=()=>({automation:{backlog:true},tasks:[{id:'research',venture:'bids',agent:'Venture Lead',stage:'Backlog',title:'Research',brief:'Review primary sources'}],jobs:[],todos:[],activity:[]});
 const capabilities={research:true,artwork:true};
 let s=make();assert.equal(dispatchAutomaticBacklog(s,capabilities),true);assert.equal(s.jobs.length,1);assert.equal(s.jobs[0].automatic,true);assert.equal(s.tasks[0].stage,'Ready');assert.equal(dispatchAutomaticBacklog(s,capabilities),false);
 for(const extra of [{execution:'assisted'},{execution:'founder'},{kind:'goal'},{kind:'implementation'},{autoStart:false},{result:'Prior delivery'},{dependsOn:['missing']},{requiredTodoIds:['missing']}]){s=make();Object.assign(s.tasks[0],extra);assert.equal(dispatchAutomaticBacklog(s,capabilities),false,JSON.stringify(extra));}
 s=make();s.automation.backlog=false;assert.equal(dispatchAutomaticBacklog(s,capabilities),false);
 s=make();s.jobs.push({taskId:'research',status:'failed'});assert.equal(dispatchAutomaticBacklog(s,capabilities),false);
 s=make();assert.equal(dispatchAutomaticBacklog(s,{research:false}),false);
 s=make();s.tasks[0].execution='artwork';assert.equal(dispatchAutomaticBacklog(s,{research:true}),false);assert.equal(dispatchAutomaticBacklog(s,capabilities),true);assert.equal(s.jobs[0].mode,'artwork');
 s=make();s.tasks[0].dependsOn=['prerequisite'];s.tasks.push({id:'prerequisite',stage:'Review'});assert.equal(dispatchAutomaticBacklog(s,capabilities),false);s.tasks[1].stage='Done';assert.equal(dispatchAutomaticBacklog(s,capabilities),true);
 s=make();s.tasks[0].id='grok-bids-quality';assert.equal(dispatchAutomaticBacklog(s,capabilities),false);
 s=make();s.tasks[0].parentId='goal';s.tasks.push({id:'goal',kind:'goal',stage:'Backlog'});assert.equal(dispatchAutomaticBacklog(s,capabilities),false);s.tasks[1].planApproved=true;assert.equal(dispatchAutomaticBacklog(s,capabilities),true);
 console.log('Backlog checks passed: pause, dependencies, founder actions, capabilities, duplicates and failed-run protection.');
}finally{await rm(tmp,{recursive:true,force:true});}
