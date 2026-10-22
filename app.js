const GENRES=['K-pop','힙합','R&B','인디','발라드','록','일렉트로닉','기타'];
const K='gwiro_v2';
let D=JSON.parse(localStorage.getItem(K)||'null')||{users:['나'],cur:'나',songs:[],reviews:[],played:{}};
D.reviews.forEach(r=>{if(r.verified===undefined&&!r.example)r.verified=true}); // 기존 평가는 70% 게이트를 통과한 것이므로 인증 처리
const save=()=>localStorage.setItem(K,JSON.stringify(D));const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DEBUG=new URLSearchParams(location.search).get('debug')==='1';
function parseYT(u){u=u.trim();let m=u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);if(m)return m[1];return /^[\w-]{11}$/.test(u)?u:null}
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;const f2=x=>x==null?'-':x.toFixed(2);
const all=()=>[...D.songs,...CATALOG];const song=id=>all().find(s=>s.id===id);
function userStats(u,genre){const rs=D.reviews.filter(r=>r.user===u);const g=rs.filter(r=>song(r.songId)?.genre===genre);
 return {all:mean(rs.map(r=>r.score)),n:rs.length,g:mean(g.map(r=>r.score)),gn:g.length}}
const vb=r=>r&&r.verified?'<span class="vbadge" title="끝까지 들은 평가" aria-label="끝까지 들은 평가">♪</span>':'';
const exTag=x=>x?'<span class="tag ex">예시</span>':'';
const cover=v=>v?`<img loading="lazy" src="https://i.ytimg.com/vi/${v}/hqdefault.jpg" alt="">`:'';
const revs=id=>D.reviews.filter(r=>r.songId===id);
function avgLine(id){const rs=revs(id);return rs.length?`<div class="avg">평균 ★ ${f2(mean(rs.map(r=>r.score)))} <span class="s">(${rs.length})</span></div>`:'<div class="avg none">아직 평가 없음</div>'}
const cardH=(s,rank)=>`<a class="cc" href="#/song/${s.id}"><div class="cv">${cover(s.vid)}${rank?`<span class="rank">${rank}</span>`:''}</div><div class="t">${esc(s.title)}</div><div class="s">${esc(s.artist)} · ${s.year||''}${s.user?' · 추가곡':''}</div>${avgLine(s.id)}</a>`;
const rowH=(title,list,more,ranked)=>list.length?`<section class="sec"><h2>${title}${more?`<a href="${more}">전체 보기 ›</a>`:''}</h2><div class="hrow">${withRowAds(list.map((s,i)=>cardH(s,ranked?i+1:0)))}</div></section>`:'';
function renderUsers(){$('#userSel').innerHTML=D.users.map(u=>`<option ${u===D.cur?'selected':''}>${esc(u)}</option>`).join('')}
$('#userSel').onchange=e=>{D.cur=e.target.value;save();route()};
$('#addUser').onclick=()=>{const n=prompt('새 사용자 이름');if(n&&n.trim()){const v=n.trim();if(!D.users.includes(v))D.users.push(v);D.cur=v;save();renderUsers();route()}};
let ytReady=false,ytCb=[];window.onYouTubeIframeAPIReady=()=>{ytReady=true;ytCb.forEach(f=>f());ytCb=[]};
(function(){const t=document.createElement('script');t.src='https://www.youtube.com/iframe_api';t.onerror=()=>console.warn('YouTube API 로드 실패');document.head.appendChild(t)})();
let timer=null,player=null;
function popular(){const S=all();const c=s=>revs(s.id).length;const rated=S.filter(c).sort((a,b)=>c(b)-c(a)||b.year-a.year);
 return [...rated,...S.filter(s=>!c(s)).slice(0,Math.max(0,20-rated.length))].slice(0,20)}
function home(){const q=(new URLSearchParams(location.hash.split('?')[1]||'').get('q')||'');
 const S=all();
 let body;
 if(q){const k=q.toLowerCase().replace(/\s/g,'');const res=S.filter(s=>(s.title+s.artist).toLowerCase().replace(/\s/g,'').includes(k));
  body=`<section class="sec"><h2>‘${esc(q)}’ 검색 결과 ${res.length}곡</h2></section>${res.length?`<div class="grid">${res.map(s=>cardH(s)).join('')}</div>`:'<p class="empty">검색 결과가 없어요. 오른쪽 위 “곡 추가”로 직접 추가할 수 있어요.</p>'}`}
 else{const latest=[...S].sort((a,b)=>b.year-a.year||(a.id<b.id?-1:1)).slice(0,20);
  const mine=D.songs.length?rowH('내가 추가한 곡',D.songs):'';
  body=adSlot('home_top')+recHome()+rowH('지금 많이 평가하는 곡',popular(),'#/all',true)+mine+GENRES.map(g=>{const l=S.filter(s=>s.genre===g);return rowH(g,l.slice(0,20),'#/all/'+encodeURIComponent(g))}).join('')}
 $('#app').innerHTML=`<div class="search"><input id="q" type="search" placeholder="곡 제목, 아티스트 검색" value="${esc(q)}" enterkeyhint="search"></div>
<div class="toolbar"><a class="chip" href="#/all">전체 보기 (${S.length})</a><button class="chip" id="addBtn">＋ 곡 추가</button><button class="chip" id="demo">예시 평가 불러오기</button><button class="chip" id="reset">초기화</button></div>${body}
<p class="note pad" style="margin-top:20px">누구나 별점을 남길 수 있고, 영상의 70% 이상을 실제로 재생한 뒤 남긴 평가에는 <span class="vbadge" title="끝까지 들은 평가">♪</span> 보라 음표 인증이 붙습니다. 예시 평가·예시 사용자는 데모용 가상 데이터이며, 곡 목록은 실제 곡입니다.</p>`;
 let tm;$('#q').oninput=e=>{clearTimeout(tm);tm=setTimeout(()=>{const v=e.target.value.trim();history.replaceState(null,'',v?'#/?q='+encodeURIComponent(v):'#/');home();const i=$('#q');i.focus();i.setSelectionRange(i.value.length,i.value.length)},250)};
 document.querySelectorAll('[data-tog]').forEach(b=>b.onclick=()=>{D.extTog=b.dataset.tog;save();home()});
 $('#addBtn').onclick=addDialog;$('#demo').onclick=seed;$('#reset').onclick=()=>{if(confirm('평가·사용자·추가곡 데이터를 모두 삭제할까요?')){localStorage.removeItem(K);location.hash='#/';location.reload()}}}
function addDialog(){const d=document.createElement('dialog');d.innerHTML=`<h3 style="margin:0 0 4px">곡 추가</h3><div class="s">카탈로그에 없는 곡을 YouTube 링크로 추가하세요.</div>
<label>YouTube URL</label><input id="url" placeholder="youtu.be/... · watch?v= · shorts · music.youtube.com">
<div class="row"><div><label>제목</label><input id="title"></div><div><label>아티스트</label><input id="artist"></div></div>
<div class="row"><div><label>장르</label><select id="genre" class="full">${GENRES.map(g=>`<option>${g}</option>`).join('')}</select></div><div><label>발매 연도</label><input id="year" type="number" inputmode="numeric" value="${new Date().getFullYear()}"></div></div>
<div id="msg" class="err"></div><div class="row" style="margin-top:12px"><button class="ghost" id="cx">취소</button><button id="add">추가</button></div>`;
 document.body.appendChild(d);d.showModal();d.querySelector('#cx').onclick=()=>d.remove();d.addEventListener('close',()=>d.remove());
 d.querySelector('#add').onclick=()=>{const g=x=>d.querySelector(x).value.trim();const vid=parseYT(g('#url')),t=g('#title'),a=g('#artist');
  if(!vid)return d.querySelector('#msg').textContent='올바른 YouTube URL이 아닙니다.';if(!t||!a)return d.querySelector('#msg').textContent='제목과 아티스트를 입력하세요.';
  const s={id:'s'+Date.now(),vid,title:t,artist:a,genre:g('#genre'),year:+g('#year')||new Date().getFullYear(),user:true};D.songs.unshift(s);save();d.remove();location.hash='#/song/'+s.id}}
function allPage(genre){genre=genre?decodeURIComponent(genre):'';const S=all().filter(s=>!genre||s.genre===genre).sort((a,b)=>b.year-a.year);
 $('#app').innerHTML=`<a class="back" href="#/">← 홈</a><section class="sec" style="margin-top:8px"><h2>전체 곡 <span class="s">${S.length}곡</span></h2></section>
<div class="filters"><a class="chip ${genre?'':'on'}" href="#/all">전체</a>${GENRES.map(g=>`<a class="chip ${g===genre?'on':''}" href="#/all/${encodeURIComponent(g)}">${g}</a>`).join('')}</div>
<div class="grid">${withRowAds(S.map(s=>cardH(s)))||'<p class="empty">곡이 없어요.</p>'}</div>`}
function seed(){D.reviews=D.reviews.filter(r=>!r.example);D.lastListened=D.lastListened||{};
 // 예시 데이터: 6명의 가상 사용자, 카탈로그 다수 곡. 일부 곡은 평가 수를 적게 두어 '숨은 명곡' 행이 채워지도록 함.
 const U={'예시_후한평론가':[4.4,.4,{}],'예시_짠손':[2.4,.4,{'힙합':-.5}],'예시_힙합헤드':[3.2,.4,{'힙합':1.2,'K-pop':-.4}],'예시_발라드러버':[3.4,.4,{'발라드':1,'R&B':.6}],'예시_인디키드':[3.3,.5,{'인디':1.1,'K-pop':-.3}],'예시_올라운더':[3.6,.6,{}],'예시_신규':[3.5,.3,{}]};
 let rnd=7;const r=()=>(rnd=(rnd*9301+49297)%233280)/233280;const T=['후렴이 계속 맴돌아요','사운드가 깔끔','기대 이하','명곡 인정','뮤비까지 완벽','가사가 와닿음','무난한 편'];
 const q=CATALOG.map((x,i)=>(i*37)%17/17); // 곡별 '품질' 가상값
 Object.entries(U).forEach(([u,[b,v,adj]],ui)=>{if(!D.users.includes(u))D.users.push(u);CATALOG.forEach((x,i)=>{if(u==='예시_신규'&&i>3)return;
  const p=i%5===4?0.25:0.75;if(r()>p)return;
  let sc=Math.round((b+(adj[x.genre]||0)+(r()-.5)*2*v+(q[i]-.5)*1.6)*4)/4;sc=Math.min(5,Math.max(1,sc));
  D.reviews.push({songId:x.id,user:u,score:sc,text:T[(i+u.length)%T.length]+' (예시 리뷰)',verified:((i*13+ui*7+u.length)%10)<6,ts:Date.now()-i*36e5-ui*6e5,example:true});
  D.lastListened[u+'|'+x.id]=Date.now()-((i*7+ui*3)%40)*864e5})});
 if(D.reviews.filter(x=>x.user===D.cur).length<3)D.cur='예시_발라드러버';
 save();renderUsers();route()}
function songPage(id){const s=song(id);if(!s)return home();const key=D.cur+'|'+id;const rs=revs(id);
 const raw=mean(rs.map(r=>r.score));const gm=mean(D.reviews.map(r=>r.score));
 const adj=rs.length?mean(rs.map(r=>r.score-userStats(r.user).all))+gm:null;const mine=rs.find(r=>r.user===D.cur);const vr=rs.filter(r=>r.verified),vavg=mean(vr.map(r=>r.score)),vOnly=!!D.vOnly;
 $('#app').innerHTML=`<a class="back" href="javascript:history.length>1?history.back():location.hash='#/'">← 뒤로</a>
<div class="hero"><div class="bg" style="background-image:url(https://i.ytimg.com/vi/${s.vid}/hqdefault.jpg)"></div><div class="cv">${cover(s.vid)}</div>
<div style="min-width:0"><h1>${esc(s.title)}</h1><div class="s" style="color:#cfd3dd">${esc(s.artist)}</div><div class="s">${s.year||''} · <span class="tag">${esc(s.genre)}</span>${s.user?'<span class="tag">사용자 추가곡</span>':''}</div>
<div style="margin-top:6px;font-weight:800;color:#ff8fb1">${rs.length?`평균 ★ ${f2(raw)} <span class="s">(${rs.length}명)</span>`:'<span class="s">아직 평가 없음</span>'}</div>${rs.length?`<div class="vline"><span class="vbadge" title="끝까지 들은 평가">♪</span> 인증 청취 ${vr.length}명 · 인증 평균 ★ ${f2(vavg)}</div>`:''}</div></div>
<div class="card" style="margin-top:6px"><div class="player"><div id="yt"></div></div>
<div style="margin-top:10px" class="s" id="vt">청취 진행 0% / 70%</div><div class="bar"><i id="pb" style="width:0"></i><div class="goal"></div></div><div class="note">끝까지(70% 이상) 들으면 보라 음표 <span class="vbadge" title="끝까지 들은 평가">♪</span> 인증이 붙어요. 재생 중인 시간만 집계되며, 앞으로 건너뛴 구간은 포함되지 않습니다.${s.channel?` · 영상: ${esc(s.channel)}`:''}</div>
${DEBUG?'<div class="card debug" style="margin:10px 0 0"><b>디버그 모드</b> (?debug=1) — <button id="sim" class="sm">+30초 재생</button></div>':''}</div>
<div class="card" id="rate"><h3 style="margin-top:0">${mine?'내 평가 수정':'평가하기'} <span class="s">(${esc(D.cur)})</span></h3>${mine?`<div class="s" id="myr">내 평점 <b style="color:#ff8fb1">★ ${mine.score.toFixed(2)}</b> <span id="mybadge">${vb(mine)}</span></div>`:''}<div id="lockmsg" class="s">듣지 않아도 평가할 수 있어요.</div>
<div id="rc"><div class="big" id="sv">${(mine?.score??3).toFixed(2)}</div><input type="range" id="sl" min="1" max="5" step="0.25" value="${mine?.score??3}" style="width:100%">
<div class="row s" style="justify-content:space-between"><span style="flex:0">1.00</span><span style="flex:0">5.00</span></div><label>한줄평</label><input id="rt" maxlength="120" value="${esc(mine?.text||'')}" placeholder="짧은 리뷰를 남겨주세요"><button id="sub" style="margin-top:10px;width:100%">평가 등록</button></div></div>
<div class="card"><div class="stats"><div>단순 평균<b>${f2(raw)}</b><span class="s">${rs.length}개 평가</span></div><div>편향 보정 평균<b>${adj==null?'-':Math.min(5,Math.max(1,adj)).toFixed(2)}</b><span class="s">보정</span></div><div>인증 평균<b style="color:#a78bfa">${f2(vavg)}</b><span class="s"><span class="vbadge" title="끝까지 들은 평가">♪</span> ${vr.length}명</span></div></div>
<p class="note">편향 보정: 각 평가에서 그 평가자의 개인 평균을 뺀 값의 평균에 전체 평균(${f2(gm)})을 더해, 후하거나 짠 평가자의 영향을 줄였습니다.</p></div>
<div class="card"><h3 style="margin-top:0;display:flex;justify-content:space-between;align-items:center">리뷰 <span><button class="chip ${vOnly?'':'on'}" data-vo="0">전체</button> <button class="chip ${vOnly?'on':''}" data-vo="1">♪ 인증만</button></span></h3>${vOnly?`<p class="s">인증 청취 리뷰 ${vr.length}개 · 평균 ★ ${f2(vavg)}</p>`:''}${rs.filter(r=>!vOnly||r.verified).sort((a,b)=>b.ts-a.ts).map(r=>{const st=userStats(r.user,s.genre);
 const a=st.n<10?'평균 평가 수 부족':`평균 ${st.all.toFixed(1)}점`,g=(st.n<10||st.gn<5)?`${s.genre} 평균 평가 수 부족`:`${s.genre} 평균 ${st.g.toFixed(1)}점`;
 return `<div class="review"><div class="row" style="justify-content:space-between"><b style="flex:1"><a href="#/profile/${encodeURIComponent(r.user)}">${esc(r.user)}</a>${vb(r)} ${exTag(r.example)}</b><span class="score" style="flex:0;white-space:nowrap">${r.score.toFixed(2)}</span></div><div>${esc(r.text)}</div><div class="avgs">${a} · ${g}</div></div>`}).join('')||`<p class="s">${vOnly?'인증 청취 리뷰가 아직 없습니다.':'아직 리뷰가 없습니다.'}</p>`}</div>${adSlot('song_bottom')}${goodsRow(s)}`;
 const dur=()=>D.played[key]?.dur||0;
 function upd(){const p=D.played[key]||{sec:0,dur:0};const pct=p.dur?Math.min(100,p.sec/p.dur*100):0;$('#pb').style.width=pct+'%';
  $('#vt').textContent=`청취 진행 ${Math.floor(pct)}% / 70%`+(p.dur?` · ${Math.floor(p.sec)}초 / ${Math.floor(p.dur)}초`:'');const done=pct>=70;
  const m=D.reviews.find(r=>r.user===D.cur&&r.songId===id);
  if(done&&m&&!m.verified){m.verified=true;save();const b=$('#mybadge');if(b)b.innerHTML=vb(m)}
  $('#lockmsg').innerHTML=done?(m?'<span class="vbadge">♪</span> 끝까지 들은 평가로 인증됐어요.':'<span class="vbadge">♪</span> 청취 인증 완료! 지금 남기는 평가에 보라 음표가 붙어요.'):(m&&m.verified?'<span class="vbadge">♪</span> 이미 인증된 평가예요.':'듣지 않아도 평가할 수 있어요. 끝까지 들으면 보라 음표 <span class="vbadge">♪</span> 인증이 붙어요.')}
 const addSec=(d,du)=>{const p=D.played[key]||(D.played[key]={sec:0,dur:0});if(d>0){(D.lastListened=D.lastListened||{})[key]=Date.now()}if(du)p.dur=du;p.sec=Math.min(p.dur||1e9,p.sec+d);save();upd()};
 $('#sl').oninput=e=>$('#sv').textContent=(+e.target.value).toFixed(2);
 $('#sub').onclick=()=>{const sc=+$('#sl').value;const t=$('#rt').value.trim();const p=D.played[key]||{};const ver=(p.dur&&p.sec/p.dur>=0.7)||!!mine?.verified;D.reviews=D.reviews.filter(r=>!(r.user===D.cur&&r.songId===id));D.reviews.push({songId:id,user:D.cur,score:sc,text:t,ts:Date.now(),verified:!!ver});save();route()};
 document.querySelectorAll('[data-vo]').forEach(b=>b.onclick=()=>{D.vOnly=b.dataset.vo==='1';save();const y=scrollY;route();scrollTo(0,y)});
 if(DEBUG)$('#sim').onclick=()=>addSec(30,dur()||200);
 upd();
 const mk=()=>{if(!$('#yt'))return;player=new YT.Player('yt',{videoId:s.vid,playerVars:{playsinline:1,rel:0},events:{onReady:()=>{addSec(0,player.getDuration())}}});
  let last=null,lastWall=null;timer=setInterval(()=>{if(!player?.getPlayerState)return;const st=player.getPlayerState(),ct=player.getCurrentTime(),now=performance.now();
   if(st===1&&last!=null){const d=ct-last,wall=(now-lastWall)/1000*(player.getPlaybackRate?.()||1);if(d>0&&d<=wall+0.6)addSec(d,player.getDuration())}
   last=st===1?ct:null;lastWall=now},500)};
 ytReady?mk():ytCb.push(mk)}
function profile(u){u=decodeURIComponent(u||D.cur);const st=userStats(u);const rows=GENRES.map(g=>{const x=userStats(u,g);return [g,x.g,x.gn]}).filter(x=>x[2]);
 const rated=D.reviews.filter(r=>r.user===u).sort((a,b)=>b.score-a.score).map(r=>song(r.songId)).filter(Boolean);
 $('#app').innerHTML=`<a class="back" href="#/">← 홈</a><div class="card taste" style="margin-top:10px"><div class="s" style="color:#cdd">음악 취향 카드</div><h2 style="margin:2px 0">${esc(u)} ${u.startsWith('예시_')?'<span class="tag ex">예시</span>':''}</h2>
<div class="s" style="color:#dde">평가 ${st.n}곡 · 전체 평균 ${st.n<10?'평가 수 부족':st.all.toFixed(2)+'점'}</div><div style="margin-top:12px">${rows.map(([g,a,n])=>`<div class="gbar"><span>${g}</span><div class="bar"><i style="width:${a/5*100}%"></i></div><span>${a.toFixed(2)} <small>(${n})</small></span></div>`).join('')||'<p>아직 평가가 없어요</p>'}</div>
<div class="note" style="color:#ccd;margin-top:10px">LisN · 누구나 평가, 끝까지 들으면 ♪ 인증</div></div><div class="pad"><button id="share" class="ghost">카드 공유 링크 복사</button></div>
${rowH('높게 평가한 곡',rated.slice(0,20))}
<div class="card" style="margin-top:14px"><h3 style="margin-top:0">사용자</h3>${D.users.map(x=>`<a href="#/profile/${encodeURIComponent(x)}" class="chip" style="margin:0 4px 6px 0">${esc(x)}</a>`).join('')}</div>`;
 $('#share').onclick=()=>{const l=location.href.split('#')[0]+'#/profile/'+encodeURIComponent(u);navigator.clipboard?.writeText(l).then(()=>alert('복사됨: '+l),()=>prompt('링크',l))}}
function route(){clearInterval(timer);try{player?.destroy?.()}catch(e){}player=null;renderUsers();const h=location.hash.slice(2).split('?')[0].split('/');
 if(h[0]==='song')songPage(h[1]);else if(h[0]==='profile')profile(h[1]);else if(h[0]==='all')allPage(h[1]);else home();
 adsFill();
 if(!location.hash.includes('?q='))scrollTo(0,0)}
window.onhashchange=route;route();
