const state = { agents: [], events: [], objects: {}, series: {}, selected: 0, tick: 0, agentMode: {} };
const $ = (id) => document.getElementById(id);
const fmt = (n, suffix='') => `${Math.round(n)}${suffix}`;

async function loadData(){
  const [agentRes, kpiRes, objRes] = await Promise.all([
    fetch('data/agents.json'), fetch('data/kpi_timeseries.json'), fetch('data/port_objects.json')
  ]);
  const agentData = await agentRes.json();
  state.agents = agentData.agents;
  state.events = agentData.events;
  state.series = await kpiRes.json();
  state.objects = await objRes.json();
  renderAgents(); renderTelemetry(); startSimulation();
}

const pctKpis = ['productivity','adherence','availability','accuracy','stability','readiness','visibility','collection','utilisation','recovery'];
const kpiSuffix = (k) => pctKpis.some(term => k.toLowerCase().includes(term)) ? '%' : '';

function renderAgents(){
  const list = $('agentList');
  list.innerHTML = state.agents.map((a,i)=>`<button class="agent-btn ${i===state.selected?'active':''}" data-agent="${i}"><small>${a.domain}</small>${a.name}</button>`).join('');
  list.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{state.selected=+btn.dataset.agent;renderAgents();}));
  const a = state.agents[state.selected];
  const mode = state.agentMode[a.id] || 0;
  const primaryKpi = Object.entries(a.kpis)[mode % Object.keys(a.kpis).length];
  $('agentDetail').innerHTML = `
    <span class="domain-tag">${a.domain}</span>
    <h3>${a.name}</h3>
    <p class="mission">${a.mission}</p>
    <div class="detail-grid">
      <div class="mini-panel"><h4>Live signals</h4><div class="chips">${a.signals.map(s=>`<span class="chip">${s}</span>`).join('')}</div></div>
      <div class="mini-panel"><h4>Agent actions</h4><div class="chips">${a.actions.map(s=>`<span class="chip">${s}</span>`).join('')}</div></div>
    </div>
    <div class="kpi-grid">${Object.entries(a.kpis).map(([k,v])=>`<div class="kpi"><strong>${v}${kpiSuffix(k)}</strong><span>${k}</span></div>`).join('')}</div>
    <div class="agent-intelligence">
      <div class="mini-panel agent-graph-panel">
        <div class="panel-top"><h4>Agent intelligence graph</h4><span class="tag">${primaryKpi[0]}</span></div>
        <canvas id="agentGraph" width="620" height="220"></canvas>
      </div>
      <div class="mini-panel decision-panel">
        <h4>Decision actuator</h4>
        <p id="decisionCopy">${mode ? 'Optimization pulse applied. Agent is testing a faster action path against guardrails.' : 'Baseline recommendation path is active. Press to simulate an intelligent intervention.'}</p>
        <button class="decision-button ${mode ? 'engaged' : ''}" id="decisionButton" type="button">
          <span class="decision-track"><span class="decision-orb"></span></span>
          <span>${mode ? 'Revert to baseline' : 'Run smart intervention'}</span>
        </button>
      </div>
    </div>
    <div class="target">Target outcome: ${a.target}</div>
  `;
  $('decisionButton').addEventListener('click',()=>{state.agentMode[a.id] = mode ? 0 : 1; renderAgents();});
  drawAgentGraph(a, mode);
}

function drawAgentGraph(agent, mode=0){
  const canvas = $('agentGraph'); if(!canvas) return;
  const ctx = canvas.getContext('2d'); const w = canvas.width, h = canvas.height;
  const entries = Object.entries(agent.kpis); const selected = entries[mode % entries.length];
  const seed = agent.id.split('').reduce((sum,ch)=>sum+ch.charCodeAt(0),0) + mode*19 + state.tick;
  const data = Array.from({length:12},(_,i)=>{
    const trend = mode ? i*2.4 : i*.9;
    const wave = Math.sin((seed+i)*.75)*7 + Math.cos((seed+i)*.33)*4;
    return Math.max(8, selected[1] + wave + trend - (mode ? 8 : 2));
  });
  const min = Math.min(...data)-8, max = Math.max(...data)+8;
  ctx.clearRect(0,0,w,h);
  const gradient = ctx.createLinearGradient(0,0,w,h); gradient.addColorStop(0,'rgba(0,245,212,.12)'); gradient.addColorStop(1,'rgba(55,183,255,.03)');
  ctx.fillStyle = gradient; ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='rgba(255,255,255,.12)'; ctx.lineWidth=1;
  for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(36,i*h/4);ctx.lineTo(w-18,i*h/4);ctx.stroke();}
  ctx.strokeStyle = mode ? '#6eff8b' : '#00f5d4'; ctx.lineWidth = 4; ctx.beginPath();
  data.forEach((v,i)=>{ const x=42+i*(w-72)/(data.length-1); const y=h-34-((v-min)/(max-min||1))*(h-68); i?ctx.lineTo(x,y):ctx.moveTo(x,y); });
  ctx.stroke();
  ctx.fillStyle = mode ? 'rgba(110,255,139,.18)' : 'rgba(0,245,212,.16)'; ctx.lineTo(w-30,h-28); ctx.lineTo(42,h-28); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#dff8ff'; ctx.font='800 13px Inter'; ctx.fillText(mode ? 'Intervention forecast' : 'Baseline forecast', 42, 24);
  ctx.fillStyle=mode ? '#6eff8b' : '#00f5d4'; ctx.font='900 26px Inter'; ctx.fillText(`${Math.round(data.at(-1))}${kpiSuffix(selected[0])}`, 42, 58);
  ctx.fillStyle='rgba(223,248,255,.72)'; ctx.font='700 12px Inter'; ctx.fillText(`${agent.name} · ${selected[0]}`, 42, 78);
}

function renderTelemetry(){
  $('vesselTable').innerHTML = state.objects.vessels.map(v=>`<div class="row"><div><b>${v.name}</b><br><small>${v.containers} containers</small></div><div>${v.eta}</div><div>${v.risk}</div></div>`).join('');
  $('equipmentList').innerHTML = state.objects.equipment.map(e=>`<div class="lane"><div class="lane-head"><b>${e.id}</b><span>${e.health}% · ${e.status}</span></div><div class="bar"><span style="width:${e.health}%"></span></div></div>`).join('');
  $('gateLanes').innerHTML = state.objects.lanes.map(l=>`<div class="lane"><div class="lane-head"><b>${l.gate}</b><span>${l.queue} trucks · ${l.status}</span></div><div class="bar"><span style="width:${Math.min(100,l.queue*3)}%"></span></div></div>`).join('');
  drawChart();
}

function drawChart(){
  const canvas = $('kpiChart'); const ctx = canvas.getContext('2d'); const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h); ctx.fillStyle='rgba(255,255,255,.03)'; ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='rgba(255,255,255,.12)'; ctx.lineWidth=1;
  for(let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(42,i*h/5);ctx.lineTo(w-18,i*h/5);ctx.stroke();}
  const lines = [
    ['dwell','Dwell index'], ['queue','Queue index'], ['craneProductivity','Crane productivity'], ['yardUtilisation','Yard utilisation'], ['rehandles','Re-handles']
  ];
  lines.forEach(([key,label],li)=>{
    const data = state.series[key]; const max=Math.max(...data,120), min=Math.min(...data,0); const color = ['#00f5d4','#37b7ff','#6eff8b','#ffd166','#ff5d73'][li];
    ctx.strokeStyle=color; ctx.lineWidth=3; ctx.beginPath();
    data.forEach((v,i)=>{ const x=48+i*(w-80)/(data.length-1); const y=h-38-((v-min)/(max-min||1))*(h-82); i?ctx.lineTo(x,y):ctx.moveTo(x,y); });
    ctx.stroke(); ctx.fillStyle=color; ctx.font='700 13px Inter'; ctx.fillText(label, 56+li*150, 24);
  });
  const x=48+(state.tick%13)*(w-80)/12; ctx.strokeStyle='rgba(255,255,255,.55)'; ctx.setLineDash([5,6]); ctx.beginPath();ctx.moveTo(x,34);ctx.lineTo(x,h-30);ctx.stroke();ctx.setLineDash([]);
}

function pushEvent(){
  const stream = $('eventStream'); const t = new Date(Date.now()+state.tick*300000); const hh = String(t.getHours()).padStart(2,'0'), mm=String(t.getMinutes()).padStart(2,'0');
  const event = state.events[(state.tick + Math.floor(Math.random()*state.events.length)) % state.events.length];
  const confidence = 82 + Math.floor(Math.random()*16);
  const item = document.createElement('div'); item.className='event'; item.innerHTML = `<b>${hh}:${mm}</b> · ${event}<br><small>confidence ${confidence}% · guardrail OK · human approval ${confidence>91?'optional':'required'}</small>`;
  stream.prepend(item); while(stream.children.length>9) stream.removeChild(stream.lastChild);
  $('heroEvent').textContent = event;
}

function updateClock(){
  const base = 12*60; const mins = base + state.tick*5; $('simClock').textContent = `${String(Math.floor(mins/60)%24).padStart(2,'0')}:${String(mins%60).padStart(2,'0')}`;
}

function startSimulation(){
  pushEvent(); updateClock();
  setInterval(()=>{
    state.tick = (state.tick+1)%13; updateClock(); drawChart(); pushEvent();
    const randomAgent = Math.floor(Math.random()*state.agents.length); state.agents[randomAgent].kpis[Object.keys(state.agents[randomAgent].kpis)[0]] += (Math.random()>.5?1:-1);
    if(randomAgent===state.selected) renderAgents(); else if($('agentGraph')) drawAgentGraph(state.agents[state.selected], state.agentMode[state.agents[state.selected].id] || 0);
  }, 2800);
}

document.querySelectorAll('[data-scroll]').forEach(b=>b.addEventListener('click',()=>document.querySelector(b.dataset.scroll).scrollIntoView({behavior:'smooth'})));
loadData().catch(err=>{console.error(err); document.body.insertAdjacentHTML('afterbegin','<div style="padding:20px;background:#5b0000;color:white">Could not load data JSON. Run with a local server or GitHub Pages.</div>')});
