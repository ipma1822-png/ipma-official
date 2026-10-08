(function(){
  const SUPABASE_URL='https://ojxarsfaewehwjidwgac.supabase.co';
  const SUPABASE_KEY='sb_publishable_ZoAZrV5rDmYDLxhXlnEXCw_lPqJfin0';
  const org=String(window.NETWORK_NOTICE_ORG||'ALL').toUpperCase();
  const list=document.getElementById('networkNoticeList');
  const count=document.getElementById('networkNoticeCount');
  if(!list) return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const language=()=>{const q=new URLSearchParams(location.search).get('lang');let saved='';try{saved=localStorage.getItem('ipma_language')||'';}catch(e){}return (q||saved||document.documentElement.lang||'ko').toLowerCase().split('-')[0]};
  const labels={
    ko:['통합공지','건','불러오는 중','공지를 불러오는 중입니다.','현재 표시할 글로벌 네트워크 공지가 없습니다.','중요','총재 메시지','전성권 총재','공지사항을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.','공지 조회 오류'],
    en:['Integrated notices','items','Loading','Loading notices...','There are no global network notices to display.','Important','President’s Message','President Jeon Seong Kweon','Unable to load notices. Please try again later.','Notice loading error'],
    zh:['综合公告','条','加载中','正在加载公告…','目前没有可显示的全球网络公告。','重要','总裁致辞','全成权总裁','无法加载公告，请稍后重试。','公告加载错误'],
    ja:['統合お知らせ','件','読み込み中','お知らせを読み込み中…','現在表示できるグローバルネットワークのお知らせはありません。','重要','総裁メッセージ','全成權総裁','お知らせを読み込めませんでした。後ほどお試しください。','読み込みエラー'],
    es:['Avisos integrados','avisos','Cargando','Cargando avisos…','No hay avisos de la red global para mostrar.','Importante','Mensaje del presidente','Presidente Jeon Seong Kweon','No se pudieron cargar los avisos. Inténtelo más tarde.','Error al cargar avisos'],
    fr:['Annonces intégrées','annonces','Chargement','Chargement des annonces…','Aucune annonce du réseau mondial à afficher.','Important','Message du président','Président Jeon Seong Kweon','Impossible de charger les annonces. Réessayez plus tard.','Erreur de chargement'],
    de:['Gemeinsame Mitteilungen','Einträge','Lädt','Mitteilungen werden geladen…','Keine globalen Netzwerkmitteilungen vorhanden.','Wichtig','Botschaft des Präsidenten','Präsident Jeon Seong Kweon','Mitteilungen konnten nicht geladen werden. Bitte später erneut versuchen.','Ladefehler'],
    pt:['Avisos integrados','avisos','Carregando','Carregando avisos…','Não há avisos da rede global para exibir.','Importante','Mensagem do presidente','Presidente Jeon Seong Kweon','Não foi possível carregar os avisos. Tente novamente mais tarde.','Erro ao carregar'],
    it:['Avvisi integrati','avvisi','Caricamento','Caricamento avvisi…','Nessun avviso della rete globale da mostrare.','Importante','Messaggio del presidente','Presidente Jeon Seong Kweon','Impossibile caricare gli avvisi. Riprova più tardi.','Errore di caricamento'],
    ru:['Общие объявления','объявлений','Загрузка','Загрузка объявлений…','Нет объявлений глобальной сети для отображения.','Важно','Обращение президента','Президент Чон Сон Квон','Не удалось загрузить объявления. Повторите попытку позже.','Ошибка загрузки'],
    mn:['Нэгдсэн мэдэгдэл','мэдэгдэл','Уншиж байна','Мэдэгдлийг ачаалж байна…','Одоогоор харуулах мэдэгдэл алга.','Чухал','Ерөнхийлөгчийн мэдэгдэл','Ерөнхийлөгч Жон Сон Квон','Мэдэгдлийг ачаалж чадсангүй. Дараа дахин оролдоно уу.','Ачаалах алдаа'],
    vi:['Thông báo chung','thông báo','Đang tải','Đang tải thông báo…','Hiện không có thông báo mạng lưới toàn cầu.','Quan trọng','Thông điệp của Chủ tịch','Chủ tịch Jeon Seong Kweon','Không thể tải thông báo. Vui lòng thử lại sau.','Lỗi tải thông báo'],
    th:['ประกาศรวม','รายการ','กำลังโหลด','กำลังโหลดประกาศ…','ไม่มีประกาศเครือข่ายทั่วโลกในขณะนี้','สำคัญ','สารจากประธาน','ประธาน Jeon Seong Kweon','ไม่สามารถโหลดประกาศได้ โปรดลองอีกครั้งภายหลัง','ข้อผิดพลาดในการโหลด'],
    id:['Pengumuman terpadu','item','Memuat','Memuat pengumuman…','Tidak ada pengumuman jaringan global untuk ditampilkan.','Penting','Pesan Presiden','Presiden Jeon Seong Kweon','Gagal memuat pengumuman. Silakan coba lagi nanti.','Kesalahan pemuatan'],
    ms:['Notis bersepadu','notis','Memuatkan','Memuatkan notis…','Tiada notis rangkaian global untuk dipaparkan.','Penting','Perutusan Presiden','Presiden Jeon Seong Kweon','Tidak dapat memuatkan notis. Sila cuba lagi kemudian.','Ralat memuatkan'],
    fil:['Pinagsamang abiso','abiso','Naglo-load','Kinukuha ang mga abiso…','Walang abiso ng pandaigdigang network na maipapakita.','Mahalaga','Mensahe ng Pangulo','Pangulong Jeon Seong Kweon','Hindi ma-load ang mga abiso. Subukan muli mamaya.','Error sa pag-load'],
    hi:['संयुक्त सूचनाएँ','सूचनाएँ','लोड हो रहा है','सूचनाएँ लोड हो रही हैं…','अभी कोई वैश्विक नेटवर्क सूचना उपलब्ध नहीं है।','महत्त्वपूर्ण','अध्यक्ष का संदेश','अध्यक्ष जिओन सियोंग क्वोन','सूचनाएँ लोड नहीं हो सकीं। कृपया बाद में प्रयास करें।','लोड त्रुटि'],
    ar:['الإعلانات الموحدة','إعلانًا','جارٍ التحميل','جارٍ تحميل الإعلانات…','لا توجد إعلانات للشبكة العالمية لعرضها حاليًا.','مهم','رسالة الرئيس','الرئيس جيون سونغ كوون','تعذر تحميل الإعلانات. يرجى المحاولة لاحقًا.','خطأ في التحميل'],
    tr:['Birleşik duyurular','duyuru','Yükleniyor','Duyurular yükleniyor…','Gösterilecek küresel ağ duyurusu yok.','Önemli','Başkanın Mesajı','Başkan Jeon Seong Kweon','Duyurular yüklenemedi. Lütfen daha sonra tekrar deneyin.','Yükleme hatası'],
    ne:['एकीकृत सूचनाहरू','सूचना','लोड हुँदैछ','सूचनाहरू लोड हुँदैछन्…','अहिले देखाउन कुनै विश्वव्यापी सञ्जाल सूचना छैन।','महत्त्वपूर्ण','अध्यक्षको सन्देश','अध्यक्ष जिओन सियोङ क्वोन','सूचनाहरू लोड हुन सकेनन्। पछि फेरि प्रयास गर्नुहोस्।','लोड त्रुटि']
  };
  const L=()=>labels[language()]||labels.en;
  const fmt=d=>d?new Date(d).toLocaleDateString(language()==='ko'?'ko-KR':language()==='en'?'en-US':language()):'';
  const active=x=>!x.expires_at || new Date(x.expires_at).getTime()>=Date.now();
  let cachedRows=null;
  function render(rows){
    const t=L();
    if(count)count.textContent=t[0]+' '+rows.length+' '+t[1];
    if(!rows.length){list.innerHTML='<div class="network-notice-empty">'+esc(t[4])+'</div>';return;}
    list.innerHTML=rows.map(x=>`<article class="network-notice-card ${x.is_pinned?'is-pinned':''}"><div class="network-notice-meta"><b>${x.is_pinned?'📌 '+esc(t[5]):'🌐 NETWORK'}</b><span>${esc(x.category||t[6])}</span><time>${fmt(x.published_at)}</time></div><h3>${esc(x.title)}</h3><p>${esc(x.content).replace(/\\n/g,'<br>')}</p><footer>${esc(x.author||t[7])}</footer></article>`).join('');
  }
  async function load(){
    try{
      const q='select=id,title,content,author,category,targets,is_pinned,published_at,expires_at&is_published=eq.true&order=is_pinned.desc,published_at.desc';
      const r=await fetch(SUPABASE_URL+'/rest/v1/network_notices?'+q,{headers:{apikey:SUPABASE_KEY}});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const data=await r.json();
      if(!Array.isArray(data))throw new Error('Invalid notice response');
      const rows=data.filter(x=>x&&active(x)&&Array.isArray(x.targets)&&(x.targets.includes('ALL')||x.targets.includes(org)));
      cachedRows=rows;render(rows);
    }catch(e){console.error('Network notice load error',e);const t=L();list.innerHTML='<div class="network-notice-empty">'+esc(t[8])+'</div>';if(count)count.textContent=t[9];}
  }
  window.addEventListener('ipma-language-change',()=>{if(cachedRows!==null)render(cachedRows);else if(count){const t=L();count.textContent=t[2];list.innerHTML='<div class="network-notice-empty">'+esc(t[3])+'</div>';}});
  load();
  setInterval(load,60000);
})();