import React, { useCallback, useEffect, useRef, useState } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import lintModule from 'bpmn-js-bpmnlint';
import jsPDF from 'jspdf';
import { Canvg } from 'canvg';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

export default function BpmnEditor(){
  const containerRef = useRef(null);
  const modelerRef = useRef(null);
  return (
    <div style={{padding:'1rem',fontFamily:'sans-serif',color:'#b91c1c'}}>
      <strong>BpmnEditor stub:</strong> The original file was corrupted and replaced.<br/>
      Import and use <code>BpmnEditorClean</code> from './BpmnEditorClean'.
    </div>
  );
}

  const save=async()=>{try{const {xml}=await modelerRef.current.saveXML({format:true}); let base=fileName.trim()||'diagram'; if(!/\.(bpmn|xml)$/i.test(base)) base+='.bpmn'; const blob=new Blob([xml],{type:'application/xml'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=base; a.click(); URL.revokeObjectURL(url);}catch{alert('Save failed')}};
  const openDialog=()=>fileRef.current?.click();
  const openFile=async e=>{const f=e.target.files?.[0]; if(!f)return; const txt=await f.text(); try{await modelerRef.current.importXML(txt); modelerRef.current.get('canvas').zoom('fit-viewport'); localStorage.setItem('diagram',txt); setFileName(f.name.replace(/\.bpmn$/i,'').replace(/\.xml$/i,'')); runLint();}catch{alert('Import error')} e.target.value='';};
  const newDiagram=async()=>{const empty=`<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" targetNamespace="http://bpmn.io/schema/bpmn"><bpmn:process id="Process_${Date.now()}" isExecutable="false"/></bpmn:definitions>`; try{await modelerRef.current.importXML(empty); modelerRef.current.get('canvas').zoom('fit-viewport'); localStorage.setItem('diagram',empty); setFileName('diagram'); runLint();}catch{alert('New failed')}};
  const undo=()=>{try{modelerRef.current.get('commandStack').undo();}catch{}}; const redo=()=>{try{modelerRef.current.get('commandStack').redo();}catch{}};
  const zin=()=>{try{const c=modelerRef.current.get('canvas'); const z=Number(c.zoom())||1; c.zoom(z*1.1);}catch{}}; const zout=()=>{try{const c=modelerRef.current.get('canvas'); const z=Number(c.zoom())||1; c.zoom(Math.max(z/1.1,0.2));}catch{}}; const resetView=()=>{try{modelerRef.current.get('canvas').zoom('fit-viewport');}catch{}};
  useEffect(()=>{const h=e=>{if(['INPUT','TEXTAREA'].includes(e.target.tagName))return; const ctrl=e.ctrlKey||e.metaKey; if(ctrl&&(e.key==='+'||e.key==='=')){e.preventDefault();zin();} if(ctrl&&(e.key==='-'||e.key==='_' )){e.preventDefault();zout();} if(ctrl&&e.key==='0'){e.preventDefault();resetView();}}; window.addEventListener('keydown',h); return()=>window.removeEventListener('keydown',h);},[]);

  const dragOver=e=>{e.preventDefault(); setDrag(true);}; const dragLeave=e=>{e.preventDefault(); setDrag(false);}; const drop=async e=>{e.preventDefault(); setDrag(false); const f=e.dataTransfer.files?.[0]; if(!f)return; if(!/\.(bpmn|xml)$/i.test(f.name)){alert('Not BPMN');return;} const txt=await f.text(); try{await modelerRef.current.importXML(txt); modelerRef.current.get('canvas').zoom('fit-viewport'); localStorage.setItem('diagram',txt); setFileName(f.name.replace(/\.bpmn$/i,'').replace(/\.xml$/i,'')); runLint();}catch{alert('Import failed')}};

  const getTags=kind=>{ if(!selected) return []; return (selected.businessObject.get(`${kind}Tags`)||'').split(',').filter(Boolean); };
  const toggleTag=(kind,val)=>{ if(!selected) return; const bo=selected.businessObject; const cur=getTags(kind); const next=cur.includes(val)?cur.filter(x=>x!==val):[...cur,val]; bo.set(`${kind}Tags`,next.join(',')); try{modelerRef.current.get('modeling').updateProperties(selected,{});}catch{}};
  const addSystem=()=>{ if(!newSystem.id.trim())return; const upd=[...systems.filter(s=>s.id!==newSystem.id.trim()),{id:newSystem.id.trim(),name:newSystem.name.trim()||newSystem.id.trim()}]; setSystems(upd); localStorage.setItem('systemsCatalog',JSON.stringify(upd)); setNewSystem({id:'',name:''}); };
  const remSystem=id=>{ const upd=systems.filter(s=>s.id!==id); setSystems(upd); localStorage.setItem('systemsCatalog',JSON.stringify(upd)); };
  const addData=()=>{ const v=newData.trim(); if(!v)return; if(!dataEntities.includes(v)){ const upd=[...dataEntities,v]; setDataEntities(upd); localStorage.setItem('dataCatalog',JSON.stringify(upd)); } setNewData(''); };
  const remData=id=>{ const upd=dataEntities.filter(d=>d!==id); setDataEntities(upd); localStorage.setItem('dataCatalog',JSON.stringify(upd)); };
  const loadTemplate=async t=>{ if(!t)return; try{await modelerRef.current.importXML(t.xml); modelerRef.current.get('canvas').zoom('fit-viewport'); localStorage.setItem('diagram',t.xml); setFileName(t.id); runLint(); setShowTemplates(false);}catch{alert('Template error')}};

  const exportSVG=async()=>{ try{ const {svg}=await modelerRef.current.saveSVG(); const blob=new Blob([svg],{type:'image/svg+xml'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${fileName}.svg`; a.click(); URL.revokeObjectURL(url);}catch{alert('SVG export failed')}};
  const exportPNG=async()=>{ try{ const {svg}=await modelerRef.current.saveSVG(); const c=document.createElement('canvas'); const ctx=c.getContext('2d'); const v=await Canvg.from(ctx,svg); await v.render(); c.toBlob(b=>{ if(!b)return; const url=URL.createObjectURL(b); const a=document.createElement('a'); a.href=url; a.download=`${fileName}.png`; a.click(); URL.revokeObjectURL(url); });}catch{alert('PNG export failed')}};
  const exportPDF=async()=>{ try{ const {svg}=await modelerRef.current.saveSVG(); const pdf=new jsPDF({orientation:'landscape',unit:'pt',format:'a4'}); const c=document.createElement('canvas'); const ctx=c.getContext('2d'); const v=await Canvg.from(ctx,svg); await v.render(); const img=c.toDataURL('image/png'); pdf.addImage(img,'PNG',20,20,pdf.internal.pageSize.getWidth()-40,pdf.internal.pageSize.getHeight()-40); pdf.save(`${fileName}.pdf`);}catch{alert('PDF export failed')}};
  const exportCSV=()=>{ try{ const reg=modelerRef.current.get('elementRegistry'); const rows=['id;name;systems;data']; reg.getAll().forEach(el=>{ const bo=el.businessObject; if(bo&&/Task$/.test(bo.$type)){ rows.push(`${bo.id};${(bo.name||'').replace(/;/g,',')};${bo.get('systemTags')||''};${bo.get('dataTags')||''}`); }}); const blob=new Blob([rows.join('\n')],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${fileName}_report.csv`; a.click(); URL.revokeObjectURL(url);}catch{alert('CSV export failed')}};
  const focus=id=>{ try{const el=modelerRef.current.get('elementRegistry').get(id); if(el){modelerRef.current.get('selection').select(el); modelerRef.current.get('canvas').scrollToElement(el);} }catch{} };

  useEffect(()=>{ if(!modelerRef.current) return; const reg=modelerRef.current.get('elementRegistry'); const canvas=modelerRef.current.get('canvas'); reg.getAll().forEach(el=>{ const bo=el.businessObject; const gfx=canvas.getGraphics(el.id); if(!bo||!gfx)return; if(/Task$/.test(bo.$type)){ const st=(bo.get('systemTags')||'').split(',').filter(Boolean); const dt=(bo.get('dataTags')||'').split(',').filter(Boolean); const okS=!filterSystem||st.includes(filterSystem); const okD=!filterData||dt.includes(filterData); gfx.style.display=(okS&&okD)?'':'none'; if(colorize){ const first=st[0]; if(first) gfx.setAttribute('data-system-color',first); else gfx.removeAttribute('data-system-color'); } else gfx.removeAttribute('data-system-color'); }} }); },[filterSystem,filterData,colorize,selected,systems,dataEntities]);

  const H=60;
  return <div className="h-screen w-full overflow-hidden flex flex-col" style={{paddingTop:H}}>
    <div className="fixed top-0 left-0 right-0 h-[60px] flex items-center flex-wrap gap-2 px-4 z-50 bg-neutral-900/85 backdrop-blur border-b border-white/10 shadow">
      <span className="text-lg font-semibold text-white tracking-wide mr-2">Process Studio</span>
      <button onClick={newDiagram} className="btn btn-secondary text-xs" title="New">🆕</button>
      <button onClick={openDialog} className="btn btn-secondary text-xs" title="Open">📂</button>
      <input ref={fileRef} type="file" accept=".bpmn,.xml" onChange={openFile} className="hidden" />
      <button onClick={save} className="btn btn-primary text-xs" title="Save">💾</button>
      <button onClick={save} className="btn btn-secondary text-xs" title="Save As">💾+</button>
      <div className="flex items-center gap-1 ml-2">
        <button onClick={undo} className="btn btn-secondary text-xs" title="Undo">↶</button>
        <button onClick={redo} className="btn btn-secondary text-xs" title="Redo">↷</button>
        <button onClick={zin} className="btn btn-secondary text-xs px-2" title="Zoom In">＋</button>
        <button onClick={zout} className="btn btn-secondary text-xs px-2" title="Zoom Out">－</button>
        <button onClick={resetView} className="btn btn-secondary text-xs px-2" title="Fit">♻</button>
      </div>
      <input value={fileName} onChange={e=>setFileName(e.target.value)} className="px-3 py-2 border border-gray-300/60 rounded-md w-48 bg-white/80 text-sm" placeholder="File name" />
      <select value={filterSystem} onChange={e=>setFilterSystem(e.target.value)} className="border px-2 py-1 rounded text-xs bg-white/80"><option value="">All Systems</option>{systems.map(s=> <option key={s.id} value={s.id}>{s.id}</option>)}</select>
      <select value={filterData} onChange={e=>setFilterData(e.target.value)} className="border px-2 py-1 rounded text-xs bg-white/80"><option value="">All Data</option>{dataEntities.map(d=> <option key={d} value={d}>{d}</option>)}</select>
      <button onClick={()=>{setFilterSystem(''); setFilterData('');}} className="btn btn-ghost text-xs" title="Clear filters">✖</button>
      <button onClick={()=>setColorize(c=>!c)} className={`btn text-xs ${colorize?'btn-primary':'btn-secondary'}`} title="Colorize">🎨</button>
      <button onClick={runLint} className="btn btn-secondary text-xs" title="Validate">✔</button>
      <button onClick={()=>setShowIssues(s=>!s)} className="btn btn-secondary text-xs" title="Issues">⚠ {issues.length}</button>
      <button onClick={exportCSV} className="btn btn-secondary text-xs" title="CSV">📑</button>
      <button onClick={()=>setShowTemplates(true)} className="btn btn-secondary text-xs" title="Templates">📦</button>
      <button onClick={()=>setShowCatalog(true)} className="btn btn-secondary text-xs" title="Catalog">🗂</button>
      <button onClick={exportSVG} className="btn btn-secondary text-xs" title="SVG">🧬</button>
      <button onClick={exportPNG} className="btn btn-secondary text-xs" title="PNG">🖼</button>
      <button onClick={exportPDF} className="btn btn-secondary text-xs" title="PDF">📄</button>
    </div>
    <div ref={containerRef} onDragOver={dragOver} onDragLeave={dragLeave} onDrop={drop} className={`flex-1 relative border border-gray-400/40 rounded-lg overflow-hidden w-full ${drag?'ring-4 ring-blue-400 ring-offset-2':''}`} style={{minHeight:0}}>
      {showIssues && <div className="absolute bottom-4 right-4 max-h-60 w-72 bg-white/95 backdrop-blur border border-amber-300 rounded-lg shadow-lg overflow-auto text-xs z-30"><div className="sticky top-0 bg-amber-100 px-2 py-1 font-semibold text-amber-800 flex justify-between items-center text-[11px]"><span>Issues ({issues.length})</span><div className="flex gap-1"><button onClick={runLint} className="bg-amber-500 text-white px-2 py-0.5 rounded" title="Refresh">↻</button><button onClick={()=>setShowIssues(false)} className="bg-amber-300 text-amber-800 px-2 py-0.5 rounded" title="Close">✕</button></div></div>{issues.length===0 && <div className="p-2 text-green-600">No issues 🎉</div>}{issues.map((iss,i)=>(<button key={i} onClick={()=>focus(iss.elementId)} className={`block w-full text-left px-2 py-1 border-b last:border-b-0 hover:bg-amber-50 ${iss.level==='errors'?'text-red-600':'text-amber-700'}`} title={iss.id}><span className="font-medium">[{iss.level==='errors'?'ERR':'WARN'}]</span> {iss.message}<div className="text-[10px] opacity-70">{iss.elementId}</div></button>))}</div>}
      {showTemplates && <div className="absolute top-4 left-4 w-72 max-h-[70%] bg-white/95 backdrop-blur border border-indigo-300 rounded-lg shadow-lg flex flex-col text-xs z-40"><div className="flex justify-between items-center px-3 py-2 bg-indigo-100 text-indigo-800 font-semibold text-[11px]"><span>Templates</span><button onClick={()=>setShowTemplates(false)} className="px-2 py-0.5 bg-indigo-300 rounded" title="Close">✕</button></div><div className="overflow-auto divide-y divide-indigo-100">{templates.map(t=>(<button key={t.id} onClick={()=>loadTemplate(t)} className="w-full text-left px-3 py-2 hover:bg-indigo-50"><div className="font-medium text-indigo-700">{t.name}</div><div className="text-[10px] text-indigo-400">{t.id}</div></button>))}</div><div className="px-3 py-2 text-[10px] text-indigo-600 border-t bg-indigo-50">Loading replaces current diagram.</div></div>}
      {showCatalog && <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[480px] max-h-[75%] bg-white/95 backdrop-blur border border-fuchsia-300 rounded-lg shadow-lg flex flex-col text-xs z-40"><div className="flex justify-between items-center px-3 py-2 bg-fuchsia-100 text-fuchsia-800 font-semibold text-[11px]"><span>Systems & Data</span><button onClick={()=>setShowCatalog(false)} className="px-2 py-0.5 bg-fuchsia-300 rounded" title="Close">✕</button></div><div className="flex-1 overflow-auto p-3 space-y-4"><section><h4 className="text-fuchsia-700 font-semibold mb-1">Systems</h4><div className="flex gap-2 mb-2"><input value={newSystem.id} onChange={e=>setNewSystem(s=>({...s,id:e.target.value}))} placeholder="id" className="border px-2 py-1 rounded w-20"/><input value={newSystem.name} onChange={e=>setNewSystem(s=>({...s,name:e.target.value}))} placeholder="Name" className="border px-2 py-1 rounded flex-1"/><button onClick={addSystem} className="px-3 py-1 bg-fuchsia-600 text-white rounded text-xs">Add</button></div><div className="flex flex-wrap gap-1">{systems.map(s=>(<span key={s.id} className="px-2 py-0.5 bg-fuchsia-100 text-fuchsia-700 rounded flex items-center gap-1">{s.id}<button onClick={()=>remSystem(s.id)} className="text-fuchsia-500 hover:text-fuchsia-800" title="Remove">✕</button></span>))}{!systems.length&&<span className="text-fuchsia-400">None</span>}</div></section><section><h4 className="text-fuchsia-700 font-semibold mb-1">Data</h4><div className="flex gap-2 mb-2"><input value={newData} onChange={e=>setNewData(e.target.value)} placeholder="Entity" className="border px-2 py-1 rounded flex-1"/><button onClick={addData} className="px-3 py-1 bg-fuchsia-600 text-white rounded text-xs">Add</button></div><div className="flex flex-wrap gap-1">{dataEntities.map(d=>(<span key={d} className="px-2 py-0.5 bg-fuchsia-100 text-fuchsia-700 rounded flex items-center gap-1">{d}<button onClick={()=>remData(d)} className="text-fuchsia-500 hover:text-fuchsia-800" title="Remove">✕</button></span>))}{!dataEntities.length&&<span className="text-fuchsia-400">None</span>}</div></section><section>{selected? <div className="space-y-3"><div><div className="text-[10px] uppercase text-fuchsia-500 font-semibold mb-1">Systems</div><div className="flex flex-wrap gap-1">{systems.map(s=>{const active=getTags('system').includes(s.id); return <button key={s.id} onClick={()=>toggleTag('system',s.id)} className={`px-2 py-0.5 rounded text-[11px] border ${active?'bg-fuchsia-600 text-white border-fuchsia-700':'bg-white text-fuchsia-700 hover:bg-fuchsia-50 border-fuchsia-300'}`}>{s.id}</button>;})}{!systems.length&&<span className="text-fuchsia-300">No systems</span>}</div></div><div><div className="text-[10px] uppercase text-fuchsia-500 font-semibold mb-1">Data</div><div className="flex flex-wrap gap-1">{dataEntities.map(d=>{const active=getTags('data').includes(d); return <button key={d} onClick={()=>toggleTag('data',d)} className={`px-2 py-0.5 rounded text-[11px] border ${active?'bg-fuchsia-600 text-white border-fuchsia-700':'bg-white text-fuchsia-700 hover:bg-fuchsia-50 border-fuchsia-300'}`}>{d}</button>;})}{!dataEntities.length&&<span className="text-fuchsia-300">No data</span>}</div></div><div className="text-[10px] text-fuchsia-500">Tags: systemTags / dataTags.</div></div> : <div className="text-fuchsia-400 text-[11px]">Select a Task to tag.</div>}</section></div></div>}
      {drag && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center text-gray-700 text-lg font-semibold pointer-events-none">Drop .bpmn / .xml file</div>}
    </div>
  </div>;
}

  const getTags=kind=>{ if(!selected) return []; return (selected.businessObject.get(`${kind}Tags`)||'').split(',').filter(Boolean); };
  const toggleTag=(kind,val)=>{ if(!selected) return; const bo=selected.businessObject; const cur=getTags(kind); const next=cur.includes(val)?cur.filter(x=>x!==val):[...cur,val]; bo.set(`${kind}Tags`, next.join(',')); try{modelerRef.current.get('modeling').updateProperties(selected,{});}catch{}};

  useEffect(()=>{ if(!modelerRef.current) return; const registry=modelerRef.current.get('elementRegistry'); const canvas=modelerRef.current.get('canvas'); registry.getAll().forEach(el=>{ const bo=el.businessObject; const gfx=canvas.getGraphics(el.id); if(!bo||!gfx)return; if(filterSystem||filterData){ const st=(bo.get('systemTags')||'').split(','); const dt=(bo.get('dataTags')||'').split(','); const okS=!filterSystem||st.includes(filterSystem); const okD=!filterData||dt.includes(filterData); gfx.style.display=(okS&&okD)?'':'none'; } else { gfx.style.display=''; } if(colorize){ const first=(bo.get('systemTags')||'').split(',').filter(Boolean)[0]; if(first) gfx.setAttribute('data-system-color',first); else gfx.removeAttribute('data-system-color'); } else gfx.removeAttribute('data-system-color'); }); },[filterSystem,filterData,colorize,selected]);

  const addSystem=()=>{ if(!newSystem.id.trim()) return; const upd=[...systems.filter(s=>s.id!==newSystem.id.trim()), {id:newSystem.id.trim(), name:newSystem.name.trim()||newSystem.id.trim()}]; setSystems(upd); localStorage.setItem('systemsCatalog',JSON.stringify(upd)); setNewSystem({id:'',name:''});};
  const remSystem=id=>{ const upd=systems.filter(s=>s.id!==id); setSystems(upd); localStorage.setItem('systemsCatalog',JSON.stringify(upd));};
  const addData=()=>{ const v=newData.trim(); if(!v)return; if(!dataEntities.includes(v)){ const upd=[...dataEntities,v]; setDataEntities(upd); localStorage.setItem('dataCatalog',JSON.stringify(upd)); } setNewData('');};
  const remData=id=>{ const upd=dataEntities.filter(d=>d!==id); setDataEntities(upd); localStorage.setItem('dataCatalog',JSON.stringify(upd)); };

  const loadTemplate=async t=>{ if(!t) return; try{await modelerRef.current.importXML(t.xml); modelerRef.current.get('canvas').zoom('fit-viewport'); localStorage.setItem('diagram',t.xml); setFileName(t.id); runLint(); setShowTemplates(false);}catch{alert('Template error')}};

  const exportSVG=async()=>{ try{ const {svg}=await modelerRef.current.saveSVG(); const blob=new Blob([svg],{type:'image/svg+xml'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${fileName}.svg`; a.click(); URL.revokeObjectURL(url);}catch{alert('SVG export failed')}};
  const exportPNG=async()=>{ try{ const {svg}=await modelerRef.current.saveSVG(); const c=document.createElement('canvas'); const ctx=c.getContext('2d'); const v=await Canvg.from(ctx, svg); await v.render(); c.toBlob(b=>{ if(!b)return; const url=URL.createObjectURL(b); const a=document.createElement('a'); a.href=url; a.download=`${fileName}.png`; a.click(); URL.revokeObjectURL(url); }); }catch{alert('PNG export failed')}};
  const exportPDF=async()=>{ try{ const {svg}=await modelerRef.current.saveSVG(); const pdf=new jsPDF({orientation:'landscape',unit:'pt',format:'a4'}); const c=document.createElement('canvas'); const ctx=c.getContext('2d'); const v=await Canvg.from(ctx, svg); await v.render(); const img=c.toDataURL('image/png'); pdf.addImage(img,'PNG',20,20,pdf.internal.pageSize.getWidth()-40,pdf.internal.pageSize.getHeight()-40); pdf.save(`${fileName}.pdf`);}catch{alert('PDF export failed')}};
  const exportCSV=()=>{ try{ const reg=modelerRef.current.get('elementRegistry'); const rows=['id;name;systems;data']; reg.getAll().forEach(el=>{ const bo=el.businessObject; if(bo&&/Task$/.test(bo.$type)){rows.push(`${bo.id};${(bo.name||'').replace(/;/g,',')};${bo.get('systemTags')||''};${bo.get('dataTags')||''}`);}}); const blob=new Blob([rows.join('\n')],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${fileName}_report.csv`; a.click(); URL.revokeObjectURL(url);}catch{alert('CSV export failed')}};

  const focus=id=>{try{const el=modelerRef.current.get('elementRegistry').get(id); if(el){modelerRef.current.get('selection').select(el); modelerRef.current.get('canvas').scrollToElement(el);}}catch{}};

  const H=60;

  return <div className="h-screen w-full overflow-hidden flex flex-col" style={{paddingTop:H}}>
    <div className="fixed top-0 left-0 right-0 h-[60px] flex items-center flex-wrap gap-2 px-4 z-50 bg-neutral-900/85 backdrop-blur border-b border-white/10 shadow">
      <span className="text-lg font-semibold text-white tracking-wide mr-2">Process Studio</span>
      // Clean placeholder file after corruption cleanup. Implementation moved to fresh file version.
      export default function BpmnEditor(){
        return <div className="p-4 text-sm text-red-600">BpmnEditor temporarily removed for cleanup. (Placeholder)</div>;
      }
                      {showCatalog && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[520px] max-h-[75%] bg-white/95 backdrop-blur border border-fuchsia-300 rounded-lg shadow-lg flex flex-col text-xs z-[60]">
                          <div className="flex justify-between items-center px-3 py-2 bg-fuchsia-100 text-fuchsia-800 font-semibold text-[11px]">
                            <span>Systems & Data Catalog</span>
                            <button onClick={()=>setShowCatalog(false)} className="px-2 py-0.5 bg-fuchsia-300 rounded text-fuchsia-900" title="Close">✕</button>
                          </div>
                          <div className="flex-1 overflow-auto p-3 space-y-4">
                            <section>
                              <h4 className="text-fuchsia-700 font-semibold mb-1">Systems</h4>
                              <div className="flex gap-2 mb-2">
                                <input value={newSystem.id} onChange={e=>setNewSystem(s=>({...s,id:e.target.value}))} placeholder="id" className="border px-2 py-1 rounded w-24" />
                                <input value={newSystem.name} onChange={e=>setNewSystem(s=>({...s,name:e.target.value}))} placeholder="Name" className="border px-2 py-1 rounded flex-1" />
                                <button onClick={addSystem} className="px-3 py-1 bg-fuchsia-600 text-white rounded text-xs">Add</button>
                              </div>
                              <table className="w-full text-[11px] border">
                                <thead><tr className="bg-fuchsia-50 text-fuchsia-700"><th className="border px-1 py-1 text-left">ID</th><th className="border px-1 py-1 text-left">Name</th><th className="border px-1 py-1">#</th></tr></thead>
                                <tbody>
                                  {systems.map(s=> (
                                    <tr key={s.id} className="hover:bg-fuchsia-50"><td className="border px-1 py-0.5 font-mono">{s.id}</td><td className="border px-1 py-0.5">{s.name}</td><td className="border px-1 py-0.5 text-center"><button onClick={()=>removeSystem(s.id)} className="text-fuchsia-600 hover:text-fuchsia-800" title="Remove">✕</button></td></tr>
                                  ))}
                                  {systems.length===0 && <tr><td colSpan="3" className="text-center text-fuchsia-400 py-2">No systems</td></tr>}
                                </tbody>
                              </table>
                            </section>
                            <section>
                              <h4 className="text-fuchsia-700 font-semibold mb-1">Data Entities</h4>
                              <div className="flex gap-2 mb-2">
                                <input value={newData} onChange={e=>setNewData(e.target.value)} placeholder="Entity name" className="border px-2 py-1 rounded flex-1" />
                                <button onClick={addDataEntity} className="px-3 py-1 bg-fuchsia-600 text-white rounded text-xs">Add</button>
                              </div>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {dataEntities.map(d=> (
                                  <span key={d} className="px-2 py-0.5 bg-fuchsia-100 text-fuchsia-700 rounded inline-flex items-center gap-1">{d}<button onClick={()=>removeDataEntity(d)} className="text-fuchsia-500 hover:text-fuchsia-800" title="Remove">✕</button></span>
                                ))}
                                {dataEntities.length===0 && <span className="text-fuchsia-400">No data entities</span>}
                              </div>
                            </section>
                            <section>
                              {selectedElement ? (
                                <div className="space-y-3">
                                  <div>
                                    <div className="text-[10px] uppercase text-fuchsia-500 font-semibold mb-1">Systems</div>
                                    <div className="flex flex-wrap gap-1">
                                      {systems.map(s=>{ const active=getTags('system').includes(s.id); return <button key={s.id} onClick={()=>toggleTag('system', s.id)} className={`px-2 py-0.5 rounded text-[11px] border ${active?'bg-fuchsia-600 text-white border-fuchsia-700':'bg-white text-fuchsia-700 hover:bg-fuchsia-50 border-fuchsia-300'}`}>{s.id}</button>; })}
                                      {systems.length===0 && <span className="text-fuchsia-300">No systems defined</span>}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] uppercase text-fuchsia-500 font-semibold mb-1">Data</div>
                                    <div className="flex flex-wrap gap-1">
                                      {dataEntities.map(d=>{ const active=getTags('data').includes(d); return <button key={d} onClick={()=>toggleTag('data', d)} className={`px-2 py-0.5 rounded text-[11px] border ${active?'bg-fuchsia-600 text-white border-fuchsia-700':'bg-white text-fuchsia-700 hover:bg-fuchsia-50 border-fuchsia-300'}`}>{d}</button>; })}
                                      {dataEntities.length===0 && <span className="text-fuchsia-300">No data entities defined</span>}
                                    </div>
                                  </div>
                                  <div className="text-[10px] text-fuchsia-500">Tags stored as attributes: systemTags / dataTags. 🎨 colors by first system tag. Filters hide unmatched tasks.</div>
                                </div>
                              ) : <div className="text-fuchsia-400 text-[11px]">Select a Task to manage tags.</div>}
                            </section>
                          </div>
                        </div>
                      )}
                      {dragActive && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center text-gray-700 text-lg font-semibold pointer-events-none"><span>Drop .bpmn / .xml file to load</span></div>
                      )}
                    </div>
                  </div>
                );
              }
      runLint();
    } catch (e) {
  console.error('Template load error', e);
    }
  };
  const runLint = useCallback(async () => {
    if (!modelerRef.current) return;
    try {
      const linting = modelerRef.current.get('linting');
      if (!linting) return;
      // spróbuj lint()
      if (typeof linting.lint === 'function') {
        try { linting.lint(); } catch (_) { /* ignore */ }
      }
      let results = null;
      if (typeof linting.getResults === 'function') {
        results = linting.getResults();
      } else if (typeof linting.getWarnings === 'function') {
        results = { warnings: linting.getWarnings() || {}, errors: {} };
      } else if (linting._currentResult) {
        results = linting._currentResult;
      } else if (linting._results) {
        results = linting._results;
      }
      if (!results) { setIssues([]); return; }
      const flat = [];
      ['errors','warnings'].forEach(level => {
        const bucket = results[level] || {};
        Object.keys(bucket).forEach(elId => {
          (bucket[elId] || []).forEach(r => flat.push({ ...r, level, elementId: elId }));
        });
      });
      setIssues(flat);
    } catch (err) {
      console.warn('Lint error (zignorowano):', err);
      setIssues([]);
    }
  }, []);

  const handleManualLint = async () => { try { await runLint(); } catch (_) { /* ignore */ } };

  // Selection tracking for tagging
  useEffect(() => {
    if (!modelerRef.current) return;
    const eventBus = modelerRef.current.get('eventBus');
    const onSel = (e) => {
      const el = e.newSelection && e.newSelection[0];
      setSelectedElement(el && /Task$/.test(el.type) ? el : null);
    };
    eventBus.on('selection.changed', onSel);
    return () => eventBus.off('selection.changed', onSel);
  }, []);

  // Persist catalogs
  useEffect(() => { localStorage.setItem('systemsCatalog', JSON.stringify(systems)); }, [systems]);
  useEffect(() => { localStorage.setItem('dataCatalog', JSON.stringify(dataEntities)); }, [dataEntities]);
  // Seed przykładowych katalogów jeśli puste
  useEffect(() => {
    if (systems.length === 0) {
      setSystems([
        { id:'DCS', name:'Departure Control System' },
        { id:'BRS', name:'Baggage Reconciliation System' },
        { id:'PSS', name:'Passenger Service System' },
        { id:'GATE', name:'Gate Management' },
        { id:'SEC', name:'Security Screening System' }
      ]);
    }
    if (dataEntities.length === 0) {
      setDataEntities(['Passenger','Booking','BoardingPass','BaggageItem','Flight','SecurityAlert']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addSystem = () => {
    if (!newSystem.id.trim() || !newSystem.name.trim()) return;
    if (systems.some(s=>s.id===newSystem.id.trim())) return;
    setSystems([...systems, { id:newSystem.id.trim(), name:newSystem.name.trim() }]);
    setNewSystem({ id:'', name:'' });
  };
  const removeSystem = (id) => setSystems(systems.filter(s=>s.id!==id));
  const addDataEntity = () => {
    if (!newData.trim()) return; if (dataEntities.includes(newData.trim())) return;
    setDataEntities([...dataEntities, newData.trim()]); setNewData('');
  };
  const removeDataEntity = (id) => setDataEntities(dataEntities.filter(d=>d!==id));

  const toggleTag = (kind, tag) => {
    if (!selectedElement || !modelerRef.current) return;
    const bo = selectedElement.businessObject;
    const modeling = modelerRef.current.get('modeling');
    const attrName = kind === 'system' ? 'systemTags' : 'dataTags';
    const current = (bo.get(attrName) || '').split(',').map(s=>s.trim()).filter(Boolean);
    const exists = current.includes(tag);
    const next = exists ? current.filter(t=>t!==tag) : [...current, tag];
    modeling.updateProperties(selectedElement, { [attrName]: next.join(',') });
  };
  const getTags = (kind) => {
    if (!selectedElement) return [];
    const bo = selectedElement.businessObject;
    const attrName = kind === 'system' ? 'systemTags' : 'dataTags';
    return (bo.get(attrName) || '').split(',').map(s=>s.trim()).filter(Boolean);
  };

  // Apply system coloring & filtering
  useEffect(() => {
    if (!modelerRef.current) return; const elementRegistry = modelerRef.current.get('elementRegistry'); const canvas = modelerRef.current.get('canvas');
    elementRegistry.getAll().forEach(el => {
      if (!/Task$/.test(el.type)) return;
      const bo = el.businessObject;
      const sysTags = (bo.get('systemTags')||'').split(',').map(s=>s.trim()).filter(Boolean);
      const dataTags = (bo.get('dataTags')||'').split(',').map(s=>s.trim()).filter(Boolean);
      let hide = false;
      if (filterSystem && !sysTags.includes(filterSystem)) hide = true;
      if (!hide && filterData && !dataTags.includes(filterData)) hide = true;
      // coloring index
      let idx = -1;
      if (colorizeSystems && sysTags.length) {
        const first = sysTags[0];
        const order = systems.map(s=>s.id);
        idx = order.indexOf(first);
      }
      const gfx = canvas.getGraphics(el);
      if (gfx) {
        if (hide) {
          gfx.style.display = 'none';
        } else {
          gfx.style.display = '';
          if (idx>=0) {
            gfx.setAttribute('data-system-color', String(idx % 10));
          } else {
            gfx.removeAttribute('data-system-color');
          }
        }
      }
    });
  }, [filterSystem, filterData, colorizeSystems, systems]);

  const exportReport = async () => {
    if (!modelerRef.current) return;
    const elementRegistry = modelerRef.current.get('elementRegistry');
    const tasks = elementRegistry.getAll().filter(e=>/Task$/.test(e.type));
    const rows = tasks.map(t => {
      const bo = t.businessObject;
      const name = bo.name || t.id;
      const systemsT = (bo.get('systemTags')||'').split(',').map(s=>s.trim()).filter(Boolean).join(';');
      const dataT = (bo.get('dataTags')||'').split(',').map(s=>s.trim()).filter(Boolean).join(';');
      return { id: t.id, name, systems: systemsT, data: dataT };
    });
    const header = 'Task ID,Task Name,System Tags,Data Tags';
    const csv = [header, ...rows.map(r => [r.id, '"'+r.name.replace(/"/g,'""')+'"', '"'+r.systems+'"', '"'+r.data+'"'].join(','))].join('\r\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='process-report.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const focusElement = (id) => {
    if (!id) return;
    const elementRegistry = modelerRef.current.get('elementRegistry');
    const canvas = modelerRef.current.get('canvas');
    const element = elementRegistry.get(id);
    if (element) {
      canvas.scrollToElement(element);
      canvas.addMarker(id, 'highlight-problem');
      setTimeout(() => canvas.removeMarker(id, 'highlight-problem'), 1500);
      canvas.zoom('fit-viewport');
    }
  };

  const handleNewDiagram = async () => {
    const template = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Start"/>
    <bpmn:task id="Task_1" name="Task"/>
    <bpmn:endEvent id="EndEvent_1" name="End"/>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1"/>
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="EndEvent_1"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="180" y="160" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_Task_1_di" bpmnElement="Task_1">
        <dc:Bounds x="260" y="140" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="400" y="160" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint xmlns:di="http://www.omg.org/spec/DD/20100524/DI" x="216" y="178"/>
        <di:waypoint xmlns:di="http://www.omg.org/spec/DD/20100524/DI" x="260" y="180"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint xmlns:di="http://www.omg.org/spec/DD/20100524/DI" x="360" y="180"/>
        <di:waypoint xmlns:di="http://www.omg.org/spec/DD/20100524/DI" x="400" y="178"/>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
    try {
      await modelerRef.current.importXML(template);
      modelerRef.current.get('canvas').zoom('fit-viewport');
      localStorage.removeItem('diagram');
      setFileName('diagram');
      runLint();
    } catch (err) {
  console.error('New diagram creation error:', err);
    }
  };

  // Mini mapa (live snapshot + prostokąt viewportu + drag)
  const miniMapRef = useRef(null);
  const computeViewportOverlay = (svgEl) => {
    if (!modelerRef.current || !svgEl) return;
    const canvas = modelerRef.current.get('canvas');
    const vb = svgEl.getAttribute('viewBox')?.split(/\s+/).map(Number);
    if (!vb || vb.length !== 4) return;
    const current = canvas.viewbox();
    const left = ((current.x - vb[0]) / vb[2]) * 100;
    const top = ((current.y - vb[1]) / vb[3]) * 100;
    const width = (current.width / vb[2]) * 100;
    const height = (current.height / vb[3]) * 100;
    setMiniViewport({ left, top, width, height });
  };
  const updateMiniMap = useCallback(async () => {
    if (!showMiniMap) return;
    const modeler = modelerRef.current;
    if (!modeler) return;
    try {
      const { svg } = await modeler.saveSVG();
      if (miniMapRef.current) {
        miniMapRef.current.innerHTML = svg.replace('<svg', '<svg width="200"');
        const svgEl = miniMapRef.current.querySelector('svg');
        computeViewportOverlay(svgEl);
      }
    } catch (_) { /* ignore */ }
  }, [showMiniMap]);
  const updateMiniMapDebounced = useCallback(() => {
    if (updateMiniMapDebounced._t) clearTimeout(updateMiniMapDebounced._t);
    updateMiniMapDebounced._t = setTimeout(updateMiniMap, 120);
  }, [updateMiniMap]);
  useEffect(() => { updateMiniMap(); }, [updateMiniMap]);
  useEffect(() => {
    if (!modelerRef.current) return;
    const eventBus = modelerRef.current.get('eventBus');
    const handler = () => updateMiniMapDebounced();
    eventBus.on('canvas.viewbox.changed', handler);
    return () => eventBus.off('canvas.viewbox.changed', handler);
  }, [updateMiniMapDebounced]);
  const applyPointerToViewport = (clientX, clientY) => {
    if (!miniMapRef.current) return;
    const svgEl = miniMapRef.current.querySelector('svg');
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const vb = svgEl.getAttribute('viewBox')?.split(/\s+/).map(Number);
    if (!vb || vb.length !== 4) return;
    const x = clientX - rect.left; const y = clientY - rect.top;
    const scaleX = vb[2] / rect.width; const scaleY = vb[3] / rect.height;
    const targetX = vb[0] + x * scaleX; const targetY = vb[1] + y * scaleY;
    const canvas = modelerRef.current.get('canvas');
    const current = canvas.viewbox();
    canvas.viewbox({ x: targetX - current.width / 2, y: targetY - current.height / 2, width: current.width, height: current.height });
  };
  const onMiniPointerDown = (e) => { setDraggingMini(true); applyPointerToViewport(e.clientX, e.clientY); };
  const onMiniPointerMove = (e) => { if (draggingMini) applyPointerToViewport(e.clientX, e.clientY); };
  const endMiniDrag = () => setDraggingMini(false);
  useEffect(() => {
    if (!draggingMini) return; window.addEventListener('pointerup', endMiniDrag); return () => window.removeEventListener('pointerup', endMiniDrag);
  }, [draggingMini]);
  // Aktualizuj snapshot przy zmianach command stack
  useEffect(() => {
    const modeler = modelerRef.current; if (!modeler) return;
    const cb = () => updateMiniMapDebounced();
    modeler.on('commandStack.changed', cb);
    return () => modeler.off('commandStack.changed', cb);
  }, [updateMiniMapDebounced]);
  // Zapamiętuj ustawienia UI
  useEffect(() => { localStorage.setItem('uiSettings', JSON.stringify({ showMiniMap, showIssues, miniCollapsed })); }, [showMiniMap, showIssues, miniCollapsed]);

  const handleOpen = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      await modelerRef.current.importXML(text);
      modelerRef.current.get('canvas').zoom('fit-viewport');
      localStorage.setItem('diagram', text);
      const base = file.name.replace(/\.bpmn$/i, '').replace(/\.xml$/i, '');
      if (base) setFileName(base);
    } catch (err) {
  console.error('Diagram load error:', err);
    }
  };

  const handleOpenDialog = async () => {
    if (window.showOpenFilePicker) {
      try {
        const [handle] = await window.showOpenFilePicker({
          multiple: false,
          types: [
            {
              description: 'BPMN / XML',
              accept: { 'application/xml': ['.bpmn', '.xml'] }
            }
          ]
        });
        const file = await handle.getFile();
        const text = await file.text();
        await modelerRef.current.importXML(text);
        modelerRef.current.get('canvas').zoom('fit-viewport');
        localStorage.setItem('diagram', text);
        const base = file.name.replace(/\.bpmn$/i, '').replace(/\.xml$/i, '');
        if (base) setFileName(base);
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return; // user cancelled
        console.warn('showOpenFilePicker fallback', err);
      }
    }
    // Fallback hidden input
    openInputRef.current?.click();
  };

  const handleSaveAs = async () => {
    // Wymusza dialog (nie korzysta z samego fallbacku zapisu automatycznego)
    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      let base = (fileName || 'diagram').trim();
      if (!base.toLowerCase().endsWith('.bpmn')) base += '.bpmn';
      if (window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: base,
            types: [
              { description: 'BPMN Diagram', accept: { 'application/xml': ['.bpmn'] } }
            ]
          });
          const writable = await handle.createWritable();
          await writable.write(xml);
          await writable.close();
          return;
        } catch (pickerErr) {
          if (pickerErr?.name === 'AbortError') return;
          console.warn('Save As picker error, fallback to download.', pickerErr);
        }
      }
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = base;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
  console.error('Save As error:', err);
    }
  };

  // Drag & Drop obsługa
  const onDragOver = useCallback((e) => {
    e.preventDefault();
  if (!dragActive) setDragActive(true);
  }, [dragActive]);

  const onDragLeave = useCallback((e) => {
    // Opuścił cały kontener
    if (e.target === e.currentTarget) setDragActive(false);
  }, []);

  const onDrop = useCallback(async (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!/\.(bpmn|xml)$/i.test(file.name)) {
      alert('Drop a .bpmn or .xml file');
      return;
    }
    try {
      const text = await file.text();
      await modelerRef.current.importXML(text);
      modelerRef.current.get('canvas').zoom('fit-viewport');
      localStorage.setItem('diagram', text);
      const base = file.name.replace(/\.bpmn$/i, '').replace(/\.xml$/i, '');
      if (base) setFileName(base);
    } catch (err) {
  console.error('Drag & drop import error:', err);
    }
  }, []);

  const handleExportPDF = async () => {
    try {
      const { svg } = await modelerRef.current.saveSVG();

      // Ustalenie rozmiarów z viewBox lub atrybutów width/height
      let width = 1000;
      let height = 700;
      const viewBoxMatch = svg.match(/viewBox="([\d.\s-]+)"/);
      if (viewBoxMatch) {
        const parts = viewBoxMatch[1].trim().split(/\s+/).map(Number);
        if (parts.length === 4) {
          width = parts[2];
          height = parts[3];
        }
      } else {
        const wMatch = svg.match(/width="(\d+(?:\.\d+)?)"/);
        const hMatch = svg.match(/height="(\d+(?:\.\d+)?)"/);
        if (wMatch) width = parseFloat(wMatch[1]);
        if (hMatch) height = parseFloat(hMatch[1]);
      }

      // Skalowanie do strony A4 jeśli diagram większy
      const a4Portrait = { w: 595.28, h: 841.89 }; // pt
      const a4Landscape = { w: 841.89, h: 595.28 };
      const landscape = width > height;
      const page = landscape ? a4Landscape : a4Portrait;
      const scale = Math.min(page.w / width, page.h / height, 1); // nie powiększaj ponad 100%

      // Render SVG do canvasa przy użyciu canvg (zapewnia poprawne fonty i style)
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      const v = await Canvg.fromString(ctx, svg, { ignoreMouse: true, ignoreAnimation: true });
      await v.render();

      // Konwersja do PNG
      const pngData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'pt', format: 'a4' });
      const drawW = width * scale;
      const drawH = height * scale;
      const offsetX = (page.w - drawW) / 2;
      const offsetY = (page.h - drawH) / 2;
      pdf.addImage(pngData, 'PNG', offsetX, offsetY, drawW, drawH);
      pdf.save('diagram.pdf');
    } catch (err) {
  console.error('PDF export error:', err);
    }
  };
  // Eksport SVG/PNG
  const downloadBlob = async (blob, suggestedName) => {
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({ suggestedName });
        const w = await handle.createWritable(); await w.write(blob); await w.close(); return;
      } catch (e) { if (e?.name === 'AbortError') return; }
    }
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = suggestedName; a.click(); URL.revokeObjectURL(url);
  };
  const handleExportSVG = async () => {
  try { const { svg } = await modelerRef.current.saveSVG(); await downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `${fileName || 'diagram'}.svg`); } catch (e) { console.error('SVG export error:', e); }
  };
  const handleExportPNG = async () => {
  try { const { svg } = await modelerRef.current.saveSVG(); let width=1200,height=800; const vb=svg.match(/viewBox="([\d.\s-]+)"/); if (vb){const p=vb[1].trim().split(/\s+/).map(Number); if(p.length===4){width=p[2];height=p[3];}} const canvas=document.createElement('canvas'); canvas.width=width; canvas.height=height; const ctx=canvas.getContext('2d'); const v= await Canvg.fromString(ctx, svg, { ignoreAnimation:true, ignoreMouse:true }); await v.render(); canvas.toBlob(async b=>{ if(b) await downloadBlob(b, `${fileName || 'diagram'}.png`); }, 'image/png'); } catch(e){ console.error('PNG export error:', e); }
  };

  // Zoom In
  const handleZoomIn = () => {
    console.debug('[BPMN] Zoom In click');
    try {
      if (!modelerRef.current) return;
      const canvas = modelerRef.current.get('canvas');
      const currentZoom = Number(canvas.zoom()) || 1;
      const container = canvas.getContainer();
      const center = { x: container.clientWidth / 2, y: container.clientHeight / 2 };
      const next = Math.min(currentZoom * 1.1, 5); // limit 500%
      canvas.zoom(next, center);
      // fallback jeśli brak zmiany (niektóre implementacje wymagają setTimeout)
      if (Math.abs(canvas.zoom() - currentZoom) < 0.0001) {
        setTimeout(() => canvas.zoom(next, center), 0);
      }
    } catch (e) {
      console.warn('ZoomIn error', e);
    }
  };

  // Zoom Out
  const handleZoomOut = () => {
    console.debug('[BPMN] Zoom Out click');
    try {
      if (!modelerRef.current) return;
      const canvas = modelerRef.current.get('canvas');
      const currentZoom = Number(canvas.zoom()) || 1;
      const container = canvas.getContainer();
      const center = { x: container.clientWidth / 2, y: container.clientHeight / 2 };
      const next = Math.max(currentZoom / 1.1, 0.2); // min 20%
      canvas.zoom(next, center);
      if (Math.abs(canvas.zoom() - currentZoom) < 0.0001) {
        setTimeout(() => canvas.zoom(next, center), 0);
      }
    } catch (e) {
      console.warn('ZoomOut error', e);
    }
  };

  // Reset View
  const handleResetView = () => {
    console.debug('[BPMN] Reset View click');
    try {
      if (!modelerRef.current) return;
      const canvas = modelerRef.current.get('canvas');
      canvas.resized();
      const success = canvas.zoom('fit-viewport');
      // Jeśli fit-viewport nie zmienia (czasem gdy brak rozmiaru), użyj manualnego wyliczenia
      if (!success) {
        const root = canvas.getRootElement();
        if (root && root.children?.length) {
          // spróbuj ponownie po krótkim czasie
          setTimeout(() => canvas.zoom('fit-viewport'), 30);
        }
      }
    } catch (e) {
      console.warn('Reset error', e);
    }
  };

  // Skróty klawiaturowe: Ctrl/Cmd + '+', '-', '0'
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && (e.key === '+' || e.key === '=')) { e.preventDefault(); handleZoomIn(); }
      if (ctrl && (e.key === '-' || e.key === '_')) { e.preventDefault(); handleZoomOut(); }
      if (ctrl && (e.key === '0')) { e.preventDefault(); handleResetView(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const TOOLBAR_HEIGHT = 50; // new single bar height

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col" style={{ paddingTop: TOOLBAR_HEIGHT }}>
      {/* Menu bar */}
      <div ref={menuBarRef} className="fixed top-0 left-0 right-0 h-[30px] flex items-center gap-4 pl-3 pr-4 z-[70] bg-neutral-900/80 backdrop-blur text-[12px] text-neutral-100 select-none shadow">
        <span className="font-semibold tracking-wide pr-2">✈️ BPMN Editor</span>
        {['file','edit','view','tools','help'].map(menu => (
          <div key={menu} className="relative">
            <button
              onClick={()=>setOpenMenu(m=> m===menu? null : menu)}
              className={`px-2 py-0.5 rounded hover:bg-neutral-700 focus:bg-neutral-700 ${openMenu===menu? 'bg-neutral-700' : ''}`}
            >
              {menu==='file' && 'File'}
              {menu==='edit' && 'Edit'}
              {menu==='view' && 'View'}
              {menu==='tools' && 'Tools'}
              {menu==='help' && 'Help'}
            </button>
            {openMenu===menu && (
              <div className="absolute top-full left-0 mt-1 min-w-[180px] glass-panel bg-neutral-800/95 backdrop-blur border border-neutral-600 rounded-md shadow-lg p-1 flex flex-col z-[80]">
                {menu==='file' && (
                  <>
                    <button onClick={()=>{handleNewDiagram(); setOpenMenu(null);}} className="app-menu-item">🆕 New</button>
                    <button onClick={()=>{handleOpenDialog(); setOpenMenu(null);}} className="app-menu-item">📂 Open…</button>
                    <input ref={openInputRef} type="file" accept=".bpmn,.xml" onChange={handleOpen} className="hidden" />
                    <button onClick={()=>{handleSave(); setOpenMenu(null);}} className="app-menu-item">� Save</button>
                    <button onClick={()=>{handleSaveAs(); setOpenMenu(null);}} className="app-menu-item">💾 Save As…</button>
                    <div className="app-menu-sep" />
                    <button onClick={()=>{handleExportPDF(); setOpenMenu(null);}} className="app-menu-item">📄 Export PDF</button>
                    <button onClick={()=>{handleExportPNG(); setOpenMenu(null);}} className="app-menu-item">🖼 Export PNG</button>
                    <button onClick={()=>{handleExportSVG(); setOpenMenu(null);}} className="app-menu-item">🧬 Export SVG</button>
                    <div className="app-menu-sep" />
                    <button onClick={()=>{setShowTemplates(true); setOpenMenu(null);}} className="app-menu-item">📦 Templates…</button>
                    <button onClick={()=>{setShowCatalog(true); setOpenMenu(null);}} className="app-menu-item">🗂 Catalog…</button>
                  </>
                )}
                {menu==='edit' && (
                  <>
                    <button onClick={()=>{handleUndo(); setOpenMenu(null);}} className="app-menu-item">↶ Undo</button>
                    <button onClick={()=>{handleRedo(); setOpenMenu(null);}} className="app-menu-item">↷ Redo</button>
                    <div className="app-menu-sep" />
                    <button onClick={()=>{handleManualLint(); setOpenMenu(null);}} className="app-menu-item">✔ Validate (Lint)</button>
                  </>
                )}
                {menu==='view' && (
                  <>
                    <button onClick={()=>{setShowIssues(s=>!s); setOpenMenu(null);}} className="app-menu-item">⚠ Issues {issues.length>0? `(${issues.length})`: ''}</button>
                    <button onClick={()=>{setShowMiniMap(m=>!m); if(!showMiniMap) setMiniCollapsed(false); setOpenMenu(null);}} className="app-menu-item">🗺 Minimap {showMiniMap? 'Off':'On'}</button>
                    <div className="app-menu-sep" />
                    <button onClick={()=>{handleZoomIn(); setOpenMenu(null);}} className="app-menu-item">＋ Zoom In</button>
                    <button onClick={()=>{handleZoomOut(); setOpenMenu(null);}} className="app-menu-item">－ Zoom Out</button>
                    <button onClick={()=>{handleResetView(); setOpenMenu(null);}} className="app-menu-item">♻ Fit / Reset</button>
                  </>
                )}
                {menu==='tools' && (
                  <>
                    <button onClick={()=>{setColorizeSystems(c=>!c); setOpenMenu(null);}} className="app-menu-item">🎨 Colorize Systems {colorizeSystems? '✓':''}</button>
                    <button onClick={()=>{setFilterSystem(''); setFilterData(''); setOpenMenu(null);}} className="app-menu-item">✖ Clear Filters</button>
                    <button onClick={()=>{exportReport(); setOpenMenu(null);}} className="app-menu-item">📑 Export CSV Report</button>
                  </>
                )}
                {menu==='help' && (
                  <>
                    <div className="px-2 py-1 text-[11px] text-neutral-300">Keyboard: Ctrl+ + / - / 0 for zoom & fit.</div>
                    <div className="px-2 py-1 text-[11px] text-neutral-400">Drag & drop .bpmn to import.</div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Secondary bar */}
      <div className="fixed top-[30px] left-0 right-0 h-[42px] flex items-center gap-3 px-3 z-[60] glass-bar backdrop-blur border-b border-white/10">
        <input type="text" value={fileName} onChange={(e)=>setFileName(e.target.value)} placeholder="File name" className="px-3 py-2 border border-gray-300/60 rounded-md w-48 focus:outline-none focus:ring-2 focus:ring-blue-400/60 bg-white/80 backdrop-blur-sm shadow-sm text-sm" />
        <div className="flex items-center gap-1">
          <button type="button" onClick={handleZoomIn} className="btn btn-secondary text-xs px-2" title="Zoom In (Ctrl + '+')">＋</button>
          <button type="button" onClick={handleZoomOut} className="btn btn-secondary text-xs px-2" title="Zoom Out (Ctrl + '-')">－</button>
          <button type="button" onClick={handleResetView} className="btn btn-secondary text-xs px-2" title="Fit / Reset (Ctrl + 0)">♻</button>
        </div>
        <select value={filterSystem} onChange={e=>setFilterSystem(e.target.value)} className="border px-2 py-1 rounded text-xs bg-white/80 backdrop-blur shadow-sm">
          <option value="">All Systems</option>
          {systems.map(s=> <option key={s.id} value={s.id}>{s.id}</option>)}
        </select>
        <select value={filterData} onChange={e=>setFilterData(e.target.value)} className="border px-2 py-1 rounded text-xs bg-white/80 backdrop-blur shadow-sm">
          <option value="">All Data</option>
          {dataEntities.map(d=> <option key={d} value={d}>{d}</option>)}
        </select>
        <button onClick={()=>{setFilterSystem(''); setFilterData('');}} className="btn btn-ghost text-xs px-2 py-1" title="Clear filters">✖</button>
        <button onClick={()=>setColorizeSystems(c=>!c)} className={`text-xs px-2 py-1 rounded btn ${colorizeSystems?'btn-primary':'btn-secondary'}`} title="Colorize by system">🎨</button>
        <button onClick={handleSave} className="btn btn-primary" title="Save (Ctrl+S)">💾 Save</button>
        <button onClick={handleManualLint} className="btn btn-secondary" title="Validate diagram">✔ Lint</button>
        <button onClick={()=>setShowIssues(s=>!s)} className="btn btn-secondary text-xs" title="Issues list">⚠ {issues.length}</button>
        <button onClick={()=>{setShowMiniMap(m=>!m); if(!showMiniMap) setMiniCollapsed(false);}} className="btn btn-secondary text-xs" title="Minimap">🗺</button>
      </div>

  {/* Editor area */}
      <div
        ref={containerRef}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex-1 relative border border-gray-400/40 rounded-lg overflow-hidden w-full transition-all diagram-surface ${dragActive ? 'ring-4 ring-blue-400 ring-offset-2' : ''}`}
        {/* New single top bar */}
        <div className="fixed top-0 left-0 right-0 h-[50px] flex items-center gap-3 px-4 z-[70] bg-neutral-900/85 backdrop-blur border-b border-white/10 shadow">
          <span className="text-lg font-semibold text-white tracking-wide">Process Studio</span>
          <button onClick={handleNewDiagram} className="btn btn-secondary text-xs" title="New diagram">🆕</button>
          <button onClick={handleOpenDialog} className="btn btn-secondary text-xs" title="Open diagram">📂</button>
          <input ref={openInputRef} type="file" accept=".bpmn,.xml" onChange={handleOpen} className="hidden" />
          <button onClick={handleSave} className="btn btn-primary text-xs" title="Save">💾</button>
          <button onClick={handleSaveAs} className="btn btn-secondary text-xs" title="Save As">💾+</button>
          <div className="h-6 w-px bg-white/20 mx-1" />
              </section>
              <section>
                <h4 className="text-fuchsia-700 font-semibold mb-1">Data Entities</h4>
                <div className="flex gap-2 mb-2">
                  <input value={newData} onChange={e=>setNewData(e.target.value)} placeholder="Entity name" className="border px-2 py-1 rounded flex-1" />
                  <button onClick={addDataEntity} className="px-3 py-1 bg-fuchsia-600 text-white rounded text-xs">Add</button>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {dataEntities.map(d => (
                    <span key={d} className="px-2 py-0.5 bg-fuchsia-100 text-fuchsia-700 rounded inline-flex items-center gap-1">
                      {d}
                      <button onClick={()=>removeDataEntity(d)} className="text-fuchsia-500 hover:text-fuchsia-800" title="Remove">✕</button>
                    </span>
                  ))}
                  {dataEntities.length===0 && <span className="text-fuchsia-400">No data entities</span>}
                </div>
              </section>
              <section>
          {/* Minimap toggle removed per request */}
                {selectedElement ? (
          <button onClick={()=>setShowTemplates(true)} className="btn btn-secondary text-xs" title="Templates">📦</button>
          <button onClick={()=>setShowCatalog(true)} className="btn btn-secondary text-xs" title="Catalog">🗂</button>
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] uppercase text-fuchsia-500 font-semibold mb-1">Systems</div>
                      <div className="flex flex-wrap gap-1">
                        {systems.map(s => {
                          const active = getTags('system').includes(s.id);
                          return <button key={s.id} onClick={()=>toggleTag('system', s.id)} className={`px-2 py-0.5 rounded text-[11px] border ${active? 'bg-fuchsia-600 text-white border-fuchsia-700':'bg-white text-fuchsia-700 hover:bg-fuchsia-50 border-fuchsia-300'}`}>{s.id}</button>;
                        })}
                        {systems.length===0 && <span className="text-fuchsia-300">No systems defined</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-fuchsia-500 font-semibold mb-1">Data</div>
                      <div className="flex flex-wrap gap-1">
                        {dataEntities.map(d => {
                          const active = getTags('data').includes(d);
                          return <button key={d} onClick={()=>toggleTag('data', d)} className={`px-2 py-0.5 rounded text-[11px] border ${active? 'bg-fuchsia-600 text-white border-fuchsia-700':'bg-white text-fuchsia-700 hover:bg-fuchsia-50 border-fuchsia-300'}`}>{d}</button>;
                        })}
                        {dataEntities.length===0 && <span className="text-fuchsia-300">No data entities defined</span>}
                      </div>
                    </div>
                    <div className="text-[10px] text-fuchsia-500">
                      Tags stored as element attributes: systemTags / dataTags (persisted in BPMN XML attributes).
                      Report button (📑) exports CSV; 🎨 toggles color overlay; filters limit visible tasks.
                    </div>
                  </div>
                ) : (
                  <div className="text-fuchsia-400 text-[11px]">Select a Task to manage tags.</div>
                )}
              </section>
            </div>
          </div>
        )}
        {showMiniMap && (
          miniCollapsed ? (
            <button
              onClick={() => setMiniCollapsed(false)}
              className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-teal-600 text-white shadow flex items-center justify-center text-lg hover:bg-teal-700 z-10"
              title="Show minimap"
            >🗺</button>
          ) : (
            <div className="absolute bottom-4 right-4 w-[230px] h-[170px] bg-white/85 backdrop-blur border border-teal-300 rounded-lg shadow p-1 z-10 text-[10px] select-none flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-teal-700">Minimap</span>
                <div className="flex gap-1">
                  <button onClick={updateMiniMap} className="px-1 py-0.5 bg-teal-300 text-teal-900 rounded" title="Refresh">↻</button>
                  <button onClick={() => setMiniCollapsed(true)} className="px-1 py-0.5 bg-teal-200 text-teal-800 rounded" title="Collapse">–</button>
                </div>
              </div>
              <div
                ref={miniMapRef}
                onPointerDown={onMiniPointerDown}
                onPointerMove={onMiniPointerMove}
                className={`relative cursor-${draggingMini ? 'grabbing' : 'grab'} overflow-hidden flex-1 bg-white border border-teal-200 rounded`}
              >
                {miniViewport && (
                  <div
                    className="absolute border-2 border-teal-500 bg-teal-400/10 rounded"
                    style={{ left: miniViewport.left + '%', top: miniViewport.top + '%', width: miniViewport.width + '%', height: miniViewport.height + '%'}}
                  />
                )}
              </div>
            </div>
          )
        )}
        {dragActive && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center text-gray-700 text-lg font-semibold pointer-events-none">
            <span>Drop a .bpmn / .xml file to load</span>
          </div>
        )}
      </div>
    </div>
  );
}
