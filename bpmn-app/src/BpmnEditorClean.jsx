import React, { useCallback, useEffect, useRef, useState } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import lintModule from 'bpmn-js-bpmnlint';
import jsPDF from 'jspdf';
import { Canvg } from 'canvg';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

// Clean, conflict-free editor component (renamed)
export default function BpmnEditorClean(){
  const containerRef=useRef(null); const modelerRef=useRef(null); const fileRef=useRef(null);
  const [fileName,setFileName]=useState('diagram');
  const [issues,setIssues]=useState([]); const [showIssues,setShowIssues]=useState(false);
  const [showTemplates,setShowTemplates]=useState(false); const [showCatalog,setShowCatalog]=useState(false);
  const [drag,setDrag]=useState(false); const [selected,setSelected]=useState(null);
  const [systems,setSystems]=useState(()=>{try{return JSON.parse(localStorage.getItem('systemsCatalog')||'[]');}catch{return[]}});
  const [dataEntities,setDataEntities]=useState(()=>{try{return JSON.parse(localStorage.getItem('dataCatalog')||'[]');}catch{return[]}});
  const [newSystem,setNewSystem]=useState({id:'',name:''}); const [newData,setNewData]=useState('');
  const [filterSystem,setFilterSystem]=useState(''); const [filterData,setFilterData]=useState('');
  const [colorize,setColorize]=useState(false);

  useEffect(()=>{ if(!systems.length){const seed=[{id:'DCS',name:'Departure Control'},{id:'CRM',name:'CRM'},{id:'BHS',name:'Baggage Handling'},{id:'SEC',name:'Security'},{id:'FUEL',name:'Fuel Ops'}]; setSystems(seed); localStorage.setItem('systemsCatalog',JSON.stringify(seed));} if(!dataEntities.length){const d=['Passenger','Booking','BagTag','Flight','Gate']; setDataEntities(d); localStorage.setItem('dataCatalog',JSON.stringify(d));}},[]);

  const templates=[{id:'checkin',name:'Check-in',xml:`<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" targetNamespace="http://bpmn.io/schema/bpmn"><bpmn:process id="CheckIn" isExecutable="false"><bpmn:startEvent id="Start" name="Start"/><bpmn:task id="T1" name="Select Flight"/><bpmn:task id="T2" name="Provide Docs"/><bpmn:endEvent id="End" name="End"/><bpmn:sequenceFlow id="f1" sourceRef="Start" targetRef="T1"/><bpmn:sequenceFlow id="f2" sourceRef="T1" targetRef="T2"/><bpmn:sequenceFlow id="f3" sourceRef="T2" targetRef="End"/></bpmn:process></bpmn:definitions>`}];

  const runLint = useCallback(() => {
    try {
      const l = modelerRef.current?.get('linting');
      if (!l) return;
      if (typeof l.lint === 'function') {
        try { l.lint(); } catch { /* ignore */ }
      }
      const r = l.getResults ? l.getResults() : (l._currentResult || l._results || null);
      if (!r) { setIssues([]); return; }
      const flat = [];
      ['errors','warnings'].forEach(level => {
        const bucket = r[level] || {};
        Object.keys(bucket).forEach(id => (bucket[id] || []).forEach(x => flat.push({ ...x, level, elementId: id })));
      });
      setIssues(flat);
    } catch {
      setIssues([]);
    }
  }, []);

  useEffect(() => {
    if (modelerRef.current) return;
    const m = new BpmnModeler({
      container: containerRef.current,
      additionalModules: [ lintModule ]
    });
    modelerRef.current = m;
    const empty = `<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" targetNamespace="http://bpmn.io/schema/bpmn"><bpmn:process id="Process_1" isExecutable="false"/></bpmn:definitions>`;
    (async () => {
      try {
        await m.importXML(localStorage.getItem('diagram') || empty);
      } catch {
        await m.importXML(empty);
      }
      try { m.get('canvas').zoom('fit-viewport'); } catch {}
      runLint();
    })();
    m.on('commandStack.changed', async () => {
      try { const { xml } = await m.saveXML({ format: true }); localStorage.setItem('diagram', xml); } catch {}
      runLint();
    });
    m.on('selection.changed', e => setSelected(e.newSelection?.[0] || null));
  }, [runLint]);

  const save=async()=>{try{const {xml}=await modelerRef.current.saveXML({format:true}); let base=fileName.trim()||'diagram'; if(!/\.(bpmn|xml)$/i.test(base)) base+='.bpmn'; const blob=new Blob([xml],{type:'application/xml'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=base; a.click(); URL.revokeObjectURL(url);}catch{alert('Save failed')}};
  const openFile=async e=>{const f=e.target.files?.[0]; if(!f)return; const txt=await f.text(); try{await modelerRef.current.importXML(txt); modelerRef.current.get('canvas').zoom('fit-viewport'); localStorage.setItem('diagram',txt); setFileName(f.name.replace(/\.bpmn$/i,'').replace(/\.xml$/i,'')); runLint();}catch{alert('Import error')} e.target.value='';};
  const newDiagram=async()=>{const empty=`<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" targetNamespace="http://bpmn.io/schema/bpmn"><bpmn:process id="Process_${Date.now()}" isExecutable="false"/></bpmn:definitions>`; try{await modelerRef.current.importXML(empty); modelerRef.current.get('canvas').zoom('fit-viewport'); localStorage.setItem('diagram',empty); setFileName('diagram'); runLint();}catch{alert('New failed')}};
  const undo=()=>{try{modelerRef.current.get('commandStack').undo();}catch{}}; const redo=()=>{try{modelerRef.current.get('commandStack').redo();}catch{}};
  const zin=()=>{try{const c=modelerRef.current.get('canvas'); const z=Number(c.zoom())||1; c.zoom(z*1.1);}catch{}}; const zout=()=>{try{const c=modelerRef.current.get('canvas'); const z=Number(c.zoom())||1; c.zoom(Math.max(z/1.1,0.2));}catch{}}; const resetView=()=>{try{modelerRef.current.get('canvas').zoom('fit-viewport');}catch{}};

  const getTags = (kind) => {
    if (!selected) return [];
    return (selected.businessObject.get(`${kind}Tags`) || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  };
  const toggleTag = (kind, val) => {
    if (!selected) return;
    const bo = selected.businessObject;
    const cur = getTags(kind);
    const next = cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val];
    bo.set(`${kind}Tags`, next.join(','));
    try { modelerRef.current.get('modeling').updateProperties(selected, {}); } catch {}
  };
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

  useEffect(() => {
    if (!modelerRef.current) return;
    const reg = modelerRef.current.get('elementRegistry');
    const canvas = modelerRef.current.get('canvas');
    reg.getAll().forEach(el => {
      const bo = el.businessObject;
      if (!bo) return;
      if (!/Task$/.test(bo.$type)) return;
      const gfx = canvas.getGraphics(el.id);
      if (!gfx) return;
      const st = (bo.get('systemTags') || '').split(',').map(s=>s.trim()).filter(Boolean);
      const dt = (bo.get('dataTags') || '').split(',').map(s=>s.trim()).filter(Boolean);
      const okS = !filterSystem || st.includes(filterSystem);
      const okD = !filterData || dt.includes(filterData);
      gfx.style.display = (okS && okD) ? '' : 'none';
      if (colorize) {
        const first = st[0];
        if (first) gfx.setAttribute('data-system-color', first);
        else gfx.removeAttribute('data-system-color');
      } else {
        gfx.removeAttribute('data-system-color');
      }
    });
  }, [filterSystem, filterData, colorize, selected, systems, dataEntities]);

  const H=60;
  return (<div className="h-screen w-full overflow-hidden flex flex-col bg-white" style={{paddingTop:H}}>
    <div className="fixed top-0 left-0 right-0 h-[60px] flex items-center flex-wrap gap-2 px-4 z-50 bg-neutral-900/85 backdrop-blur border-b border-white/10 shadow">
      <span className="text-lg font-semibold text-white tracking-wide mr-2">Process Studio</span>
      <button onClick={newDiagram} className="btn btn-secondary text-xs" title="New">🆕</button>
      <button onClick={()=>fileRef.current?.click()} className="btn btn-secondary text-xs" title="Open">📂</button>
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
    <div ref={containerRef} onDragOver={e=>{e.preventDefault(); setDrag(true);}} onDragLeave={e=>{e.preventDefault(); setDrag(false);}} onDrop={async e=>{e.preventDefault(); setDrag(false); const f=e.dataTransfer.files?.[0]; if(!f)return; if(!/\.(bpmn|xml)$/i.test(f.name)){alert('Not BPMN');return;} const txt=await f.text(); try{await modelerRef.current.importXML(txt); modelerRef.current.get('canvas').zoom('fit-viewport'); localStorage.setItem('diagram',txt); setFileName(f.name.replace(/\.bpmn$/i,'').replace(/\.xml$/i,'')); runLint();}catch{alert('Import failed')}}} className={`flex-1 relative border border-gray-400/40 rounded-lg overflow-hidden w-full ${drag?'ring-4 ring-blue-400 ring-offset-2':''}`} style={{minHeight:0}}>
      {showIssues && <div className="absolute bottom-4 right-4 max-h-60 w-72 bg-white/95 backdrop-blur border border-amber-300 rounded-lg shadow-lg overflow-auto text-xs z-30"><div className="sticky top-0 bg-amber-100 px-2 py-1 font-semibold text-amber-800 flex justify-between items-center text-[11px]"><span>Issues ({issues.length})</span><div className="flex gap-1"><button onClick={runLint} className="bg-amber-500 text-white px-2 py-0.5 rounded" title="Refresh">↻</button><button onClick={()=>setShowIssues(false)} className="bg-amber-300 text-amber-800 px-2 py-0.5 rounded" title="Close">✕</button></div></div>{issues.length===0 && <div className="p-2 text-green-600">No issues 🎉</div>}{issues.map((iss,i)=>(<button key={i} onClick={()=>focus(iss.elementId)} className={`block w-full text-left px-2 py-1 border-b last:border-b-0 hover:bg-amber-50 ${iss.level==='errors'?'text-red-600':'text-amber-700'}`} title={iss.id}><span className="font-medium">[{iss.level==='errors'?'ERR':'WARN'}]</span> {iss.message}<div className="text-[10px] opacity-70">{iss.elementId}</div></button>))}</div>}
      {showTemplates && <div className="absolute top-4 left-4 w-72 max-h-[70%] bg-white/95 backdrop-blur border border-indigo-300 rounded-lg shadow-lg flex flex-col text-xs z-40"><div className="flex justify-between items-center px-3 py-2 bg-indigo-100 text-indigo-800 font-semibold text-[11px]"><span>Templates</span><button onClick={()=>setShowTemplates(false)} className="px-2 py-0.5 bg-indigo-300 rounded" title="Close">✕</button></div><div className="overflow-auto divide-y divide-indigo-100">{templates.map(t=>(<button key={t.id} onClick={()=>loadTemplate(t)} className="w-full text-left px-3 py-2 hover:bg-indigo-50"><div className="font-medium text-indigo-700">{t.name}</div><div className="text-[10px] text-indigo-400">{t.id}</div></button>))}</div><div className="px-3 py-2 text-[10px] text-indigo-600 border-t bg-indigo-50">Loading replaces current diagram.</div></div>}
      {showCatalog && <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[480px] max-h-[75%] bg-white/95 backdrop-blur border border-fuchsia-300 rounded-lg shadow-lg flex flex-col text-xs z-40"><div className="flex justify-between items-center px-3 py-2 bg-fuchsia-100 text-fuchsia-800 font-semibold text-[11px]"><span>Systems & Data</span><button onClick={()=>setShowCatalog(false)} className="px-2 py-0.5 bg-fuchsia-300 rounded" title="Close">✕</button></div><div className="flex-1 overflow-auto p-3 space-y-4"><section><h4 className="text-fuchsia-700 font-semibold mb-1">Systems</h4><div className="flex gap-2 mb-2"><input value={newSystem.id} onChange={e=>setNewSystem(s=>({...s,id:e.target.value}))} placeholder="id" className="border px-2 py-1 rounded w-20"/><input value={newSystem.name} onChange={e=>setNewSystem(s=>({...s,name:e.target.value}))} placeholder="Name" className="border px-2 py-1 rounded flex-1"/><button onClick={addSystem} className="px-3 py-1 bg-fuchsia-600 text-white rounded text-xs">Add</button></div><div className="flex flex-wrap gap-1">{systems.map(s=>(<span key={s.id} className="px-2 py-0.5 bg-fuchsia-100 text-fuchsia-700 rounded flex items-center gap-1">{s.id}<button onClick={()=>remSystem(s.id)} className="text-fuchsia-500 hover:text-fuchsia-800" title="Remove">✕</button></span>))}{!systems.length&&<span className="text-fuchsia-400">None</span>}</div></section><section><h4 className="text-fuchsia-700 font-semibold mb-1">Data</h4><div className="flex gap-2 mb-2"><input value={newData} onChange={e=>setNewData(e.target.value)} placeholder="Entity" className="border px-2 py-1 rounded flex-1"/><button onClick={addData} className="px-3 py-1 bg-fuchsia-600 text-white rounded text-xs">Add</button></div><div className="flex flex-wrap gap-1">{dataEntities.map(d=>(<span key={d} className="px-2 py-0.5 bg-fuchsia-100 text-fuchsia-700 rounded flex items-center gap-1">{d}<button onClick={()=>remData(d)} className="text-fuchsia-500 hover:text-fuchsia-800" title="Remove">✕</button></span>))}{!dataEntities.length&&<span className="text-fuchsia-400">None</span>}</div></section><section>{selected? <div className="space-y-3"><div><div className="text-[10px] uppercase text-fuchsia-500 font-semibold mb-1">Systems</div><div className="flex flex-wrap gap-1">{systems.map(s=>{const active=getTags('system').includes(s.id); return <button key={s.id} onClick={()=>toggleTag('system',s.id)} className={`px-2 py-0.5 rounded text-[11px] border ${active?'bg-fuchsia-600 text-white border-fuchsia-700':'bg-white text-fuchsia-700 hover:bg-fuchsia-50 border-fuchsia-300'}`}>{s.id}</button>;})}{!systems.length&&<span className="text-fuchsia-300">No systems</span>}</div></div><div><div className="text-[10px] uppercase text-fuchsia-500 font-semibold mb-1">Data</div><div className="flex flex-wrap gap-1">{dataEntities.map(d=>{const active=getTags('data').includes(d); return <button key={d} onClick={()=>toggleTag('data',d)} className={`px-2 py-0.5 rounded text-[11px] border ${active?'bg-fuchsia-600 text-white border-fuchsia-700':'bg-white text-fuchsia-700 hover:bg-fuchsia-50 border-fuchsia-300'}`}>{d}</button>;})}{!dataEntities.length&&<span className="text-fuchsia-300">No data</span>}</div></div><div className="text-[10px] text-fuchsia-500">Tags: systemTags / dataTags.</div></div> : <div className="text-fuchsia-400 text-[11px]">Select a Task to tag.</div>}</section></div></div>}
      {drag && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center text-gray-700 text-lg font-semibold pointer-events-none">Drop .bpmn / .xml file</div>}
    </div>
  </div>);
}
