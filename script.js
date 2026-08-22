(() => {
  const cfg = window.GATEWAY_CONFIG || {};
  const slidesEl = document.getElementById('slides');
  const title = document.getElementById('heroTitle');
  const eyebrow = document.getElementById('heroEyebrow');
  const note = document.getElementById('heroNote');
  const now = document.getElementById('slideNow');
  const total = document.getElementById('slideTotal');
  const progress = document.getElementById('progressBar');
  const intervalMs = 7000;
  let index = 0, timer, touchX = 0;

  document.getElementById('version').textContent = `v${cfg.version || '1.0.0'}`;
  const slides = cfg.slides || [];
  total.textContent = String(slides.length).padStart(2,'0');

  slides.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = `slide${i===0?' active':''}`;
    div.style.backgroundImage = `url('${s.src}')`;
    div.setAttribute('role','img');
    div.setAttribute('aria-label', s.title || `슬라이드 ${i+1}`);
    slidesEl.appendChild(div);
  });
  const slideNodes = [...document.querySelectorAll('.slide')];

  function animateProgress(){
    progress.style.transition = 'none'; progress.style.width = '0%';
    requestAnimationFrame(()=>requestAnimationFrame(()=>{progress.style.transition=`width ${intervalMs}ms linear`;progress.style.width='100%';}));
  }
  function show(next){
    index = (next + slides.length) % slides.length;
    slideNodes.forEach((el,i)=>el.classList.toggle('active',i===index));
    const s=slides[index]; eyebrow.textContent=s.eyebrow||''; title.textContent=s.title||''; note.textContent=s.note||'';
    now.textContent=String(index+1).padStart(2,'0');
    animateProgress();
  }
  function play(){clearInterval(timer);timer=setInterval(()=>show(index+1),intervalMs);animateProgress();}
  document.getElementById('prevBtn').addEventListener('click',()=>{show(index-1);play()});
  document.getElementById('nextBtn').addEventListener('click',()=>{show(index+1);play()});
  document.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){show(index+1);play()} if(e.key==='ArrowLeft'){show(index-1);play()}});
  const hero=document.querySelector('.hero');
  hero.addEventListener('touchstart',e=>touchX=e.changedTouches[0].clientX,{passive:true});
  hero.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>50){show(index+(dx<0?1:-1));play()}},{passive:true});
  play();

  document.querySelectorAll('.world-section[data-bg]').forEach(el=>el.style.setProperty('--world-bg',`url('${el.dataset.bg}')`));

  const numberObserver = new IntersectionObserver(entries=>entries.forEach(ent=>{if(ent.isIntersecting){runCounters();numberObserver.disconnect();}}),{threshold:.35});
  numberObserver.observe(document.querySelector('.network'));
  function countTo(el,target,suffix=''){
    const dur=1800,start=performance.now();
    function step(t){const p=Math.min(1,(t-start)/dur),ease=1-Math.pow(1-p,3);el.textContent=Math.floor(target*ease).toLocaleString('ko-KR')+suffix;if(p<1)requestAnimationFrame(step)}
    requestAnimationFrame(step);
  }
  let countersStarted=false;
  function runCounters(){if(countersStarted)return;countersStarted=true;countTo(document.querySelector('[data-counter="countries"]'),cfg.stats?.countries||51);countTo(document.querySelector('[data-counter="branches"]'),cfg.stats?.branches||150,'+');loadMembers();}
  async function loadMembers(){
    const el=document.querySelector('[data-counter="members"]'), status=document.getElementById('memberStatus');
    const sb=cfg.supabase||{};
    if(sb.url && sb.anonKey && sb.table){
      try{
        const res=await fetch(`${sb.url}/rest/v1/${sb.table}?select=${encodeURIComponent(sb.memberCountColumn||'id')}`,{headers:{apikey:sb.anonKey,Authorization:`Bearer ${sb.anonKey}`,Prefer:'count=exact'},method:'HEAD'});
        const range=res.headers.get('content-range'); const count=range?Number(range.split('/')[1]):NaN;
        if(Number.isFinite(count)){el.textContent='0';countTo(el,count);status.textContent='LIVE · SUPABASE';return;}
      }catch(err){console.warn('member count',err)}
    }
    if(Number.isFinite(cfg.stats?.membersFallback)){el.textContent='0';countTo(el,cfg.stats.membersFallback);status.textContent='현재 등록 회원';}
    else {el.textContent='—';status.textContent='SUPABASE 연결 후 자동 표시';}
  }

  const dialog=document.getElementById('linkDialog');
  function enterSite(key){const url=cfg.links?.[key];if(url){window.location.href=url}else{dialog.showModal()}}
  document.querySelectorAll('[data-enter]').forEach(btn=>btn.addEventListener('click',()=>enterSite(btn.dataset.enter)));
  document.getElementById('dialogClose').onclick=()=>dialog.close();document.getElementById('dialogOk').onclick=()=>dialog.close();

  // User-initiated, copyright-free procedural ambient sound. Muted by default.
  let audioCtx, master, nodes=[],soundOn=false;
  const soundBtn=document.getElementById('soundBtn');
  soundBtn.addEventListener('click',()=>{
    if(!audioCtx){
      audioCtx=new (window.AudioContext||window.webkitAudioContext)();master=audioCtx.createGain();master.gain.value=.018;master.connect(audioCtx.destination);
      [55,82.41,110].forEach((f,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=i===0?'sine':'triangle';o.frequency.value=f;g.gain.value=i===0?.7:.18;o.connect(g).connect(master);o.start();nodes.push(o,g)});
    }
    soundOn=!soundOn; master.gain.setTargetAtTime(soundOn?.018:0,audioCtx.currentTime,.3);soundBtn.textContent=soundOn?'SOUND ●':'SOUND ○';soundBtn.setAttribute('aria-pressed',String(soundOn));
  });
})();
