(function(){
'use strict';
var saved=JSON.parse(document.getElementById('site-data').textContent);
var data=saved;          /* what is currently shown */
var root=document.getElementById('site');

/* ===== helpers ===== */
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function url(u){u=String(u||'').trim();return /^https?:\/\/[^\s"'<>]+$/i.test(u)?u:'';}
function img(u){u=String(u||'').trim();return (/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+\/=]+$/.test(u)||/^https:\/\/[^\s"'<>]+$/i.test(u)||/^img\/[\w.\-]+$/.test(u))?u:'';}
function uid(){return Math.random().toString(36).slice(2,10);}
function clone(o){return JSON.parse(JSON.stringify(o));}
function parseD(s){var p=String(s||'').split('-');return p.length===3?new Date(+p[0],+p[1]-1,+p[2]):null;}
var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var MONL=['January','February','March','April','May','June','July','August','September','October','November','December'];
var DAY=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
function sameDay(a,b){return a&&b&&a.getTime()===b.getTime();}
function longDate(s,monthOnly){var d=parseD(s);if(!d)return '';return monthOnly?MONL[d.getMonth()]+' '+d.getFullYear():d.getDate()+' '+MONL[d.getMonth()]+' '+d.getFullYear();}
function shortDate(s){var d=parseD(s);return d?DAY[d.getDay()]+' '+d.getDate()+' '+MON[d.getMonth()]:'';}
function paras(t){return String(t||'').split(/\n\s*\n/).map(function(p){return p.trim();}).filter(Boolean);}
function lines(t){return String(t||'').split('\n').map(function(p){return p.trim();}).filter(Boolean);}
var STRIPES='<div class="stripes" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span></div>';
var SWATCH=['var(--r1)','var(--r3)','var(--r5)','var(--r4)','var(--r2)','var(--r6)'];
var MATCH={'Home match':1,'Away match':1,'Cup match':1};
function pillClass(t){return t==='Home match'?'pill-home':t==='Away match'?'pill-away':t==='Cup match'?'pill-cup':t==='Meetup'||t==='Social'?'pill-meet':'pill-other';}
function upcoming(d){return d.events.filter(function(e){var x=parseD(e.date);return x&&x>=today;}).sort(function(a,b){return (a.date+(a.time||'99')).localeCompare(b.date+(b.time||'99'));});}
function newsSorted(d){return d.news.slice().sort(function(a,b){return String(b.date).localeCompare(String(a.date));});}

/* ===== public site rendering ===== */
function fixturesBtn(i,cls,style){var u=url(i.fixturesUrl);return u?'<a class="'+cls+'" href="'+esc(u)+'" target="_blank" rel="noopener"'+(style?' style="'+style+'"':'')+'>View fixtures</a>':'';}
function joinBtn(i,label){var u=url(i.joinUrl);return u?'<a class="btn btn-gold" href="'+esc(u)+'" target="_blank" rel="noopener">'+esc(label||'Become a member')+'</a>':'';}

function header(d){
  var i=d.info;
  return '<header class="site"><div class="wrap bar">'+
    '<a class="brand" href="#home" aria-label="Rainbow Spireites home">'+(img(i.crestSmall)?'<img src="'+i.crestSmall+'" alt="" width="34" height="40">':'')+'Rainbow Spireites</a>'+
    '<nav class="main" aria-label="Main"><a href="#home" data-nav="home">Home</a><a href="#who" class="wide">About</a><a href="#events" data-nav="events">Fixtures &amp; events</a><a href="#news" data-nav="news">News</a><a href="#contact" class="wide">Contact</a>'+
    (url(i.joinUrl)?'<a class="btn btn-gold" href="'+esc(url(i.joinUrl))+'" target="_blank" rel="noopener">Join us</a>':'')+'</nav></div>'+
    '<div class="wrap subnav" aria-label="Sections"><a href="#home" data-nav="home">Home</a><a href="#events" data-nav="events">Fixtures &amp; events</a><a href="#news" data-nav="news">News</a><a href="#contact">Contact</a></div>'+STRIPES+'</header>';
}

function eventRow(e){
  var d=parseD(e.date),isToday=sameDay(d,today);
  var sub=[e.time?esc(e.time):(MATCH[e.type]?'Kick-off TBC':''),esc(e.place)].filter(Boolean).join(' · ');
  var link=url(e.link);
  return '<li class="fx'+(isToday?' today':'')+'"><div class="fx-date"><span class="d">'+(d?d.getDate():'')+'</span><span class="m">'+(d?DAY[d.getDay()]+' '+MON[d.getMonth()]:'')+'</span></div>'+
    '<div><div class="fx-opp">'+esc(e.title)+'</div>'+(sub?'<div class="fx-sub">'+sub+'</div>':'')+
    ((e.details||link)?'<p class="fx-det">'+esc(e.details)+(link?(e.details?' ':'')+'<a href="'+esc(link)+'" target="_blank" rel="noopener">More info</a>':'')+'</p>':'')+'</div>'+
    '<div class="fx-badges">'+(isToday?'<span class="pill pill-today">Today</span>':'')+'<span class="pill '+pillClass(e.type)+'">'+esc(e.type||'Event')+'</span></div></li>';
}

function newsCard(n,crest){
  var th=img(n.photo)?'<img class="thumb" src="'+n.photo+'" alt="'+esc(n.photoAlt||'')+'" loading="lazy">':(img(crest)?'<img class="thumb crestthumb" src="'+crest+'" alt="">':'');
  var l=url(n.link);
  return '<article class="post">'+th+'<div class="meta">'+(n.tag?'<span class="tag">'+esc(n.tag)+'</span>':'')+'<time datetime="'+esc(n.date)+'">'+esc(longDate(n.date,n.monthOnly))+'</time></div>'+
    '<h3>'+esc(n.title)+'</h3><p>'+esc(n.body)+'</p>'+(l?'<a class="src" href="'+esc(l)+'" target="_blank" rel="noopener">Read more →</a>':'')+'</article>';
}

function who(q){
  var ph=img(q.photo)?'<img src="'+q.photo+'" alt="" loading="lazy">':'<span class="ph" aria-hidden="true">'+esc((q.name||'?').trim().charAt(0).toUpperCase())+'</span>';
  return '<div class="who">'+ph+'<div><span class="n">'+esc(q.name)+(q.kind?'<span class="kind">'+esc(q.kind)+'</span>':'')+'</span>'+(q.role?'<span class="r">'+esc(q.role)+'</span>':'')+'</div></div>';
}

function quotesSection(d,editorView){
  var qs=d.quotes||[];
  if(!qs.length&&!editorView)return '';
  var head='<div class="sec-head"><div><p class="eyebrow">In their words</p><h2>Why it matters</h2></div><p class="aside">'+esc(d.info.quotesIntro||'')+'</p></div>';
  if(!qs.length)return '<section class="band quotes-band" id="quotes"><div class="wrap">'+head+'<div class="empty"><p>No quotes yet. Only people who can edit the website see this box; visitors won\'t see this section until a quote is added.</p><button class="btn btn-gold" type="button" data-ed-open="quotes">Add the first quote</button></div></div></section>';
  var lead=qs.filter(function(q){return q.featured;})[0]||qs[0];
  var rest=qs.filter(function(q){return q!==lead;});
  return '<section class="band quotes-band" id="quotes"><div class="wrap">'+head+
    '<figure class="q-lead" style="margin:0 0 40px"><span class="q-mark" aria-hidden="true">&ldquo;</span><blockquote>'+esc(lead.text)+'</blockquote>'+who(lead)+'</figure>'+
    (rest.length?'<div class="q-grid">'+rest.map(function(q){return '<figure class="q-card" style="margin:0"><blockquote>&ldquo;'+esc(q.text)+'&rdquo;</blockquote>'+who(q)+'</figure>';}).join('')+'</div>':'')+
    '</div></section>';
}

function homeView(d,editorView){
  var i=d.info, up=upcoming(d), nx=up[0], news=newsSorted(d).slice(0,3);
  var nm='';
  if(!nx&&url(i.fixturesUrl)){nm='<div class="nextmatch"><div class="wrap"><div class="nm-info"><span class="nm-label">Fixtures</span><span class="nm-meta">See every Chesterfield FC match on the full fixture list.</span></div><a class="textlink" href="'+esc(url(i.fixturesUrl))+'" target="_blank" rel="noopener">View fixtures →</a></div></div>';}
  if(nx){var nd=parseD(nx.date);nm='<div class="nextmatch"><div class="wrap"><div class="nm-info"><span class="nm-label">'+(sameDay(nd,today)?'Today':'Next up')+'</span><span class="nm-teams">'+esc(nx.title)+'</span><span class="nm-meta">'+esc([shortDate(nx.date),nx.time||(MATCH[nx.type]?'Kick-off TBC':''),nx.place].filter(Boolean).join(' · '))+'</span></div><a class="textlink" href="#events">All dates →</a></div></div>';}
  var about=paras(i.about);
  var facts=[];
  if(i.founded)facts.push('<li>Founded <strong>'+esc(i.founded)+'</strong></li>');
  if(i.runBy)facts.push('<li>Run by <strong>'+esc(i.runBy)+'</strong></li>');
  facts.push('<li>Open to <strong>LGBTQ+ fans &amp; allies</strong></li>');
  var groups=lines(i.allianceGroups);
  var gal=d.gallery||[];
  return '<div data-view="home">'+
   '<section class="hero"><div class="wrap"><div class="hero-copy"><p class="eyebrow">'+esc(i.heroEyebrow)+'</p><h1>Proud to be<br><span class="rb">Spireites</span></h1>'+
     (i.motto?'<p class="motto">&ldquo;'+esc(i.motto)+'&rdquo;</p>':'')+'<p class="lede">'+esc(i.intro)+'</p><div class="actions">'+joinBtn(i)+'<a class="btn btn-ghost" href="#events">See our events</a>'+fixturesBtn(i,'btn btn-ghost')+'</div></div>'+
     (img(i.crest)?'<img class="crest" src="'+i.crest+'" alt="Rainbow Spireites crest: the Chesterfield FC badge in Pride colours">':'')+'</div></section>'+nm+
   '<section class="band" id="who"><div class="wrap split"><div><p class="eyebrow muted">Who we are</p><h2>'+esc(i.aboutHeading)+'</h2>'+
     (img(i.aboutPhoto)?'<figure class="photo about-photo"><img src="'+i.aboutPhoto+'" alt="'+esc(i.aboutCaption||'Rainbow Spireites')+'" loading="lazy">'+(i.aboutCaption?'<figcaption>'+esc(i.aboutCaption)+'</figcaption>':'')+'</figure>':'')+
     '</div><div class="prose">'+about.map(function(p){return '<p>'+esc(p)+'</p>';}).join('')+'<ul class="facts">'+facts.join('')+'</ul></div></div></section>'+
   '<section class="band do" id="what"><div class="wrap"><div class="sec-head"><div><p class="eyebrow muted">What we do</p><h2>On matchday and beyond</h2></div><p class="aside">'+esc(i.whatIntro)+'</p></div><div class="do-grid">'+
     d.whatWeDo.map(function(w,k){return '<article class="do-item"><span class="swatch" style="background:'+SWATCH[k%6]+'"></span><h3>'+esc(w.title)+'</h3><p>'+esc(w.text)+'</p></article>';}).join('')+'</div></div></section>'+
   quotesSection(d,editorView)+
   '<section class="band alliance-band" id="alliance"><div class="wrap split"><div><p class="eyebrow muted">Stronger together</p><h2>'+esc(i.allianceHeading)+'</h2><p class="lead-p">'+esc(i.allianceText)+'</p>'+
     (groups.length?'<ul class="alliance">'+groups.map(function(g){return '<li>'+esc(g)+'</li>';}).join('')+'</ul>':'')+'</div>'+
     (img(i.allianceImage)?'<figure class="photo"><img src="'+i.allianceImage+'" alt="Regional Alliance of LGBTQ+ Football Supporters\' Groups badges" loading="lazy"></figure>':'')+'</div></section>'+
   (gal.length?'<section class="band" id="gallery"><div class="wrap"><div class="sec-head"><div><p class="eyebrow muted">Gallery</p><h2>Out and about</h2></div><p class="aside">'+esc(i.galleryIntro)+'</p></div><div class="gallery">'+
     gal.map(function(g){return img(g.src)?'<figure><img src="'+g.src+'" alt="'+esc(g.alt||g.caption||'')+'" loading="lazy">'+(g.caption?'<figcaption>'+esc(g.caption)+'</figcaption>':'')+'</figure>':'';}).join('')+'</div></div></section>':'')+
   (news.length?'<section class="band" id="latest"><div class="wrap"><div class="sec-head"><div><p class="eyebrow muted">News</p><h2>Latest from the group</h2></div><a class="textlink" href="#news">All news →</a></div><div class="news-grid">'+news.map(function(n){return newsCard(n,i.crest);}).join('')+'</div></div></section>':'')+
  '</div>';
}

function eventsView(d){
  var i=d.info,up=upcoming(d);
  return '<div data-view="events" hidden><section class="pagehead"><div class="wrap"><p class="eyebrow">Dates for the diary</p><h1>Fixtures &amp; events</h1><p>'+esc(i.eventsIntro)+'</p>'+fixturesBtn(i,'btn btn-gold','margin-top:24px')+'</div></section>'+
   '<section class="band"><div class="wrap ev-layout"><div><div class="filters" role="group" aria-label="Filter dates">'+
   '<button class="chip" type="button" id="f-all" data-filter="all" aria-pressed="true">All</button><button class="chip" type="button" id="f-match" data-filter="match" aria-pressed="false">Matches</button><button class="chip" type="button" id="f-group" data-filter="group" aria-pressed="false">Group events</button></div>'+
   '<ol class="fixtures" id="fixtureList">'+(up.length?up.map(eventRow).join(''):'<li class="fx"><div></div><div class="fx-sub">New dates will be added here soon. Follow us on social media for the latest.</div></li>')+'</ol>'+
   '<p class="note">These are the events we\'re promoting. For every Chesterfield FC match, use the full fixture list'+(url(i.fixturesUrl)?': <a class="textlink" href="'+esc(url(i.fixturesUrl))+'" target="_blank" rel="noopener">View fixtures →</a>':'.')+'</p></div>'+
   '<aside class="aside-card"><span class="swatch" style="background:var(--r3)"></span><h3>Matchday meetups</h3><p>'+esc(i.meetupText)+'</p>'+
   (url(i.instagram)?'<div class="actions"><a class="btn btn-gold" href="'+esc(url(i.instagram))+'" target="_blank" rel="noopener">Follow on Instagram</a></div>':'')+'</aside></div></section></div>';
}

function newsView(d){
  var all=newsSorted(d),i=d.info;
  var lead=all.filter(function(n){return n.featured;})[0]||all[0];
  var rest=all.filter(function(n){return n!==lead;});
  var feat='';
  if(lead){var l=url(lead.link);
    feat='<article class="feature"><div class="feature-art">'+(img(lead.photo)?'<img src="'+lead.photo+'" alt="'+esc(lead.photoAlt||'')+'">':(img(i.crest)?'<img class="c" src="'+i.crest+'" alt="">':''))+'</div><div>'+
    '<div class="post" style="border:0;padding:0"><div class="meta">'+(lead.tag?'<span class="tag">'+esc(lead.tag)+'</span>':'')+'<time datetime="'+esc(lead.date)+'">'+esc(longDate(lead.date,lead.monthOnly))+'</time></div></div>'+
    '<h2 style="color:var(--blue)">'+esc(lead.title)+'</h2><p>'+esc(lead.body)+'</p>'+(l?'<a class="textlink" href="'+esc(l)+'" target="_blank" rel="noopener">Read more →</a>':'')+'</div></article>';}
  return '<div data-view="news" hidden><section class="pagehead"><div class="wrap"><p class="eyebrow">From the terraces</p><h1>News</h1><p>'+esc(i.newsIntro)+'</p></div></section>'+
   '<section class="band"><div class="wrap">'+(all.length?feat+'<div class="news-grid">'+rest.map(function(n){return newsCard(n,i.crest);}).join('')+'</div>':'<p class="muted">News stories will appear here.</p>')+'</div></section></div>';
}

function joinAndFooter(d){
  var i=d.info;
  var socials=[['Instagram',i.instagram],['Facebook',i.facebook],['X',i.x]].filter(function(s){return url(s[1]);});
  return '<section class="join" id="join">'+STRIPES+'<div class="wrap"><div><h2>'+esc(i.joinHeading)+'</h2><p>'+esc(i.joinText)+'</p></div><div class="cta">'+joinBtn(i)+(url(i.joinUrl)?'<p class="small">Opens our short membership form in a new tab.</p>':'')+'</div></div></section></main>'+
   '<footer class="site" id="contact">'+STRIPES+'<div class="wrap"><div><div class="big-brand">Rainbow<br>Spireites</div><p style="margin:12px 0 0;opacity:.75">Chesterfield FC LGBTQ+ Supporters Group</p></div>'+
   '<div><h4>Contact us</h4>'+(i.email?'<div class="email"><code id="email">'+esc(i.email)+'</code><button class="copy" id="copyBtn" type="button">Copy</button></div>':'')+
   '<h4 style="margin-top:28px">Explore</h4><ul class="flist"><li><a href="#events">Fixtures &amp; events</a></li>'+(url(i.fixturesUrl)?'<li><a href="'+esc(url(i.fixturesUrl))+'" target="_blank" rel="noopener">Full fixture list</a></li>':'')+'<li><a href="#news">News</a></li></ul></div>'+
   '<div><h4>Follow us</h4><ul class="flist">'+socials.map(function(s){return '<li><a href="'+esc(url(s[1]))+'" target="_blank" rel="noopener">'+s[0]+'</a></li>';}).join('')+'</ul></div>'+
   '<div class="legal"><span>© '+now.getFullYear()+' Rainbow Spireites. All rights reserved.</span><span>Chesterfield FC LGBTQ+ &amp; allies supporters club</span></div></div></footer>';
}

var currentFilter='all';
function applyFilter(){
  var list=document.getElementById('fixtureList');if(!list)return;
  var up=upcoming(data).filter(function(e){return currentFilter==='all'||(currentFilter==='match'?MATCH[e.type]:!MATCH[e.type]);});
  list.innerHTML=up.length?up.map(eventRow).join(''):'<li class="fx"><div></div><div class="fx-sub">Nothing coming up in this list yet.</div></li>';
  document.querySelectorAll('.chip').forEach(function(c){c.setAttribute('aria-pressed',String(c.dataset.filter===currentFilter));});
}

function render(d,keepScroll){
  var y=window.scrollY;
  data=d;
  root.innerHTML=header(d)+'<main>'+homeView(d,false)+eventsView(d)+newsView(d)+joinAndFooter(d);
  showView(true);
  if(currentFilter!=='all')applyFilter();
  if(keepScroll)window.scrollTo(0,y);
}

/* ===== views ===== */
var VIEWS=['home','events','news'];
function showView(noScroll){
  var h=(location.hash||'').slice(1);
  var view=VIEWS.indexOf(h)>-1?h:'home';
  root.querySelectorAll('[data-view]').forEach(function(v){v.hidden=v.dataset.view!==view;});
  root.querySelectorAll('[data-nav]').forEach(function(a){if(a.dataset.nav===view)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  if(noScroll)return;
  var t=(VIEWS.indexOf(h)>-1||!h)?null:document.getElementById(h);
  if(t)t.scrollIntoView();else window.scrollTo(0,0);
}
window.addEventListener('hashchange',function(){showView(false);});

root.addEventListener('click',function(ev){
  var chip=ev.target.closest('.chip');
  if(chip){currentFilter=chip.dataset.filter;applyFilter();return;}
  var cp=ev.target.closest('#copyBtn');
  if(cp){var el=document.getElementById('email');
    var sel=function(){var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r);cp.textContent='Selected';};
    try{navigator.clipboard.writeText(el.textContent).then(function(){cp.textContent='Copied';},sel);}catch(e){sel();}
    setTimeout(function(){cp.textContent='Copy';},2000);return;}
});

render(saved);
showView(false);

/* ===== Content from the Google Sheet =====
   Darren and Ellie edit the spreadsheet; the site reads each tab as CSV when it loads.
   If the sheet can't be reached, the built-in content above is shown instead. */
var SHEET_ID=(window.RS_CONFIG&&window.RS_CONFIG.sheetId)||'';
var CACHE_KEY='rs-sheet-cache-v1';

function parseCSV(t){
  var rows=[],row=[],f='',q=false,i=0,c;
  for(;i<t.length;i++){c=t[i];
    if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++;}else q=false;}else f+=c;}
    else if(c==='"')q=true;
    else if(c===','){row.push(f);f='';}
    else if(c==='\n'||c==='\r'){if(c==='\r'&&t[i+1]==='\n')i++;row.push(f);rows.push(row);row=[];f='';}
    else f+=c;}
  if(f!==''||row.length){row.push(f);rows.push(row);}
  return rows;
}
function norm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');}
function toObjects(rows){
  if(!rows.length)return [];
  var head=rows[0].map(norm);
  return rows.slice(1).map(function(r){var o={};head.forEach(function(h,k){o[h]=String(r[k]==null?'':r[k]).trim();});return o;})
    .filter(function(o){return Object.keys(o).some(function(k){return o[k];});});
}
function pick(o,names){for(var k=0;k<names.length;k++){var v=o[norm(names[k])];if(v)return v;}return '';}
function yes(v){return /^(y|yes|true|x|✓|✔)/i.test(String(v||'').trim());}

var MONTHS={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,sept:9,oct:10,nov:11,dec:12};
function pad(n){return (n<10?'0':'')+n;}
function iso(y,m,d){if(y<100)y+=2000;var t=new Date(y,m-1,d);if(t.getFullYear()!==y||t.getMonth()!==m-1||t.getDate()!==d)return null;return y+'-'+pad(m)+'-'+pad(d);}
/* Returns {date:'YYYY-MM-DD', monthOnly:bool} or null. UK order: day first. */
function monthNum(w){w=String(w||'').toLowerCase();return MONTHS[w.slice(0,4)]||MONTHS[w.slice(0,3)]||0;}
function parseDateCell(s){
  s=String(s||'').trim().replace(/(\d)(st|nd|rd|th)\b/gi,'$1').replace(/,/g,' ').replace(/\s+/g,' ');
  if(!s)return null;var m,mo;
  if((m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)))return {date:iso(+m[1],+m[2],+m[3])};
  if((m=s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/)))return {date:iso(+m[3],+m[2],+m[1])};
  if((m=s.match(/(\d{1,2}) ([a-z]{3,9}) (\d{2,4})/i))&&(mo=monthNum(m[2])))return {date:iso(+m[3],mo,+m[1])};
  if((m=s.match(/^([a-z]{3,9}) (\d{4})$/i))&&(mo=monthNum(m[1])))return {date:iso(+m[2],mo,1),monthOnly:true};
  return null;
}
function parseTime(s){
  s=String(s||'').trim().toLowerCase();var m=s.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?$/);
  if(!m)return '';var h=+m[1],mi=+(m[2]||0);
  if(m[3]==='pm'&&h<12)h+=12;if(m[3]==='am'&&h===12)h=0;
  if(!m[2]&&!m[3])return '';
  return h<24&&mi<60?pad(h)+':'+pad(mi):'';
}
var TYPE_MAP={home:'Home match',homematch:'Home match',away:'Away match',awaymatch:'Away match',cup:'Cup match',cupmatch:'Cup match',meetup:'Meetup',social:'Social'};
function eventType(s){return TYPE_MAP[norm(s)]||(s?String(s).trim():'Event');}
/* Google Drive share links become direct image links; other https links are used as they are. */
function photoLink(s){
  s=String(s||'').trim();if(!s)return '';
  var m=s.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=|thumbnail\?id=)([\w-]{10,})/)||s.match(/[?&]id=([\w-]{10,})/);
  if(m&&/google/.test(s))return 'https://drive.google.com/thumbnail?id='+m[1]+'&sz=w1600';
  if(/^https:\/\//i.test(s))return s;
  if(/^img\/[\w.\-]+$/.test(s))return s;
  return '';
}
var INFO_KEYS={
  'smalllineabovetheheadline':'heroEyebrow','motto':'motto','welcomesentence':'intro',
  'aboutusheading':'aboutHeading','aboutustext':'about','founded':'founded','runby':'runBy',
  'aboutusphotolink':'aboutPhoto','aboutusphotocaption':'aboutCaption',
  'whatwedointroduction':'whatIntro','quotesintroduction':'quotesIntro',
  'allianceheading':'allianceHeading','alliancetext':'allianceText','alliancemembergroups':'allianceGroups','alliancepicturelink':'allianceImage',
  'eventspageintroduction':'eventsIntro','matchdaymeetupsbox':'meetupText','newspageintroduction':'newsIntro','galleryintroduction':'galleryIntro',
  'viewfixturesbuttonlink':'fixturesUrl','joiningheading':'joinHeading','joiningtext':'joinText','membershipformlink':'joinUrl',
  'emailaddress':'email','instagramlink':'instagram','facebooklink':'facebook','xtwitterlink':'x','logocrestphotolink':'crest'
};
var PHOTO_INFO={aboutPhoto:1,allianceImage:1,crest:1};

function applySheet(base,t){
  var d=JSON.parse(JSON.stringify(base));
  if(t.events){d.events=t.events.map(function(o,k){
      var dt=parseDateCell(pick(o,['Date']));var title=pick(o,['Event name','Event','Title']);
      if(!dt||!dt.date||!title)return null;
      return {id:'s'+k,date:dt.date,time:parseTime(pick(o,['Time','Kick-off'])),title:title,type:eventType(pick(o,['Type'])),place:pick(o,['Where','Place']),details:pick(o,['Details']),link:pick(o,['Link','More info link'])};
    }).filter(Boolean);}
  if(t.news){d.news=t.news.map(function(o,k){
      var dt=parseDateCell(pick(o,['Date']));var title=pick(o,['Headline','Title']);
      if(!dt||!dt.date||!title)return null;
      return {id:'s'+k,date:dt.date,monthOnly:!!dt.monthOnly,tag:pick(o,['Label','Tag']),title:title,body:pick(o,['Story','Text']),photo:photoLink(pick(o,['Photo link','Photo'])),photoAlt:pick(o,['Photo description']),link:pick(o,['Read more link','Link']),featured:yes(pick(o,['Main story']))};
    }).filter(Boolean);}
  if(t.quotes){d.quotes=t.quotes.map(function(o,k){
      var text=pick(o,['Quote']),name=pick(o,['Who said it','Name']);
      if(!text||!name)return null;
      return {id:'s'+k,text:text.replace(/^["“]|["”]$/g,''),name:name,role:pick(o,['Their role','Role']),kind:pick(o,['Type']),photo:photoLink(pick(o,['Photo link','Photo'])),featured:yes(pick(o,['Big quote']))};
    }).filter(Boolean);}
  if(t.photos){var g=t.photos.map(function(o,k){
      var src=photoLink(pick(o,['Photo link','Photo']));if(!src)return null;
      return {id:'s'+k,src:src,caption:pick(o,['Caption']),alt:pick(o,['Description','Photo description'])||pick(o,['Caption'])};
    }).filter(Boolean);d.gallery=g;}
  if(t.info){t.info.forEach(function(o){
      var key=INFO_KEYS[norm(pick(o,['Setting']))];var v=pick(o,['Value']);
      if(!key||!v)return;
      if(PHOTO_INFO[key]){v=photoLink(v);if(!v)return;}
      d.info[key]=v.replace(/\\n/g,'\n');
    });
    var w=[1,2,3].map(function(n,k){var o=t.info.filter(function(r){return norm(pick(r,['Setting']))==='whatwedobox'+n+'heading';})[0];var p=t.info.filter(function(r){return norm(pick(r,['Setting']))==='whatwedobox'+n+'text';})[0];
      return {title:o?pick(o,['Value']):'',text:p?pick(p,['Value']):''};});
    w.forEach(function(x,k){if(d.whatWeDo[k]){if(x.title)d.whatWeDo[k].title=x.title;if(x.text)d.whatWeDo[k].text=x.text;}});
  }
  return d;
}

var TABS_TO_LOAD={events:'Events',news:'News',quotes:'Quotes',photos:'Photos',info:'Key info'};
function sheetURL(tab){return 'https://docs.google.com/spreadsheets/d/'+encodeURIComponent(SHEET_ID)+'/gviz/tq?tqx=out:csv&headers=1&sheet='+encodeURIComponent(tab)+'&_='+Date.now();}
function loadSheet(){
  if(!SHEET_ID)return Promise.resolve(null);
  var keys=Object.keys(TABS_TO_LOAD);
  return Promise.all(keys.map(function(k){
    return fetch(sheetURL(TABS_TO_LOAD[k]),{cache:'no-store'}).then(function(r){
      if(!r.ok)throw new Error('HTTP '+r.status);
      return r.text();
    }).then(function(txt){
      if(/^\s*</.test(txt))throw new Error('not CSV');
      return toObjects(parseCSV(txt));
    }).catch(function(){return undefined;});
  })).then(function(res){var t={},any=false;keys.forEach(function(k,n){if(res[n]!==undefined){t[k]=res[n];any=true;}});return any?t:null;});
}

/* show the last good copy straight away, then refresh from the sheet */
(function(){
  var cached=null;
  try{cached=JSON.parse(localStorage.getItem(CACHE_KEY)||'null');}catch(e){}
  if(cached&&cached.t){try{render(applySheet(saved,cached.t),true);}catch(e){}}
  loadSheet().then(function(t){
    if(!t)return;
    render(applySheet(saved,t),true);
    try{localStorage.setItem(CACHE_KEY,JSON.stringify({t:t,at:Date.now()}));}catch(e){}
  });
})();

})();
