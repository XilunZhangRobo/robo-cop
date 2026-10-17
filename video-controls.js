(() => {
  const bound = new WeakSet();
  const time = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  function bind(video) {
    if (bound.has(video)) return;
    bound.add(video);
    const bar = document.createElement('div');
    bar.className = 'video-seek';
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '0';
    slider.step = '0.1';
    slider.value = '0';
    slider.disabled = true;
    slider.setAttribute('aria-label', 'Video position');
    const label = document.createElement('span');
    label.textContent = 'Loading duration…';
    bar.append(slider, label);
    video.after(bar);
    function sync() {
      const ready = Number.isFinite(video.duration) && video.duration > 0;
      slider.disabled = !ready;
      slider.max = ready ? String(video.duration) : '0';
      slider.value = ready ? String(video.currentTime) : '0';
      label.textContent = ready ? `${time(video.currentTime)} / ${time(video.duration)}` : 'Loading duration…';
      slider.setAttribute('aria-valuetext', label.textContent);
    }
    ['loadedmetadata', 'durationchange', 'timeupdate', 'seeked'].forEach(event => video.addEventListener(event, sync));
    video.addEventListener('emptied', () => {
      slider.disabled = true;
      slider.value = '0';
      label.textContent = 'Loading duration…';
    });
    slider.addEventListener('input', () => {
      if (slider.disabled) return;
      video.dispatchEvent(new Event('userseek'));
      video.currentTime = Number(slider.value);
      sync();
    });
    if (video.preload !== 'metadata') {
      video.preload = 'metadata';
      if (video.readyState === 0) video.load();
    }
    sync();
  }
  function scan() { document.querySelectorAll('video[controls]').forEach(bind); }
  scan();
  new MutationObserver(scan).observe(document.body, {childList: true, subtree: true});
})();
