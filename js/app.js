let bank,qs=[],writing=[],phase="idle",qidx=0,answers={},times={},qStarted=0,timer=90*60,wTimer=45*60,interval=null,winterval=null,selectedTopic=0;

const $=id=>document.getElementById(id);
async function load(){bank=await (await fetch("data/set01.json")).json();qs=bank.questions;writing=bank.writing}
function hideAll(){["start","briefing","exam","writing","result"].forEach(x=>$(x).classList.add("hidden"))}
function show(x){hideAll();$(x).classList.remove("hidden")}
function speak(text,onDone){
  if(!("speechSynthesis" in window)){ if(onDone) onDone(); return; }
  speechSynthesis.cancel();
  const clean=text.replace(/<[^>]+>/g," ");
  const u=new SpeechSynthesisUtterance(clean);
  u.lang="ms-MY";
  u.rate=.88;
  u.pitch=.78;
  u.volume=1;
  const voices=speechSynthesis.getVoices();
  const ms=voices.filter(v=>(v.lang||"").toLowerCase().startsWith("ms"));
  const preferred=ms.find(v=>/male|lelaki|man|hazim|aziz|rizal|faiz|firdaus/i.test(v.name));
  u.voice=preferred||ms[0]||voices.find(v=>(v.lang||"").toLowerCase().startsWith("id"))||null;
  u.onend=()=>{ if(onDone) onDone(); };
  u.onerror=()=>{ if(onDone) onDone(); };
  speechSynthesis.speak(u);
}

function beginABBriefing(){
 phase="abBrief";show("briefing");$("briefingTitle").textContent="Bahagian A + B";
 const text="Calon diminta memberikan perhatian. Sila baca setiap soalan dengan teliti dan pilih jawapan yang paling sesuai. Anda mempunyai 90 minit untuk menjawab Bahagian A dan Bahagian B. Sila urus masa anda dengan baik. Semua jawapan akan direkodkan. Ujian akan bermula sekarang.";
 $("voiceText").innerHTML=text.replace("Ujian akan bermula sekarang.","<b>Ujian akan bermula sekarang.</b>");
 // Tunggu suara pengawas habis sepenuhnya. Barulah kiraan 3-2-1 bermula.
 speak(text,()=>countdown(startAB));
}
function countdown(callback){let n=3;$("count").textContent=n;let x=setInterval(()=>{n--;$("count").textContent=n;if(n<=0){clearInterval(x);callback()}},1000)}
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
 $("voiceText").innerHTML=text;
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
function buildResult(cdata){
 const a=qs.filter(q=>q.type==="graded"),b=qs.filter(q=>q.type==="dichotomous");
 let aBy={},bBy={};
 a.forEach(q=>{aBy[q.category]??={n:0,score:0,max:0};aBy[q.category].n++;aBy[q.category].max+=3;if(answers[q.id]!==undefined)aBy[q.category].score+=q.weights[answers[q.id]]});
 b.forEach(q=>{bBy[q.category]??={n:0,ans:0,correct:0};bBy[q.category].n++;if(answers[q.id]!==undefined){bBy[q.category].ans++;if(answers[q.id]===q.answer)bBy[q.category].correct++}});
 let answered=Object.keys(answers).length,bAnswered=b.filter(q=>answers[q.id]!==undefined).length,bCorrect=b.filter(q=>answers[q.id]!==undefined&&answers[q.id]===q.answer).length,bWrong=bAnswered-bCorrect,bUnanswered=b.length-bAnswered;
 const aScore=a.reduce((s,q)=>s+(answers[q.id]===undefined?0:q.weights[answers[q.id]]),0),aMax=a.length*3;
 const abUsed=90*60-timer;
 $("summary").innerHTML=[["A skor",aScore+"/"+aMax],["B dijawab",bAnswered+"/"+b.length],["B betul",bCorrect],["B salah",bWrong],["B tak sempat",bUnanswered],["A+B masa",Math.floor(abUsed/60)+"m "+(abUsed%60)+"s"]].map(x=>`<div class="stat"><span>${x[0]}</span><b>${x[1]}</b></div>`).join("");
 $("aAnalysis").innerHTML=tableA(aBy);$("bAnalysis").innerHTML=tableB(bBy);
 $("cAnalysis").innerHTML=`<div class="table"><div class="row head"><div>Perkara</div><div>Nilai</div><div></div><div></div><div></div></div><div class="row"><div>Tajuk</div><div>${cdata.title}</div><div></div><div></div><div></div></div><div class="row"><div>Perkataan</div><div>${cdata.words}</div><div></div><div></div><div>${cdata.words>=100?"Minimum dicapai":"Minimum belum dicapai"}</div></div></div><p class="note">Semakan ini tidak mendakwa sebagai pemarkahan rasmi KPM.</p>`;
 const timesSorted=qs.map((q,i)=>({id:q.id,sec:(times[i]||0)/1000})).sort((x,y)=>y.sec-x.sec).slice(0,5);
 $("timeAnalysis").innerHTML=`<div class="table"><div class="row head"><div>Soalan</div><div>Masa</div><div></div><div></div><div></div></div>`+timesSorted.map(x=>`<div class="row"><div>${x.id}</div><div>${Math.round(x.sec)} saat</div><div></div><div></div><div></div></div>`).join("")+"</div>";
 const weakA=Object.entries(aBy).sort((x,y)=>(x[1].score/x[1].max)-(y[1].score/y[1].max))[0],weakB=Object.entries(bBy).filter(x=>x[1].ans).sort((x,y)=>(x[1].correct/x[1].ans)-(y[1].correct/y[1].ans))[0];
 let c=`Bahagian A+B: ${answered} daripada ${qs.length} soalan dijawab. Bahagian B mencatat ${bCorrect} betul, ${bWrong} salah dan ${bUnanswered} tidak dijawab.`;
 if(weakA)c+=` Dalam Bahagian A, konstruk yang paling perlu diberi perhatian ialah ${weakA[0]}.`;
 if(weakB)c+=` Dalam Bahagian B, domain dengan ketepatan terendah ialah ${weakB[0]}.`;
 if(cdata.words<100)c+=" Bahagian C belum mencapai minimum 100 patah perkataan.";
 $("conclusion").textContent=c;show("result");
 localStorage.setItem("pksk-set01-result",JSON.stringify({answers,times,cdata,summary:{aScore,aMax,bAnswered,bCorrect,bWrong,bUnanswered}}))
}
load();