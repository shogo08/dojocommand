export const stages = ['Backlog','Ready','In progress','Review','Done'];
export const roles = ['Venture Lead','Market Researcher','Economics Analyst','Builder','Quality Inspector'];
export const ventures = [
 ['publishing','Digital Publishing','DP','Digital venture','Test digital books and Etsy products, including adult coloring books.','Draft a demand-validation plan for one digital publishing niche.'],
 ['reconcile','Operations Reconciliation','RC','Digital venture','Reconcile CSV exports and explain exceptions.','Prototype a deterministic comparison using synthetic records.'],
 ['bids','Public Bid Radar','BR','Digital venture','Verified bid shortlists for specialty contractors.','Choose one contractor niche and define eligibility checks.'],
 ['catalog','Catalog QA','CQ','Digital venture','Find product listing errors for specialist shops.','Define ten audit rules and create a sample issue report.'],
 ['grants','Grant Eligibility Watch','GW','Digital venture','Funding matches and eligibility checklists.','Map eligibility fields and unknowns for one nonprofit niche.'],
 ['competitors','Competitor Pulse','CP','Digital venture','Verified changes from permitted competitor sources.','Identify a niche and permitted source plan.'],
 ['cards','Card Asset Intelligence','TC','Asset intelligence','Inventory and hypothetical grading economics.','Create an inventory worksheet and list missing valuation inputs.'],
 ['space','Space Asset Intelligence','SP','Asset intelligence','Compare private room and container uses.','Compare idle, storage and production scenarios with owner labor.']
].map(([id,name,code,division,description,mission])=>({id,name,code,division,description,mission}));
export const initialState = {
 tasks: ventures.map((v,i)=>({id:'seed-'+v.id,venture:v.id,title:v.mission,agent:'Venture Lead',stage:i<3?'Ready':'Backlog',brief:'Prepare a preliminary research memo. Separate assumptions from facts, identify evidence gaps, owner hours, a low-cost validation experiment and kill criteria.',result:'',created:new Date().toISOString()})),
 todos:[{id:'founder-1',title:'Confirm weekly hours available for the studio',done:false},{id:'founder-2',title:'Inventory a small sample of owned cards',done:false},{id:'founder-3',title:'Choose one customer niche for the first software pilot',done:false},{id:'founder-4',title:'Verify energy costs and permitted uses for the container',done:false},{id:'founder-5',title:'Connect live agents securely',done:false}],
 messages:[], notes:{}, activity:[{id:'start',text:'Seven venture workspaces prepared. Ideas remain unvalidated.',at:new Date().toISOString()}]
};

export function portfolio(state:any){return (Array.isArray(state?.ventures)?state.ventures:ventures) as typeof ventures;}
