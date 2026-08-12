// Audio pengawas: fail M4A dalam folder audio.
let bank=null,qs=[],writing=[],phase="idle",qidx=0,answers={},times={},qStarted=0,timer=5400,wTimer=2700,interval=null,winterval=null,selectedTopic=0,abStartedAt=null,cStartedAt=null;
const $=id=>document.getElementById(id);
async function load(){const r=await fetch("data/set01.json");bank=await r.json();qs=bank.questions;writing=bank.writing}
function show(id){["start","briefing","exam","writing","result"].forEach(x=>$(x).classList.add("hidden"));$(id).classList.remove("hidden")}
function audio(name){const a=new Audio("audio/"+name);a.preload="auto";return a}
const audioFiles={ab:audio("arahan-ab.m4a"),c:audio("arahan-c.m4a"),ten:audio("amaran-10-minit.m4a"),five:audio("amaran-5-minit.m4a"),end:audio("masa-tamat.m4a")};
function playAnnouncement(key,after){
 const a=audioFiles[key]; $("voiceStatus").textContent="Sila dengar arahan sehingga selesai.";
 let finished=false;
 const done=()=>{if(finished)return;finished=true;a.onended=null;setTimeout(after,1400)};
 a.onended=done;
 a.onerror=()=>{if(finished)return;finished=true;setTimeout(after,2500)};
 const p=a.play(); if(p&&p.catch)p.catch(()=>{setTimeout(after,2500)});
}
function countdown(callback){
 $("voiceStatus").textContent="Arahan selesai. Bersedia…";
 let n=3;$("count").textContent=n;
 const t=setInterval(()=>{n--;if(n>0)$("count").textContent=n;else{$("count").textContent="MULA";clearInterval(t);setTimeout(callback,700)}},1000)
}
function beginABBriefing(){
 phase="abBrief";show("briefing");$("briefingTitle").textContent="Bahagian A + B";$("count").textContent="";
 $("voiceText").textContent="Calon diminta memberikan perhatian. Sila dengar arahan pengawas sehingga selesai.";
 playAnnouncement("ab",()=>countdown(startAB));
}
function startAB(){
 phase="ab";qidx=0;answers={};times={};timer=5400;qStarted=Date.now();abStartedAt=Date.now();show("exam");renderTimer();renderQ();
 clearInterval(interval);interval=setInterval(()=>{timer--;renderTimer();
  if(timer===600)playAudioOnly("ten");
  if(timer===300)playAudioOnly("five");
  if(timer<=0){clearInterval(interval);playAudioOnly("end");finishAB(true)}
 },1000)
}
function playAudioOnly(key){const a=audioFiles[key];a.currentTime=0;a.play().catch(()=>{})}
function renderTimer(){const m=Math.floor(timer/60).toString().padStart(2,"0"),s=(timer%60).toString().padStart(2,"0");$("timer").textContent=`${m}:${s}`}
function saveTime(){if(qStarted){times[qidx]=(times[qidx]||0)+(Date.now()-qStarted);qStarted=Date.now()}}
function renderQ(){
 const q=qs[qidx];$("sectionPill").textContent=q.section;$("cat").textContent=q.category;$("qnum").textContent=`Soalan ${qidx+1} daripada ${qs.length}`;
 $("qtext").textContent=q.question;$("answeredCount").textContent=`${Object.keys(answers).length} / ${qs.length}`;
 $("opts").innerHTML=q.options.map((o,i)=>`<label class="opt ${answers[q.id]===i?"selected":""}"><input type="radio" name="opt" ${answers[q.id]===i?"checked":""} onchange="answer(${i})"><span><b>${String.fromCharCode(65+i)}.</b> ${escapeHtml(o)}</span></label>`).join("");
 $("prevBtn").disabled=qidx===0;$("nextBtn").textContent=qidx===qs.length-1?"HANTAR A + B →":"SETERUSNYA →";
 $("grid").innerHTML=qs.map((x,i)=>`<button class="${answers[x.id]!==undefined?"done ":""}${i===qidx?"current":""}" onclick="gotoQ(${i})">${i+1}</button>`).join("");
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function answer(i){answers[qs[qidx].id]=i;renderQ()}
function gotoQ(i){saveTime();qidx=i;renderQ()}
function nextQ(){saveTime();if(qidx<qs.length-1){qidx++;renderQ()}else confirmFinish()}
function prevQ(){if(qidx>0){saveTime();qidx--;renderQ()}}
function confirmFinish(){if(confirm("Hantar Bahagian A + B sekarang? Selepas dihantar, anda akan terus ke Bahagian C."))finishAB(false)}
function finishAB(auto){
 if(phase!=="ab")return;saveTime();clearInterval(interval);phase="cBrief";
 show("briefing");$("briefingTitle").textContent="Bahagian C — Artikulasi Penulisan";$("count").textContent="";
 $("voiceText").textContent=auto?"Masa Bahagian A dan Bahagian B telah tamat. Sila dengar arahan seterusnya untuk Bahagian C.":"Bahagian A dan Bahagian B telah selesai. Sila dengar arahan untuk Bahagian C.";
 playAnnouncement("c",()=>countdown(startWriting));
}
function startWriting(){
 phase="c";show("writing");wTimer=2700;cStartedAt=Date.now();selectedTopic=0;renderWTimer();
 $("topics").innerHTML=writing.map((t,i)=>`<label class="topic ${i===0?"selected":""}" onclick="selectTopic(${i})"><input type="radio" name="topic" ${i===0?"checked":""}><b>${t.title}</b><span>${t.prompt}</span></label>`).join("");
 $("essay").value="";$("essay").oninput=updateWords;updateWords();
 clearInterval(winterval);winterval=setInterval(()=>{wTimer--;renderWTimer();
  if(wTimer===600)playAudioOnly("ten");if(wTimer===300)playAudioOnly("five");
  if(wTimer<=0){clearInterval(winterval);playAudioOnly("end");finishWriting(true)}
 },1000)
}
function selectTopic(i){selectedTopic=i;document.querySelectorAll(".topic").forEach((e,j)=>e.classList.toggle("selected",i===j));document.querySelectorAll('input[name="topic"]')[i].checked=true}
function updateWords(){const t=$("essay").value.trim(),n=t?t.split(/\s+/).length:0;$("wordCount").textContent=n+" patah perkataan";$("minStatus").textContent=n>=100?"✓ Minimum dicapai":"Minimum 100 patah perkataan"}
function renderWTimer(){const m=Math.floor(wTimer/60).toString().padStart(2,"0"),s=(wTimer%60).toString().padStart(2,"0");$("wTimer").textContent=`${m}:${s}`}
function finishWriting(auto=false){if(phase!=="c")return;clearInterval(winterval);phase="done";const text=$("essay").value.trim(),words=text?text.split(/\s+/).length:0;buildResult({topic:writing[selectedTopic],text,words,auto})}
function pct(a,b){return b?Math.round(a/b*100):0}
function bar(p){return `<div class="meter"><i style="width:${Math.min(100,p)}%"></i></div>`}
function tableA(){
 const groups={};qs.filter(q=>q.section==="BAHAGIAN A").forEach(q=>{groups[q.category]??={n:0,score:0,max:0};groups[q.category].n++;groups[q.category].max+=Math.max(...q.weights);if(answers[q.id]!==undefined)groups[q.category].score+=q.weights[answers[q.id]]});
 return `<div class="table"><div class="row head"><div>Konstruk</div><div>Item</div><div>Skor</div><div>Maks.</div><div>Prestasi</div></div>`+Object.entries(groups).map(([k,v])=>{let p=pct(v.score,v.max);return `<div class="row"><div><b>${k}</b></div><div>${v.n}</div><div>${v.score}</div><div>${v.max}</div><div>${p}%${bar(p)}</div></div>`}).join("")+"</div>"
}
function tableB(){
 const groups={};qs.filter(q=>q.section==="BAHAGIAN B").forEach(q=>{groups[q.category]??={n:0,ans:0,correct:0};groups[q.category].n++;if(answers[q.id]!==undefined){groups[q.category].ans++;if(answers[q.id]===q.answer)groups[q.category].correct++}});
 return `<div class="table"><div class="row head"><div>Bidang</div><div>Item</div><div>Jawab</div><div>Betul</div><div>Ketepatan</div></div>`+Object.entries(groups).map(([k,v])=>{let p=pct(v.correct,v.ans);return `<div class="row"><div><b>${k}</b></div><div>${v.n}</div><div>${v.ans}</div><div>${v.correct}</div><div>${p}%${bar(p)}</div></div>`}).join("")+"</div>"
}
function essayAnalysis(c){
 const t=c.text,low=t.toLowerCase(),sent=t.split(/[.!?]+/).map(x=>x.trim()).filter(Boolean),paras=t.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
 const markers=["selain itu","seterusnya","di samping itu","oleh itu","akhirnya","kesimpulannya","sebagai contoh","namun","walau bagaimanapun"];
 const found=markers.filter(x=>low.includes(x));
 const topicWords=c.topic.title.toLowerCase().split(/\s+/).filter(x=>x.length>3);
 const relevant=topicWords.filter(x=>low.includes(x)).length;
 const numbers=(t.match(/\b\d+(?:[.,]\d+)?\s*(?:%|peratus|orang|tahun|km|RM|juta|bilion)?\b/gi)||[]);
 const claims=numbers.length;
 let structure=c.words>=100&&sent.length>=5?"Baik":"Perlu diperkemas";
 let relevance=relevant>=1?"Ada kaitan jelas dengan tajuk":"Semak semula fokus kepada tajuk";
 let factMsg=claims?`Dikesan ${claims} angka/nilai dalam karangan. Angka dan dakwaan fakta perlu disemak dengan sumber yang sah sebelum dianggap benar.`:"Tiada angka khusus dikesan. Jika menggunakan fakta, pastikan fakta boleh disahkan.";
 return `<div class="essay-grid">
 <div class="essay-item"><b>Panjang karangan</b><p>${c.words} patah perkataan — ${c.words>=100?'<span class="good">minimum dicapai</span>':'<span class="bad">minimum belum dicapai</span>'}</p></div>
 <div class="essay-item"><b>Relevan dengan tajuk</b><p>${relevance}</p></div>
 <div class="essay-item"><b>Struktur</b><p>${paras.length} perenggan, ${sent.length} ayat. ${structure}.</p></div>
 <div class="essay-item"><b>Penanda wacana</b><p>${found.length?found.join(", "):"Belum banyak penanda wacana dikesan."}</p></div>
 <div class="essay-item"><b>Isi & huraian</b><p>${c.words>=100&&sent.length>=6?"Ada ruang yang mencukupi untuk mengembangkan isi. Semak setiap isi supaya disokong contoh atau sebab yang jelas.":"Tambah isi, sebab dan contoh supaya huraian lebih matang."}</p></div>
 <div class="essay-item"><b>Fakta / dakwaan</b><p>${factMsg}</p></div>
 </div>`
}
function buildResult(c){
 const a=qs.filter(q=>q.section==="BAHAGIAN A"),b=qs.filter(q=>q.section==="BAHAGIAN B");
 const aScore=a.reduce((s,q)=>s+(answers[q.id]===undefined?0:q.weights[answers[q.id]]),0),aMax=a.reduce((s,q)=>s+Math.max(...q.weights),0);
 const bAnswered=b.filter(q=>answers[q.id]!==undefined).length,bCorrect=b.filter(q=>answers[q.id]!==undefined&&answers[q.id]===q.answer).length,bWrong=bAnswered-bCorrect,bSkip=b.length-bAnswered;
 const abElapsed=90*60-timer,cElapsed=45*60-wTimer;
 $("summary").innerHTML=[
  ["A skor",`${aScore}/${aMax}`],["B betul",`${bCorrect}/${b.length}`],["B salah",bWrong],["B tidak dijawab",bSkip],["A+B ketepatan",`${pct(bCorrect,bAnswered)}%`],["Masa digunakan",`${Math.floor((abElapsed+cElapsed)/60)}m`]
 ].map(x=>`<div class="stat"><span>${x[0]}</span><b>${x[1]}</b></div>`).join("");
 $("aAnalysis").innerHTML=tableA();$("bAnalysis").innerHTML=tableB();$("cAnalysis").innerHTML=essayAnalysis(c);
 const slow=qs.map((q,i)=>({id:q.id,ms:times[i]||0})).filter(x=>x.ms).sort((x,y)=>y.ms-x.ms).slice(0,5);
 $("timeAnalysis").innerHTML=`<div class="table"><div class="row head"><div>Soalan paling lama</div><div>Masa</div><div></div><div></div><div></div></div>`+slow.map(x=>`<div class="row"><div>${x.id}</div><div>${Math.round(x.ms/1000)} saat</div><div></div><div></div><div></div></div>`).join("")+`</div><p class="note">“Tidak dijawab” bermaksud calon tidak memilih jawapan sebelum menghantar atau masa tamat.</p>`;
 const groups={};b.forEach(q=>{groups[q.category]??={a:0,c:0};if(answers[q.id]!==undefined){groups[q.category].a++;if(answers[q.id]===q.answer)groups[q.category].c++}});
 const weak=Object.entries(groups).filter(x=>x[1].a).sort((x,y)=>pct(x[1].c,x[1].a)-pct(y[1].c,y[1].a))[0];
 $("conclusionTitle").textContent=weak?`Fokus latihan: ${weak[0]}`:"Teruskan latihan secara konsisten";
 $("conclusion").textContent=`Anda menjawab ${Object.keys(answers).length} daripada 100 soalan A+B. Bahagian B mencatat ${bCorrect} betul, ${bWrong} salah dan ${bSkip} tidak dijawab. ${weak?`Bidang dengan ketepatan paling rendah dalam jawapan yang sempat dibuat ialah ${weak[0]}. Gunakan analisis di atas untuk menentukan topik latihan seterusnya.`:"Semak setiap bidang dan ulang soalan yang mengambil masa paling lama."} Bahagian C pula dinilai dari segi panjang, relevan, struktur, huraian dan keperluan menyemak fakta.`;
 show("result");
 localStorage.setItem("pksk-set01-result",JSON.stringify({answers,times,c}))
}
load();
