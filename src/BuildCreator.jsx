// ═══════════════════════════════════════════════════
// BUILD CREATOR — All build creator components
// ═══════════════════════════════════════════════════
import { useState, useEffect, useRef } from "react";
import {
  STATS, RACES, CLASSES, CLASS_TIERS, CLASS_TIER_PRESTIGE, CLASS_TIER_COLORS,
  AUGMENTS, TIER_COLORS, TIER_ORDER, EVOLUTIONS, SC, SL, TABS,
  WEAPON_PRESETS, RECOMMENDED_BUILDS, ROLE_META,
  WEAPONS_REAL, MOBS_DB, RPGMOBS_TIERS, SYNERGIES, getSynergyScore,
} from './data.js';
import {
  getActiveRace, computeInnates, computeAugBonuses, computeStat,
  computeClassPassiveScaling, computeAugMultipliers, fmt, encodeBuild, decodeBuild,
  loadSavedBuilds, saveBuildsList,
} from './engine.js';
import { G } from './styles.jsx';

function PassiveList({passives,compact}){return(<div style={{display:"flex",flexDirection:"column",gap:compact?4:6}}>{passives.map((p,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:compact?"5px 10px":"8px 12px",background:p.color+"0a",borderRadius:"var(--radius-md)",border:"1px solid "+p.color+"15",transition:"background 0.15s"}}><span style={{fontSize:compact?14:16,flexShrink:0,width:compact?20:24,textAlign:"center"}}>{p.icon}</span><div style={{minWidth:0}}><span style={{fontSize:compact?11:12,fontWeight:700,color:p.color}}>{p.name}</span><span style={{fontSize:compact?10:11,color:"#7888a8",marginLeft:6}}>{p.desc}</span></div></div>))}</div>)}

function AscTree({race}){const stages=["base","tier_1","tier_2","final"];const by={};stages.forEach(s=>{by[s]=race.tree.filter(n=>n.stage===s)});return(<div style={{display:"flex",gap:6,alignItems:"flex-start",overflowX:"auto",padding:"8px 0"}}>{stages.map((stage,si)=>(<div key={stage} style={{display:"flex",alignItems:"center"}}><div style={{display:"flex",flexDirection:"column",gap:5,alignItems:"center",minWidth:82}}><div style={{fontSize:9,color:SC[stage],fontWeight:800,textTransform:"uppercase",letterSpacing:1.5}}>{SL[stage]}</div>{by[stage].map(n=>(<div key={n.id} style={{background:SC[stage]+"12",border:"2px solid "+SC[stage]+"44",borderRadius:"var(--radius-md)",padding:"4px 10px",textAlign:"center",fontSize:11,fontWeight:700,color:SC[stage],minWidth:72}}>{n.name}{n.prestige>0&&<div style={{fontSize:9,opacity:0.6}}>P{n.prestige}</div>}</div>))}</div>{si<3&&<div style={{color:"#333",fontSize:14,margin:"0 2px",marginTop:14}}>›</div>}</div>))}</div>)}

const bs=(c,sm)=>({minWidth:sm?30:36,height:sm?26:30,borderRadius:7,border:"1px solid "+c+"33",background:c+"10",color:c,fontWeight:700,fontSize:sm?11:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0});

// ═══════════════════════════════════════════
// TAB: RACE
// ═══════════════════════════════════════════
function EvoTree({race,selectedEvo,setSelectedEvo}){
  const stages=["base","tier_1","tier_2","final"];
  const by={};stages.forEach(s=>{by[s]=race.tree.filter(n=>n.stage===s)});
  return(<div style={{display:"flex",gap:6,alignItems:"flex-start",overflowX:"auto",padding:"8px 0",flexWrap:"wrap"}}>{stages.map((stage,si)=>(<div key={stage} style={{display:"flex",alignItems:"center"}}><div style={{display:"flex",flexDirection:"column",gap:5,alignItems:"center",minWidth:82}}><div style={{fontSize:9,color:SC[stage],fontWeight:800,textTransform:"uppercase",letterSpacing:1.5}}>{SL[stage]}</div>{by[stage].map(n=>{const sel=selectedEvo===n.id;const evo=EVOLUTIONS[n.id];return(<div key={n.id} onClick={()=>setSelectedEvo(n.id)} style={{background:sel?SC[stage]+"25":SC[stage]+"0a",border:"2px solid "+(sel?SC[stage]:SC[stage]+"44"),borderRadius:"var(--radius-md)",padding:"6px 12px",textAlign:"center",fontSize:11,fontWeight:700,color:sel?"#fff":SC[stage],minWidth:78,cursor:"pointer",transition:"all 0.2s",boxShadow:sel?"0 2px 12px "+SC[stage]+"30":"none"}}><div>{evo?.name||n.name}</div>{n.prestige>0&&<div style={{fontSize:9,opacity:0.6}}>P{n.prestige}</div>}</div>)})}</div>{si<3&&<div style={{color:"#333",fontSize:14,margin:"0 2px",marginTop:14}}>›</div>}</div>))}</div>);
}

function EvoDetails({evoId,raceColor}){
  const evo=EVOLUTIONS[evoId];if(!evo)return null;
  return(<div style={{marginTop:10}}>
    <div style={{fontSize:12,fontWeight:700,color:raceColor,marginBottom:6}}>{evo.name} <span style={{fontSize:10,color:SC[evo.stage],background:SC[evo.stage]+"15",padding:"2px 8px",borderRadius:"var(--radius-md)",marginLeft:6}}>{SL[evo.stage]}{evo.prestige>0?` P${evo.prestige}`:""}</span></div>
    <div style={{fontSize:11,color:"#888",marginBottom:8,lineHeight:1.4}}>{evo.desc}</div>
    {/* Requirements */}
    {(evo.minSk||evo.minAny||evo.reqForms)&&<div style={{marginBottom:8,padding:"6px 10px",background:"#ffffff06",borderRadius:8,border:"1px solid #ffffff0a"}}>
      <div style={{fontSize:10,fontWeight:700,color:"#f5a623",marginBottom:3}}>Requirements</div>
      {evo.minSk&&<div style={{fontSize:10,color:"#aaa",display:"flex",gap:6,flexWrap:"wrap"}}>{Object.entries(evo.minSk).map(([k,v])=>{const s=STATS.find(st=>st.key===k);return <span key={k} style={{background:s?.color+"15",color:s?.color||"#aaa",padding:"1px 6px",borderRadius:4}}>{s?.icon||""} {s?.name||k} ≥{v}</span>})}</div>}
      {evo.minAny&&<div style={{fontSize:10,color:"#aaa",marginTop:2}}>OU: {evo.minAny.map((x,i)=>{const[k,v]=Object.entries(x)[0];const s=STATS.find(st=>st.key===k);return <span key={i} style={{background:s?.color+"15",color:s?.color||"#aaa",padding:"1px 6px",borderRadius:4,marginRight:4}}>{s?.icon||""} {s?.name||k} ≥{v}</span>})}</div>}
      {evo.reqForms&&<div style={{fontSize:10,color:"#e74c3c",marginTop:2}}>Forme requise: {evo.reqForms.map(f=>EVOLUTIONS[f]?.name||f).join(" ou ")}</div>}
    </div>}
    {/* Stats grid */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(5, 1fr)",gap:2,marginBottom:8}}>{STATS.map(s=>{const v=evo.attrs[s.key]||0;const label=s.mode==="mult"?(v===0||v===undefined?"—":`×${v}`):s.mode==="haste"?(v===0||v===undefined?"—":`${((v-1)*100)>=0?"+":""}${((v-1)*100).toFixed(0)}%`):s.mode==="add%"?`+${v}%`:`${v}`;return(<div key={s.key} style={{textAlign:"center",fontSize:9,padding:"3px 0",background:s.color+"08",borderRadius:4}}><div>{s.icon}</div><div style={{color:s.mode==="mult"?(v>=1?"#2ed573":v>0?"#ff6b6b":"#555"):s.mode==="haste"?(v>=1?"#2ed573":v>0?"#ff6b6b":"#555"):s.color,fontWeight:700}}>{label}</div></div>)})}</div>
    <div style={{fontSize:10,color:"#777"}}>Innate/niv: {Object.entries(evo.innate).map(([k,v])=>(STATS.find(s=>s.key===k)?.icon||"")+" "+k+" +"+v).join(" • ")}</div>
    <div style={{marginTop:6}}><PassiveList passives={evo.passives} compact/></div>
  </div>);
}

function RaceTab({selectedRace:sr,setSelectedRace:set,selectedEvo,setSelectedEvo}){
  const KEY_STATS=["life_force","strength","sorcery","defense","haste"];
  return(<div>
    <h3 style={{margin:"0 0 16px",fontSize:18,color:"#fff",fontFamily:"var(--fd)",letterSpacing:0.5}}>🧬 Choisis ta Race</h3>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))",gap:10}}>
      {RACES.map(r=>{const sel=sr?.id===r.id;return(
        <div key={r.id} onClick={()=>{set(r);setSelectedEvo(r.id)}} style={{
          background:sel?`linear-gradient(160deg,${r.color}14,${r.color}06)`:"var(--c-card)",
          border:sel?`2px solid ${r.color}`:"1px solid var(--c-border)",
          borderLeft:`4px solid ${r.color}`,
          borderRadius:"var(--radius-lg)",
          padding:"var(--sp-2) var(--sp-2) var(--sp-2) calc(var(--sp-2) - 4px)",
          cursor:"pointer",transition:"all 0.25s ease",position:"relative",overflow:"hidden",
          boxShadow:sel?`0 6px 24px ${r.color}20,inset 0 1px 0 ${r.color}15`:"none",
        }}
        >
          {sel&&<div style={{position:"absolute",top:0,right:0,width:60,height:60,background:`radial-gradient(circle at top right,${r.color}18,transparent)`,borderRadius:"0 0 0 60px"}}/>}
          <div style={{fontSize:36,marginBottom:8,filter:sel?"none":"grayscale(0.2)"}}>{r.emoji}</div>
          <div style={{fontSize:15,fontWeight:800,color:sel?"#fff":r.color,fontFamily:"var(--fd)",marginBottom:3}}>{r.name}</div>
          <div style={{fontSize:11,color:"#7c8db5",lineHeight:1.4,marginBottom:10}}>{r.desc}</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {KEY_STATS.map(k=>{const s=STATS.find(st=>st.key===k);const v=r.attrs[k]||0;if(v===0&&(s.mode==="mult"||s.mode==="haste"))return null;
              const label=s.mode==="mult"?`×${v}`:s.mode==="haste"?`${((v-1)*100)>=0?"+":""}${((v-1)*100).toFixed(0)}%`:s.mode==="add%"?`+${v}%`:`${v}`;
              const good=s.mode==="mult"?v>=1:s.mode==="haste"?v>=1:true;
              return <span key={k} style={{fontSize:9,padding:"2px 6px",borderRadius:"var(--radius-md)",background:s.color+"12",color:good?s.color:"#ff6b6b",fontWeight:700}}>{s.icon} {label}</span>
            })}
          </div>
          <div style={{marginTop:8,fontSize:10,color:"#555"}}>{r.passives.length} passif{r.passives.length>1?"s":""}</div>
        </div>
      )})}
    </div>
    {sr&&(<div style={{marginTop:16,background:"linear-gradient(145deg,var(--card),"+sr.color+"05)",borderRadius:"var(--radius-md)",padding:"20px 18px",border:"2px solid "+sr.color+"25",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-40,right:-40,width:160,height:160,background:`radial-gradient(circle,${sr.color}0a,transparent)`,borderRadius:"50%"}}/>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12,position:"relative"}}>
        <span style={{fontSize:32}}>{sr.emoji}</span>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:sr.color,fontFamily:"var(--fd)"}}>{sr.name}</div>
          <div style={{fontSize:12,color:"#7c8db5"}}>Sélectionne une forme d'ascension</div>
        </div>
      </div>
      <EvoTree race={sr} selectedEvo={selectedEvo||sr.id} setSelectedEvo={setSelectedEvo}/>
      <EvoDetails evoId={selectedEvo||sr.id} raceColor={sr.color}/>
    </div>)}
  </div>)}


// ═══════════════════════════════════════════
// TAB: CLASS
// ═══════════════════════════════════════════
function ClassTab({primaryClass:pc,setPrimaryClass:spc,secondaryClass:sc,setSecondaryClass:ssc,primaryTier:pt,setPrimaryTier:spt,secondaryTier:st,setSecondaryTier:sst}){const[mode,setMode]=useState("primary");const cc=mode==="primary"?pc:sc;const setC=mode==="primary"?spc:ssc;const ct=mode==="primary"?pt:st;const setT=mode==="primary"?spt:sst;return(<div><div style={{display:"flex",gap:8,marginBottom:14}}>{["primary","secondary"].map(m=>(<button key={m} onClick={()=>setMode(m)} style={{padding:"8px 18px",borderRadius:"var(--radius-md)",border:"2px solid "+(mode===m?"#f5a623":"var(--brd)"),background:mode===m?"#f5a62312":"var(--card)",color:mode===m?"#f5a623":"#555",fontWeight:700,fontSize:13,cursor:"pointer"}}>{m==="primary"?"⚔️ Primaire":"🛡️ Secondaire"}</button>))}</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:10}}>{CLASSES.map(cls=>{const sel=cc?.id===cls.id;const oth=mode==="primary"?sc?.id===cls.id:pc?.id===cls.id;return(<div key={cls.id} onClick={()=>{if(!oth){setC(cls);setT(0)}}} style={{background:sel?"linear-gradient(135deg,"+cls.color+"10,"+cls.color+"05)":oth?"#091018":"var(--c-card)",border:sel?"2px solid "+cls.color:"1px solid var(--c-border)",borderLeft:"4px solid "+cls.color,borderRadius:"var(--radius-lg)",padding:12,cursor:oth?"not-allowed":"pointer",opacity:oth?0.3:1,transition:"all 0.2s ease"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{fontSize:24}}>{cls.emoji}</span><div><div style={{fontSize:14,fontWeight:800,color:cls.color}}>{cls.name}</div><div style={{fontSize:10,color:"#666"}}>{cls.dmg} • {cls.range} • Cap DEF: {cls.defCap}%</div></div></div><div style={{display:"flex",gap:3,marginBottom:6,flexWrap:"wrap"}}>{cls.weapons.map(w=><span key={w} style={{fontSize:9,background:cls.color+"15",color:cls.color,padding:"2px 6px",borderRadius:5}}>{w}</span>)}</div><PassiveList passives={cls.passives} compact/></div>)})}</div>{cc&&(<div style={{marginTop:14,background:"var(--card)",borderRadius:8,padding:14,border:"2px solid "+cc.color+"30"}}><div style={{fontSize:15,fontWeight:800,color:cc.color,marginBottom:10,fontFamily:"var(--fd)"}}>{cc.emoji} {cc.name} — Tier</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{CLASS_TIERS.map((tier,i)=>(<button key={tier} onClick={()=>setT(i)} style={{padding:"8px 16px",borderRadius:"var(--radius-md)",border:"2px solid "+(ct===i?CLASS_TIER_COLORS[i]:"var(--brd)"),background:ct===i?CLASS_TIER_COLORS[i]+"15":"var(--bg)",color:ct===i?CLASS_TIER_COLORS[i]:"#555",fontWeight:700,fontSize:12,cursor:"pointer"}}>{tier} {CLASS_TIER_PRESTIGE[i]>0&&<span style={{opacity:0.5}}>(P{CLASS_TIER_PRESTIGE[i]})</span>}</button>))}</div><div style={{marginTop:10,fontSize:11,color:"#777"}}>Innate : {Object.entries(cc.innateByTier[ct]).map(([k,v])=>(STATS.find(s=>s.key===k)?.icon||"")+" "+k+" +"+v+"/niv").join("  •  ")}{mode==="secondary"&&<span style={{color:"#f5a623",marginLeft:8}}>× 0.5 (secondaire)</span>}</div></div>)}</div>)}

// ═══════════════════════════════════════════
// TAB: STATS
// ═══════════════════════════════════════════
function StatsTab({level,setLevel,prestige,setPrestige,skillPoints:sp,setSkillPoints:setSP,totalSP,usedSP,selectedRace:race,primaryClass:c1,primaryTier:t1,secondaryClass:c2,secondaryTier:t2,augBonus,postBonus,augMult,augLock,selectedEvo}){const rem=totalSP-usedSP;const aRace=getActiveRace(race,selectedEvo||race?.id);const inn=computeInnates(aRace,c1,t1,c2,t2,level);const add=(k,a)=>{setSP(p=>{const c=p[k]||0;const nv=Math.max(0,c+a);if(nv-c>rem&&a>0)return p;return{...p,[k]:nv}})};return(<div><div style={{display:"flex",gap:12,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:6}}><label style={{fontSize:12,color:"#aaa",fontWeight:700}}>Niveau</label><input type="number" min={1} max={200} value={level} onChange={e=>{const v=parseInt(e.target.value)||1;setLevel(Math.max(1,Math.min(200,v)))}} style={{width:64,background:"#0a1220",border:"1px solid #1a2d4f",borderRadius:8,color:"#f5a623",padding:"6px 10px",fontSize:15,fontWeight:800,textAlign:"center",fontFamily:"var(--fb)",outline:"none"}}/></div><div style={{display:"flex",alignItems:"center",gap:6}}><label style={{fontSize:12,color:"#aaa",fontWeight:700}}>Prestige</label><input type="number" min={0} max={20} value={prestige} onChange={e=>{const v=parseInt(e.target.value)||0;setPrestige(Math.max(0,Math.min(20,v)))}} style={{width:52,background:"#0a1220",border:"1px solid #1a2d4f",borderRadius:8,color:"#e74c3c",padding:"6px 8px",fontSize:15,fontWeight:800,textAlign:"center",fontFamily:"var(--fb)",outline:"none"}}/></div><div style={{background:rem>0?"#2ed57312":"#ff6b6b12",padding:"6px 14px",borderRadius:"var(--radius-md)",border:"1px solid "+(rem>0?"#2ed573":"#ff6b6b")+"30",fontSize:13,fontWeight:700,color:rem>0?"#2ed573":"#ff6b6b"}}>{rem} / {totalSP} SP</div><button onClick={()=>setSP({})} style={{...bs("#ff6b6b"),padding:"6px 14px",minWidth:"auto",fontSize:11}}>Reset</button></div>{(race||c1||c2)&&STATS.some(s=>inn[s.key].perLevel>0)&&(<div style={{background:"var(--card)",borderRadius:12,padding:12,marginBottom:14,border:"1px solid var(--brd)"}}><div style={{fontSize:12,fontWeight:800,color:"#fff",marginBottom:8}}>📈 Innate Bonuses</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:6}}>{STATS.filter(s=>inn[s.key].perLevel>0).map(s=>{const i=inn[s.key];return(<div key={s.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 10px",background:s.color+"08",borderRadius:8,border:"1px solid "+s.color+"18"}}><span style={{fontSize:12,color:"#ccc"}}>{s.icon} {s.name}</span><span style={{fontSize:12,fontWeight:700,color:s.color}}>+{i.perLevel.toFixed(2)}/niv <span style={{color:"#666"}}>(Total +{i.total.toFixed(1)} @ Niv {level})</span></span></div>)})}</div></div>)}<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))",gap:8}}>{STATS.map(stat=>{const pts=sp[stat.key]||0;const compRaw=computeStat(stat,aRace,inn,sp,augBonus,postBonus);let cTotal=compRaw.total;if(augMult&&augMult[stat.key]!=null)cTotal*=augMult[stat.key];if(augLock&&augLock[stat.key]!=null)cTotal=augLock[stat.key];const comp={...compRaw,total:cTotal};return(<div key={stat.key} style={{background:"var(--card)",borderRadius:12,padding:12,border:"1px solid "+stat.color+"18"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:18}}>{stat.icon}</span><div><div style={{fontSize:13,fontWeight:700,color:stat.color}}>{stat.name}</div><div style={{fontSize:9,color:"#555"}}>Niv. {pts} • {stat.per_level}{stat.mode!=="flat"?"%":""}/pt{stat.mode==="mult"?" (×race)":stat.mode==="haste"?" (×race + offset)":""}</div></div></div><div style={{textAlign:"right"}}><div style={{fontSize:20,fontWeight:900,color:stat.color}}>{fmt(comp.total,stat.mode)}</div></div></div><div style={{display:"flex",gap:4,fontSize:9,color:"#555",marginBottom:6,flexWrap:"wrap"}}>{stat.mode==="mult"&&aRace&&<span style={{background:"#fff1",padding:"1px 5px",borderRadius:4}}>Race: {(aRace.attrs[stat.key]===0||aRace.attrs[stat.key]===undefined)?"×1.0 (aucun)":`×${aRace.attrs[stat.key]}`}</span>}{stat.mode==="haste"&&aRace&&<span style={{background:"#fff1",padding:"1px 5px",borderRadius:4}}>Race: {aRace.attrs[stat.key]||1} ({((aRace.attrs[stat.key]||1)-1)*100>=0?"+":""}{(((aRace.attrs[stat.key]||1)-1)*100).toFixed(0)}% base, ×gains)</span>}{stat.mode!=="mult"&&stat.mode!=="haste"&&comp.base!==0&&<span style={{background:"#fff1",padding:"1px 5px",borderRadius:4}}>Race: +{comp.base}</span>}{comp.fromInn>0&&<span style={{background:"#fff1",padding:"1px 5px",borderRadius:4}}>Innate: +{comp.fromInn.toFixed(1)}</span>}{comp.fromSP>0&&<span style={{background:stat.color+"15",padding:"1px 5px",borderRadius:4,color:stat.color}}>SP: +{comp.fromSP.toFixed(1)}</span>}{comp.fromAug!==0&&<span style={{background:comp.fromAug>0?"#f5a62320":"#ff6b6b20",padding:"1px 5px",borderRadius:4,color:comp.fromAug>0?"#f5a623":"#ff6b6b"}}>Aug: {comp.fromAug>0?"+":""}{comp.fromAug}</span>}{comp.fromPost>0&&<span style={{background:"#a55eea20",padding:"1px 5px",borderRadius:4,color:"#a55eea"}}>Passive: +{comp.fromPost.toFixed(1)}</span>}</div><div style={{display:"flex",gap:4,alignItems:"center"}}><button onClick={()=>add(stat.key,-10)} style={bs("#ff6b6b",true)}>-10</button><button onClick={()=>add(stat.key,-1)} style={bs("#ff6b6b",true)}>-1</button><div style={{flex:1,height:6,background:"#0e1828",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(pts/4,100)+"%",background:"linear-gradient(90deg,"+stat.color+"55,"+stat.color+")",borderRadius:3,transition:"width 0.15s"}}/></div><button onClick={()=>add(stat.key,1)} style={bs("#2ed573",true)}>+1</button><button onClick={()=>add(stat.key,10)} style={bs("#2ed573",true)}>+10</button></div></div>)})}</div></div>)}

// ═══════════════════════════════════════════
// TAB: AUGMENTS (with stat bonus input)
// ═══════════════════════════════════════════
function AugmentsTab({selectedAugments:sa,setSelectedAugments:setSA,augBonus,setAugBonus}){
  const[f,setF]=useState("ALL");
  const[expanded,setExpanded]=useState(new Set());
  const fl=f==="ALL"?AUGMENTS:AUGMENTS.filter(a=>a.tier===f);
  const gr={};TIER_ORDER.forEach(t=>{gr[t]=fl.filter(a=>a.tier===t)});
  const tog=a=>setSA(p=>p.find(x=>x.id===a.id)?p.filter(x=>x.id!==a.id):[...p,a]);
  const togExp=(id,e)=>{e.stopPropagation();setExpanded(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});};
  return(<div>
    <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
      {["ALL",...TIER_ORDER].map(t=>(<button key={t} onClick={()=>setF(t)} style={{padding:"6px 14px",borderRadius:"var(--radius-md)",border:"2px solid "+(f===t?(TIER_COLORS[t]||"#f5a623"):"var(--brd)"),background:f===t?(TIER_COLORS[t]||"#f5a623")+"12":"var(--bg)",color:f===t?(TIER_COLORS[t]||"#f5a623"):"#444",fontWeight:700,fontSize:12,cursor:"pointer"}}>{t==="ALL"?"Tous":t}</button>))}
      <span style={{marginLeft:"auto",fontSize:12,color:"#666"}}>{sa.length} sélectionnés</span>
    </div>
    {TIER_ORDER.map(tier=>{const augs=gr[tier];if(!augs?.length)return null;return(<div key={tier} style={{marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:800,color:TIER_COLORS[tier],marginBottom:6,textTransform:"uppercase",letterSpacing:1.5}}>{tier} ({augs.length})</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:6}}>
        {augs.map(aug=>{const sel=sa.find(a=>a.id===aug.id);const isExp=expanded.has(aug.id);const tc=TIER_COLORS[aug.tier];
        return(<div key={aug.id} style={{background:sel?tc+"0e":"var(--card)",border:"2px solid "+(sel?tc:"var(--brd)"),borderRadius:"var(--radius-md)",padding:"10px 12px",cursor:"pointer",transition:"border-color .15s"}} onClick={()=>tog(aug)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <span style={{fontSize:12,fontWeight:700,color:sel?tc:"#bbb",flex:1}}>{aug.name}</span>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              {aug.dpsImpact&&<span title="Impacte le DPS Meter" style={{fontSize:8,background:"#f5a62318",color:"#f5a623",padding:"1px 5px",borderRadius:4,fontWeight:700}}>⚡ DPS</span>}
              <span style={{fontSize:9,color:tc,background:tc+"15",padding:"2px 6px",borderRadius:5}}>{aug.tier}</span>
            </div>
          </div>
          <div style={{fontSize:10,color:"#666",marginTop:3,lineHeight:1.4}}>{aug.desc}</div>
          {(aug.bonuses||aug.scaling)&&<div style={{display:"flex",gap:4,marginTop:5,flexWrap:"wrap"}}>
            {aug.bonuses&&Object.entries(aug.bonuses).map(([k,v])=>{const st=STATS.find(s=>s.key===k);return st?<span key={k} style={{fontSize:9,background:v>0?"#2ed57318":"#ff6b6b18",color:v>0?"#2ed573":"#ff6b6b",padding:"1px 6px",borderRadius:4,fontWeight:700}}>{v>0?"+":""}{v}{st.mode!=="flat"?"%":""} {st.name}</span>:null;})}
            {aug.scaling&&aug.scaling.map((sc,i)=>{const src=STATS.find(s=>s.key===sc.source);const tgt=STATS.find(s=>s.key===sc.target);return <span key={i} style={{fontSize:9,background:"#a55eea18",color:"#a55eea",padding:"1px 6px",borderRadius:4,fontWeight:700}}>{src?.icon}{(sc.ratio*100).toFixed(0)}% {src?.name}→{tgt?.icon}{tgt?.name}</span>;})}
          </div>}
          {aug.sections&&<div>
            <button onClick={e=>togExp(aug.id,e)} style={{marginTop:6,background:"transparent",border:"none",color:"#555",fontSize:10,cursor:"pointer",padding:"2px 0",display:"flex",alignItems:"center",gap:3,fontWeight:600}}>
              {isExp?"▲ Masquer":"▼ Détails"}
            </button>
            {isExp&&<div style={{marginTop:6,display:"flex",flexDirection:"column",gap:4}} onClick={e=>e.stopPropagation()}>
              {aug.sections.map((sec,i)=>(
                <div key={i} style={{background:(sec.color||"#8adf9e")+"10",border:"1px solid "+(sec.color||"#8adf9e")+"25",borderLeft:"3px solid "+(sec.color||"#8adf9e"),borderRadius:"0 6px 6px 0",padding:"5px 8px"}}>
                  {sec.title&&<div style={{fontSize:9,fontWeight:800,color:sec.color||"#8adf9e",textTransform:"uppercase",letterSpacing:0.8,marginBottom:2}}>{sec.title}</div>}
                  <div style={{fontSize:10,color:"#ccc",lineHeight:1.5,whiteSpace:"pre-line"}}>{sec.body}</div>
                </div>
              ))}
              {aug.dpsImpact?.note&&<div style={{fontSize:9,color:"#f5a623",fontStyle:"italic",marginTop:2}}>⚠ {aug.dpsImpact.note}</div>}
            </div>}
          </div>}
        </div>);})}
      </div>
    </div>);})}

{/* Augment stat bonuses input */}
<div style={{marginTop:16,background:"var(--card)",borderRadius:8,padding:16,border:"1px solid var(--brd)"}}>
<div style={{fontSize:14,fontWeight:800,color:"#f5a623",marginBottom:4,fontFamily:"var(--fd)"}}>📊 Bonus manuels</div>
<div style={{fontSize:10,color:"#666",marginBottom:10}}>Ajoute ici les bonus des rolls Common ou d'autres sources non automatiques. Les bonus des augments sélectionnés ci-dessus sont déjà calculés automatiquement.</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",gap:8}}>
{STATS.map(s=>(<div key={s.key} style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14}}>{s.icon}</span><span style={{fontSize:11,color:"#aaa",minWidth:70}}>{s.name}</span><input type="number" step="0.01" value={augBonus[s.key]||""} onChange={e=>{const v=parseFloat(e.target.value);setAugBonus(p=>({...p,[s.key]:isNaN(v)?0:v}))}} placeholder="0" style={{width:70,background:"#0a1220",border:"1px solid #1a2d4f",borderRadius:"var(--radius-md)",color:s.color,padding:"4px 8px",fontSize:12,fontWeight:700,textAlign:"right"}}/><span style={{fontSize:10,color:"#555"}}>{s.mode!=="flat"?"%":""}</span></div>))}
</div></div></div>)}

// ═══════════════════════════════════════════
// TAB: SUMMARY
// ═══════════════════════════════════════════
function SummaryTab({state:s,onPublishToCommunity}){const{selectedRace:race0,selectedEvo:sEvo,primaryClass:c1,secondaryClass:c2,primaryTier:t1,secondaryTier:t2,level,prestige,skillPoints:sp,selectedAugments:sa,augBonus:manualAug}=s;const race=getActiveRace(race0,sEvo||race0?.id);const totalSP=12+(level-1)*5;const usedSP=Object.values(sp).reduce((a,b)=>a+b,0);const inn=computeInnates(race,c1,t1,c2,t2,level);const flatAug=computeAugBonuses(sa,manualAug);const baseStats={};STATS.forEach(s=>{baseStats[s.key]=computeStat(s,race,inn,sp,flatAug).total});const augBonus=computeAugBonuses(sa,manualAug,baseStats);const baseStats2={};STATS.forEach(s=>{baseStats2[s.key]=computeStat(s,race,inn,sp,augBonus).total});const postBonus=computeClassPassiveScaling(c1,c2,baseStats2);const{mult:augMult4,lock:augLock4}=computeAugMultipliers(sa);const finalStats4={};STATS.forEach(st=>{let v=computeStat(st,race,inn,sp,augBonus,postBonus).total;if(augMult4[st.key]!=null)v*=augMult4[st.key];if(augLock4[st.key]!=null)v=augLock4[st.key];finalStats4[st.key]=v;});const[copied,setCopied]=useState(false);const code=encodeBuild(s);return(<div><div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}><button onClick={()=>{navigator.clipboard?.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),2000)}} style={{padding:"8px 16px",borderRadius:"var(--radius-md)",border:"2px solid #f5a62340",background:"#f5a62310",color:"#f5a623",fontWeight:700,fontSize:12,cursor:"pointer"}}>{copied?"✅ Copié !":"📋 Copier le code"}</button>{onPublishToCommunity&&<button onClick={()=>onPublishToCommunity(code)} style={{padding:"8px 16px",borderRadius:"var(--radius-md)",border:"2px solid #3dd8c540",background:"#3dd8c510",color:"#3dd8c5",fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>📤 Publier dans la Communauté</button>}<div style={{flex:1,background:"var(--card)",borderRadius:8,padding:"6px 10px",fontSize:10,color:"#444",fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",border:"1px solid var(--brd)"}}>{code.slice(0,80)}...</div></div>
<div style={{background:"linear-gradient(135deg,#0e1828,#111d3a)",borderRadius:"var(--radius-md)",padding:18,border:"1px solid #1a2d4f",marginBottom:14}}><div style={{display:"flex",gap:20,flexWrap:"wrap"}}>{[{l:"PRESTIGE",v:prestige,c:prestige>0?"#e74c3c":"#fff"},{l:"LEVEL",v:level,c:"#fff"}].map(x=>(<div key={x.l} style={{flex:"1 1 80px"}}><div style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:2}}>{x.l}</div><div style={{fontSize:22,fontWeight:900,color:x.c}}>{x.v}</div></div>))}<div style={{flex:"1 1 120px"}}><div style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:2}}>RACE</div>{race?<div><div style={{fontSize:16,fontWeight:800,color:race.color}}>{race.emoji} {race.activeName||race.name}</div>{race.activeStage&&race.activeStage!=="base"&&<div style={{fontSize:10,color:SC[race.activeStage]}}>{SL[race.activeStage]}</div>}</div>:<div style={{color:"#444"}}>—</div>}</div>{[{l:"PRIMARY CLASS",o:c1,t:t1},{l:"SECONDARY CLASS",o:c2,t:t2}].map(x=>(<div key={x.l} style={{flex:"1 1 140px"}}><div style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:2}}>{x.l}</div>{x.o?<div><span style={{fontSize:14,fontWeight:800,color:x.o.color}}>{x.o.emoji} {x.o.name}</span><div style={{fontSize:10,color:CLASS_TIER_COLORS[x.t]}}>{CLASS_TIERS[x.t]}</div></div>:<div style={{color:"#444"}}>—</div>}</div>))}</div></div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}><div style={{display:"flex",flexDirection:"column",gap:14}}>
{/* Total Attributes */}
<div style={{background:"var(--card)",borderRadius:8,padding:16,border:"1px solid var(--brd)"}}><div style={{fontSize:13,fontWeight:800,color:"#fff",marginBottom:10,textTransform:"uppercase",letterSpacing:1.5,fontFamily:"var(--fd)"}}>Total Attributes</div>{STATS.map(stat=>{const raw4=computeStat(stat,race,inn,sp,augBonus,postBonus);const comp={...raw4,total:finalStats4[stat.key]??raw4.total};const pts=sp[stat.key]||0;const mx=stat.mode==="flat"?300:100;const pct=Math.min((Math.abs(comp.total)/mx)*100,100);return(<div key={stat.key} style={{marginBottom:5}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}><span style={{color:pts>0?stat.color:"#888"}}>{stat.icon} <span style={{fontWeight:pts>0?700:400}}>Niv. {pts}</span> {stat.name}</span><span style={{color:stat.color,fontWeight:800,fontSize:13}}>{fmt(comp.total,stat.mode)}</span></div><div style={{height:5,background:"#0e1828",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:"linear-gradient(90deg,"+stat.color+"44,"+stat.color+")",borderRadius:3}}/></div></div>)})}</div>
{/* Innate */}
<div style={{background:"var(--card)",borderRadius:8,padding:16,border:"1px solid var(--brd)"}}><div style={{fontSize:13,fontWeight:800,color:"#fff",marginBottom:10,textTransform:"uppercase",letterSpacing:1.5,fontFamily:"var(--fd)"}}>Innate Bonuses</div>{STATS.filter(s=>inn[s.key].perLevel>0).map(stat=>{const i=inn[stat.key];return(<div key={stat.key} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid #ffffff08",fontSize:12}}><span style={{color:"#bbb"}}>{stat.icon} {stat.name}</span><span style={{color:stat.color,fontWeight:600}}>+{i.perLevel.toFixed(2)} par niveau <span style={{color:"#666"}}>(Total +{i.total.toFixed(1)} @ Niv {level})</span></span></div>)})}</div></div>
<div style={{display:"flex",flexDirection:"column",gap:14}}>
{/* Augments */}
<div style={{background:"var(--card)",borderRadius:8,padding:16,border:"1px solid var(--brd)"}}><div style={{fontSize:13,fontWeight:800,color:"#fff",marginBottom:8,textTransform:"uppercase",letterSpacing:1.5,fontFamily:"var(--fd)"}}>Augments ({sa.length})</div>{sa.length===0?<div style={{color:"#444",fontSize:11}}>Aucun augment</div>:<div style={{display:"flex",flexDirection:"column",gap:4}}>{sa.map(aug=>(<div key={aug.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",background:TIER_COLORS[aug.tier]+"0a",borderRadius:"var(--radius-md)",border:"1px solid "+TIER_COLORS[aug.tier]+"18"}}><span style={{fontSize:11,fontWeight:600,color:"#ccc"}}>{aug.name}</span><span style={{fontSize:9,color:TIER_COLORS[aug.tier],fontWeight:700}}>{aug.tier}</span></div>))}</div>}
{/* Augment stat bonuses */}
{Object.entries(augBonus).some(([,v])=>v!==0)&&(<div style={{marginTop:8}}><div style={{fontSize:10,fontWeight:700,color:"#f5a623",marginBottom:4}}>Bonus Augments (total)</div>{STATS.filter(s=>(augBonus[s.key]||0)!==0).map(s=>(<div key={s.key} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"2px 0"}}><span style={{color:"#aaa"}}>{s.icon} {s.name}</span><span style={{color:augBonus[s.key]>0?"#f5a623":"#ff6b6b",fontWeight:700}}>{augBonus[s.key]>0?"+":""}{augBonus[s.key]}{s.mode!=="flat"?"%":""}</span></div>))}</div>)}
</div>
{/* Passives */}
<div style={{background:"var(--card)",borderRadius:8,padding:16,border:"1px solid var(--brd)"}}><div style={{fontSize:13,fontWeight:800,color:"#fff",marginBottom:8,textTransform:"uppercase",letterSpacing:1.5,fontFamily:"var(--fd)"}}>Passives</div>{race&&<div style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:race.color,marginBottom:4}}>{race.emoji} {race.name}</div><PassiveList passives={race.passives} compact/></div>}{c1&&<div style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:c1.color,marginBottom:4}}>{c1.emoji} {c1.name} (Primaire)</div><PassiveList passives={c1.passives} compact/></div>}{c2&&<div><div style={{fontSize:10,fontWeight:700,color:c2.color,marginBottom:4}}>{c2.emoji} {c2.name} (Secondaire)</div><PassiveList passives={c2.passives} compact/></div>}</div></div></div>
<div style={{marginTop:14,padding:"10px 14px",background:"#f5a6230a",borderRadius:"var(--radius-md)",border:"1px solid #f5a62318",fontSize:10,color:"#888",lineHeight:1.5}}>⚠️ Formules : Stats multiplicatives (FOR, DEF, SOR) = (innate + SP + aug) × race. Hâte = (race - 1.0)×100 + (innate + SP + aug) × race. Stats additives (PRE, FER, DIS) = base race + innate + SP + aug. Stats flat (VIT, END, FLOW) = base race + innate + SP + aug.</div></div>)}


// ═══════════════════════════════════════════
// TAB: DPS METER — armes réelles + créateur ennemi + RPGMobs tiers
// ═══════════════════════════════════════════

function DpsTab({computedStats,selectedRace,primaryClass,selectedEvo,selectedAugments}){
  const sa=selectedAugments||[];
  const[weaponId,setWeaponId]=useState("longsword_onyxium");
  const[customDmg,setCustomDmg]=useState(10);
  const[customSpd,setCustomSpd]=useState(1.5);
  const[customType,setCustomType]=useState("physical");
  const[modFilter,setModFilter]=useState("ALL");
  const[showAugEffects,setShowAugEffects]=useState(true);
  // Ennemi
  const[enemyMode,setEnemyMode]=useState("preset");
  const[enemyId,setEnemyId]=useState("zombie_aberrant");
  const[catFilter,setCatFilter]=useState("ALL");
  const[rpgTier,setRpgTier]=useState(2);
  const[useEL,setUseEL]=useState(true);
  const[enemyLevel,setEnemyLevel]=useState(100);
  const[customHP,setCustomHP]=useState(1000);
  const[customDef,setCustomDef]=useState(20);
  // EL scaling contexts — extraits des world-settings
  const EL_CONTEXTS=[
    {id:"default",    label:"Open World",     baseMult:1.0, perLevel:0.115},
    {id:"endgame",    label:"Donjon Endgame", baseMult:3.0, perLevel:0.10},
    {id:"major",      label:"Donjon Majeur",  baseMult:3.0, perLevel:0.075},
    {id:"dexx",       label:"Donjon Dexx",    baseMult:3.0, perLevel:0.05},
    {id:"shiva",      label:"Donjon Shiva",   baseMult:4.0, perLevel:0.075},
  ];
  const[elCtx,setElCtx]=useState("default");
  const elConfig=EL_CONTEXTS.find(e=>e.id===elCtx)||EL_CONTEXTS[0];
  const EL_BASE=elConfig.baseMult, EL_PER_LVL=elConfig.perLevel;

  const allMods=["ALL",...[...new Set(WEAPONS_REAL.map(w=>w.mod))]];
  const weapons=modFilter==="ALL"?WEAPONS_REAL:WEAPONS_REAL.filter(w=>w.mod===modFilter);
  const weapon=WEAPONS_REAL.find(w=>w.id===weaponId)||WEAPONS_REAL[0];
  const isCustomW=weapon.id==="custom_weapon";
  const baseDmg=isCustomW?customDmg:weapon.avgDmg;
  const baseSpd=isCustomW?customSpd:weapon.speed;
  const dmgType=isCustomW?customType:weapon.dmgType;

  // Ennemi
  const cats=["ALL","boss","elite","normal"];
  const preset=MOBS_DB.find(m=>m.id===enemyId)||MOBS_DB[0];
  const tierInfo=RPGMOBS_TIERS[rpgTier-1];
  const isCustomE=enemyMode==="custom";
  const baseHP=isCustomE?customHP:Math.round(preset.hp*tierInfo.hpMult);
  const baseDmgEn=isCustomE?customDef:Math.round((preset.dmg||40)*tierInfo.dmgMult);
  const baseDefPct=isCustomE?customDef:0;
  const scaledHP=useEL?Math.round(baseHP*EL_BASE*(1+EL_PER_LVL*enemyLevel)):baseHP;
  const defReduction=Math.min(baseDefPct,80)/100;

  // Stats build + augments
  let str=computedStats?.strength||0, sor=computedStats?.sorcery||0;
  let pre=computedStats?.precision||0, fer=computedStats?.ferocity||0, haste=computedStats?.haste||0;
  let globalDmgMult=1.0;
  const augEffects=[];
  sa.forEach(aug=>{
    if(!aug.dpsImpact)return;
    const d=aug.dpsImpact;
    if(d.strMult){str*=d.strMult;augEffects.push({label:aug.name,effect:`Force ×${d.strMult}`,color:"#ff9f43"});}
    if(d.sorMult){sor*=d.sorMult;augEffects.push({label:aug.name,effect:`Sorcellerie ×${d.sorMult}`,color:"#a55eea"});}
    if(d.precLock){pre=0;augEffects.push({label:aug.name,effect:"Précision → 0",color:"#ff6b6b"});}
    if(d.strPct){str+=str*d.strPct;augEffects.push({label:aug.name,effect:`+${Math.round(d.strPct*100)}% Force`,color:"#ff9f43"});}
    if(d.sorPct){sor+=sor*d.sorPct;augEffects.push({label:aug.name,effect:`+${Math.round(d.sorPct*100)}% SOR`,color:"#a55eea"});}
    if(d.hastePct){haste+=d.hastePct;augEffects.push({label:aug.name,effect:`+${d.hastePct}% Hâte`,color:"#a29bfe"});}
    if(d.ferPct){fer+=d.ferPct;augEffects.push({label:aug.name,effect:`+${d.ferPct}% Férocité`,color:"#ff6348"});}
    if(d.dmgMult){globalDmgMult+=d.dmgMult;augEffects.push({label:aug.name,effect:`+${Math.round(d.dmgMult*100)}% dégâts`,color:"#2ed573"});}
    if(d.dmgMultNote)augEffects.push({label:aug.name,effect:d.dmgMultNote,color:"#f5a623",cond:true});
  });

  const dmgMod=dmgType==="magic"?sor:str;
  const modifiedDmg=baseDmg*(1+dmgMod/100);
  const atkSpeed=baseSpd*(1+haste/100);
  const critChance=Math.min(pre,100)/100;
  const critMult=1+fer/100;
  const avgCritMult=1+critChance*(critMult-1);
  const dmgPerHit=modifiedDmg*avgCritMult*globalDmgMult;
  const rawDps=dmgPerHit*atkSpeed;

  // Procs augments
  const procs=[]; let procDps=0;
  sa.forEach(aug=>{
    if(!aug.dpsImpact?.procs)return;
    aug.dpsImpact.procs.forEach(p=>{
      if(p.maxHpRatio||p.targetHpPct){procs.push({label:p.label,icon:p.icon,dps:null,note:p.note||"Dépend PV"});return;}
      let pd=(p.flat||0)+(p.sorRatio||0)*sor+(p.strRatio||0)*str;
      if(p.canCrit)pd*=avgCritMult;
      let rate=0,tl="";
      if(p.trigger==="cd"){rate=1/(p.cd||1);tl=`/${p.cd}s`;}
      else if(p.trigger==="hits"){rate=atkSpeed/(p.hitsReq||1);tl=`/${p.hitsReq}h`;}
      else if(p.trigger==="onhit"){rate=atkSpeed;tl="/hit";}
      const dps=pd*rate; procDps+=dps;
      procs.push({label:p.label,icon:p.icon,dps,trigger:tl,canCrit:p.canCrit,isTrueDmg:p.isTrueDmg});
    });
  });

  const totalDps=rawDps+procDps;
  const effectiveDps=totalDps*(1-defReduction);
  const ttk=effectiveDps>0?(scaledHP/effectiveDps).toFixed(1)+"s":"∞";
  const htk=dmgPerHit>0?Math.ceil(scaledHP/dmgPerHit):"∞";

  const fmtN=(v,d=1)=>v>=1000?(v/1000).toFixed(1)+"k":v.toFixed(d);
  const StatBox=({label,value,unit,color,sub})=>(
    <div style={{background:color+"0a",border:"1px solid "+color+"20",borderRadius:8,padding:"12px 10px",textAlign:"center"}}>
      <div style={{fontSize:9,color:"#7c8db5",fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:3}}>{label}</div>
      <div style={{fontSize:22,fontWeight:900,color,fontFamily:"var(--fd)",lineHeight:1}}>{typeof value==="number"?fmtN(value):value}<span style={{fontSize:11,fontWeight:600,opacity:0.6}}>{unit}</span></div>
      {sub&&<div style={{fontSize:9,color:"#555",marginTop:2}}>{sub}</div>}
    </div>
  );
  const MOD_COLORS={"WansWonder":"#e74c3c","Endgame":"#a55eea","Dexx":"#3498db","Exarkys":"#e67e22","RPGMagic":"#2ed573","ExpandedNecro":"#00cec9","Custom":"#f5a623","ALL":"#888"};
  const CAT_COLORS={"boss":"#e74c3c","elite":"#3498db","normal":"#2ed573","ALL":"#888"};
  const inp={background:"#0a1220",border:"1px solid #1a2d4f",borderRadius:8,padding:"5px 8px",fontSize:13,fontWeight:700,textAlign:"center",outline:"none"};

  return(<div>
    <h3 style={{margin:"0 0 14px",fontSize:18,color:"#fff",fontFamily:"var(--fd)"}}>⚡ DPS Meter</h3>

    {/* ARME */}
    <div style={{background:"var(--card)",borderRadius:8,padding:14,border:"1px solid var(--brd)",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
        <div style={{fontSize:13,fontWeight:800,color:"#fff",fontFamily:"var(--fd)"}}>🗡️ Arme</div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
          {allMods.map(m=><button key={m} onClick={()=>setModFilter(m)} style={{padding:"2px 8px",borderRadius:5,border:"1px solid "+(modFilter===m?(MOD_COLORS[m]||"#888"):"var(--brd)"),background:modFilter===m?(MOD_COLORS[m]||"#888")+"15":"transparent",color:modFilter===m?(MOD_COLORS[m]||"#888"):"#555",fontSize:9,fontWeight:700,cursor:"pointer"}}>{m}</button>)}
        </div>
      </div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
        {weapons.map(w=>{const sel=weaponId===w.id;const mc=MOD_COLORS[w.mod]||"#888";const qc={Relic:"#f5a623",Legendary:"#e74c3c",Epic:"#3498db",Rare:"#2ed573",Divine:"#9b59b6",Corrupted:"#636e72",Custom:"#f5a623"}[w.quality]||"#888";return(
          <button key={w.id} onClick={()=>setWeaponId(w.id)} style={{padding:"6px 10px",borderRadius:"var(--radius-md)",border:"2px solid "+(sel?"#f5a623":"var(--brd)"),background:sel?"#f5a62312":"var(--bg)",color:sel?"#f5a623":"#666",fontSize:10,fontWeight:sel?700:400,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:4}}>
            <span>{w.icon} {w.name}</span>
            <span style={{fontSize:7,color:qc,background:qc+"18",padding:"1px 4px",borderRadius:3}}>{w.quality}</span>
            {w.ilvl>0&&<span style={{fontSize:7,color:mc,background:mc+"18",padding:"1px 4px",borderRadius:3}}>iLvl {w.ilvl}</span>}
          </button>
        );})}
      </div>
      {!isCustomW&&<div style={{display:"flex",gap:14,marginTop:8,fontSize:10,color:"#555",flexWrap:"wrap"}}>
        <span>Dmg moy: <strong style={{color:"#f5a623"}}>{weapon.avgDmg.toFixed(1)}</strong></span>
        <span>Max hit: <strong style={{color:"#e74c3c"}}>{weapon.maxHit}</strong></span>
        <span>Vitesse: <strong style={{color:"#a29bfe"}}>{weapon.speed}/s</strong></span>
        <span>Type: <strong style={{color:dmgType==="magic"?"#a55eea":"#ff9f43"}}>{dmgType==="magic"?"✨ Magie":"⚔️ Physique"}</strong></span>
        <span style={{color:MOD_COLORS[weapon.mod]||"#888"}}>{weapon.mod}</span>
      </div>}
      {isCustomW&&<div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",marginTop:8}}>
        <div style={{display:"flex",alignItems:"center",gap:5}}><label style={{fontSize:10,color:"#aaa",fontWeight:700}}>Dégâts</label><input type="number" step="0.5" value={customDmg} onChange={e=>setCustomDmg(parseFloat(e.target.value)||1)} style={{...inp,width:60,color:"#f5a623"}}/></div>
        <div style={{display:"flex",alignItems:"center",gap:5}}><label style={{fontSize:10,color:"#aaa",fontWeight:700}}>Vitesse</label><input type="number" step="0.1" value={customSpd} onChange={e=>setCustomSpd(parseFloat(e.target.value)||0.5)} style={{...inp,width:50,color:"#a29bfe"}}/><span style={{fontSize:9,color:"#555"}}>/s</span></div>
        <div style={{display:"flex",alignItems:"center",gap:5}}><label style={{fontSize:10,color:"#aaa",fontWeight:700}}>Type</label><select value={customType} onChange={e=>setCustomType(e.target.value)} style={{...inp,color:"#ccc"}}><option value="physical">⚔️ Physique</option><option value="magic">✨ Magique</option></select></div>
      </div>}
    </div>

    {/* ENNEMI */}
    <div style={{background:"var(--card)",borderRadius:8,padding:14,border:"1px solid var(--brd)",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
        <div style={{fontSize:13,fontWeight:800,color:"#fff",fontFamily:"var(--fd)"}}>👾 Ennemi</div>
        {["preset","custom"].map(m=><button key={m} onClick={()=>setEnemyMode(m)} style={{padding:"2px 9px",borderRadius:5,border:"1px solid "+(enemyMode===m?"#54a0ff":"var(--brd)"),background:enemyMode===m?"#54a0ff15":"transparent",color:enemyMode===m?"#54a0ff":"#555",fontSize:10,fontWeight:700,cursor:"pointer"}}>{m==="preset"?"Preset":"Custom"}</button>)}
        {enemyMode==="preset"&&cats.map(c=><button key={c} onClick={()=>setCatFilter(c)} style={{padding:"2px 7px",borderRadius:4,border:"1px solid "+(catFilter===c?(CAT_COLORS[c]||"#888"):"var(--brd)"),background:catFilter===c?(CAT_COLORS[c]||"#888")+"15":"transparent",color:catFilter===c?(CAT_COLORS[c]||"#888"):"#555",fontSize:9,fontWeight:700,cursor:"pointer"}}>{c}</button>)}
      </div>

      {enemyMode==="preset"&&<div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:8}}>
          {MOBS_DB.filter(m=>catFilter==="ALL"||m.category===catFilter).map(m=>{const sel=enemyId===m.id;const cc=CAT_COLORS[m.category]||"#888";return(
            <button key={m.id} onClick={()=>setEnemyId(m.id)} style={{padding:"4px 9px",borderRadius:"var(--radius-md)",border:"2px solid "+(sel?cc:"var(--brd)"),background:sel?cc+"12":"var(--bg)",color:sel?cc:"#555",fontWeight:sel?700:400,fontSize:9,cursor:"pointer"}}>
              {m.emoji} {m.name} <span style={{opacity:0.6}}>{fmtN(m.hp)}</span>
            </button>
          );})}
        </div>
        <div style={{fontSize:10,color:"#555",marginBottom:6}}>
          PV base: <strong style={{color:"#ff6b6b"}}>{fmtN(preset.hp)}</strong> · Dmg: <strong style={{color:"#e74c3c"}}>{preset.dmg||"?"}</strong> · Source: {preset.mod}
        </div>
      </div>}

      {enemyMode==="custom"&&<div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:5}}><label style={{fontSize:10,color:"#aaa",fontWeight:700}}>PV base</label><input type="number" min={1} value={customHP} onChange={e=>setCustomHP(parseInt(e.target.value)||1)} style={{...inp,width:80,color:"#ff6b6b"}}/></div>
        <div style={{display:"flex",alignItems:"center",gap:5}}><label style={{fontSize:10,color:"#aaa",fontWeight:700}}>Défense %</label><input type="number" min={0} max={80} value={customDef} onChange={e=>setCustomDef(Math.max(0,Math.min(80,parseInt(e.target.value)||0)))} style={{...inp,width:50,color:"#54a0ff"}}/></div>
      </div>}

      {/* RPGMobs Tier */}
      <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap",marginBottom:6}}>
        <span style={{fontSize:10,color:"#888",fontWeight:700,marginRight:2}}>RPGMobs Tier :</span>
        {RPGMOBS_TIERS.map(t=><button key={t.tier} onClick={()=>setRpgTier(t.tier)} style={{padding:"3px 8px",borderRadius:5,border:"2px solid "+(rpgTier===t.tier?t.color:"var(--brd)"),background:rpgTier===t.tier?t.color+"15":"transparent",color:rpgTier===t.tier?t.color:"#555",fontSize:9,fontWeight:700,cursor:"pointer"}}>T{t.tier}</button>)}
        <span style={{fontSize:9,color:tierInfo.color,marginLeft:4}}>× HP{tierInfo.hpMult} / DMG{tierInfo.dmgMult}</span>
      </div>

      {/* EL Scaling */}
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <label style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"#aaa",cursor:"pointer"}}>
          <input type="checkbox" checked={useEL} onChange={e=>setUseEL(e.target.checked)}/> Scaling EndlessLeveling
        </label>
        {useEL&&<div style={{display:"flex",alignItems:"center",gap:5}}>
          <span style={{fontSize:10,color:"#aaa",fontWeight:700}}>Niv.</span>
          <input type="number" min={1} max={200} value={enemyLevel} onChange={e=>setEnemyLevel(Math.max(1,Math.min(200,parseInt(e.target.value)||1)))} style={{...inp,width:55,color:"#f5a623"}}/>
        </div>}
        {useEL&&<div style={{display:"flex",gap:3,flexWrap:"wrap",alignItems:"center"}}>
          {EL_CONTEXTS.map(ec=><button key={ec.id} onClick={()=>setElCtx(ec.id)} style={{padding:"2px 7px",borderRadius:4,border:"1px solid "+(elCtx===ec.id?"#f5a623":"var(--brd)"),background:elCtx===ec.id?"#f5a62315":"transparent",color:elCtx===ec.id?"#f5a623":"#555",fontSize:8,fontWeight:700,cursor:"pointer"}}>{ec.label}</button>)}
        </div>}
        <div style={{fontSize:9,color:"#3a5068",marginLeft:4}}>
          PV finaux : <strong style={{color:"#ff6b6b"}}>{fmtN(scaledHP)}</strong>
          {useEL&&<span> (×{EL_BASE} base × (1+{EL_PER_LVL}×{enemyLevel}))</span>}
          {rpgTier!==2&&<span style={{color:tierInfo.color}}> · RPGMobs T{rpgTier} ×{tierInfo.hpMult}</span>}
        </div>
      </div>
    </div>

    {/* STATS CARDS */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))",gap:8,marginBottom:10}}>
      <StatBox label={procDps>0?"DPS Base":"DPS Brut"} value={rawDps} unit="/s" color="#f5a623" sub={fmtN(dmgPerHit)+"×"+atkSpeed.toFixed(2)+"/s"}/>
      {procDps>0&&<StatBox label="DPS Procs" value={procDps} unit="/s" color="#e74c3c" sub={procs.filter(p=>p.dps).length+" proc(s)"}/>}
      <StatBox label="DPS Effectif" value={effectiveDps} unit="/s" color="#2ed573" sub={baseDefPct>0?"après "+baseDefPct+"% DEF":"sans réduction"}/>
      <StatBox label="Temps pour tuer" value={ttk} unit="" color="#ff6b6b" sub={"vs "+fmtN(scaledHP)+" PV"}/>
      <StatBox label="Coups pour tuer" value={htk} unit="" color="#a55eea" sub={"@"+fmtN(dmgPerHit)+" /coup"}/>
      <StatBox label="Burst 5s" value={rawDps*5} unit="" color="#a29bfe" sub="dégâts en 5s"/>
      <StatBox label="Atk Speed" value={atkSpeed} unit="/s" color="#00cec9" sub={baseSpd+"+"+haste.toFixed(0)+"%"}/>
    </div>

    {/* EFFETS AUGMENTS */}
    {(augEffects.length>0||procs.length>0)&&<div style={{background:"var(--card)",borderRadius:8,padding:12,border:"1px solid #f5a62325",marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:showAugEffects?8:0}}>
        <div style={{fontSize:11,fontWeight:800,color:"#f5a623",fontFamily:"var(--fd)"}}>💠 Effets Augments actifs</div>
        <button onClick={()=>setShowAugEffects(p=>!p)} style={{background:"transparent",border:"none",color:"#555",fontSize:10,cursor:"pointer"}}>{showAugEffects?"▲":"▼"}</button>
      </div>
      {showAugEffects&&<div>
        {augEffects.length>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(250px,1fr))",gap:3,marginBottom:procs.length>0?8:0}}>
          {augEffects.map((e,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 8px",background:(e.color||"#888")+"08",borderRadius:5,border:"1px solid "+(e.color||"#888")+"12"}}>
            <span style={{fontSize:9,color:"#888"}}>{e.label}</span>
            <span style={{fontSize:9,fontWeight:700,color:e.cond?"#666":e.color}}>{e.cond?"⚠ ":""}{e.effect}</span>
          </div>)}
        </div>}
        {procs.length>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(270px,1fr))",gap:3}}>
          {procs.map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 8px",background:"#e74c3c08",borderRadius:5,border:"1px solid #e74c3c12"}}>
            <div><span style={{fontSize:10,color:"#ddd",fontWeight:600}}>{p.icon} {p.label}</span>{p.trigger&&<span style={{fontSize:8,color:"#555",marginLeft:4}}>{p.trigger}{p.canCrit?" ·crit":""}</span>}{p.note&&<span style={{fontSize:8,color:"#666",marginLeft:4}}>⚠{p.note}</span>}</div>
            <span style={{fontSize:11,fontWeight:800,color:p.dps!=null?"#e74c3c":"#444"}}>{p.dps!=null?fmtN(p.dps)+" /s":"N/A"}</span>
          </div>)}
          {procs.some(p=>p.dps!=null)&&<div style={{fontSize:9,color:"#888",textAlign:"right",marginTop:3}}>Total procs : <strong style={{color:"#e74c3c"}}>{fmtN(procDps)} /s</strong></div>}
        </div>}
      </div>}
    </div>}

    {(!selectedRace&&!primaryClass)&&<div style={{padding:12,background:"#f5a6230a",borderRadius:8,border:"1px solid #f5a62318",textAlign:"center",fontSize:11,color:"#f5a623"}}>Configure ta race et classe pour un calcul précis</div>}
    <div style={{marginTop:8,fontSize:9,color:"#3a5068",lineHeight:1.5}}>
      DPS = (baseArme × (1+FOR/SOR/100) × avgCrit × augMult) × atkSpeed + ΣProcs{useEL?" · PV = PVbase × RPGMobsTier × "+EL_BASE+"×(1+"+EL_PER_LVL+"×niv)":""}
    </div>
  </div>);
}

// ═══════════════════════════════════════════
// TAB: SYNERGIES Race × Classe
// ═══════════════════════════════════════════

function SynergyTab({selectedRace,primaryClass}){
  const[view,setView]=useState("recommend");
  const[hlRace,setHlRace]=useState(null);
  const[hlClass,setHlClass]=useState(null);

  const SC={5:"#f5a623",4:"#e74c3c",3:"#3498db",2:"#555",1:"#333"};
  const ROLE_C={dps_phys:"#ff9f43",dps_mag:"#a55eea",tank:"#54a0ff",support:"#2ed573",unknown:"#555"};
  const ROLE_L={dps_phys:"DPS Phys",dps_mag:"DPS Mag",tank:"Tank",support:"Support",unknown:"?"};
  const RATING=["","Faible","Correct","Bon","Excellent","Optimal"];
  const stars=n=>"★".repeat(n)+"☆".repeat(5-n);

  const topCombos=Object.entries(SYNERGIES).filter(([,v])=>v.score>=4).sort(([,a],[,b])=>b.score-a.score).map(([key,v])=>{
    const race=RACES.find(r=>key.startsWith(r.id+"_"));
    const cls=race?CLASSES.find(c=>c.id===key.slice(race.id.length+1)):null;
    return {key,race,cls,...v};
  }).filter(c=>c.race&&c.cls);

  const curSyn=selectedRace&&primaryClass?getSynergyScore(selectedRace.id,primaryClass.id):null;
  const bestForRace=selectedRace?CLASSES.map(c=>({cls:c,...getSynergyScore(selectedRace.id,c.id)})).sort((a,b)=>b.score-a.score):[];
  const bestForClass=primaryClass?RACES.map(r=>({race:r,...getSynergyScore(r.id,primaryClass.id)})).sort((a,b)=>b.score-a.score):[];

  return(<div>
    <div style={{display:"flex",gap:6,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
      <h3 style={{margin:0,fontSize:18,color:"#fff",fontFamily:"var(--fd)"}}>🔗 Synergies Race × Classe</h3>
      <div style={{marginLeft:"auto",display:"flex",gap:4}}>
        {[{id:"recommend",label:"Mon Build"},{id:"top",label:"Top Combos"},{id:"matrix",label:"Matrice"}].map(v=>(
          <button key={v.id} onClick={()=>setView(v.id)} style={{padding:"5px 12px",borderRadius:6,border:"1px solid "+(view===v.id?"#f5a623":"var(--brd)"),background:view===v.id?"#f5a62312":"transparent",color:view===v.id?"#f5a623":"#555",fontSize:11,fontWeight:700,cursor:"pointer"}}>{v.label}</button>
        ))}
      </div>
    </div>

    {view==="recommend"&&<div>
      {(!selectedRace&&!primaryClass)&&<div style={{padding:20,background:"#f5a6230a",borderRadius:10,border:"1px solid #f5a62318",textAlign:"center"}}>
        <div style={{fontSize:13,color:"#f5a623",fontWeight:700,marginBottom:5}}>Configure ton build d'abord</div>
        <div style={{fontSize:11,color:"#666"}}>Sélectionne une race et une classe pour voir les recommandations.</div>
      </div>}
      {selectedRace&&primaryClass&&curSyn&&<div style={{background:"var(--card)",borderRadius:10,padding:16,border:"2px solid "+(SC[curSyn.score]||"#555")+"35",marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:800,color:"#fff",marginBottom:6}}>
          <span style={{color:selectedRace.color}}>{selectedRace.emoji} {selectedRace.name}</span>
          <span style={{color:"#555",margin:"0 6px"}}>+</span>
          <span style={{color:primaryClass.color}}>{primaryClass.emoji} {primaryClass.name}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <span style={{fontSize:22,color:SC[curSyn.score]}}>{stars(curSyn.score)}</span>
          <span style={{fontSize:12,color:SC[curSyn.score],fontWeight:700}}>{RATING[curSyn.score]}</span>
          {curSyn.role&&<span style={{fontSize:9,background:(ROLE_C[curSyn.role]||"#888")+"18",color:ROLE_C[curSyn.role]||"#888",padding:"2px 7px",borderRadius:4,fontWeight:700}}>{ROLE_L[curSyn.role]}</span>}
        </div>
        <p style={{fontSize:11,color:"#aaa",margin:"0 0 8px",lineHeight:1.5}}>{curSyn.reason}</p>
        {curSyn.tags?.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{curSyn.tags.map(t=><span key={t} style={{fontSize:8,background:"#f5a62315",color:"#f5a623",padding:"1px 6px",borderRadius:4,fontWeight:700}}>{t}</span>)}</div>}
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {selectedRace&&<div>
          <div style={{fontSize:11,fontWeight:800,color:"#fff",marginBottom:8}}>Meilleures classes pour {selectedRace.emoji} {selectedRace.name}</div>
          {bestForRace.slice(0,7).map(({cls,score,role})=>(
            <div key={cls.id} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 10px",background:"var(--card)",borderRadius:6,border:"1px solid var(--brd)",marginBottom:4}}>
              <span style={{fontSize:12,color:cls.color}}>{cls.emoji} {cls.name}</span>
              {role&&role!=="unknown"&&<span style={{fontSize:8,background:(ROLE_C[role]||"#888")+"18",color:ROLE_C[role]||"#888",padding:"1px 5px",borderRadius:3,fontWeight:700}}>{ROLE_L[role]}</span>}
              <span style={{marginLeft:"auto",fontSize:11,color:SC[score],fontWeight:800}}>{stars(score)}</span>
            </div>
          ))}
        </div>}
        {primaryClass&&<div>
          <div style={{fontSize:11,fontWeight:800,color:"#fff",marginBottom:8}}>Meilleures races pour {primaryClass.emoji} {primaryClass.name}</div>
          {bestForClass.slice(0,7).map(({race,score,role})=>(
            <div key={race.id} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 10px",background:"var(--card)",borderRadius:6,border:"1px solid var(--brd)",marginBottom:4}}>
              <span style={{fontSize:12,color:race.color}}>{race.emoji} {race.name}</span>
              {role&&role!=="unknown"&&<span style={{fontSize:8,background:(ROLE_C[role]||"#888")+"18",color:ROLE_C[role]||"#888",padding:"1px 5px",borderRadius:3,fontWeight:700}}>{ROLE_L[role]}</span>}
              <span style={{marginLeft:"auto",fontSize:11,color:SC[score],fontWeight:800}}>{stars(score)}</span>
            </div>
          ))}
        </div>}
      </div>
    </div>}

    {view==="top"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(300px,1fr))",gap:10}}>
      {topCombos.map(({key,race,cls,score,reason,tags,role})=>(
        <div key={key} style={{background:"var(--card)",borderRadius:10,padding:14,border:"2px solid "+(SC[score]||"#555")+"20"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:"#fff",marginBottom:4}}>
                <span style={{color:race.color}}>{race.emoji} {race.name}</span><span style={{color:"#555",margin:"0 5px"}}>+</span><span style={{color:cls.color}}>{cls.emoji} {cls.name}</span>
              </div>
              {role&&role!=="unknown"&&<span style={{fontSize:9,background:(ROLE_C[role]||"#888")+"18",color:ROLE_C[role]||"#888",padding:"2px 7px",borderRadius:4,fontWeight:700}}>{ROLE_L[role]}</span>}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:14,color:SC[score],fontWeight:900}}>{stars(score)}</div>
              <div style={{fontSize:9,color:SC[score]}}>{RATING[score]}</div>
            </div>
          </div>
          <p style={{fontSize:10,color:"#aaa",margin:"0 0 8px",lineHeight:1.5}}>{reason}</p>
          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{tags.map(t=><span key={t} style={{fontSize:8,background:(SC[score]||"#888")+"15",color:SC[score]||"#888",padding:"1px 5px",borderRadius:3,fontWeight:700}}>{t}</span>)}</div>
        </div>
      ))}
    </div>}

    {view==="matrix"&&<div>
      <p style={{fontSize:10,color:"#666",marginBottom:10}}>Clic sur une race/classe pour filtrer. Survol pour détails.</p>
      <div style={{overflowX:"auto"}}>
        <table style={{borderCollapse:"collapse",fontSize:8,width:"100%"}}>
          <thead>
            <tr>
              <th style={{padding:"4px 6px",color:"#555",textAlign:"left",minWidth:75}}>Race ↓ / Classe →</th>
              {CLASSES.map(c=><th key={c.id} onClick={()=>setHlClass(hlClass===c.id?null:c.id)} style={{padding:"3px 5px",color:hlClass===c.id?c.color:"#555",cursor:"pointer",whiteSpace:"nowrap",background:hlClass===c.id?c.color+"12":"transparent"}}>{c.emoji} {c.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {RACES.map(r=>(
              <tr key={r.id} style={{background:hlRace===r.id?r.color+"08":"transparent"}}>
                <td onClick={()=>setHlRace(hlRace===r.id?null:r.id)} style={{padding:"3px 6px",color:hlRace===r.id?r.color:"#777",fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",borderRight:"1px solid var(--brd)"}}>{r.emoji} {r.name}</td>
                {CLASSES.map(c=>{
                  const syn=getSynergyScore(r.id,c.id);
                  const sc=SC[syn.score]||"#333";
                  const hl=hlRace===r.id||hlClass===c.id;
                  return<td key={c.id} title={`${r.name} + ${c.name}\n${stars(syn.score)} — ${syn.reason}`}
                    style={{padding:"2px 4px",textAlign:"center",background:hl?sc+"18":"transparent",borderRadius:3,cursor:"default"}}>
                    <span style={{color:syn.score>=4?sc:"#2a2a2a",fontWeight:syn.score>=4?800:400,fontSize:syn.score>=4?10:8}}>
                      {syn.score>=4?"★".repeat(syn.score):"·".repeat(syn.score)}
                    </span>
                  </td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{display:"flex",gap:8,marginTop:6,fontSize:8,color:"#555",flexWrap:"wrap"}}>
        {Object.entries(SC).reverse().map(([s,c])=><span key={s} style={{color:c}}>{"★".repeat(parseInt(s))} {RATING[parseInt(s)]}</span>)}
      </div>
    </div>}
  </div>);
}



// ═══════════════════════════════════════════
// IMPORT DIALOG

// ═══════════════════════════════════════════
// RECOMMENDED BUILDS DATA
// ═══════════════════════════════════════════


function GuideTab({ onImportBuild }) {
  const [activeRole, setActiveRole] = useState("dps_phys");
  const [expandedBuild, setExpandedBuild] = useState(null);

  const roleMeta = ROLE_META[activeRole];
  const builds = RECOMMENDED_BUILDS.filter(b => b.role === activeRole);

  const handleImport = (build) => {
    const data = {
      selectedRace: RACES.find(r => r.id === build.race) || null,
      selectedEvo: build.evo || "",
      primaryClass: CLASSES.find(c => c.id === build.class1) || null,
      secondaryClass: CLASSES.find(c => c.id === build.class2) || null,
      primaryTier: build.tier1 || 0,
      secondaryTier: build.tier2 || 0,
      level: build.level || 100,
      prestige: build.prestige || 0,
      skillPoints: build.sp || {},
      selectedAugments: (build.augments || []).map(id => AUGMENTS.find(a => a.id === id)).filter(Boolean),
      augBonus: {},
    };
    onImportBuild(data);
  };

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 18, color: "#fff", fontFamily: "var(--fd)", letterSpacing: 0.5 }}>
        📚 Builds Recommandés
      </h3>
      <p style={{ fontSize: 12, color: G.muted, margin: "0 0 16px" }}>
        Builds optimisés pour chaque rôle — clique pour voir les détails, importe directement dans le créateur.
      </p>

      {/* Role tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {Object.entries(ROLE_META).map(([id, meta]) => {
          const active = activeRole === id;
          const count = RECOMMENDED_BUILDS.filter(b => b.role === id).length;
          return (
            <button key={id} onClick={() => { setActiveRole(id); setExpandedBuild(null); }} style={{
              padding: "10px 18px", borderRadius: "var(--radius-md)",
              border: `2px solid ${active ? meta.color : "var(--brd)"}`,
              background: active ? meta.color + "12" : "transparent",
              color: active ? meta.color : G.muted,
              fontWeight: 700, fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
              fontFamily: "var(--fb)", transition: "all 0.2s",
            }}>
              <span style={{ fontSize: 16 }}>{meta.icon}</span>
              {meta.name}
              <span style={{ fontSize: 10, opacity: 0.6 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Role description */}
      <div style={{
        padding: "12px 16px", marginBottom: 16,
        background: roleMeta.color + "08", borderRadius: "var(--radius-md)",
        borderLeft: `3px solid ${roleMeta.color}`,
        fontSize: 12, color: G.muted,
      }}>
        <span style={{ fontWeight: 700, color: roleMeta.color }}>{roleMeta.icon} {roleMeta.name}</span>
        <span style={{ marginLeft: 8 }}>— {roleMeta.desc}</span>
      </div>

      {/* Build cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {builds.map(build => {
          const isOpen = expandedBuild === build.id;
          const race = RACES.find(r => r.id === build.race);
          const evo = EVOLUTIONS[build.evo];
          const c1 = CLASSES.find(c => c.id === build.class1);
          const c2 = CLASSES.find(c => c.id === build.class2);

          return (
            <div key={build.id} style={{
              background: isOpen ? `linear-gradient(165deg, ${G.card}, ${roleMeta.color}06)` : G.card,
              border: `1px solid ${isOpen ? roleMeta.color + "30" : G.border}`,
              borderRadius: "var(--radius-lg)",
              overflow: "hidden", transition: "all 0.2s",
            }}>
              {/* Header — always visible */}
              <div
                onClick={() => setExpandedBuild(isOpen ? null : build.id)}
                style={{ padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}
              >
                {/* Race/class icons */}
                <div style={{ display: "flex", gap: 4, fontSize: 24, flexShrink: 0 }}>
                  {race && <span>{race.emoji}</span>}
                  {c1 && <span>{c1.emoji}</span>}
                  {c2 && <span style={{ opacity: 0.5, fontSize: 18 }}>{c2.emoji}</span>}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "var(--fd)" }}>
                    {build.name}
                  </div>
                  <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>
                    {evo?.name || race?.name} · {c1?.name}{c2 ? ` / ${c2.name}` : ""} · Niv.{build.level} P{build.prestige}
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                    {build.tags.map(tag => (
                      <span key={tag} style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 4,
                        background: roleMeta.color + "12", color: roleMeta.color, fontWeight: 700,
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>

                <span style={{
                  fontSize: 14, color: G.muted, transition: "transform 0.2s",
                  transform: isOpen ? "rotate(180deg)" : "",
                }}>▼</span>
              </div>

              {/* Expanded details */}
              {isOpen && (
                <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${G.border}` }}>
                  {/* Description */}
                  <p style={{ fontSize: 13, color: G.text, lineHeight: 1.6, margin: "14px 0" }}>
                    {build.desc}
                  </p>

                  {/* Build config grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 14 }}>
                    {/* Race + Evo */}
                    <div style={{ background: race?.color + "0a", border: "1px solid " + (race?.color || G.border) + "20", borderRadius: "var(--radius-md)", padding: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: G.muted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Race & Évolution</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: race?.color || "#fff" }}>{race?.emoji} {evo?.name || race?.name}</div>
                      <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>{race?.name} → {evo?.name}</div>
                    </div>

                    {/* Classes */}
                    <div style={{ background: c1?.color + "0a", border: "1px solid " + (c1?.color || G.border) + "20", borderRadius: "var(--radius-md)", padding: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: G.muted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Classes</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: c1?.color || "#fff" }}>{c1?.emoji} {c1?.name} <span style={{ fontSize: 11, color: CLASS_TIER_COLORS[build.tier1] }}>{CLASS_TIERS[build.tier1]}</span></div>
                      {c2 && <div style={{ fontSize: 12, color: c2.color, marginTop: 2, opacity: 0.7 }}>{c2.emoji} {c2.name} <span style={{ fontSize: 11, color: CLASS_TIER_COLORS[build.tier2] }}>{CLASS_TIERS[build.tier2]}</span></div>}
                    </div>

                    {/* Augments */}
                    <div style={{ background: "#845ef708", border: "1px solid #845ef720", borderRadius: "var(--radius-md)", padding: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: G.muted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Augments</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {build.augments.map(augId => {
                          const aug = AUGMENTS.find(a => a.id === augId);
                          return aug ? (
                            <div key={augId} style={{ fontSize: 12, color: TIER_COLORS[aug.tier] || "#ccc", fontWeight: 600 }}>
                              {aug.name} <span style={{ fontSize: 10, opacity: 0.5 }}>{aug.tier}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>

                  {/* SP Distribution */}
                  <div style={{ background: "#ffffff04", borderRadius: "var(--radius-md)", padding: 12, marginBottom: 14, border: "1px solid " + G.border }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: G.muted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Répartition SP (priorité)</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {Object.entries(build.sp)
                        .filter(([, v]) => v > 0)
                        .sort(([, a], [, b]) => b - a)
                        .map(([key, val]) => {
                          const stat = STATS.find(s => s.key === key);
                          return stat ? (
                            <div key={key} style={{
                              display: "flex", alignItems: "center", gap: 4, padding: "4px 10px",
                              background: stat.color + "10", borderRadius: 6, border: "1px solid " + stat.color + "20",
                            }}>
                              <span style={{ fontSize: 12 }}>{stat.icon}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: stat.color }}>{val}</span>
                              <span style={{ fontSize: 10, color: G.muted }}>{stat.name}</span>
                            </div>
                          ) : null;
                        })}
                    </div>
                  </div>

                  {/* Tips */}
                  <div style={{
                    background: G.accent2 + "08", borderRadius: "var(--radius-md)", padding: 12, marginBottom: 14,
                    borderLeft: "3px solid " + G.accent2,
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: G.accent2, marginBottom: 4 }}>💡 Conseils</div>
                    <div style={{ fontSize: 12, color: G.text, lineHeight: 1.5 }}>{build.tips}</div>
                  </div>

                  {/* Pros / Cons */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#2ed573", marginBottom: 6 }}>✅ Points forts</div>
                      {build.pros.map((p, i) => (
                        <div key={i} style={{ fontSize: 11, color: G.text, padding: "3px 0", display: "flex", gap: 6 }}>
                          <span style={{ color: "#2ed573", flexShrink: 0 }}>+</span>{p}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#ff6b6b", marginBottom: 6 }}>⚠️ Points faibles</div>
                      {build.cons.map((c, i) => (
                        <div key={i} style={{ fontSize: 11, color: G.text, padding: "3px 0", display: "flex", gap: 6 }}>
                          <span style={{ color: "#ff6b6b", flexShrink: 0 }}>−</span>{c}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Import button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleImport(build); }}
                    className="btn-primary"
                    style={{ width: "100%" }}
                  >
                    📥 Importer ce build dans le créateur
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════
function ImportDialog({onImport,onClose}){const[code,setCode]=useState("");const[err,setErr]=useState("");const go=()=>{const r=decodeBuild(code.trim());if(r){onImport(r);onClose()}else setErr("Code invalide")};return(<div style={{position:"fixed",inset:0,background:"#000b",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{background:"#111d33",borderRadius:"var(--radius-md)",padding:24,width:400,maxWidth:"90vw",border:"2px solid #1a2d4f"}}><h3 style={{margin:"0 0 12px",color:"#fff",fontSize:16}}>📥 Importer un build</h3><textarea value={code} onChange={e=>{setCode(e.target.value);setErr("")}} placeholder="Colle ton code ici..." style={{width:"100%",minHeight:80,background:"#0b1528",border:"1px solid #1a2d4f",borderRadius:"var(--radius-md)",color:"#ccc",padding:10,fontSize:12,fontFamily:"monospace",resize:"vertical",boxSizing:"border-box"}}/>{err&&<div style={{color:"#ff6b6b",fontSize:11,marginTop:4}}>{err}</div>}<div style={{display:"flex",gap:8,marginTop:12,justifyContent:"flex-end"}}><button onClick={onClose} style={{padding:"8px 16px",borderRadius:8,border:"1px solid #333",background:"transparent",color:"#888",cursor:"pointer",fontWeight:600,fontSize:12}}>Annuler</button><button onClick={go} style={{padding:"8px 16px",borderRadius:8,border:"none",background:"#f5a623",color:"#000",cursor:"pointer",fontWeight:700,fontSize:12}}>Importer</button></div></div></div>)}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════════════
// BUILD CREATOR — COMPONENT
// ═══════════════════════════════════════════════════
// ═══════════════════════════════════════════
// SHARE CARD — PNG EXPORT VIA CANVAS
// ═══════════════════════════════════════════
function ShareCard({ state, onClose }) {
  const { selectedRace: race0, selectedEvo: sEvo, primaryClass: c1, secondaryClass: c2, primaryTier: t1, secondaryTier: t2, level, prestige, skillPoints: sp, selectedAugments: sa, augBonus: manualAug } = state;
  const race = getActiveRace(race0, sEvo || race0?.id);
  const inn = computeInnates(race, c1, t1, c2, t2, level);
  const flatAug = computeAugBonuses(sa, manualAug);
  const bs1 = {}; STATS.forEach(s => { bs1[s.key] = computeStat(s, race, inn, sp, flatAug).total; });
  const augB = computeAugBonuses(sa, manualAug, bs1);
  const bs2 = {}; STATS.forEach(s => { bs2[s.key] = computeStat(s, race, inn, sp, augB).total; });
  const post = computeClassPassiveScaling(c1, c2, bs2);
  const { mult: cMult, lock: cLock } = computeAugMultipliers(sa);

  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef(null);

  const drawCard = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const W = 600, H = 520;
    canvas.width = W * 2; canvas.height = H * 2;
    const ctx = canvas.getContext("2d");
    ctx.scale(2, 2); // Retina

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, "#0b1120"); bgGrad.addColorStop(1, "#111d33");
    ctx.fillStyle = bgGrad; roundRect(ctx, 0, 0, W, H, 16); ctx.fill();

    // Border
    ctx.strokeStyle = "#1a2d4f"; ctx.lineWidth = 1.5; roundRect(ctx, 0, 0, W, H, 16); ctx.stroke();

    // Header
    ctx.fillStyle = "#3dd8c5"; ctx.font = "bold 22px sans-serif"; ctx.fillText("CielDeVignis", 24, 38);
    ctx.fillStyle = "#7c8db5"; ctx.font = "11px sans-serif"; ctx.fillText("Build Creator • EndlessLeveling v6.7", 24, 56);
    // Level
    ctx.fillStyle = "#fff"; ctx.font = "bold 24px sans-serif"; ctx.textAlign = "right";
    ctx.fillText(`Niv. ${level}${prestige > 0 ? ` P${prestige}` : ""}`, W - 24, 42);
    ctx.textAlign = "left";

    // Divider
    ctx.fillStyle = "#1a2d4f"; ctx.fillRect(24, 68, W - 48, 1);

    // Build info boxes
    let bx = 24;
    const drawBox = (emoji, name, sub, color) => {
      const bw = 170;
      ctx.fillStyle = color + "15"; roundRect(ctx, bx, 80, bw, 60, 10); ctx.fill();
      ctx.strokeStyle = color + "40"; roundRect(ctx, bx, 80, bw, 60, 10); ctx.stroke();
      ctx.font = "24px sans-serif"; ctx.fillStyle = "#fff"; ctx.fillText(emoji, bx + 12, 116);
      ctx.font = "bold 14px sans-serif"; ctx.fillStyle = color; ctx.fillText(name, bx + 44, 108);
      ctx.font = "10px sans-serif"; ctx.fillStyle = "#7c8db5"; ctx.fillText(sub, bx + 44, 124);
      bx += bw + 10;
    };
    if (race) drawBox(race.emoji, race.name, "Race", race.color);
    if (c1) drawBox(c1.emoji, c1.name, `${CLASS_TIERS[t1]} • Primaire`, c1.color);
    if (c2) drawBox(c2.emoji, c2.name, `${CLASS_TIERS[t2]} • Secondaire`, c2.color);

    // Stats - 2 columns
    let sy = 160;
    ctx.font = "bold 11px sans-serif"; ctx.fillStyle = "#7c8db5";
    ctx.fillText("TOTAL ATTRIBUTES", 24, sy); sy += 16;

    STATS.forEach((stat, i) => {
      // apply pass 4 multipliers
      const applyP4 = (v) => { let r=v; if(cMult[stat.key]!=null)r*=cMult[stat.key]; if(cLock[stat.key]!=null)r=cLock[stat.key]; return r; };
      const compRaw = computeStat(stat, race, inn, sp, augB, post);
      let compTotal = compRaw.total;
      compTotal = applyP4(compTotal);
      const comp = { ...compRaw, total: compTotal };
      const pts = sp[stat.key] || 0;
      const col = i < 5 ? 0 : 1;
      const row = i < 5 ? i : i - 5;
      const x = 24 + col * 290;
      const y = sy + row * 28;

      // Label
      ctx.font = "12px sans-serif";
      ctx.fillStyle = pts > 0 ? stat.color : "#7c8db5";
      ctx.fillText(`${stat.icon} Niv. ${pts} ${stat.name}`, x, y + 12);

      // Value
      ctx.font = "bold 13px sans-serif"; ctx.fillStyle = stat.color;
      ctx.textAlign = "right"; ctx.fillText(fmt(comp.total, stat.mode), x + 270, y + 12);
      ctx.textAlign = "left";

      // Bar
      const barW = 270, barH = 4;
      const mx = stat.mode === "flat" ? 300 : 100;
      const pct = Math.min(Math.abs(comp.total) / mx, 1);
      ctx.fillStyle = "#1a2d4f"; roundRect(ctx, x, y + 18, barW, barH, 2); ctx.fill();
      if (pct > 0) { ctx.fillStyle = stat.color + "88"; roundRect(ctx, x, y + 18, barW * pct, barH, 2); ctx.fill(); }
    });

    // Augments
    const augY = sy + 5 * 28 + 20;
    if (sa.length > 0) {
      ctx.font = "bold 11px sans-serif"; ctx.fillStyle = "#7c8db5";
      ctx.fillText("AUGMENTS", 24, augY);
      let ax = 24;
      sa.forEach(a => {
        const tc = TIER_COLORS[a.tier] || "#888";
        ctx.font = "11px sans-serif";
        const tw = ctx.measureText(a.name).width + 16;
        ctx.fillStyle = tc + "20"; roundRect(ctx, ax, augY + 6, tw, 20, 6); ctx.fill();
        ctx.fillStyle = tc; ctx.font = "bold 10px sans-serif"; ctx.fillText(a.name, ax + 8, augY + 20);
        ax += tw + 6;
        if (ax > W - 60) { ax = 24; }
      });
    }

    // Footer
    ctx.fillStyle = "#5a7090"; ctx.font = "9px sans-serif"; ctx.textAlign = "right";
    ctx.fillText("cieldevignis.vercel.app", W - 24, H - 16);
    ctx.textAlign = "left";
  };

  useEffect(() => { drawCard(); }, [state]);

  const handleDownload = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    setDownloading(true);
    const link = document.createElement("a");
    link.download = `build-${race?.name || "custom"}-${c1?.name || ""}-lv${level}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setTimeout(() => setDownloading(false), 1000);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000c", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 640, width: "95vw" }}>
        <div style={{ background: "#0b1120", borderRadius: 16, padding: 20, border: "1px solid #1a2d4f" }}>
          <canvas ref={canvasRef} style={{ width: "100%", borderRadius: 12, display: "block" }} />
          <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "center" }}>
            <button onClick={handleDownload} className="btn-primary" style={{ fontWeight: 800, fontSize: 14 }}>
              {downloading ? "✅ Téléchargé !" : "📥 Télécharger PNG"}
            </button>
            <button onClick={onClose} className="btn-ghost">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

// ═══════════════════════════════════════════
// BUILDS MANAGER TAB
// ═══════════════════════════════════════════
function BuildsManagerTab({ savedBuilds, onLoad, onDelete, currentState, onSave }) {
  const [name, setName] = useState("");
  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim());
    setName("");
  };
  return (
    <div>
      <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "#fff", fontFamily: "var(--fd)" }}>💾 Mes Builds</h3>
      {/* Save current */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "center" }}>
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSave()}
          placeholder="Nom du build..." style={{
            flex: 1, padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--brd)", background: "var(--bg)",
            color: "#fff", fontSize: 13, fontFamily: "var(--fb)", outline: "none",
          }} />
        <button onClick={handleSave} className="btn-primary" style={{ whiteSpace: "nowrap" }}>💾 Sauvegarder</button>
      </div>
      {/* Saved list */}
      {savedBuilds.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#7c8db5" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 14 }}>Aucun build sauvegardé</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Configure ton build puis sauvegarde-le ici !</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {savedBuilds.map((build, i) => {
            const d = build.data;
            const race = RACES.find(r => r.id === d.r);
            const c1 = CLASSES.find(c => c.id === d.c1);
            const c2 = CLASSES.find(c => c.id === d.c2);
            return (
              <div key={i} style={{
                background: "var(--card)", border: "1px solid var(--brd)", borderRadius: "var(--radius-lg)",
                padding: 14, display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", gap: 4, fontSize: 24 }}>
                  {race && <span>{race.emoji}</span>}
                  {c1 && <span>{c1.emoji}</span>}
                  {c2 && <span style={{ opacity: 0.6, fontSize: 18 }}>{c2.emoji}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{build.name}</div>
                  <div style={{ fontSize: 11, color: "#7c8db5" }}>
                    Niv. {d.l}{d.p > 0 ? ` P${d.p}` : ""} • {(d.e && EVOLUTIONS[d.e]?.name) || race?.name || "?"} • {c1?.name || "?"}{c2 ? ` / ${c2.name}` : ""}
                    {d.t1 > 0 && ` • ${CLASS_TIERS[d.t1]}`}
                  </div>
                  <div style={{ fontSize: 10, color: "#5a7090", marginTop: 2 }}>
                    {new Date(build.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => onLoad(build)} className="btn-ghost-teal">Charger</button>
                  <button onClick={() => onDelete(i)} className="btn-danger">✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// COMPARE TAB
// ═══════════════════════════════════════════
function CompareTab({ savedBuilds, currentState }) {
  const [slotA, setSlotA] = useState("current");
  const [slotB, setSlotB] = useState(null);

  const resolveState = (slot) => {
    if (slot === "current") return currentState;
    const build = savedBuilds[slot];
    if (!build) return null;
    const d = build.data;
    return {
      selectedRace: RACES.find(r => r.id === d.r) || null,
      selectedEvo: d.e || d.r || "",
      primaryClass: CLASSES.find(c => c.id === d.c1) || null,
      secondaryClass: CLASSES.find(c => c.id === d.c2) || null,
      primaryTier: d.t1 || 0, secondaryTier: d.t2 || 0,
      level: d.l || 1, prestige: d.p || 0,
      skillPoints: d.sp || {}, selectedAugments: (d.a || []).map(id => AUGMENTS.find(a => a.id === id)).filter(Boolean),
      augBonus: d.ab || {},
    };
  };

  const computeAll = (state) => {
    if (!state) return null;
    const { selectedRace: race0, selectedEvo: sEvo, primaryClass: c1, secondaryClass: c2, primaryTier: t1, secondaryTier: t2, level, skillPoints: sp, selectedAugments: sa, augBonus: mAug } = state;
    const race = getActiveRace(race0, sEvo || race0?.id);
    const inn = computeInnates(race, c1, t1, c2, t2, level);
    const fAug = computeAugBonuses(sa, mAug);
    const bs1 = {}; STATS.forEach(s => { bs1[s.key] = computeStat(s, race, inn, sp, fAug).total; });
    const aB = computeAugBonuses(sa, mAug, bs1);
    const bs2 = {}; STATS.forEach(s => { bs2[s.key] = computeStat(s, race, inn, sp, aB).total; });
    const post = computeClassPassiveScaling(c1, c2, bs2);
    const final = {}; STATS.forEach(s => { final[s.key] = computeStat(s, race, inn, sp, aB, post).total; });
    return { stats: final, state };
  };

  const a = computeAll(resolveState(slotA));
  const b = computeAll(resolveState(slotB));

  const options = [{ value: "current", label: "⚔️ Build actuel" }, ...savedBuilds.map((b, i) => ({ value: i, label: `💾 ${b.name}` }))];

  const BuildColumn = ({ data, label }) => {
    if (!data) return <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#7c8db5", fontSize: 13 }}>Sélectionne un build</div>;
    const { stats, state: s } = data;
    return (
      <div style={{ flex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", fontSize: 22 }}>
            {s.selectedRace && <span>{s.selectedRace.emoji}</span>}
            {s.primaryClass && <span>{s.primaryClass.emoji}</span>}
            {s.secondaryClass && <span style={{ opacity: 0.5 }}>{s.secondaryClass.emoji}</span>}
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginTop: 4 }}>Niv. {s.level}{s.prestige > 0 ? ` P${s.prestige}` : ""}</div>
          <div style={{ fontSize: 11, color: "#7c8db5" }}>
            {s.selectedRace?.name} • {s.primaryClass?.name}{s.secondaryClass ? ` / ${s.secondaryClass.name}` : ""}
          </div>
        </div>
        {STATS.map(st => (
          <div key={st.key} style={{ display: "flex", justifyContent: "space-between", padding: "3px 8px", fontSize: 11 }}>
            <span style={{ color: "#7c8db5" }}>{st.icon} {st.name}</span>
            <span style={{ color: st.color, fontWeight: 700 }}>{fmt(stats[st.key], st.mode)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "#fff", fontFamily: "var(--fd)" }}>⚖️ Comparer des builds</h3>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: "#7c8db5", fontWeight: 700, display: "block", marginBottom: 4 }}>Build A</label>
          <select value={slotA ?? ""} onChange={e => setSlotA(e.target.value === "current" ? "current" : parseInt(e.target.value))} style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--brd)", background: "var(--bg)", color: "#fff", fontSize: 12 }}>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 8, fontSize: 18, color: "#7c8db5" }}>vs</div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: "#7c8db5", fontWeight: 700, display: "block", marginBottom: 4 }}>Build B</label>
          <select value={slotB ?? ""} onChange={e => setSlotB(e.target.value === "current" ? "current" : e.target.value === "" ? null : parseInt(e.target.value))} style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--brd)", background: "var(--bg)", color: "#fff", fontSize: 12 }}>
            <option value="">— Choisir —</option>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
      {/* Comparison */}
      <div style={{ display: "flex", gap: 16, background: "var(--card)", borderRadius: 16, padding: 16, border: "1px solid var(--brd)" }}>
        <BuildColumn data={a} label="A" />
        {a && b && (
          <div style={{ width: 1, background: "var(--brd)", flexShrink: 0, margin: "30px 0" }} />
        )}
        {a && b && (
          <div style={{ width: 60, display: "flex", flexDirection: "column", justifyContent: "flex-start", paddingTop: 62 }}>
            {STATS.map(st => {
              const diff = (b.stats[st.key] || 0) - (a.stats[st.key] || 0);
              if (Math.abs(diff) < 0.05) return <div key={st.key} style={{ padding: "3px 0", fontSize: 10, textAlign: "center", color: "#5a7090" }}>—</div>;
              return <div key={st.key} style={{ padding: "3px 0", fontSize: 10, textAlign: "center", fontWeight: 700, color: diff > 0 ? "#2ed573" : "#ff6b6b" }}>{diff > 0 ? "+" : ""}{diff.toFixed(1)}</div>;
            })}
          </div>
        )}
        {a && b && (
          <div style={{ width: 1, background: "var(--brd)", flexShrink: 0, margin: "30px 0" }} />
        )}
        <BuildColumn data={b} label="B" />
      </div>
      {savedBuilds.length === 0 && <div style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: "#7c8db5" }}>Sauvegarde des builds dans l'onglet "Mes Builds" pour les comparer ici</div>}
    </div>
  );
}

// ═══════════════════════════════════════════
// BUILD CREATOR — MAIN COMPONENT
// ═══════════════════════════════════════════
function BuildCreator({ initialCode, onClearInitialCode, onPublishToCommunity }) {
  const [tab, setTab] = useState("race");
  const [selectedRace, setSelectedRace] = useState(null);
  const [selectedEvo, setSelectedEvo] = useState("");
  const [primaryClass, setPrimaryClass] = useState(null);
  const [secondaryClass, setSecondaryClass] = useState(null);
  const [primaryTier, setPrimaryTier] = useState(0);
  const [secondaryTier, setSecondaryTier] = useState(0);
  const [level, setLevel] = useState(1);
  const [prestige, setPrestige] = useState(0);
  const [skillPoints, setSkillPoints] = useState({});
  const [selectedAugments, setSelectedAugments] = useState([]);
  const [augBonus, setAugBonus] = useState({});
  const [showImport, setShowImport] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [savedBuilds, setSavedBuilds] = useState([]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  useEffect(() => { loadSavedBuilds().then(b => setSavedBuilds(b)); }, []);

  // Auto-import si on arrive depuis la Communauté avec un code
  useEffect(() => {
    if (initialCode) {
      const d = decodeBuild(initialCode);
      if (d) {
        setSelectedRace(d.selectedRace);
        setSelectedEvo(d.selectedEvo || d.selectedRace?.id || "");
        setPrimaryClass(d.primaryClass);
        setSecondaryClass(d.secondaryClass);
        setPrimaryTier(d.primaryTier);
        setSecondaryTier(d.secondaryTier);
        setLevel(d.level);
        setPrestige(d.prestige);
        setSkillPoints(d.skillPoints);
        setSelectedAugments(d.selectedAugments);
        setAugBonus(d.augBonus || {});
        setTab("summary");
      }
      if (onClearInitialCode) onClearInitialCode();
    }
  }, [initialCode]);

  const totalSP = 12 + (level - 1) * 5;
  const usedSP = Object.values(skillPoints).reduce((a, b) => a + b, 0);
  const handleImport = d => {
    setSelectedRace(d.selectedRace);
    setSelectedEvo(d.selectedEvo || d.selectedRace?.id || "");
    setPrimaryClass(d.primaryClass);
    setSecondaryClass(d.secondaryClass);
    setPrimaryTier(d.primaryTier);
    setSecondaryTier(d.secondaryTier);
    setLevel(d.level);
    setPrestige(d.prestige);
    setSkillPoints(d.skillPoints);
    setSelectedAugments(d.selectedAugments);
    setAugBonus(d.augBonus || {});
    setTab("summary");
  };
  const handleSaveBuild = (name) => {
    const d = {
      r: selectedRace?.id || "", e: selectedEvo || selectedRace?.id || "",
      c1: primaryClass?.id || "", c2: secondaryClass?.id || "",
      t1: primaryTier, t2: secondaryTier, l: level, p: prestige,
      sp: skillPoints, a: selectedAugments.map(a => a.id), ab: augBonus,
    };
    const newBuilds = [...savedBuilds, { name, data: d, date: Date.now() }];
    setSavedBuilds(newBuilds);
    saveBuildsList(newBuilds);
  };
  const handleLoadBuild = (build) => {
    const d = build.data;
    setSelectedRace(RACES.find(r => r.id === d.r) || null);
    setSelectedEvo(d.e || d.r || "");
    setPrimaryClass(CLASSES.find(c => c.id === d.c1) || null);
    setSecondaryClass(CLASSES.find(c => c.id === d.c2) || null);
    setPrimaryTier(d.t1 || 0);
    setSecondaryTier(d.t2 || 0);
    setLevel(d.l || 1);
    setPrestige(d.p || 0);
    setSkillPoints(d.sp || {});
    setSelectedAugments((d.a || []).map(id => AUGMENTS.find(a => a.id === id)).filter(Boolean));
    setAugBonus(d.ab || {});
    setTab("summary");
  };
  const handleDeleteBuild = (idx) => {
    const newBuilds = savedBuilds.filter((_, i) => i !== idx);
    setSavedBuilds(newBuilds);
    saveBuildsList(newBuilds);
  };

  const state = {
    selectedRace, selectedEvo: selectedEvo || selectedRace?.id || "",
    primaryClass, secondaryClass, primaryTier, secondaryTier,
    level, prestige, skillPoints, selectedAugments, augBonus,
  };
  // 2-pass computation: base stats first, then scaling augments, then class passive scaling
  const activeRace = getActiveRace(selectedRace, selectedEvo || selectedRace?.id);
  const inn = computeInnates(activeRace, primaryClass, primaryTier, secondaryClass, secondaryTier, level);
  const flatAugBonus = computeAugBonuses(selectedAugments, augBonus);
  const baseStats = {};
  STATS.forEach(s => { baseStats[s.key] = computeStat(s, activeRace, inn, skillPoints, flatAugBonus).total; });
  const totalAugBonus = computeAugBonuses(selectedAugments, augBonus, baseStats);
  const baseStats2 = {};
  STATS.forEach(s => { baseStats2[s.key] = computeStat(s, activeRace, inn, skillPoints, totalAugBonus).total; });
  const postBonus = computeClassPassiveScaling(primaryClass, secondaryClass, baseStats2);
  const finalComputedStats = {};
  STATS.forEach(s => { finalComputedStats[s.key] = computeStat(s, activeRace, inn, skillPoints, totalAugBonus, postBonus).total; });
  // Pass 4: augment multipliers (ex: Brute Force ×2.5 FOR/SOR, PRÉ→0)
  const { mult: augMult, lock: augLock } = computeAugMultipliers(selectedAugments);
  STATS.forEach(s => {
    if (augMult[s.key] != null) finalComputedStats[s.key] = finalComputedStats[s.key] * augMult[s.key];
    if (augLock[s.key] != null) finalComputedStats[s.key] = augLock[s.key];
  });
  const evoName = selectedEvo && EVOLUTIONS[selectedEvo] ? EVOLUTIONS[selectedEvo].name : null;
return(<div style={{"--bg":"#0b1120","--card":"#111d33","--brd":"#1a2d4f","--fd":"var(--fd)","--fb":"var(--fb)",background:"var(--bg)",color:"#d0d0e0",fontFamily:"var(--fb)"}}>
{/* BUILD CREATOR HEADER */}
<div style={{background:"linear-gradient(180deg,#0e1628,#0b1120)",padding:"12px 20px 0",borderBottom:"2px solid #3dd8c515",position:"relative"}}>
  {/* Top bar: breadcrumb + actions */}
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,gap:12}}>
    {/* Build breadcrumb */}
    <div style={{display:"flex",alignItems:"center",gap:6,flex:1,minWidth:0,overflowX:"auto"}}>
      <span style={{fontSize:14,fontWeight:800,fontFamily:"var(--fd)",color:"#3dd8c5",flexShrink:0,letterSpacing:0.5}}>Build Creator</span>
      {selectedRace&&<><span style={{color:"#1a2d4f",flexShrink:0}}>›</span><span style={{fontSize:12,color:selectedRace.color,fontWeight:700,flexShrink:0}}>{selectedRace.emoji} {evoName||selectedRace.name}</span></>}
      {primaryClass&&<><span style={{color:"#1a2d4f",flexShrink:0}}>›</span><span style={{fontSize:12,color:primaryClass.color,fontWeight:700,flexShrink:0}}>{primaryClass.emoji} {primaryClass.name}</span></>}
      {secondaryClass&&<><span style={{color:"#1a2d4f",flexShrink:0}}>›</span><span style={{fontSize:11,color:secondaryClass.color,fontWeight:600,opacity:0.7,flexShrink:0}}>{secondaryClass.emoji} {secondaryClass.name}</span></>}
      {level>1&&<><span style={{color:"#1a2d4f",flexShrink:0}}>›</span><span style={{fontSize:11,color:"#f5a623",fontWeight:700,flexShrink:0}}>Niv.{level}{prestige>0?` P${prestige}`:""}</span></>}
    </div>
    {/* Action buttons */}
    <div style={{display:"flex",gap:6,flexShrink:0}}>
      <button onClick={()=>setShowImport(true)} className="btn-icon" title="Importer un build">📥</button>
      <button onClick={()=>setShowShareCard(true)} className="btn-icon" title="Exporter en image">📸</button>
    </div>
  </div>
  {/* Tabs */}
  <div className="build-tabs-desktop" style={{display:"flex",gap:1,overflowX:"auto",paddingBottom:0,scrollbarWidth:"none"}}>
    {TABS.map(t=>{const active=tab===t.id;const done=t.id==="race"?!!selectedRace:t.id==="class"?!!primaryClass:t.id==="stats"?usedSP>0:t.id==="augments"?selectedAugments.length>0||Object.values(augBonus).some(v=>v>0):t.id==="dps"?!!selectedRace&&!!primaryClass:t.id==="synergie"?true:t.id==="guide"?true:t.id==="builds"?savedBuilds.length>0:false;
    return(<button key={t.id} onClick={()=>setTab(t.id)} className={`tab-btn${active?" active":""}`}
    ><span style={{fontSize:14}}>{t.emoji}</span><span className="tab-label">{t.label}</span>
    {done&&<span style={{width:6,height:6,borderRadius:2,background:"#3dd8c5",boxShadow:"0 0 8px #3dd8c560",flexShrink:0}}/>}
    </button>)})}
  </div>
</div><div className="build-content" style={{padding:"16px 20px",maxWidth:1200,margin:"0 auto"}}>{tab==="race"&&<RaceTab selectedRace={selectedRace} setSelectedRace={setSelectedRace} selectedEvo={selectedEvo} setSelectedEvo={setSelectedEvo}/>}{tab==="class"&&<ClassTab primaryClass={primaryClass} setPrimaryClass={setPrimaryClass} secondaryClass={secondaryClass} setSecondaryClass={setSecondaryClass} primaryTier={primaryTier} setPrimaryTier={setPrimaryTier} secondaryTier={secondaryTier} setSecondaryTier={setSecondaryTier}/>}{tab==="stats"&&<StatsTab level={level} setLevel={setLevel} prestige={prestige} setPrestige={setPrestige} skillPoints={skillPoints} setSkillPoints={setSkillPoints} totalSP={totalSP} usedSP={usedSP} selectedRace={selectedRace} primaryClass={primaryClass} primaryTier={primaryTier} secondaryClass={secondaryClass} secondaryTier={secondaryTier} augBonus={totalAugBonus} postBonus={postBonus} augMult={augMult} augLock={augLock} selectedEvo={selectedEvo}/>}{tab==="augments"&&<AugmentsTab selectedAugments={selectedAugments} setSelectedAugments={setSelectedAugments} augBonus={augBonus} setAugBonus={setAugBonus}/>}{tab==="dps"&&<DpsTab computedStats={finalComputedStats} selectedRace={selectedRace} primaryClass={primaryClass} selectedEvo={selectedEvo} selectedAugments={selectedAugments}/>}{tab==="synergie"&&<SynergyTab selectedRace={selectedRace} primaryClass={primaryClass}/>}{tab==="guide"&&<GuideTab onImportBuild={handleImport}/>}{tab==="summary"&&<SummaryTab state={state} onPublishToCommunity={onPublishToCommunity}/>}{tab==="builds"&&<BuildsManagerTab savedBuilds={savedBuilds} onLoad={handleLoadBuild} onDelete={handleDeleteBuild} currentState={state} onSave={handleSaveBuild}/>}{tab==="compare"&&<CompareTab savedBuilds={savedBuilds} currentState={state}/>}</div>  {showImport && <ImportDialog onImport={handleImport} onClose={() => setShowImport(false)} />}
  {showShareCard && <ShareCard state={state} onClose={() => setShowShareCard(false)} />}

  {/* Mobile bottom nav */}
  <div className="build-bottom-nav">
    {[
      { id: "race", icon: "🐉", label: "Race" },
      { id: "class", icon: "⚔️", label: "Classe" },
      { id: "stats", icon: "📊", label: "Stats" },
      { id: "summary", icon: "📄", label: "Résumé" },
      { id: "__more", icon: "···", label: "Plus" },
    ].map(t => (
      <button
        key={t.id}
        className={tab === t.id ? "active" : ""}
        onClick={() => {
          if (t.id === "__more") setShowMoreMenu(!showMoreMenu);
          else { setTab(t.id); setShowMoreMenu(false); }
        }}
      >
        <span className="nav-icon">{t.icon}</span>
        {t.label}
      </button>
    ))}
  </div>

  {/* More menu overlay (mobile) */}
  {showMoreMenu && (
    <div className="more-menu-overlay">
      {[
        { id: "augments", icon: "💠", label: "Augments" },
        { id: "dps", icon: "⚡", label: "DPS" },
        { id: "guide", icon: "📚", label: "Guides" },
        { id: "builds", icon: "💾", label: "Mes Builds" },
        { id: "compare", icon: "⚖️", label: "Comparer" },
      ].map(t => (
        <button
          key={t.id}
          className={tab === t.id ? "active" : ""}
          onClick={() => { setTab(t.id); setShowMoreMenu(false); }}
        >
          <span>{t.icon}</span> {t.label}
        </button>
      ))}
    </div>
  )}
</div>);
}

export { BuildCreator };
