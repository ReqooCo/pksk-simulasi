let bank,qs=[],writing=[],phase="idle",qidx=0,answers={},times={},qStarted=0,timer=90*60,wTimer=45*60,interval=null,winterval=null,selectedTopic=0;

const $=id=>document.getElementById(id);
async function load(){bank=await (await fetch("data/set01.json")).json();qs=bank.questions;writing=bank.writing}
function hideAll(){["start","briefing","exam","writing","result"].forEach(x=>$(x).classList.add("hidden"))}
function show(x){hideAll();$(x).classList.remove("hidden")}
let voiceReadyPromise=null;
function getMalayMaleVoice(){
  const voices=speechSynthesis.getVoices();
  const male=voices.filter(v=>/ms[-_]MY/i.test(v.lang||""));
  return male.find(v=>/Wavenet-B|Wavenet-D|Standard-B|Standard-D/i.test(v.name||""))
      || male.find(v=>/Microsoft.*Malay|Malay.*Malaysia|Osman/i.test(v.name||""))
      || male[0]
      || voices.find(v=>/ms/i.test(v.lang||""));
}
function ensureVoices(){
  if(!("speechSynthesis" in window)) return Promise.resolve([]);
  if(speechSynthesis.getVoices().length) return Promise.resolve(speechSynthesis.getVoices());
  if(voiceReadyPromise) return voiceReadyPromise;
  voiceReadyPromise=new Promise(resolve=>{
    const done=()=>{speechSynthesis.removeEventListener("voiceschanged",done);resolve(speechSynthesis.getVoices())};
    speechSynthesis.addEventListener("voiceschanged",done);
    setTimeout(()=>{speechSynthesis.removeEventListener("voiceschanged",done);resolve(speechSynthesis.getVoices())},1500);
  });
  return voiceReadyPromise;
}
function speak(text,onDone){
  if(!("speechSynthesis" in window)){ if(onDone) setTimeout(onDone,9000); return; }
  speechSynthesis.cancel();
  ensureVoices().then(()=>{
    const clean=text.replace(/<[^>]+>/g," ");
    const u=new SpeechSynthesisUtterance(clean);
    u.lang="ms-MY";
    u.rate=.86;
    u.pitch=.72;
    u.volume=1;
    const voice=getMalayMaleVoice();
    if(voice) u.voice=voice;
    let ended=false;
    const finish=()=>{
      if(ended)return; ended=true;
      // Small pause so the last word is clearly finished before countdown.
      setTimeout(()=>onDone&&onDone(),1400);
    };
    u.onend=finish;
    u.onerror=finish;
    speechSynthesis.speak(u);
    // Safety fallback only; it never starts before the speech has had enough time
    // for a full announcement.
    const minimumMs=Math.max(12000,clean.length*85);
    setTimeout(finish,minimumMs);
  });
}

function beginABBriefing(){
 phase="abBrief";show("briefing");$("briefingTitle").textContent="Bahagian A + B";
 const text="Calon diminta memberikan perhatian. Sila baca setiap soalan dengan teliti dan pilih jawapan yang paling sesuai. Anda mempunyai 90 minit untuk menjawab Bahagian A dan Bahagian B. Sila urus masa anda dengan baik. Semua jawapan akan direkodkan. Ujian akan bermula sekarang.";
 $("voiceText").innerHTML=text.replace("Ujian akan bermula sekarang.","<b>Ujian akan bermula sekarang.</b>"); $("count").textContent="";
 // Tunggu suara pengawas habis sepenuhnya. Barulah kiraan 3-2-1 bermula.
 speak(text,()=>countdown(startAB));
}
function countdown(callback){$("count").textContent="Bersedia…";setTimeout(()=>{},0);let n=3;setTimeout(()=>{$("count").textContent=n;let x=setInterval(()=>{n--;$("count").textContent=n;if(n<=0){clearInterval(x);callback()}},1000)},500);}
function startAB(){
 phase="ab";show("exam");qidx=0;qStarted=Date.now();renderTimer();renderQ();
 interval=setInterval(()=>{timer--;renderTimer();
   if(timer===600){alert("Perhatian. Masa menjawab berbaki 10 minit.");speak("Perhatian. Masa menjawab berbaki sepuluh minit.")}
   if(timer===300){alert("Perhatian. Masa menjawab berbaki 5 minit.");speak("Perhatian. Masa menjawab berbaki lima minit.")}
   if(timer<=0){speak("Masa Bahagian A dan Bahagian B telah tamat. Sila berhenti menjawab.");finishAB(true)}
 },1000)
}
function renderTimer(){let m=Math.floor(timer/60).toString().padStart(2,"0"),s=(timer%60).toString().padStart(2,"0");$("timer").textContent=`${m}:${s}`}
function saveTime(){let now=Date.now();if(qStarted)times[qidx]=(times[qidx]||0)+(now-qStarted);qStarted=now}
function renderQ(){
 const q=qs[qidx];$("sectionPill").textContent=q.section;$("cat").textContent=q.category;$("qnum").textContent=`Soalan ${qidx+1} daripada ${qs.length}`;
 $("qtext").textContent=q.question;$("answeredCount").textContent=`${Object.keys(answers).length}/${qs.length}`;
 $("opts").innerHTML=q.options.map((o,i)=>`<label class="opt ${answers[q.id]===i?"selected":""}"><input type="radio" name="opt" ${answers[q.id]===i?"checked":""} onchange="answer(${i})"><span><b>${String.fromCharCode(65+i)}.</b> ${o}</span></label>`).join("");
 $("prevBtn").disabled=qidx===0;$("nextBtn").textContent=qidx===qs.length-1?"HANTAR A + B →":"SETERUSNYA →";
 $("grid").innerHTML=qs.map((x,i)=>`<button class="${answers[x.id]!==undefined?"answered ":""}${i===qidx?"current":""}" onclick="gotoQ(${i})">${i+1}</button>`).join("");
}
function answer(i){answers[qs[qidx].id]=i;renderQ()}
function gotoQ(i){saveTime();qidx=i;renderQ()}
function nextQ(){saveTime();if(qidx<qs.length-1){qidx++;renderQ()}else confirmFinish()}
function prevQ(){if(qidx>0){saveTime();qidx--;renderQ()}}
function confirmFinish(){if(confirm("Hantar Bahagian A + B sekarang? Selepas dihantar, anda akan terus ke Bahagian C."))finishAB(false)}
function finishAB(auto=false){
 if(phase!=="ab")return;saveTime();clearInterval(interval);phase="cBrief";localStorage.setItem("pksk-set01-ab",JSON.stringify({answers,times,auto}));
 show("briefing");$("briefingTitle").textContent="Bahagian C — Artikulasi Penulisan";
 const text=auto?"Masa Bahagian A dan Bahagian B telah tamat. Sesi akan diteruskan ke Bahagian C. Anda mempunyai 45 minit untuk memilih satu tajuk dan menulis jawapan. Minimum 100 patah perkataan.":"Bahagian A dan Bahagian B telah selesai. Seterusnya ialah Bahagian C, Artikulasi Penulisan. Anda mempunyai 45 minit. Pilih satu daripada tiga tajuk dan tulis sekurang-kurangnya 100 patah perkataan. Ujian akan bermula sekarang.";
 $("voiceText").innerHTML=text; $("count").textContent="";
 // Sama: jangan mulakan masa C sebelum arahan pengawas selesai disebut.
 speak(text,()=>countdown(startWriting));
}
function startWriting(){
 phase="c";show("writing");selectedTopic=0;essayStart=Date.now();wTimer=45*60;renderWTimer();
 $("topics").innerHTML=writing.map((t,i)=>`<label class="topic ${i===0?"selected":""}" onclick="selectTopic(${i})"><input type="radio" name="topic" ${i===0?"checked":""}><b>${t.title}</b><span>${t.prompt}</span></label>`).join("");
 $("essay").value="";$("essay").oninput=updateWords;updateWords();
 clearInterval(winterval);winterval=setInterval(()=>{wTimer--;renderWTimer();if(wTimer===600)speak("Perhatian. Masa penulisan berbaki sepuluh minit.");if(wTimer===300)speak("Perhatian. Masa penulisan berbaki lima minit.");if(wTimer<=0){speak("Masa Bahagian C telah tamat. Sila berhenti menulis.");finishWriting(true)}},1000)
}
function selectTopic(i){selectedTopic=i;document.querySelectorAll(".topic").forEach((e,j)=>e.classList.toggle("selected",i===j));document.querySelectorAll('input[name="topic"]')[i].checked=true}
function updateWords(){let t=$("essay").value.trim(),n=t?t.split(/\s+/).length:0;$("wordCount").textContent=n+" patah perkataan";$("minStatus").textContent=n>=100?"Minimum dicapai":"Minimum 100 patah perkataan"}
function renderWTimer(){let m=Math.floor(wTimer/60).toString().padStart(2,"0"),s=(wTimer%60).toString().padStart(2,"0");$("wTimer").textContent=`${m}:${s}`}
function finishWriting(auto=false){
 if(phase!=="c")return;phase="done";clearInterval(winterval);let text=$("essay").value,words=text.trim()?text.trim().split(/\s+/).length:0;
 const cdata={topic:writing[selectedTopic].id,title:writing[selectedTopic].title,text,words,auto};
 localStorage.setItem("pksk-set01-writing",JSON.stringify(cdata));buildResult(cdata)
}
function pct(n,d){return d?((n/d)*100).toFixed(1)+"%":"0.0%"}
function tableA(x){return `<div class="table"><div class="row head"><div>Konstruk</div><div>Soalan</div><div>Skor</div><div>Maks.</div><div>Peratus</div></div>`+Object.entries(x).map(([k,v])=>`<div class="row"><div>${k}</div><div>${v.n}</div><div>${v.score}</div><div>${v.max}</div><div>${pct(v.score,v.max)}</div></div>`).join("")+"</div>"}
function tableB(x){return `<div class="table"><div class="row head"><div>Domain</div><div>Soalan</div><div>Jawab</div><div>Betul</div><div>Ketepatan</div></div>`+Object.entries(x).map(([k,v])=>`<div class="row"><div>${k}</div><div>${v.n}</div><div>${v.ans}</div><div>${v.correct}</div><div>${pct(v.correct,v.ans)}</div></div>`).join("")+"</div>"}
function analyseEssay(cdata){
  const text=cdata.text.trim();
  const words=text?text.split(/\s+/):[];
  const sentences=text.split(/[.!?]+/).map(s=>s.trim()).filter(Boolean);
  const paragraphs=text.split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);
  const lower=text.toLowerCase();

  // Lightweight offline screening. It does NOT claim to prove facts true/false.
  // It flags factual-looking statements for review instead.
  const factPatterns=[
    /\b\d{1,4}\s*(?:km|kilometer|tahun|peratus|%|juta|bilion|darjah|meter|kg|gram)\b/gi,
    /\b(?:menurut|berdasarkan|kajian|data|statistik|rekod|fakta|pada tahun|pada \d{4})\b/gi,
    /\b(?:paling|pertama|terbesar|tertinggi|terendah|utama)\b/gi
  ];
  const claims=[...new Set(factPatterns.flatMap(r=>text.match(r)||[]))];
  const transitions=["selain itu","di samping itu","seterusnya","oleh itu","justeru","namun","walau bagaimanapun","kesimpulannya","akhirnya"];
  const transitionHits=transitions.filter(x=>lower.includes(x)).length;
  const hasIntro=sentences.length>=2;
  const hasConclusion=/(kesimpulannya|akhir kata|oleh itu|justeru|sebagai kesimpulan)/i.test(text);
  const vocab=new Set(words.map(w=>w.toLowerCase().replace(/[^a-zA-ZÀ-ÿ\u00C0-\u024F\u1E00-\u1EFF\u00A0-\uFFFF'-]/g,"")).filter(Boolean));
  const longSentences=sentences.filter(s=>s.split(/\s+/).length>35).length;
  const structureScore=Math.min(20,(hasIntro?8:4)+(hasConclusion?7:2)+Math.min(5,transitionHits));
  const languageScore=Math.max(0,Math.min(20,20-longSentences*3));
  const relevanceScore=Math.min(20, words.length>=100 ? 20 : Math.round(words.length/5));
  const factsScore=claims.length?12:20; // review-needed, not factual correctness
  const overall=Math.min(80,Math.round(relevanceScore+structureScore+languageScore+factsScore));

  return {
    words:words.length,sentences:sentences.length,paragraphs:paragraphs.length,
    structureScore,languageScore,relevanceScore,factsScore,overall,
    claims,transitionHits,hasConclusion,longSentences
  };
}
function scoreBadge(label,value,max){
  return `<div class="c-score"><span>${label}</span><b>${value}/${max}</b><small>${Math.round(value/max*100)}%</small></div>`;
}
function buildResult(cdata){
 const a=qs.filter(q=>q.type==="graded"),b=qs.filter(q=>q.type==="dichotomous");
 let aBy={},bBy={};
 a.forEach(q=>{aBy[q.category]??={n:0,score:0,max:0};aBy[q.category].n++;aBy[q.category].max+=3;if(answers[q.id]!==undefined)aBy[q.category].score+=q.weights[answers[q.id]]});
 b.forEach(q=>{bBy[q.category]??={n:0,ans:0,correct:0};bBy[q.category].n++;if(answers[q.id]!==undefined){bBy[q.category].ans++;if(answers[q.id]===q.answer)bBy[q.category].correct++}});

 const aScore=a.reduce((s,q)=>s+(answers[q.id]===undefined?0:q.weights[answers[q.id]]),0),aMax=a.length*3;
 const bAnswered=b.filter(q=>answers[q.id]!==undefined).length;
 const bCorrect=b.filter(q=>answers[q.id]!==undefined&&answers[q.id]===q.answer).length;
 const bWrong=bAnswered-bCorrect,bUnanswered=b.length-bAnswered;
 const abMax=aMax+b.length,abScore=aScore+bCorrect;
 const abUsed=90*60-timer;
 const essay=analyseEssay(cdata);

 $("summary").innerHTML=[
   ["A",""+aScore+"/"+aMax],
   ["B",""+bCorrect+"/"+b.length],
   ["A + B",""+abScore+"/"+abMax],
   ["B ketepatan",pct(bCorrect,bAnswered)],
   ["B salah",bWrong],
   ["B tak dijawab",bUnanswered]
 ].map(x=>`<div class="stat"><span>${x[0]}</span><b>${x[1]}</b></div>`).join("");

 $("aAnalysis").innerHTML=`<div class="score-highlight">Skor Bahagian A <b>${aScore}/${aMax}</b> <span>${pct(aScore,aMax)}</span></div>`+tableA(aBy);
 $("bAnalysis").innerHTML=`<div class="score-highlight">Skor Bahagian B <b>${bCorrect}/${b.length}</b> <span>${pct(bCorrect,b.length)}</span></div>`+tableB(bBy);

 const claimHtml=essay.claims.length
   ? `<div class="fact-review"><b>Semakan fakta diperlukan</b><p>Jawapan mengandungi pernyataan yang kelihatan seperti fakta atau angka. Sistem ini <strong>tidak akan menanda fakta sebagai benar/salah tanpa sumber rujukan</strong>. Semak pernyataan berikut sebelum menganggap jawapan tepat:</p><ul>${essay.claims.slice(0,12).map(x=>`<li>${x}</li>`).join("")}</ul></div>`
   : `<div class="fact-ok">Tiada angka atau dakwaan fakta yang jelas dikesan secara automatik. Ini bukan pengesahan fakta.</div>`;

 $("cAnalysis").innerHTML=`
   <div class="c-score-grid">
     ${scoreBadge("Relevan",essay.relevanceScore,20)}
     ${scoreBadge("Struktur",essay.structureScore,20)}
     ${scoreBadge("Bahasa",essay.languageScore,20)}
     ${scoreBadge("Fakta",essay.factsScore,20)}
   </div>
   <div class="essay-meta">
     <div><b>Tajuk</b><span>${cdata.title}</span></div>
     <div><b>Perkataan</b><span>${essay.words}</span></div>
     <div><b>Ayat</b><span>${essay.sentences}</span></div>
     <div><b>Perenggan</b><span>${essay.paragraphs}</span></div>
   </div>
   ${claimHtml}
   <div class="c-feedback">
     <b>Ulasan automatik</b>
     <ul>
       <li>${essay.words>=100?"Panjang jawapan mencapai minimum 100 patah perkataan.":"Jawapan belum mencapai minimum 100 patah perkataan."}</li>
       <li>${essay.hasConclusion?"Ada penanda kesimpulan yang jelas.":"Kesimpulan yang jelas belum dikesan."}</li>
       <li>${essay.transitionHits>=2?"Ada penggunaan penanda wacana.":"Tambah penanda wacana supaya perenggan lebih tersusun."}</li>
       <li>${essay.longSentences?"Terdapat ayat yang sangat panjang; pecahkan beberapa ayat supaya lebih jelas.":"Panjang ayat kelihatan terkawal."}</li>
     </ul>
   </div>
   <p class="note">Skor penulisan ini ialah analisis latihan, bukan pemarkahan rasmi KPM. Semakan fakta memerlukan sumber rujukan dan tidak boleh disahkan hanya melalui kiraan teks.</p>`;

 const timesSorted=qs.map((q,i)=>({id:q.id,sec:(times[i]||0)/1000})).sort((x,y)=>y.sec-x.sec).slice(0,5);
 $("timeAnalysis").innerHTML=`<div class="table"><div class="row head"><div>Soalan</div><div>Masa</div><div></div><div></div><div></div></div>`+timesSorted.map(x=>`<div class="row"><div>${x.id}</div><div>${Math.round(x.sec)} saat</div><div></div><div></div><div></div></div>`).join("")+"</div>";

 const weakA=Object.entries(aBy).sort((x,y)=>(x[1].score/x[1].max)-(y[1].score/y[1].max))[0];
 const weakB=Object.entries(bBy).filter(x=>x[1].ans).sort((x,y)=>(x[1].correct/x[1].ans)-(y[1].correct/y[1].ans))[0];
 let c=`Bahagian A: ${aScore}/${aMax}. Bahagian B: ${bCorrect}/${b.length} betul, ${bWrong} salah dan ${bUnanswered} tidak dijawab. Jumlah A+B: ${abScore}/${abMax}.`;
 if(weakA)c+=` Konstruk A yang paling perlu diberi perhatian ialah ${weakA[0]}.`;
 if(weakB)c+=` Domain B dengan ketepatan terendah ialah ${weakB[0]}.`;
 c+=essay.words<100?" Bahagian C belum mencapai minimum 100 patah perkataan.":" Bahagian C mencapai minimum 100 patah perkataan.";
 $("conclusion").textContent=c;

 localStorage.setItem("pksk-set01-result",JSON.stringify({answers,times,cdata,essay,summary:{aScore,aMax,bAnswered,bCorrect,bWrong,bUnanswered,abScore,abMax}}));
 show("result");
}
load();