"use client";

import { useState, useEffect } from "react";

interface Emoji { id: string|null; name: string|null; animated?: boolean; }
interface Btn { type:2; style:1|2|3|4|5; label?:string; emoji?:Emoji|null; custom_id?:string; url?:string; disabled?:boolean; }
interface Comp { type:number; content?:string; components?:Comp[]; items?:{media?:{url?:string};description?:string|null;spoiler?:boolean}[]; file?:{url?:string}; spoiler?:boolean; divider?:boolean; spacing?:1|2; }
interface Container { type:17; accent_color?:number|null; spoiler?:boolean; components?:Comp[]; }
interface EditBtn { ci:number; ri:number; bi:number; label:string; style:1|2|3|4|5; custom_id:string; url:string; emoji:string; disabled:boolean; }

const intToHex=(n:number)=>"#"+n.toString(16).padStart(6,"0");

function parseEmoji(s:string):Emoji|null{
  if(!s.trim())return null;
  const m=s.match(/^<?(?:(a?)):?(\w+):(\d+)>?$/);
  if(m)return{id:m[3],name:m[2],animated:m[1]==="a"};
  return{id:null,name:s.trim()};
}

function emojiStr(e:Emoji|null|undefined):string{
  if(!e)return"";
  if(e.id)return`<${e.animated?"a":""}:${e.name}:${e.id}>`;
  return e.name??"";
}

function extractBtns(cs:Container[]):EditBtn[]{
  const r:EditBtn[]=[];
  cs.forEach((c,ci)=>{(c.components??[]).forEach((comp,ri)=>{if(comp.type===1){(comp.components??[]).forEach((b,bi)=>{const btn=b as unknown as Btn;r.push({ci,ri,bi,label:btn.label??"",style:btn.style??1,custom_id:btn.custom_id??"",url:btn.url??"",emoji:emojiStr(btn.emoji),disabled:btn.disabled??false});})}})});
  return r;
}

function applyBtns(cs:Container[],btns:EditBtn[]):Container[]{
  const r:Container[]=JSON.parse(JSON.stringify(cs));
  btns.forEach(btn=>{const row=(r[btn.ci]?.components?.[btn.ri]) as any;if(!row?.components?.[btn.bi])return;const b=row.components[btn.bi];b.label=btn.label;b.style=btn.style;b.emoji=parseEmoji(btn.emoji);b.disabled=btn.disabled;if(btn.style===5){b.url=btn.url;delete b.custom_id;}else{b.custom_id=btn.custom_id;delete b.url;}});
  return r;
}

const BTN_BG:Record<number,string>={1:"#5865f2",2:"#4e5058",3:"#248046",4:"#da373c",5:"#4e5058"};

function EmojiImg({e}:{e:Emoji|null|undefined}){
  if(!e)return null;
  if(e.id){const ext=e.animated?"gif":"webp";return<img src={`https://cdn.discordapp.com/emojis/${e.id}.${ext}`} alt={`:${e.name}:`} className="inline w-5 h-5 align-middle object-contain mr-0.5"/>;}
  return<span className="mr-0.5">{e.name}</span>;
}

function renderMd(text:string){
  return text.split("\n").map((line,i)=>{
    const t=line.trim();
    if(t.startsWith("### "))return<div key={i} className="font-bold text-sm text-white">{t.slice(4)}</div>;
    if(t.startsWith("## "))return<div key={i} className="font-bold text-base text-white">{t.slice(3)}</div>;
    if(t.startsWith("# "))return<div key={i} className="font-extrabold text-lg text-white">{t.slice(2)}</div>;
    if(t.startsWith("-# "))return<div key={i} className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>{t.slice(3)}</div>;
    if(t==="")return<div key={i} className="h-2"/>;
    return<div key={i} className="text-sm leading-relaxed" style={{color:"#dbdee1"}}>{line}</div>;
  });
}

function PreviewComp({comp}:{comp:Comp}){
  switch(comp.type){
    case 10:return<div className="flex flex-col gap-0.5">{renderMd(comp.content??"")}</div>;
    case 1:return<div className="flex flex-wrap gap-2">{(comp.components??[]).map((b,i)=>{const btn=b as unknown as Btn;return<button key={i} disabled={btn.disabled} className="flex items-center gap-1 px-4 py-1.5 rounded text-sm font-medium text-white disabled:opacity-50" style={{backgroundColor:BTN_BG[btn.style]??BTN_BG[1],minHeight:32}}><EmojiImg e={btn.emoji}/>{btn.label&&<span>{btn.label}</span>}</button>;})}</div>;
    case 12:{const items=comp.items??[];const cols=items.length===1?"grid-cols-1":"grid-cols-2";return<div className={`grid ${cols} gap-1 rounded-lg overflow-hidden`}>{items.map((item,i)=>item.media?.url?<img key={i} src={item.media.url} alt={item.description??""} className="w-full object-cover" style={{maxHeight:300}} onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>:<div key={i} className="w-full h-24 flex items-center justify-center rounded" style={{backgroundColor:"rgba(255,255,255,0.05)"}}><svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg></div>)}</div>;}
    case 13:return<div className="flex items-center gap-2 px-3 py-2 rounded" style={{backgroundColor:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg><span className="text-sm" style={{color:"#00b0f4"}}>{comp.file?.url?.split("/").pop()??"arquivo"}</span></div>;
    case 14:return<div style={{paddingTop:comp.spacing===2?16:8,paddingBottom:comp.spacing===2?16:8}}>{comp.divider!==false&&<div style={{height:1,backgroundColor:"rgba(255,255,255,0.08)"}}/>}</div>;
    default:return null;
  }
}

function DiscordPreview({containers}:{containers:Container[]}){
  if(!containers.length)return<div className="text-center py-12 text-sm" style={{color:"rgba(255,255,255,0.2)"}}>Cole o JSON para ver o preview...</div>;
  return<div className="rounded-2xl overflow-hidden" style={{backgroundColor:"#313338",border:"1px solid rgba(255,255,255,0.06)"}}>
    <div className="flex items-center gap-2 px-4 py-2 border-b" style={{borderColor:"rgba(255,255,255,0.06)",backgroundColor:"#2b2d31"}}>
      <span className="text-xs font-medium" style={{color:"rgba(255,255,255,0.4)"}}>preview</span>
      <span className="text-xs" style={{color:"rgba(255,255,255,0.15)"}}>— Discord Components v2</span>
    </div>
    <div className="p-4"><div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center" style={{background:"linear-gradient(135deg,#7c3aed,#5865f2)"}}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-2"><span className="text-sm font-semibold text-white">Ticket Bot</span><span className="text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Hoje {new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</span></div>
        <div className="flex flex-col gap-2">{containers.map((c,i)=>{const accent=c.accent_color!=null?intToHex(c.accent_color):null;return<div key={i} className="rounded-lg overflow-hidden" style={{backgroundColor:"#2b2d31",borderLeft:accent?`4px solid ${accent}`:"4px solid transparent",border:"1px solid rgba(255,255,255,0.06)"}}><div className="p-3 flex flex-col gap-2">{(c.components??[]).map((comp,j)=><PreviewComp key={j} comp={comp}/>)}</div></div>;})}</div>
      </div>
    </div></div>
  </div>;
}

const STYLE_LABELS:Record<number,string>={1:"Primario",2:"Secundario",3:"Sucesso",4:"Perigo",5:"Link"};
const STYLE_COLORS:Record<number,string>={1:"#5865f2",2:"#4e5058",3:"#248046",4:"#da373c",5:"#4e5058"};

export function PanelBuilderClient(){
  const [jsonText,setJsonText]=useState("");
  const [jsonError,setJsonError]=useState<string|null>(null);
  const [containers,setContainers]=useState<Container[]>([]);
  const [buttons,setButtons]=useState<EditBtn[]>([]);
  const [token,setToken]=useState("");
  const [tokenVisible,setTokenVisible]=useState(false);
  const [guilds,setGuilds]=useState<{id:string;name:string}[]>([]);
  const [channels,setChannels]=useState<{id:string;name:string}[]>([]);
  const [guildId,setGuildId]=useState("");
  const [channelId,setChannelId]=useState("");
  const [loadingGuilds,setLoadingGuilds]=useState(false);
  const [loadingChannels,setLoadingChannels]=useState(false);
  const [sending,setSending]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const [success,setSuccess]=useState(false);
  const [copied,setCopied]=useState(false);

  useEffect(()=>{
    if(!jsonText.trim()){setContainers([]);setButtons([]);setJsonError(null);return;}
    try{const p=JSON.parse(jsonText);const arr=Array.isArray(p)?p:[p];setContainers(arr);setButtons(extractBtns(arr));setJsonError(null);}
    catch{setJsonError("JSON invalido");}
  },[jsonText]);

  function getPreviewContainers(){if(!buttons.length)return containers;return applyBtns(containers,buttons);}
  function getFinalJSON(){return getPreviewContainers();}

  async function loadGuilds(){
    if(!token.trim())return;setLoadingGuilds(true);setError(null);
    try{const r=await fetch("/api/panel-builder/guilds",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token})});const d=await r.json();if(!r.ok)throw new Error(d.error);setGuilds(d.guilds);setGuildId("");setChannels([]);setChannelId("");}
    catch(e:any){setError(e.message);}finally{setLoadingGuilds(false);}
  }

  async function loadChannels(gId:string){
    setGuildId(gId);setChannelId("");setChannels([]);if(!gId)return;setLoadingChannels(true);
    try{const r=await fetch("/api/panel-builder/channels",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,guildId:gId})});const d=await r.json();if(!r.ok)throw new Error(d.error);setChannels(d.channels);}
    catch(e:any){setError(e.message);}finally{setLoadingChannels(false);}
  }

  async function handleSend(){
    const components=getFinalJSON();if(!components.length){setError("Cole um JSON valido.");return;}if(!channelId){setError("Selecione um canal.");return;}
    setSending(true);setError(null);setSuccess(false);
    try{const r=await fetch("/api/panel-builder/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,channelId,components})});const d=await r.json();if(!r.ok)throw new Error(d.error);setSuccess(true);setTimeout(()=>setSuccess(false),5000);}
    catch(e:any){setError(e.message);}finally{setSending(false);}
  }

  function handleCopy(){navigator.clipboard.writeText(JSON.stringify(getFinalJSON(),null,2));setCopied(true);setTimeout(()=>setCopied(false),2000);}

  const channelName=channels.find(ch=>ch.id===channelId)?.name;

  return(
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 border-b" style={{backgroundColor:"rgba(0,0,0,0.9)",borderColor:"rgba(255,255,255,0.06)",backdropFilter:"blur(12px)"}}>
        <div className="flex items-center gap-2"><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg><span className="font-semibold text-sm">Panel Builder</span><span className="text-xs px-2 py-0.5 rounded-full" style={{backgroundColor:"rgba(88,101,242,0.15)",color:"#7c8cf8",border:"1px solid rgba(88,101,242,0.3)"}}>v2</span></div>
        <button onClick={handleCopy} className="text-xs px-3 py-1.5 rounded-lg cursor-pointer" style={{backgroundColor:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.6)"}}>{copied?"Copiado!":"Copiar JSON"}</button>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <div className="rounded-xl overflow-hidden" style={{backgroundColor:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{borderColor:"rgba(255,255,255,0.06)"}}>
              <div><p className="text-sm font-semibold text-white">JSON do Painel</p><p className="text-xs mt-0.5" style={{color:"rgba(192,192,192,0.4)"}}>Cole o JSON gerado no discord.builders ou pelo bot</p></div>
              <a href="https://discord.builders" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{backgroundColor:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.7)"}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
                discord.builders
              </a>
            </div>
            <div className="p-4">
              <textarea value={jsonText} onChange={e=>setJsonText(e.target.value)} placeholder={"[\n  {\n    \"type\": 17,\n    \"components\": [...]\n  }\n]"} rows={12} spellCheck={false} className="w-full rounded-xl px-4 py-3 text-xs font-mono text-white/80 placeholder-white/15 focus:outline-none resize-none" style={{backgroundColor:"rgba(0,0,0,0.4)",border:jsonError?"1px solid rgba(239,68,68,0.4)":"1px solid rgba(255,255,255,0.06)"}}/>
              {jsonError&&<p className="text-xs mt-1.5 text-red-400">{jsonError}</p>}
            </div>
          </div>
          {buttons.length>0&&(
            <div className="rounded-xl overflow-hidden" style={{backgroundColor:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
              <div className="px-4 py-3 border-b" style={{borderColor:"rgba(255,255,255,0.06)"}}>
                <p className="text-sm font-semibold text-white">Editar Botoes</p>
                <p className="text-xs mt-0.5" style={{color:"rgba(192,192,192,0.4)"}}>{buttons.length} botao{buttons.length>1?"es":""} encontrado{buttons.length>1?"s":""} — edite o Custom ID para conectar ao bot</p>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {buttons.map((btn,i)=>(
                  <div key={i} className="rounded-xl p-4 flex flex-col gap-3" style={{backgroundColor:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.06)"}}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor:STYLE_COLORS[btn.style]}}/>
                      <span className="text-xs font-medium" style={{color:"rgba(192,192,192,0.5)"}}>Botao {i+1}</span>
                      <div className="px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1" style={{backgroundColor:STYLE_COLORS[btn.style]+"22",border:`1px solid ${STYLE_COLORS[btn.style]}44`,color:STYLE_COLORS[btn.style]}}>
                        {btn.emoji&&<EmojiImg e={parseEmoji(btn.emoji)}/>}
                        {btn.label||"Botao"}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="text-xs mb-1 block" style={{color:"rgba(192,192,192,0.4)"}}>Label</label><input type="text" value={btn.label} onChange={e=>setButtons(buttons.map((b,idx)=>idx===i?{...b,label:e.target.value}:b))} className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none" style={{backgroundColor:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}/></div>
                      <div><label className="text-xs mb-1 block" style={{color:"rgba(192,192,192,0.4)"}}>Estilo</label><select value={btn.style} onChange={e=>setButtons(buttons.map((b,idx)=>idx===i?{...b,style:Number(e.target.value) as EditBtn["style"]}:b))} className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none" style={{backgroundColor:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>{Object.entries(STYLE_LABELS).map(([v,n])=><option key={v} value={v} style={{backgroundColor:"#1a1a1a"}}>{n}</option>)}</select></div>
                    </div>
                    <div>
                      <label className="text-xs mb-1 flex items-center gap-1.5" style={{color:"rgba(192,192,192,0.4)"}}>{btn.style===5?"URL":"Custom ID"}{btn.style!==5&&<span className="px-1.5 py-0.5 rounded text-xs font-mono" style={{backgroundColor:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.1)"}}>panel_open:ID:TIPO</span>}</label>
                      <input type="text" value={btn.style===5?btn.url:btn.custom_id} onChange={e=>setButtons(buttons.map((b,idx)=>idx===i?{...b,...(btn.style===5?{url:e.target.value}:{custom_id:e.target.value})}:b))} placeholder={btn.style===5?"https://...":"panel_open:1:3"} className="w-full rounded-lg px-3 py-2 text-sm font-mono focus:outline-none" style={{backgroundColor:"rgba(255,255,255,0.04)",border:btn.custom_id.startsWith("panel_open:")?"1px solid rgba(34,197,94,0.3)":"1px solid rgba(255,255,255,0.08)",color:btn.custom_id.startsWith("panel_open:")?"#86efac":"white"}}/>
                      {btn.custom_id.startsWith("panel_open:")&&<p className="text-xs mt-1 flex items-center gap-1" style={{color:"rgba(34,197,94,0.7)"}}><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>Botao de ticket configurado</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="text-xs mb-1 block" style={{color:"rgba(192,192,192,0.4)"}}>Emoji (unicode ou &lt;:nome:id&gt;)</label><input type="text" value={btn.emoji} onChange={e=>setButtons(buttons.map((b,idx)=>idx===i?{...b,emoji:e.target.value}:b))} placeholder="🎫 ou <:nome:123>" className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none" style={{backgroundColor:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}/></div>
                      <div className="flex items-end pb-1"><label className="flex items-center gap-2 cursor-pointer"><div onClick={()=>setButtons(buttons.map((b,idx)=>idx===i?{...b,disabled:!b.disabled}:b))} className="w-9 h-5 rounded-full transition-all relative cursor-pointer" style={{backgroundColor:btn.disabled?"rgba(88,101,242,0.6)":"rgba(255,255,255,0.1)"}}><div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{left:btn.disabled?"calc(100% - 18px)":"2px"}}/></div><span className="text-xs" style={{color:"rgba(192,192,192,0.5)"}}>Desabilitado</span></label></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="rounded-xl p-4" style={{backgroundColor:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
            <p className="text-sm font-semibold mb-3 text-white">Enviar para Discord</p>
            <div className="flex flex-col gap-3">
              <div><label className="text-xs text-white/40 mb-1 block uppercase tracking-wide">Token do Bot</label><div className="flex gap-2"><div className="relative flex-1"><input type={tokenVisible?"text":"password"} value={token} onChange={e=>setToken(e.target.value)} placeholder="Token do bot..." className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none pr-8" style={{backgroundColor:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)"}}/><button onClick={()=>setTokenVisible(!tokenVisible)} className="absolute right-2 top-1/2 -translate-y-1/2" style={{color:"rgba(255,255,255,0.3)"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">{tokenVisible?<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27z"/>:<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>}</svg></button></div><button onClick={loadGuilds} disabled={!token.trim()||loadingGuilds} className="px-4 py-2 rounded-lg text-sm font-semibold text-black bg-white hover:bg-white/90 disabled:opacity-40 cursor-pointer">{loadingGuilds?"...":"Conectar"}</button></div></div>
              {guilds.length>0&&<div><label className="text-xs text-white/40 mb-1 block uppercase tracking-wide">Servidor</label><select value={guildId} onChange={e=>loadChannels(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none" style={{backgroundColor:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)"}}><option value="">Selecione...</option>{guilds.map(g=><option key={g.id} value={g.id} style={{backgroundColor:"#1a1a1a"}}>{g.name}</option>)}</select></div>}
              {loadingChannels&&<p className="text-xs text-white/30">Carregando canais...</p>}
              {channels.length>0&&<div><label className="text-xs text-white/40 mb-1 block uppercase tracking-wide">Canal</label><select value={channelId} onChange={e=>setChannelId(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none" style={{backgroundColor:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)"}}><option value="">Selecione...</option>{channels.map(ch=><option key={ch.id} value={ch.id} style={{backgroundColor:"#1a1a1a"}}># {ch.name}</option>)}</select></div>}
              {error&&<div className="text-sm text-red-400 px-3 py-2 rounded-lg" style={{backgroundColor:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)"}}>{error}</div>}
              {success&&<div className="text-sm text-green-400 px-3 py-2 rounded-lg flex items-center gap-2" style={{backgroundColor:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.2)"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>Painel enviado{channelName?` para #${channelName}`:""}!</div>}
              <button onClick={handleSend} disabled={sending||!channelId||!containers.length} className="w-full py-3 rounded-xl text-sm font-bold text-black bg-white hover:bg-white/90 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer">{sending?<><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Enviando...</>:<><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>Enviar Painel{channelName?` para #${channelName}`:""}</>}</button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3"><div className="flex items-center gap-2"><span className="text-xs font-medium uppercase tracking-widest" style={{color:"rgba(192,192,192,0.4)"}}>Preview</span><div className="flex-1 h-px" style={{background:"rgba(255,255,255,0.06)"}}/><span className="text-xs" style={{color:"rgba(192,192,192,0.2)"}}>atualiza em tempo real</span></div><DiscordPreview containers={getPreviewContainers()}/></div>
      </div>
    </div>
  );
}
