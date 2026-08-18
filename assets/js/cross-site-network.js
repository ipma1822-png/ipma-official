
(function(){
  if (document.getElementById('martial-network-dock')) return;
  const sites = [
    ['태권검도 WTKF','https://ipma1822-png.github.io/taekwonkumdo/'],
    ['경찰무도 IPMA','https://ipma.kr/'],
    ['드론순찰대 IDP','https://idp.ai.kr/']
  ];
  const host=(location.hostname||'').toLowerCase();
  const path=(location.pathname||'').toLowerCase();
  let current = host.includes('ipma.kr') ? '경찰무도 IPMA' :
                host.includes('idp.ai.kr') ? '드론순찰대 IDP' :
                (host.includes('github.io') && path.includes('taekwonkumdo')) ? '태권검도 WTKF' : '';
  const style=document.createElement('style');
  style.textContent=`
  #martial-network-dock{position:fixed;right:16px;bottom:16px;z-index:2147483000;font-family:system-ui,-apple-system,"Noto Sans KR",sans-serif}
  #martial-network-dock .mn-toggle{border:1px solid rgba(216,177,90,.55);background:#081629;color:#f2cc70;border-radius:999px;padding:10px 14px;font-weight:900;box-shadow:0 10px 30px rgba(0,0,0,.3);cursor:pointer}
  #martial-network-dock .mn-panel{display:none;position:absolute;right:0;bottom:48px;width:245px;background:#071426;border:1px solid rgba(255,255,255,.14);border-radius:16px;padding:10px;box-shadow:0 16px 44px rgba(0,0,0,.42)}
  #martial-network-dock.open .mn-panel{display:block}
  #martial-network-dock .mn-title{font-size:11px;color:#d8b15a;font-weight:900;padding:4px 6px 8px}
  #martial-network-dock a{display:block;text-decoration:none;color:#f4f7fb;padding:10px;border-radius:10px;font-size:13px;font-weight:800}
  #martial-network-dock a:hover{background:#132741}
  #martial-network-dock a.current{background:#162b46;color:#f2cc70}
  #martial-network-dock .mn-sep{height:1px;background:rgba(255,255,255,.12);margin:6px 2px}
  #martial-network-dock .mn-acts{color:#cbd5e1;font-weight:700}
  @media(max-width:640px){#martial-network-dock{right:10px;bottom:10px}.mn-panel{max-width:calc(100vw - 20px)}}
  `;
  document.head.appendChild(style);
  const dock=document.createElement('div'); dock.id='martial-network-dock';
  const links=sites.map(([label,url])=>`<a href="${url}" ${label===current?'class="current"':''}>${label}${label===current?' · 현재':''}</a>`).join('');
  dock.innerHTML=`<button class="mn-toggle" type="button">무도 네트워크 ☰</button><div class="mn-panel"><div class="mn-title">MARTIAL & PUBLIC SAFETY NETWORK</div>${links}<div class="mn-sep"></div><a class="mn-acts" href="https://acts.pe.kr/" target="_blank" rel="noopener">ACTS 선교연합 ↗ 새창</a></div>`;
  document.body.appendChild(dock);
  dock.querySelector('.mn-toggle').onclick=()=>dock.classList.toggle('open');
  document.addEventListener('click',e=>{if(!dock.contains(e.target))dock.classList.remove('open')});
})();
