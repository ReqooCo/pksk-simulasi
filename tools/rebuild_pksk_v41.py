import json, random
from pathlib import Path

names = ['Aiman', 'Aina', 'Amir', 'Aisyah', 'Danish', 'Dania', 'Hakim', 'Hana', 'Haziq', 'Irfan', 'Izzah', 'Khai', 'Luqman', 'Maya', 'Nadia', 'Nabil', 'Qaisara', 'Rafiq', 'Sara', 'Sofia', 'Adam', 'Alya', 'Farah', 'Faris', 'Mira', 'Naufal', 'Puteri', 'Rayyan', 'Syafiq', 'Zara']

def rot_options(options, answer, shift):
    n=len(options); shift%=n
    new=options[shift:]+options[:shift]
    return new, (answer-shift)%n

def graded(id_, cat, q, opts, ans, construct):
    weights=[0]*4; weights[ans]=3; weights[(ans+1)%4]=2; weights[(ans+2)%4]=1
    return {'id':id_,'section':'BAHAGIAN A','category':cat,'question':q,'options':opts,'weights':weights,'type':'graded','plannedLevel':2,'constructFamily':construct,'levelSignal':2,'contentDomain':cat,'setLevel':2,'scoringNote':'3/2/1/0 latihan: terbaik / alternatif membina / respons terhad / tidak sesuai. Bukan wajaran rasmi KPM.'}

def objective(id_, cat, q, opts, ans, explanation, construct='Reasoning', level=2, visual=None):
    d={'id':id_,'section':'BAHAGIAN B','category':cat,'question':q,'options':opts,'answer':ans,'explanation':explanation,'type':'objective','plannedLevel':level,'constructFamily':construct,'levelSignal':level,'contentDomain':cat,'setLevel':2}
    if visual: d['visual']=visual
    return d

# The generator uses curated, context-relevant item templates and varies names/numbers per set.
"+make_src+"

out = Path('sets')
for s in range(1,101):
    data=make_set(s)
    data['questions']=[q for q in data['questions'] if not (q['id'].startswith('B') and int(q['id'][1:])>70)]
    data['researchStructure']='A=30 (10 EQ/10 SQ/10 SSQ); B=70 (10 IQ/10 BM/10 BI/10 Math/10 Science/10 Tech/10 GK).'
    group=f'SET {((s-1)//10)*10+1:02d}-{((s-1)//10+1)*10:02d}'
    p=out/group/'data'/f'set{s:02d}.json'
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print('Generated 100 PKSK sets.')
