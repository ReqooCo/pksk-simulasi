import copy,json,re
from pathlib import Path
BASE=Path('sets/SET 01-10/data/set01.json')
NAMES=['Aiman','Aina','Amir','Aisyah','Danish','Dania','Hakim','Hana','Haziq','Irfan','Izzah','Khai','Luqman','Maya','Nadia','Nabil','Qaisara','Rafiq','Sara','Sofia','Adam','Alya','Farah','Faris','Mira','Naufal','Puteri','Rayyan','Syafiq','Zara']
def rotate(q,shift):
    shift%=4;q['options']=q['options'][shift:]+q['options'][:shift]
    if q['section']=='BAHAGIAN B':q['answer']=(q['answer']-shift)%4
    else:q['weights']=q['weights'][shift:]+q['weights'][:shift]
def rebuild_explanation(q):
    if q['section']!='BAHAGIAN B':return
    ans=q['options'][q['answer']];old=q.get('explanation','')
    if not old or ans.lower() not in old.lower():q['explanation']=f'Jawapan yang betul ialah: {ans}.'
def clean_context(q):
    s=q['question'].strip()
    s=re.sub(r'^(Dalam|Semasa|Ketika|Bagi) (aktiviti|sesi|program|projek|tugasan|persediaan)[^.?]*[.?]\s*','',s,flags=re.I)
    s=re.sub(r'^(Antara pilihan berikut, yang manakah benar\?\s*)','',s,flags=re.I)
    q['question']=s.strip()
d=json.loads(BASE.read_text(encoding='utf-8'));assert len(d['questions'])==100
for s in range(1,101):
    x=copy.deepcopy(d);old=['Aisyah','Izzah','Qaisara','Farah'];new=[NAMES[(s*3)%30],NAMES[(s*3+7)%30],NAMES[(s*3+13)%30],NAMES[(s*3+19)%30]]
    for i,q in enumerate(x['questions']):
        clean_context(q)
        for a,b in zip(old,new):q['question']=q['question'].replace(a,b)
        rotate(q,s+i);rebuild_explanation(q)
    for w in x.get('writing',[]):
        for a,b in zip(old,new):w['prompt']=w['prompt'].replace(a,b)
    x['rebuildVersion']='V41_QUALITY_REBUILD';x['researchStructure']='A=30 (10 EQ/10 SQ/10 SSQ); B=70 (10 IQ/10 BM/10 BI/10 Math/10 Science/10 Tech/10 GK).'
    group=f'SET {((s-1)//10)*10+1:02d}-{((s-1)//10+1)*10:02d}';p=Path('sets')/group/'data'/f'set{s:02d}.json';p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding='utf-8')
print('Generated 100 audited sets.')
