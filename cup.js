(() => {
  const data = window.CUP_TRACE;
  const host = document.getElementById('cup-deployment');
  const clips = {
    2: ['Early failure', 'Before training', 'sim-02.mp4'],
    33: ['Another failed attempt', 'Before training', 'sim-33.mp4'],
    55: ['Testing the first candidate', 'Candidate 1 · trials 46–70', 'sim-55.mp4'],
    72: ['A failed grasp, then recovery', 'First policy adopted', 'sim-72.mp4'],
    92: ['Testing the second candidate', 'Candidate 2 · trials 76–100', 'sim-92.mp4']
  };
  const events = {
    45: ['TRAIN 1', 'Evaluate the first candidate on trials 46–70.', ''],
    70: ['ADOPT 1', '15 of 25 trials succeed. The capability reviewer returns CONFIRM.', data.review70],
    75: ['TRAIN 2', '70 curated episodes, including 27 new episodes since the first training request. The controller targets cup pickup and placement again.', data.train75],
    100: ['ADOPT 2', '19 of 25 trials succeed. The reviewer returns CONFIRM. This run ends here; there is no post-adoption trial for this checkpoint.', data.review100]
  };
  function draw(selected) {
    window.drawDeploymentCurve(host.querySelector('.trial-chart'), {
      series:[{name:'Robo-COP',bits:data.outcomes,color:'#365faa'}],
      windows:[[46,70],[76,100]],
      events:[[45,'Train 1'],[70,'Adopt 1'],[75,'Train 2'],[100,'Adopt 2']],selected
    });
  }
  function evidence(t) {
    const [title,description,raw]=events[t];
    const panel=host.querySelector('.trace-body');
    panel.replaceChildren(element('p',`AFTER TRIAL ${t}`,'trace-label'),element('h3',title),element('p',description,'trace-description'));
    if(t===75)data.targets.forEach(skill=>panel.append(element('div',skill,'skill-chip')));
    if(raw)panel.append(rawDetails('Read the recorded model response',raw),element('p','Original model output; its reasoning is shown verbatim.','trace-footnote'));
    host.querySelectorAll('[data-cup-decision]').forEach(b=>{const active=Number(b.dataset.cupDecision)===t;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  }
  function select(t,play=true) {
    const [title,phase,file]=clips[t];
    const video=host.querySelector('video'); video.pause();
    video.src='assets/'+file;video.poster='assets/'+file.replace('.mp4','.jpg');video.load();
    video.setAttribute('aria-label',`Recycle cup clutter trial ${t}`);
    host.querySelector('.cup-title').textContent=title;
    host.querySelector('.cup-phase').textContent=`Trial ${t} / 100 · ${phase}`;
    host.querySelector('.cup-outcome').textContent=data.outcomes[t-1]==='1'?'Task completed':'Task not completed';
    host.querySelectorAll('[data-cup-trial]').forEach(b=>{const active=Number(b.dataset.cupTrial)===t;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    evidence(t<=45?45:t<=70?70:t<=75?75:100);draw(t);
    if(play)video.play().catch(()=>{});
  }
  host.querySelectorAll('[data-cup-trial]').forEach(b=>b.addEventListener('click',()=>select(Number(b.dataset.cupTrial))));
  host.querySelectorAll('[data-cup-decision]').forEach(b=>b.addEventListener('click',()=>{const t=Number(b.dataset.cupDecision);host.querySelector('video').pause();evidence(t);draw(t);}));
  select(2,false);
})();
