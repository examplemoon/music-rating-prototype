const GENRES=['K-pop','힙합','R&B','인디','발라드','록','일렉트로닉','기타'];
const K='gwiro_v1';let D=JSON.parse(localStorage.getItem(K)||'null')||{users:['나'],cur:'나',songs:[],reviews:[],played:{}};
const save=()=>localStorage.setItem(K,JSON.stringify(D));const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DEBUG=new URLSearchParams(location.search).get('debug')==='1';
function parseYT(u){u=u.trim();let m=u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);if(m)return m[1];return /^[\w-]{11}$/.test(u)?u:null}
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;const f2=x=>x==null?'-':x.toFixed(2);
function userStats(u,genre){const rs=D.reviews.filter(r=>r.user===u);const g=rs.filter(r=>song(r.songId)?.genre===genre);
 return {all:mean(rs.map(r=>r.score)),n:rs.length,g:mean(g.map(r=>r.score)),gn:g.length}}
const song=id=>D.songs.find(s=>s.id===id);const exTag=x=>x?'<span class="tag ex">예시 데이터</span>':'';
const thumb=s=>s.vid?`<img src="https://i.ytimg.com/vi/${s.vid}/mqdefault.jpg" alt="" onerror="this.outerHTML='<div class=ph>🎵</div>'">`:'<div class="ph">예시<br>영상 없음</div>';
function renderUsers(){$('#userSel').innerHTML=D.users.map(u=>`<option ${u===D.cur?'selected':''}>${esc(u)}</option>`).join('')}
$('#userSel').onchange=e=>{D.cur=e.target.value;save();route()};
$('#addUser').onclick=()=>{const n=prompt('새 사용자 이름');if(n&&n.trim()){const v=n.trim();if(!D.users.includes(v))D.users.push(v);D.cur=v;save();renderUsers();route()}};
let ytReady=false,ytCb=[];window.onYouTubeIframeAPIReady=()=>{ytReady=true;ytCb.forEach(f=>f());ytCb=[]};
(function(){const t=document.createElement('script');t.src='https://www.youtube.com/iframe_api';t.onerror=()=>console.warn('YouTube API 로드 실패');document.head.appendChild(t)})();
let timer=null,player=null;
function home(){const list=D.songs.map(s=>{const rs=D.reviews.filter(r=>r.songId===s.id);return `<a class="song" href="#/song/${s.id}">${thumb(s)}<div class="meta"><div class="t">${esc(s.title)}</div><div class="s">${esc(s.artist)} · <span class="tag">${esc(s.genre)}</span>${exTag(s.example)}</div></div><div class="score">${rs.length?f2(mean(rs.map(r=>r.score))):'—'}<div class="s">${rs.length}명</div></div></a>`}).join('')||'<p class="s">아직 곡이 없습니다. 곡을 추가하거나 데모 데이터를 불러오세요.</p>';
$('#app').innerHTML=`<div class="card"><h3 style="margin-top:0">곡 추가</h3><label>YouTube URL</label><input id="url" placeholder="https://youtu.be/... / watch?v= / shorts / music.youtube.com">
<div class="row"><div><label>제목</label><input id="title"></div><div><label>아티스트</label><input id="artist"></div><div><label>장르</label><select id="genre" class="full">${GENRES.map(g=>`<option>${g}</option>`).join('')}</select></div></div>
<div class="row" style="margin-top:12px"><button id="add">추가</button><button id="demo" class="ghost">데모 데이터 불러오기</button><button id="reset" class="ghost">초기화</button></div><div id="msg" class="err"></div></div>
<div class="card"><h3 style="margin-top:0">곡 목록</h3>${list}</div><p class="note">평점은 영상의 70% 이상을 실제로 재생해야 남길 수 있습니다.</p>`;
$('#add').onclick=()=>{const vid=parseYT($('#url').value),t=$('#title').value.trim(),a=$('#artist').value.trim();
 if(!vid)return $('#msg').textContent='올바른 YouTube URL이 아닙니다.';if(!t||!a)return $('#msg').textContent='제목과 아티스트를 입력하세요.';
 const s={id:'s'+Date.now(),vid,title:t,artist:a,genre:$('#genre').value};D.songs.unshift(s);save();location.hash='#/song/'+s.id};
$('#demo').onclick=seed;$('#reset').onclick=()=>{if(confirm('모든 데이터를 삭제할까요?')){localStorage.removeItem(K);location.reload()}}}
function seed(){D.songs=D.songs.filter(s=>!s.example);D.reviews=D.reviews.filter(r=>!r.example);
 const S=[['9bZkp7q19f0','강남스타일','PSY','K-pop'],['gdZLi9oWNZg','Dynamite','BTS','K-pop'],['IHNzOHi8sJs','뚜두뚜두 (DDU-DU DDU-DU)','BLACKPINK','K-pop'],[null,'예시 곡 A','예시 아티스트 1','K-pop'],[null,'예시 곡 B','예시 아티스트 2','K-pop'],
 [null,'예시 힙합 1','예시 래퍼 1','힙합'],[null,'예시 힙합 2','예시 래퍼 2','힙합'],[null,'예시 힙합 3','예시 래퍼 3','힙합'],[null,'예시 힙합 4','예시 래퍼 4','힙합'],[null,'예시 힙합 5','예시 래퍼 5','힙합'],
 [null,'예시 발라드 1','예시 가수 1','발라드'],[null,'예시 R&B 1','예시 가수 2','R&B']];
 const U={'예시_후한평론가':[4.5,.4,{}],'예시_짠손':[2.25,.4,{'힙합':-.5}],'예시_힙합헤드':[3.25,.4,{'힙합':1.25,'K-pop':-.5}],'예시_신규':[3.5,.3,{}]};
 let rnd=7;const r=()=>(rnd=(rnd*9301+49297)%233280)/233280;
 S.forEach((x,i)=>D.songs.push({id:'ex'+i,vid:x[0],title:x[1],artist:x[2],genre:x[3],example:true}));
 Object.entries(U).forEach(([u,[b,v,adj]])=>{if(!D.users.includes(u))D.users.push(u);S.forEach((x,i)=>{if(u==='예시_신규'&&i>3)return;
  let sc=Math.round((b+(adj[x[3]]||0)+(r()-.5)*2*v+(i%3-1)*.25)*4)/4;sc=Math.min(5,Math.max(1,sc));
  D.reviews.push({songId:'ex'+i,user:u,score:sc,text:['좋아요, 반복 재생각','후렴이 약함','사운드가 깔끔','기대 이하','명곡 인정'][(i+u.length)%5]+' (예시 리뷰)',ts:Date.now()-i*36e5,example:true})})});
 save();renderUsers();route()}
function songPage(id){const s=song(id);if(!s)return home();const key=D.cur+'|'+id;const rs=D.reviews.filter(r=>r.songId===id);
 const raw=mean(rs.map(r=>r.score));const gm=mean(D.reviews.map(r=>r.score));
 const adj=rs.length?mean(rs.map(r=>r.score-userStats(r.user).all))+gm:null;const mine=rs.find(r=>r.user===D.cur);
 $('#app').innerHTML=`<a href="#/">← 목록</a><h2 style="margin:8px 0 2px">${esc(s.title)}</h2><div class="s">${esc(s.artist)} · <span class="tag">${esc(s.genre)}</span>${exTag(s.example)}</div>
<div class="card" style="margin-top:12px">${s.vid?'<div class="player"><div id="yt"></div></div>':'<div class="player"><div class="ph" style="width:100%;height:100%;font-size:1rem">예시 데이터 — 연결된 영상 없음</div></div>'}
<div style="margin-top:10px" class="s" id="vt">청취 인증 0% / 70%</div><div class="bar"><i id="pb" style="width:0"></i><div class="goal"></div></div><div class="note">재생 중인 시간만 집계되며, 앞으로 건너뛴 구간은 포함되지 않습니다.</div>
${DEBUG?'<div class="card debug" style="margin-top:10px"><b>디버그 모드</b> (?debug=1) — 재생 시뮬레이션 <button id="sim">+30초 재생</button></div>':''}</div>
<div class="card" id="rate"><h3 style="margin-top:0">${mine?'내 평가 수정':'평가하기'} <span class="s">(${esc(D.cur)})</span></h3><div id="lockmsg" class="s">🔒 70% 이상 들어야 평가할 수 있어요.</div>
<div id="rc"><div class="big" id="sv">${(mine?.score??3).toFixed(2)}</div><input type="range" id="sl" min="1" max="5" step="0.25" value="${mine?.score??3}" style="width:100%">
<div class="row s" style="justify-content:space-between"><span style="flex:0">1.00</span><span style="flex:0">5.00</span></div><label>한줄평</label><input id="rt" maxlength="120" value="${esc(mine?.text||'')}" placeholder="짧은 리뷰를 남겨주세요"><button id="sub" style="margin-top:10px;width:100%">평가 등록</button></div></div>
<div class="card"><div class="stats"><div>단순 평균<b>${f2(raw)}</b><span class="s">${rs.length}개 평가</span></div><div>편향 보정 평균<b>${adj==null?'-':Math.min(5,Math.max(1,adj)).toFixed(2)}</b><span class="s">보정</span></div></div>
<p class="note">편향 보정: 각 평가에서 그 평가자의 개인 평균을 뺀 값의 평균에 전체 평균(${f2(gm)})을 더해, 후하거나 짠 평가자의 영향을 줄였습니다.</p></div>
<div class="card"><h3 style="margin-top:0">리뷰</h3>${rs.sort((a,b)=>b.ts-a.ts).map(r=>{const st=userStats(r.user,s.genre);
 const a=st.n<10?'평균 평가 수 부족':`평균 ${st.all.toFixed(1)}점`,g=(st.n<10||st.gn<5)?`${s.genre} 평균 평가 수 부족`:`${s.genre} 평균 ${st.g.toFixed(1)}점`;
 return `<div class="review"><div class="row" style="justify-content:space-between"><b style="flex:1"><a href="#/profile/${encodeURIComponent(r.user)}">${esc(r.user)}</a> ${exTag(r.example)}</b><span class="score" style="flex:0">${r.score.toFixed(2)}</span></div><div>${esc(r.text)}</div><div class="avgs">${a} · ${g}</div></div>`}).join('')||'<p class="s">아직 리뷰가 없습니다.</p>'}</div>`;
 const dur=()=>D.played[key]?.dur||0;
 function upd(){const p=D.played[key]||{sec:0,dur:0};const pct=p.dur?Math.min(100,p.sec/p.dur*100):0;$('#pb').style.width=pct+'%';
  $('#vt').textContent=`청취 인증 ${Math.floor(pct)}% / 70%`+(p.dur?` · ${Math.floor(p.sec)}초 / ${Math.floor(p.dur)}초`:'');const ok=pct>=70||!!mine;
  $('#rc').classList.toggle('locked',!ok);$('#sub').disabled=!ok;$('#lockmsg').textContent=ok?(mine&&pct<70?'✅ 이미 청취 인증된 곡입니다.':'✅ 청취 인증 완료! 평가할 수 있어요.'):'🔒 70% 이상 들어야 평가할 수 있어요.'}
 const addSec=(d,du)=>{const p=D.played[key]||(D.played[key]={sec:0,dur:0});if(du)p.dur=du;p.sec=Math.min(p.dur||1e9,p.sec+d);save();upd()};
 $('#sl').oninput=e=>$('#sv').textContent=(+e.target.value).toFixed(2);
 $('#sub').onclick=()=>{const sc=+$('#sl').value;const t=$('#rt').value.trim();D.reviews=D.reviews.filter(r=>!(r.user===D.cur&&r.songId===id));D.reviews.push({songId:id,user:D.cur,score:sc,text:t,ts:Date.now()});save();route()};
 if(DEBUG)$('#sim').onclick=()=>addSec(30,dur()||200);
 upd();if(!s.vid)return;
 const mk=()=>{player=new YT.Player('yt',{videoId:s.vid,playerVars:{playsinline:1,rel:0},events:{onReady:()=>{addSec(0,player.getDuration())}}});
  let last=null,lastWall=null;timer=setInterval(()=>{if(!player?.getPlayerState)return;const st=player.getPlayerState(),ct=player.getCurrentTime(),now=performance.now();
   if(st===1&&last!=null){const d=ct-last,wall=(now-lastWall)/1000*(player.getPlaybackRate?.()||1);if(d>0&&d<=wall+0.6)addSec(d,player.getDuration())}
   last=st===1?ct:null;lastWall=now},500)};
 ytReady?mk():ytCb.push(mk)}
function profile(u){u=decodeURIComponent(u||D.cur);const st=userStats(u);const rows=GENRES.map(g=>{const x=userStats(u,g);return [g,x.g,x.gn]}).filter(x=>x[2]);
 $('#app').innerHTML=`<a href="#/">← 목록</a><div class="card taste" style="margin-top:10px"><div class="s" style="color:#cdd">내 음악 취향 카드</div><h2 style="margin:2px 0">${esc(u)} ${u.startsWith('예시_')?'<span class="tag ex">예시 데이터</span>':''}</h2>
<div class="s" style="color:#dde">평가 ${st.n}곡 · 전체 평균 ${st.n<10?'평가 수 부족':st.all.toFixed(2)+'점'}</div><div style="margin-top:12px">${rows.map(([g,a,n])=>`<div class="gbar"><span>${g}</span><div class="bar"><i style="width:${a/5*100}%"></i></div><span>${a.toFixed(2)} <small>(${n})</small></span></div>`).join('')||'<p>아직 평가가 없어요</p>'}</div>
<div class="note" style="color:#ccd;margin-top:10px">귀로평가 · 끝까지 듣고 남긴 평점</div></div><button id="share" class="ghost">카드 공유 링크 복사</button>
<div class="card" style="margin-top:12px"><h3 style="margin-top:0">사용자</h3>${D.users.map(x=>`<a href="#/profile/${encodeURIComponent(x)}" class="tag">${esc(x)}</a>`).join(' ')}</div>`;
 $('#share').onclick=()=>{const l=location.href.split('#')[0]+'#/profile/'+encodeURIComponent(u);navigator.clipboard?.writeText(l).then(()=>alert('복사됨: '+l),()=>prompt('링크',l))}}
function route(){clearInterval(timer);try{player?.destroy?.()}catch(e){}player=null;renderUsers();const h=location.hash.slice(2).split('/');
 if(h[0]==='song')songPage(h[1]);else if(h[0]==='profile')profile(h[1]);else home();
 if(!$('#myp')){const a=document.createElement('a');a.id='myp';a.href='#/profile/';a.textContent='내 프로필';a.className='tag';$('.user').prepend(a)}scrollTo(0,0)}
window.onhashchange=route;route();
