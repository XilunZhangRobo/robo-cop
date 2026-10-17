(() => {
  const hero=document.querySelector('.hero');
  const videos=[...hero.querySelectorAll('.hero-mosaic video')];
  const button=hero.querySelector('.hero-motion');
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=preference.matches, visible=true;
  function sync(){
    button.textContent=paused?'Play background videos':'Pause background videos';
    button.setAttribute('aria-pressed',String(paused));
    videos.forEach(v=>{
      v.muted=true;
      if(paused||!visible||document.hidden)v.pause();
      else v.play().catch(()=>{button.textContent='Play background videos';});
    });
  }
  button.addEventListener('click',()=>{paused=videos.every(v=>v.paused)?false:true;sync();});
  preference.addEventListener('change',e=>{paused=e.matches;sync();});
  document.addEventListener('visibilitychange',sync);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0.05}).observe(hero);
  sync();
})();
