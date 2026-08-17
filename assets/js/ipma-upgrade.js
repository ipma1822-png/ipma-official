
(function(){
 const t=document.querySelector('.ipma-menu-toggle'), n=document.querySelector('.ipma-mega-nav'); if(t&&n)t.addEventListener('click',()=>n.classList.toggle('open'));
 document.querySelectorAll('.ipma-nav-main').forEach(a=>a.addEventListener('click',e=>{if(innerWidth<=900){const item=a.closest('.ipma-nav-item'); if(item&&item.querySelector('.ipma-dropdown')){e.preventDefault(); item.classList.toggle('open')}}}));
 const modal=document.querySelector('.ipma-modal'), frame=document.querySelector('.ipma-modal-frame');
 document.querySelectorAll('.ipma-video-thumb').forEach(b=>b.addEventListener('click',()=>{if(!modal||!frame)return; const id=b.dataset.videoId; frame.innerHTML='<iframe src="https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0" title="'+(b.dataset.videoTitle||'영상')+'" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>'; modal.classList.add('open'); document.body.style.overflow='hidden'}));
 function close(){if(!modal)return;modal.classList.remove('open');if(frame)frame.innerHTML='';document.body.style.overflow=''}
 document.querySelector('.ipma-modal-close')?.addEventListener('click',close); modal?.addEventListener('click',e=>{if(e.target===modal)close()}); document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
})();
