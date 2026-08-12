let bank,qs=[],writing=[],phase="c",wi=0,qidx=0,answers={},times={},qStarted=0,wTimer=45*60,timer=90*60,interval=null,winterval=null,selectedTopic=null,essayStart=0;

const $=id=>document.getElementById(id);
async function load(){bank=await (await fetch("data/set01.json")).json();qs=bank.questions;writing=bank.writing}
function hideAll(){["start","briefing","writing","exam","result"].forEach(x=>$(x).classList.add("hidden"))}
function show(x){hideAll();$(x).classList.remove("hidden")}

function speak(text){
  if("speechSynthesis" in window){
    speechSynthesis.cancel();
    const clean=text.replace(/<[^>]+>/g," ");
    const u=new SpeechSynthesisUtterance(clean);
    u.lang="ms-MY"; u.rate=0.92; u.pitch=1;
    speechSynthesis.speak(u);
  }
}

function beginBriefing(){
 show("briefing");$("voiceText").innerHTML="Calon diminta memberikan perhatian.<br><br>Sila pastikan anda telah bersedia. Bahagian C ialah Artikulasi Penulisan. Pilih satu daripada tiga tajuk dan tulis sekurang-kurangnya 100 patah perkataan dalam masa 45 minit.<br><br><b>Apabila masa tamat, sistem akan menghentikan sesi secara automatik.</b><br><br>Ujian akan bermula sekarang."; speak($("voiceText").innerText);
 let n=3;$("count").textContent=n;let x=setInterval(()=>{n--;$("count").textContent=n;if(n<=0){clearInterval(x);startWriting()}},1000)
}
function startWriting(){
 show("writing");essayStart=Date.now();$("topics").innerHTML=writing.map((t,i)=>`<label class="topic ${i===0?"selected":""}" onclick="selectTopic(${i})"><input type="radio" name="topic" ${i===0?"checked":""}><b>${t.title}</b><br><span>${t.prompt}</span></label>`).join("");selectedTopic=0;
 $("essay").addEventListener("input",updateWords);updateWords();winterval=setInterval(()=>{wTimer--;renderWTimer();if(wTimer<=0){speak("Masa Bahagian C telah tamat. Sila berhenti menulis.");finishWriting(true)}},1000)
}
function selectTopic(i){selectedTopic=i;document.querySelectorAll(".topic").forEach((e,j)=>e.classList.toggle("selected",i===j));document.querySelectorAll('input[name="topic"]')[i].checked=true}
function updateWords(){let txt=$("essay").value.trim();let n=txt?txt.split(/\s+/).length:0;$("wordCount").textContent=n;$("minStatus").textContent=n>=100?"Minimum dicapai":"Minimum 100 patah perkataan"}
function renderWTimer(){let m=Math.floor(wTimer/60).toString().padStart(2,"0"),s=(wTimer%60).toString().padStart(2,"0");$("wTimer").textContent=`${m}:${s}`}
function finishWriting(auto=false){if(phase!=="c")return;phase="ab";clearInterval(winterval);let text=$("essay").value;localStorage.setItem("pksk-set01-writing",JSON.stringify({topic:writing[selectedTopic].id,text,words:text.trim()?text.trim().split(/\s+/).length:0,auto}));beginABBriefing()}
function beginABBriefing(){
 show("briefing");$("voiceText").innerHTML="Calon diminta memberikan perhatian.<br><br>Bahagian A dan Bahagian B akan dijawab secara dalam talian. Baca setiap soalan dengan teliti dan pilih jawapan yang paling sesuai. Sila urus masa anda dengan baik.<br><br><b>Anda mempunyai 90 minit untuk Bahagian A dan B.</b><br><br>Ujian akan bermula sekarang."; speak($("voiceText").innerText);
 let n=3;$("count").textContent=n;let x=setInterval(()=>{n--;$("count").textContent=n;if(n<=0){clearInterval(x);startAB()}},1000)
}
function startAB(){show("exam");essayStart=Date.now();qStarted=Date.now();interval=setInterval(()=>{timer--;renderTimer();if(timer===600){alert("Perhatian. Masa menjawab berbaki 10 minit.");speak("Perhatian. Masa menjawab berbaki sepuluh minit.");}if(timer===300){alert("Perhatian. Masa menjawab berbaki 5 minit.");speak("Perhatian. Masa menjawab berbaki lima minit.");}if(timer<=0){speak("Masa Bahagian A dan B telah tamat. Sila berhenti menjawab.");finishAB(true)}},1000);renderQ()}
function renderTimer(){let m=Math.floor(timer/60).toString().padStart(2,"0"),s=(timer%60).toString().padStart(2,"0");$("timer").textContent=`${m}:${s}`}
function saveTime(){let now=Date.now();times[qidx]=(times[qidx]||0)+(now-qStarted);qStarted=now}
function renderQ(){let q=qs[qidx];$("partLabel").textContent=q.section+" · "+(q.section==="BAHAGIAN A"?"KECERDASAN INSANIAH":"KECERDASAN INTELEK");$("qnum").textContent=`Soalan ${qidx+1} daripada ${qs.length}`;$("cat").textContent=q.category;$("qtext").textContent=q.question;
 $("opts").innerHTML=q.options.map((o,i)=>`<label class="opt ${answers[q.id]===i?"selected":""}"><input type="radio" name="opt" ${answers[q.id]===i?"checked":""} onchange="answer(${i})"><span><b>${String.fromCharCode(65+i)}.</b> ${o}</span></label>`).join("");$("grid").innerHTML=qs.map((x,i)=>`<button class="${answers[x.id]!==undefined?"answered ":""}${i===qidx?"current":""}" onclick="gotoQ(${i})">${i+1}</button>`).join("")}
function answer(i){answers[qs[qidx].id]=i;renderQ()}
function gotoQ(i){saveTime();qidx=i;renderQ()}
function nextQ(){saveTime();if(qidx<qs.length-1){qidx++;renderQ()}else confirmFinish()}
function prevQ(){if(qidx>0){saveTime();qidx--;renderQ()}}
function confirmFinish(){if(confirm("Hantar Bahagian A dan B sekarang?"))finishAB(false)}
function finishAB(auto=false){if(phase==="done")return;phase="done";saveTime();clearInterval(interval);buildResult(auto)}
function pct(n,d){return d?((n/d)*100).toFixed(1)+"%":"0.0%"}
function buildResult(auto){
 let a=qs.filter(q=>q.type==="graded"),b=qs.filter(q=>q.type==="dichotomous"),aa=a.reduce((s,q)=>s+(answers[q.id]===undefined?0:q.weights[answers[q.id]]),0),amax=a.length*3,bc=b.filter(q=>answers[q.id]!==undefined).length,bcorrect=b.filter(q=>answers[q.id]!==undefined&&answers[q.id]===q.answer).length;
 let ans=qs.filter(q=>answers[q.id]!==undefined).length,correct=bcorrect,wrong=bc-bcorrect;
 let aBy={},bBy={};a.forEach(q=>{aBy[q.category]??={n:0,score:0,max:0};aBy[q.category].n++;aBy[q.category].max+=3;if(answers[q.id]!==undefined)aBy[q.category].score+=q.weights[answers[q.id]]});
 b.forEach(q=>{bBy[q.category]??={n:0,ans:0,correct:0};bBy[q.category].n++;if(answers[q.id]!==undefined){bBy[q.category].ans++;if(answers[q.id]===q.answer)bBy[q.category].correct++}});
 let totalSeconds=90*60-timer;let slow=[...qs].sort((x,y)=>(times[y?qs.indexOf(y):0]||0)-(times[x?qs.indexOf(x):0]||0)).slice(0,5);
 $("summary").innerHTML=[
 ["A skor",aa+"/"+amax],["B dijawab",bc+"/"+b.length],["B betul",bcorrect],["B salah",wrong],["B tak sempat",b.length-bc],["Masa A+B",Math.floor(totalSeconds/60)+"m "+(totalSeconds%60)+"s"]
 ].map(x=>`<div class="stat"><span>${x[0]}</span><b>${x[1]}</b></div>`).join("");
 $("aAnalysis").innerHTML=tableA(aBy);$("bAnalysis").innerHTML=tableB(bBy);
 let writing=JSON.parse(localStorage.getItem("pksk-set01-writing")||"{}");$("cAnalysis").innerHTML=`<div class="table"><div class="row head"><div>Perkara</div><div>Nilai</div><div></div><div></div><div></div></div><div class="row"><div>Tajuk dipilih</div><div>${writing.topic||"-"}</div><div></div><div></div><div></div></div><div class="row"><div>Jumlah perkataan</div><div>${writing.words||0}</div><div></div><div></div><div>${(writing.words||0)>=100?"Minimum dicapai":"Minimum belum dicapai"}</div></div></div><p class="note">Skor karangan rasmi tidak dikira secara automatik kerana rubrik pemarkahan rasmi terperinci tidak diterbitkan dalam sumber yang kami gunakan. Laporan ini hanya semakan asas.</p>`;
 let weakA=Object.entries(aBy).sort((x,y)=>(x[1].score/x[1].max)-(y[1].score/y[1].max))[0],weakB=Object.entries(bBy).filter(x=>x[1].ans).sort((x,y)=>(x[1].correct/x[1].ans)-(y[1].correct/y[1].ans))[0];
 let c=`Calon menjawab ${ans} daripada ${qs.length} soalan Bahagian A+B. Bahagian B: ${bcorrect} betul, ${wrong} salah dan ${b.length-bc} tidak dijawab.`;if(weakA)c+=` Dalam Bahagian A, konstruk yang memerlukan perhatian ialah ${weakA[0]}.`;if(weakB)c+=` Dalam Bahagian B, prestasi terendah dalam set ini ialah ${weakB[0]}.`;if(auto)c+=" Masa 90 minit telah tamat dan sistem mengunci sesi secara automatik.";$("conclusion").textContent=c;
 localStorage.setItem("pksk-set01-result",JSON.stringify({answers,times,summary:{aScore:aa,aMax:amax,bAnswered:bc,bCorrect:bcorrect,bWrong:wrong,bUnanswered:b.length-bc},writing}));show("result")
}
function tableA(x){return `<div class="table"><div class="row head"><div>Konstruk</div><div>Soalan</div><div>Skor</div><div>Maks.</div><div>Peratus</div></div>`+Object.entries(x).map(([k,v])=>`<div class="row"><div>${k}</div><div>${v.n}</div><div>${v.score}</div><div>${v.max}</div><div>${pct(v.score,v.max)}</div></div>`).join("")+"</div>"}
function tableB(x){return `<div class="table"><div class="row head"><div>Domain</div><div>Soalan</div><div>Jawab</div><div>Betul</div><div>Ketepatan</div></div>`+Object.entries(x).map(([k,v])=>`<div class="row"><div>${k}</div><div>${v.n}</div><div>${v.ans}</div><div>${v.correct}</div><div>${pct(v.correct,v.ans)}</div></div>`).join("")+"</div>"}
load();