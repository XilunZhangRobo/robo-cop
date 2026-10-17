"use strict";
const { outcomes, clips, decisions } = window.ROBO_TRACE;
let selectedTrial = 8;
let selectedDecision = 45;
let traceMode = "code";
let traceSignature = "";
const realClips = {
  1: { success: { file: "real-1-success-t48.mp4", trial: 48 }, failure: { file: "real-1-failure-clean.mp4", trial: 33 } },
  2: { success: { file: "real-2-success-clean.mp4", trial: 37 }, failure: { file: "real-2-failure-clean.mp4", trial: 48 } },
  3: { success: { file: "real-3-success-clean.mp4", trial: 14 }, failure: { file: "real-3-failure-clean.mp4", trial: 13 } }
};

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function svgElement(name, attributes) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  return node;
}
function drawChart(selected) {
  window.drawDeploymentCurve(document.getElementById('trial-chart'), {
    series: [{name:'Robo-COP', bits:outcomes, color:'#365faa'}],
    windows:[[46,70]], events:[[45,'Train'],[70,'Adopt']], selected
  });
}
function codeLine(line) {
  const row=element("div",undefined,"code-line");
  row.appendChild(element("span",String(line.line),"line-number"));
  const code=element("code");
  for(const token of line.text.split(/(execute_vla|sample_grasp_pose|goto_pregrasp|goto_pose|close_gripper|open_gripper)/g)) {
    code.appendChild(element("span",token,token==="execute_vla"?"code-vla":/^(sample_grasp_pose|goto_pregrasp|goto_pose|close_gripper|open_gripper)$/.test(token)?"code-tool":""));
  }
  row.appendChild(code); return row;
}
function rawDetails(label, text) {
  const details=element("details",undefined,"raw-record");
  details.append(element("summary",label),element("pre",text)); return details;
}
function renderTrace(force=false) {
  const clip=clips[selectedTrial];
  const frame=Math.floor(document.getElementById("sim-video").currentTime*clip.fps);
  const turn=clip.turns.find(t=>t.start!==undefined && frame>=t.start && frame<t.end) || clip.turns.filter(t=>t.start!==undefined).at(-1);
  const monitor=clip.monitors.filter(m=>m.frame<=frame).at(-1);
  const current=clip.intervals.find(v=>frame>=v.start&&frame<v.end);
  const action=document.getElementById("current-action");
  action.textContent=current?`VLA · ${current.instruction}`:"Outside VLA call";
  action.classList.toggle("is-vla",!!current);
  document.getElementById("current-turn").textContent=`Code ${(turn?.turn??0)+1}`;
  document.querySelectorAll("[data-seek-turn]").forEach(b=>b.classList.toggle("active",Number(b.dataset.seekTurn)===turn?.turn));
  const signature=[selectedTrial,traceMode,turn?.turn,traceMode==="monitor"?monitor?.frame:"",selectedDecision].join("/");
  if(!force&&signature===traceSignature) return;
  traceSignature=signature;
  const body=document.getElementById("trace-body"); body.replaceChildren();
  document.querySelectorAll("[data-trace-tab]").forEach(b=>{
    const active=b.dataset.traceTab===traceMode;
    b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active));
  });
  const position=document.getElementById("trace-position");
  if(traceMode==="decision") {
    const d=decisions[selectedDecision]; position.textContent=`After trial ${d.trial}`;
    body.append(element("span",d.type,`decision-badge decision-${d.type.toLowerCase()}`),element("h3",d.title),element("p",d.summary,"trace-description"));
    const stats=element("div",undefined,"decision-stats");
    d.stats.forEach(([label,value])=>{const cell=element("div");cell.append(element("span",label),element("strong",value));stats.appendChild(cell);});body.appendChild(stats);
    if(d.skills.length){body.appendChild(element("p","Target skills for verification","trace-label"));d.skills.forEach(skill=>body.appendChild(element("div",skill,"skill-chip")));}
    body.appendChild(rawDetails("Read the recorded model response",d.raw));
    body.appendChild(element("p","Original model output; its reasoning is shown verbatim.","trace-footnote"));
  } else if(traceMode==="monitor") {
    position.textContent=`Trial ${selectedTrial} · monitor`;
    body.appendChild(element("p","VISUAL OUTCOME MONITOR","trace-label"));
    if(monitor){body.append(element("span",monitor.verdict,`decision-badge ${monitor.verdict==="WRONG"?"decision-wait":"decision-adopt"}`),element("p",monitor.text,"monitor-record"),element("p",`Recorded at video ${(monitor.frame/clip.fps).toFixed(1)} s. This panel follows playback.`,"trace-footnote"));}
    else body.appendChild(element("p","No monitor check yet. Feedback appears as the video plays.","trace-description"));
  } else {
    position.textContent=`Trial ${selectedTrial} · code ${(turn?.turn??0)+1}`;
    body.appendChild(element("p","GENERATED PROGRAM · SELECTED LINES","trace-label"));
    const code=element("div",undefined,"code-excerpt");
    for(const line of turn?.lines||[]) code.appendChild(codeLine(line));
    if(!turn?.lines.length)code.appendChild(element("p","No tool-call excerpt in this program.","trace-footnote"));
    body.appendChild(code);
    body.appendChild(element("p","Selected lines from the executed program. Updates with playback.","trace-footnote"));
    if(turn)body.appendChild(rawDetails("Read this full generated program",turn.code));
  }
}
function buildTurnPicker() {
  const picker=document.getElementById("turn-picker");picker.replaceChildren(element("span","GENERATED CODE"));
  clips[selectedTrial].turns.filter(t=>t.start!==undefined).forEach(t=>{
    const b=element("button",String(t.turn+1)); b.type="button";b.dataset.seekTurn=t.turn;b.setAttribute("aria-label",`Play generated code ${t.turn+1}`);
    b.addEventListener("click",()=>{traceMode="code";const v=document.getElementById("sim-video");v.currentTime=t.start/clips[selectedTrial].fps;renderTrace(true);v.play().catch(()=>{});});picker.appendChild(b);
  });
}
function selectSimulationTrial(trial,play=true) {
  const clip=clips[trial]; if(!clip)return;
  selectedTrial=trial;traceMode="code";
  const video=document.getElementById("sim-video");video.pause();
  video.querySelector("source").src=`assets/${clip.file}`; video.poster=`assets/${clip.poster}`;
  video.setAttribute("aria-label",`Bananas out of bin trial ${trial}: ${clip.success?"success":"failure"}`);video.load();
  document.getElementById("sim-phase").textContent=clip.phase;
  document.getElementById("sim-trial").textContent=`TRIAL ${String(trial).padStart(2,"0")} / 100`;
  document.getElementById("sim-title").textContent=clip.title;
  document.getElementById("sim-description").textContent=clip.description;
  const outcome=document.getElementById("sim-outcome");outcome.textContent=clip.success?"Task completed":"Task not completed";outcome.className=`outcome ${clip.success?"outcome-success":"outcome-fail"}`;
  document.querySelectorAll("#deployment .clip-button").forEach(b=>{const active=Number(b.dataset.trial)===trial;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active));});
  document.querySelectorAll("[data-decision]").forEach(b=>b.classList.remove("active"));
  buildTurnPicker();drawChart(trial);renderTrace(true);
  if(play)video.play().catch(()=>{});
}
function selectDecision(trial) {
  const preceding=Object.keys(clips).map(Number).filter(t=>t<=trial).at(-1);
  selectSimulationTrial(preceding,false);selectedDecision=trial;traceMode="decision";
  document.querySelectorAll("[data-decision]").forEach(b=>b.classList.toggle("active",Number(b.dataset.decision)===trial));
  drawChart(trial);renderTrace(true);
  document.querySelector(".agent-inspector").scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"nearest"});
}
function selectRealClip(card,outcome) {
  const task=Number(card.dataset.realTask),clip=realClips[task]?.[outcome];if(!clip)return;
  const video=card.querySelector("video");video.pause();video.querySelector("source").src=`assets/${clip.file}`;
  video.setAttribute("aria-label",`Task ${task} ${outcome} trial ${clip.trial}`);video.load();
  card.querySelector(".real-caption").textContent=`Trial ${clip.trial} · ${outcome==="success"?"task completed":"task not completed"}`;
  card.querySelectorAll(".real-toggle").forEach(b=>{const active=b.dataset.outcome===outcome;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active));});video.play().catch(()=>{});
}
document.querySelectorAll("#deployment .clip-button").forEach(b=>b.addEventListener("click",()=>selectSimulationTrial(Number(b.dataset.trial))));
document.querySelectorAll("[data-decision]").forEach(b=>b.addEventListener("click",()=>selectDecision(Number(b.dataset.decision))));
document.querySelectorAll("[data-trace-tab]").forEach(b=>b.addEventListener("click",()=>{traceMode=b.dataset.traceTab;renderTrace(true);}));
document.querySelectorAll(".real-card").forEach(card=>card.querySelectorAll(".real-toggle").forEach(b=>b.addEventListener("click",()=>selectRealClip(card,b.dataset.outcome))));
document.getElementById("sim-video").addEventListener("timeupdate",()=>renderTrace());
if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)document.querySelectorAll(".hero-mosaic video").forEach(v=>{v.autoplay=false;v.pause();});
buildTurnPicker();drawChart(8);renderTrace(true);

// Recorded completed-trial outcomes, including the shared first 30 trials.
const realTask2 = {
  ours: [3,12,13,16,17,22,23,28,32,33,36,37,41,43,44,45,47,49,50],
  frozen: [3,12,13,16,17,22,23,28,36,37,40,45,46,47,49,50]
};
function drawRealProgress() {
  const bits = trials => Array.from({length:50},(_,i)=>trials.includes(i+1)?'1':'0').join('');
  window.drawDeploymentCurve(document.getElementById('real-trial-chart'), {
    series:[{name:'Frozen policy',bits:bits(realTask2.frozen),color:'#858b95',dash:true},
            {name:'Robo-COP',bits:bits(realTask2.ours),color:'#365faa'}],
    windows:[[31,40]],events:[[30,'Train'],[40,'Adopt']]
  });
}
drawRealProgress();
