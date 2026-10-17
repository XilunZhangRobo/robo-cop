"use strict";
(() => {
  const trace=window.ROBO_TRACE;
  const steps=[
    {title:'The orchestrator writes the program.',source:'Recorded execution · Bananas out of bin · Trial 8',description:'This program uses perception-guided scripted motion. Other programs can call the VLA or combine both execution paths.',video:'banana-08.mp4',poster:'banana-08.jpg',kind:'code'},
    {title:'Execution feedback informs the next attempt.',source:'Recorded monitor feedback · Trial 30 / reflection mechanism from the paper',description:'The visual monitor checks execution. At episode end, reflection records what worked and what failed in task memory. The excerpt below is monitor feedback, not a memory entry.',video:'banana-30.mp4',poster:'banana-30.jpg',kind:'monitor'},
    {title:'Keep the useful skill segments.',source:'Recorded curation examples · separate episodes',description:'The text judge proposes skill labels; the video judge checks them. Accepted segments can come from successful or failed episodes.',video:'banana-08.mp4',poster:'banana-08.jpg',videoLabel:'Execution example · Trial 8 (curation records from separate episodes below)',image:'curation-examples.png',kind:'curation'},
    {title:'The controller requests training.',source:'Recorded controller decision · after trial 45',description:'The controller selects banana pickup and placement as verification targets. Fine-tuning uses all accumulated curated data, not just segments matching those targets.',video:'banana-48.mp4',poster:'banana-48.jpg',videoLabel:'Subsequent candidate execution · Trial 48',kind:'train'},
    {title:'Check what the candidate actually did.',source:'Recorded adoption review · after trial 70',description:'The candidate window has 17 successes in 25 trials. The reviewer credits the candidate’s contributions alongside scripted gripper actions and returns CONFIRM.',video:'banana-48.mp4',poster:'banana-48.jpg',videoLabel:'Candidate-window example · Trial 48',kind:'verify'},
    {title:'Revise memory for the policy in service.',source:'Memory revision mechanism · paper Section 3.3',description:'After adoption or reversion, advice that discourages VLA use is marked unverified for the current checkpoint. Its history is retained. The next episode can reassess that advice.',video:'banana-92.mp4',poster:'banana-92.jpg',videoLabel:'Later mixed execution · Trial 92',kind:'memory'}
  ];
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const section=document.getElementById('pipeline'),play=document.getElementById('pipeline-play');
  let index=0,running=false,visible=false,complete=false;
  const previous=document.getElementById('pipeline-previous'),nextButton=document.getElementById('pipeline-next');
  const currentVideo=()=>section.querySelector('video');
  const active=()=>visible&&!document.hidden;
  const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  function status(message){
    play.textContent=running?'Pause autoplay':complete?'Replay walkthrough':'Autoplay walkthrough';
    play.setAttribute('aria-pressed',String(running));
    section.classList.toggle('is-playing',running);
    previous.disabled=index===0;nextButton.disabled=index===steps.length-1;
    document.getElementById('pipeline-status').textContent=`Step ${index+1} of ${steps.length} · ${message||(running?'Autoplay on. The next step starts when this video ends.':'Manual mode. Use Back / Next or select any stage.')}`;
  }
  function pause(){running=false;currentVideo()?.pause();status();}
  function playVideo(){
    const video=currentVideo();if(!video||!active())return;
    video.play().catch(()=>{if(video!==currentVideo())return;running=false;status('Press play on the video to watch, or use Next to continue.');});
  }
  function advance(){
    if(!running||!active())return;
    if(index===steps.length-1){running=false;complete=true;status('Walkthrough complete. Replay or select a stage to watch again.');return;}
    render(index+1,true);
  }
  function render(next,watch=false){
    const old=currentVideo();if(old)old.remove();old?.pause();index=next;complete=false;const s=steps[index];
    section.querySelectorAll('[data-pipeline]').forEach((n,i)=>{n.classList.toggle('is-revealed',i<=index);n.classList.toggle('is-current',i===index);n.setAttribute('aria-pressed',String(i===index));});
    section.querySelectorAll('[data-flow]').forEach(n=>{const k=Number(n.dataset.flow);n.classList.toggle('is-traced',k>0?k<=index:index===5);n.classList.toggle('is-flowing',k===index||(index===5&&k===0));});
    document.getElementById('pipeline-source').textContent=s.source;
    document.getElementById('pipeline-title').textContent=s.title;
    document.getElementById('pipeline-description').textContent=s.description;
    const media=document.getElementById('pipeline-media');media.replaceChildren();
    if(s.video){const video=el('video');video.src='assets/'+s.video;video.poster='assets/'+s.poster;video.controls=true;video.muted=true;video.playsInline=true;video.preload='metadata';video.setAttribute('aria-label',s.videoLabel||s.source);video.addEventListener('ended',()=>{if(video===currentVideo())advance();});video.addEventListener('pause',()=>{if(video===currentVideo()&&running&&active()&&!video.ended)pause();});video.addEventListener('error',()=>{if(video===currentVideo()){running=false;status('Video unavailable. Use Next or select another stage to continue.');}});media.append(video,el('p',s.videoLabel||s.source,'pipeline-media-label'));if(watch)playVideo();}
    if(s.image){const a=el('a');a.href='assets/'+s.image;a.target='_blank';a.rel='noopener';const img=el('img');img.src=a.href;img.alt='Recorded skill segments with initial and final frames, source actions and generated labels';a.append(img);media.append(a,el('p','Click to read the recorded instructions.','pipeline-media-label'));}
    const record=document.getElementById('pipeline-record');record.replaceChildren();
    if(s.kind==='code'){const pre=el('pre');pre.textContent=trace.clips[8].turns[0].lines.map(l=>l.text).join('\n');record.append(pre,el('small','Selected lines from the executed program.'));}
    if(s.kind==='monitor'){const m=trace.clips[30].monitors[0];record.append(el('blockquote',m?m.text:'No recorded monitor excerpt available.'));}
    if(s.kind==='curation'){record.append(el('p','Text: OK · Video: success or useful partial progress','pipeline-verdict'));}
    if(s.kind==='train'||s.kind==='verify'){const d=trace.decisions[s.kind==='train'?45:70];record.append(el('strong',s.kind==='train'?'TRAIN':'CONFIRM','pipeline-verdict'));d.stats.forEach(([k,v])=>record.append(el('p',`${k}: ${v}`)));if(s.kind==='train')d.skills.forEach(skill=>record.append(el('div',skill,'skill-chip')));record.append(el('small',s.kind==='train'?'A WAIT decision continues deployment without training.':'A rejected candidate is reverted. Insufficient exposure returns STARVED and leaves memory unchanged.'));const details=el('details'),summary=el('summary','Original model response');details.append(summary,el('pre',d.raw));record.append(details);}
    if(s.kind==='memory'){record.append(el('p','Avoidance advice → unverified for the deployed checkpoint','pipeline-verdict'),el('small','Mechanism illustration. The trial 92 video shows later execution, not an isolated test of memory revision.'));}
    status();
  }
  function start(){
    running=true;
    if(complete){render(0,true);return;}
    const video=currentVideo();if(video?.ended)video.currentTime=0;
    status();playVideo();
  }
  play.addEventListener('click',()=>running?pause():start());
  function select(next){pause();render(next,true);}
  previous.addEventListener('click',()=>{if(index>0)select(index-1);});
  nextButton.addEventListener('click',()=>{if(index<steps.length-1)select(index+1);});
  document.getElementById('pipeline-reset').addEventListener('click',()=>select(0));
  section.querySelectorAll('[data-pipeline]').forEach(n=>n.addEventListener('click',()=>select(Number(n.dataset.pipeline))));
  function syncVisibility(){
    const video=currentVideo();
    if(!active()){video?.pause();return;}
    if(running){if(video?.ended)advance();else playVideo();}
  }
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncVisibility();},{threshold:.2}).observe(section);
  document.addEventListener('visibilitychange',syncVisibility);
  reduced.addEventListener('change',()=>{if(reduced.matches)pause();});
  render(0);
})();
