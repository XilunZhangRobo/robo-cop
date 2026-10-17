(() => {
  const states = new WeakMap();
  function trailingMean(bits, size) {
    if (!/^[01]+$/.test(bits) || !Number.isInteger(size) || size < 1) throw new Error('Invalid trial data or window');
    let sum = 0;
    const points = [];
    for (let i = 0; i < bits.length; i++) {
      sum += Number(bits[i]);
      if (i >= size) sum -= Number(bits[i - size]);
      if (i >= size - 1) points.push({trial: i + 1, rate: 100 * sum / size});
    }
    return points;
  }
  window.trailingMean = trailingMean;
  window.drawDeploymentCurve = (host, {series, windows = [], events = [], selected}) => {
    const state = states.get(host) || {size: 20};
    states.set(host, state);
    const n = series[0].bits.length;
    if (series.some(s => s.bits.length !== n)) throw new Error('Unequal trial counts');
    const node = (tag, text) => {const e = document.createElement(tag); if (text) e.textContent = text; return e;};
    const svgNode = (tag, attrs, text) => {
      const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
      for (const [key, value] of Object.entries(attrs)) e.setAttribute(key, value);
      if (text !== undefined) e.textContent = text;
      return e;
    };
    function render() {
      host.replaceChildren();
      host.removeAttribute('role');
      const controls = node('label', 'Rolling window ');
      controls.className = 'curve-controls';
      const select = node('select');
      select.setAttribute('aria-label', 'Rolling success-rate window');
      [10,20].forEach(size => {const option = node('option', `${size} trials`); option.value = size; select.append(option);});
      select.value = state.size;
      select.addEventListener('change', () => {state.size = Number(select.value); render();});
      controls.append(select);
      const legend = node('span', series.map(s=>s.name).join(' / '));
      legend.className = 'curve-legend'; controls.append(legend); host.append(controls);
      const scroll = node('div'); scroll.className = 'curve-scroll';
      const svg = svgNode('svg', {viewBox:'0 0 940 330',role:'img','aria-label':`${state.size}-trial trailing success rate. All ${n} trials retained. ${series.map(s=>s.name).join(' and ')}.`});
      const x = t => 64 + (t-1)*846/(n-1), y = rate => 218-rate*1.55;
      windows.forEach(([a,b]) => svg.append(svgNode('rect',{x:x(a-.5),y:62,width:x(b+.5)-x(a-.5),height:156,fill:'#f0f2f5'})));
      [0,25,50,75,100].forEach(rate => {
        svg.append(svgNode('line',{x1:64,x2:910,y1:y(rate),y2:y(rate),stroke:'#e6e7eb'}));
        svg.append(svgNode('text',{x:52,y:y(rate)+4,'text-anchor':'end',fill:'#646b76','font-size':12},rate+'%'));
      });
      svg.append(svgNode('text',{x:64,y:17,fill:'#424957','font-size':12},'Task success rate'));
      events.forEach(([t,label],i) => {
        svg.append(svgNode('line',{x1:x(t),x2:x(t),y1:48,y2:218,stroke:'#959cac','stroke-dasharray':'3 4'}));
        svg.append(svgNode('text',{x:x(t),y:i%2?44:28,'text-anchor':t>n-5?'end':'middle',fill:'#555d6e','font-size':11},label));
      });
      series.forEach((s,index) => {
        const line = trailingMean(s.bits,state.size).map(p=>`${x(p.trial)},${y(p.rate)}`).join(' ');
        svg.append(svgNode('polyline',{points:line,fill:'none',stroke:s.color,'stroke-width':3,'stroke-linejoin':'round',...(s.dash?{'stroke-dasharray':'7 5'}:{})}));
        [...s.bits].forEach((bit,i)=>svg.append(svgNode('rect',{x:x(i+1)-2,y:252+index*22,width:4,height:bit==='1'?9:3,fill:bit==='1'?s.color:'#c7cbd2'})));
        svg.append(svgNode('text',{x:64,y:247+index*22,fill:s.color,'font-size':10},s.name+' · individual trials'));
      });
      if (selected) svg.append(svgNode('line',{x1:x(selected),x2:x(selected),y1:62,y2:218,stroke:'#333c4a','stroke-width':1}));
      const ticks=n===100?[1,25,50,75,100]:[1,10,20,30,40,50];
      ticks.forEach(t=>svg.append(svgNode('text',{x:x(t),y:235,'text-anchor':'middle',fill:'#646b76','font-size':12},t)));
      svg.append(svgNode('text',{x:490,y:310,'text-anchor':'middle',fill:'#646b76','font-size':12},'Deployment trial'));
      scroll.append(svg); host.append(scroll);
      const note=node('p',`${state.size}-trial trailing mean; starts at trial ${state.size}. Each estimate uses only the preceding ${state.size} trials, including the current one. Tall ticks = success; short grey ticks = failure. Shaded regions = candidate evaluation.`);
      note.className='curve-note';host.append(note);
    }
    render();
  };
})();
