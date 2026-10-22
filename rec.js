// LisN 추천·광고 모듈 (클라이언트 전용). 모든 광고/스폰서 정보는 점수 계산에 절대 사용하지 않습니다.
// ※ 리드머·이즘 등 외부 평론가 점수는 저작권/이용약관 문제로 복사·수집하지 않습니다. 평론가 점수 연동은 권한 협의 후 향후 작업.
const COUPANG_PARTNER_ID=''; // 쿠팡 파트너스 트래킹 ID (비어 있으면 일반 검색 링크)
const COUPANG_DISCLOSURE='이 페이지는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';
const FEATURED_IDS=['c005','c002','c010']; // 추천 음원(AD) 자리 — 현재는 예시 placeholder
const LISN_PICK_IDS=['c004']; // 우리 노래(LisN Pick) 하우스 슬롯
CATALOG.forEach(s=>{if(FEATURED_IDS.includes(s.id))s.featured=true;if(LISN_PICK_IDS.includes(s.id))s.lisnPick=true});
const BAYES_M=3; // 베이지안 사전 평가 수 m
const coupangUrl=q=>{let u='https://www.coupang.com/np/search?q='+encodeURIComponent(q);if(COUPANG_PARTNER_ID)u+='&lptag='+encodeURIComponent(COUPANG_PARTNER_ID);return u};
function goodsRow(s){const items=s?[['💿','앨범',s.artist+' '+s.title+' 앨범'],['🎧','헤드셋','블루투스 헤드셋'],['🎵','이어폰','무선 이어폰']]:[['💿','K-pop 앨범','K-pop 앨범'],['🎧','헤드셋','노이즈캔슬링 헤드셋'],['🎵','이어폰','무선 이어폰'],['🔊','스피커','블루투스 스피커']];
 return `<section class="sec"><h2>이 곡과 함께 <span class="tag ad">AD · 제휴</span></h2><div class="hrow">${items.map(([e,t,q])=>`<a class="gc" target="_blank" rel="sponsored noopener" href="${coupangUrl(q)}"><div class="ge">${e}</div><b>${esc(t)}</b><div class="s">${esc(q)}</div><div class="s">쿠팡에서 검색 ›</div></a>`).join('')}</div>
<p class="note pad disc">${COUPANG_DISCLOSURE}${COUPANG_PARTNER_ID?'':' <span class="s">(파트너 ID 설정 전 placeholder — 현재는 일반 검색 링크)</span>'}</p></section>`}
// 평가자 평균
function uMeans(){const m={};D.reviews.forEach(r=>{(m[r.user]=m[r.user]||[]).push(r.score)});for(const k in m)m[k]=mean(m[k]);return m}
// 1) 아이템 기반 협업 필터링 (평가자 평균으로 중심화한 adjusted cosine)
function recCF(u){const M=uMeans(),mine=D.reviews.filter(r=>r.user===u);if(mine.length<3)return {cold:true,list:[]};
 const by={};D.reviews.forEach(r=>{(by[r.songId]=by[r.songId]||{})[r.user]=r.score-M[r.user]});
 const rated=new Set(mine.map(r=>r.songId));const sim=(a,b)=>{let n=0,x=0,y=0;for(const k in a)if(k in b){n+=a[k]*b[k];x+=a[k]**2;y+=b[k]**2}return x&&y?n/Math.sqrt(x*y):0};
 const out=[];for(const j in by){if(rated.has(j))continue;let num=0,den=0;mine.forEach(r=>{const s=sim(by[r.songId],by[j]);if(s>0){num+=s*(r.score-M[u]);den+=s}});
  if(den>0.3)out.push([j,M[u]+num/den])}
 let list=out.sort((a,b)=>b[1]-a[1]).filter(x=>x[1]>=M[u]).map(x=>song(x[0])).filter(Boolean).slice(0,20),mode='cf';
 if(list.length<5){mode='genre';const gs=GENRES.map(g=>[g,userStats(u,g)]).filter(x=>x[1].gn).sort((a,b)=>b[1].g-a[1].g).map(x=>x[0]);
  const extra=all().filter(s=>!rated.has(s.id)&&!list.includes(s)).sort((a,b)=>gs.indexOf(a.genre)-gs.indexOf(b.genre)||0).filter(s=>gs.includes(s.genre));list=[...list,...extra].slice(0,20)}
 return {cold:false,list,mode}}
// 2) 다시 들어볼 곡: 높게 평가 + 최근 14일 내 청취 없음
function recRelisten(u){const M=uMeans()[u];const now=Date.now(),L=D.lastListened||{};
 return D.reviews.filter(r=>r.user===u&&(r.score>=4||r.score>=M+0.5)&&!(L[u+'|'+r.songId]>now-14*864e5)).sort((a,b)=>(L[u+'|'+a.songId]||0)-(L[u+'|'+b.songId]||0)||b.score-a.score).map(r=>song(r.songId)).filter(Boolean).slice(0,20)}
// 편향 보정 평균 + 베이지안 가중
function scores(){const M=uMeans(),C=mean(D.reviews.map(r=>r.score));const by={};D.reviews.forEach(r=>(by[r.songId]=by[r.songId]||[]).push(r));
 const res={};for(const id in by){const rs=by[id],v=rs.length,adj=Math.min(5,Math.max(1,mean(rs.map(r=>r.score-M[r.user]))+C)),raw=mean(rs.map(r=>r.score));res[id]={v,raw,adj,bayes:(v/(v+BAYES_M))*adj+(BAYES_M/(v+BAYES_M))*C}}return {res,C}}
// 3) 숨은 명곡: 보정평균 높음 + 평가 수 적음(또는 popularity 낮음)
function recHidden(){const {res,C}=scores();const ids=Object.keys(res);const vs=ids.map(i=>res[i].v).sort((a,b)=>a-b),med=vs[Math.floor(vs.length/2)]||0;
 return ids.filter(i=>{const s=song(i);const lowPop=s?.popularity!=null?s.popularity<50:res[i].v<=Math.max(2,med-1);return lowPop&&res[i].adj>=C+0.3}).sort((a,b)=>res[b].adj-res[a].adj).map(song).filter(Boolean).slice(0,20)}
function recExtremes(){const {res}=scores();const ids=Object.keys(res).filter(i=>res[i].v>=2);const by=k=>[...ids].sort((a,b)=>res[b][k]-res[a][k]);const t=by('raw');
 return {top:t.slice(0,15).map(song).filter(Boolean),bottom:t.reverse().slice(0,15).map(song).filter(Boolean)}}
function recBayes(){const {res}=scores();return Object.keys(res).sort((a,b)=>res[b].bayes-res[a].bayes).map(song).filter(Boolean).slice(0,20)}
const subRow=(title,sub,list,opts={})=>`<section class="sec"><h2>${title}${opts.more?`<a href="${opts.more}">전체 보기 ›</a>`:''}</h2><p class="sub">${sub}</p>${list.length?`<div class="hrow">${list.map((s,i)=>(opts.ad?adCard:cardH)(s,opts.ranked?i+1:0)).join('')}</div>`:`<p class="empty">${opts.empty||'표시할 곡이 아직 없어요.'}</p>`}</section>`;
const adCard=s=>cardH(s).replace('<div class="cv">',`<div class="cv"><span class="adb">${s.lisnPick?'LisN Pick':'AD · 예시'}</span>`);
function recHome(){const u=D.cur,cf=recCF(u),ex=recExtremes();const tog=D.extTog||'top';
 return subRow('추천 음원 <span class="tag ad">AD</span>','스폰서 자리(현재 예시 placeholder). 스폰서 여부는 평점·순위·추천 점수에 전혀 반영되지 않습니다.',all().filter(s=>s.featured),{ad:1})
 +subRow('우리 노래 <span class="tag">LisN Pick</span>','LisN 운영팀이 고른 하우스 추천 슬롯 (점수와 무관).',all().filter(s=>s.lisnPick),{ad:1})
 +subRow('당신의 평가 기반 추천',cf.cold?'평가 3곡 이상부터 추천해요.':cf.mode==='cf'?'아이템 기반 협업 필터링: 평가자별 평균을 뺀(중심화) 점수로 곡 간 유사도를 계산해, 내가 높게 준 곡과 비슷하게 평가된 곡을 예측합니다.':'유사 평가 데이터가 부족해 취향 카드의 장르별 평균이 높은 장르의 곡으로 보완했어요.',cf.list,{empty:`아직 평가가 ${D.reviews.filter(r=>r.user===u).length}곡이에요. 3곡 이상 평가하면 맞춤 추천이 열려요.`})
 +subRow('다시 들어볼 곡','내가 높게 준 곡(4점 이상 또는 내 평균+0.5 이상) 중 최근 14일간 듣지 않은 곡.',recRelisten(u),{empty:'높게 평가한 곡이 쌓이면 여기에 나타나요.'})
 +subRow('남들은 모르는 명곡','편향 보정 평균이 전체 평균보다 높지만 평가 수가 적은 곡 (popularity 필드가 있으면 그것도 사용).',recHidden())
 +subRow('신곡','발매 연도 최신순 (발매일 데이터가 없어 연도 기준).',[...all()].sort((a,b)=>(b.date||b.year+'').localeCompare(a.date||a.year+'')||(a.id<b.id?-1:1)).slice(0,20),{more:'#/all'})
 +`<section class="sec"><h2>평가 극과 극 <span><button class="chip ${tog==='top'?'on':''}" data-tog="top">최고</button> <button class="chip ${tog==='bottom'?'on':''}" data-tog="bottom">최저</button></span></h2><p class="sub">평가 2개 이상 곡의 단순 평균 ${tog==='top'?'상위':'하위'}. 평론가 점수 연동은 권한 협의 후 추가 예정(현재 미사용).</p><div class="hrow">${ex[tog].map(s=>cardH(s)).join('')||''}</div>${ex[tog].length?'':'<p class="empty">평가가 더 필요해요.</p>'}</section>`
 +subRow('LisN 알고리즘 명곡',`<span title="WR = v/(v+m)·R + m/(v+m)·C">베이지안 가중: WR = v/(v+m)·R + m/(v+m)·C (R=편향 보정 평균, v=평가 수, m=${BAYES_M}, C=전체 평균) ⓘ</span>`,recBayes(),{ranked:1})
 +goodsRow(null)}
