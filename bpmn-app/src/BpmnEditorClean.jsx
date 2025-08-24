import React, { useCallback, useEffect, useRef, useState } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import lintModule from 'bpmn-js-bpmnlint';
import jsPDF from 'jspdf';
import { Canvg } from 'canvg';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import './modal.css';
import './bpmn-custom.css';

export default function BpmnEditorClean(){
  const containerRef=useRef(null); const modelerRef=useRef(null); const fileRef=useRef(null);
  const [fileName,setFileName]=useState('diagram');
  const [issues,setIssues]=useState([]); const [showIssues,setShowIssues]=useState(false);
  const [showTemplates,setShowTemplates]=useState(false); const [showCatalog,setShowCatalog]=useState(false);
  const [showSaveOptions,setShowSaveOptions]=useState(false);
  const [drag,setDrag]=useState(false); const [selected,setSelected]=useState(null);
  const [systems,setSystems]=useState(()=>{try{return JSON.parse(localStorage.getItem('systemsCatalog')||'[]');}catch{return[]}});
  const [dataEntities,setDataEntities]=useState(()=>{try{return JSON.parse(localStorage.getItem('dataCatalog')||'[]');}catch{return[]}});
  const [newSystem,setNewSystem]=useState({id:'',name:''}); const [newData,setNewData]=useState('');
  const [filterSystem,setFilterSystem]=useState(''); const [filterData,setFilterData]=useState('');
  const [colorize,setColorize]=useState(false);

  useEffect(()=>{ if(!systems.length){const seed=[{id:'DCS',name:'Departure Control'},{id:'CRM',name:'CRM'},{id:'BHS',name:'Baggage Handling'},{id:'SEC',name:'Security'},{id:'FUEL',name:'Fuel Ops'}]; setSystems(seed); localStorage.setItem('systemsCatalog',JSON.stringify(seed));} if(!dataEntities.length){const d=['Passenger','Booking','BagTag','Flight','Gate']; setDataEntities(d); localStorage.setItem('dataCatalog',JSON.stringify(d));}},[]);

  const templates=[
    {id:'checkin',name:'Check-in',xml:`<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" targetNamespace="http://bpmn.io/schema/bpmn"><bpmn:process id="CheckIn" isExecutable="false"><bpmn:startEvent id="Start" name="Start"/><bpmn:task id="T1" name="Select Flight"/><bpmn:task id="T2" name="Provide Docs"/><bpmn:endEvent id="End" name="End"/><bpmn:sequenceFlow id="f1" sourceRef="Start" targetRef="T1"/><bpmn:sequenceFlow id="f2" sourceRef="T1" targetRef="T2"/><bpmn:sequenceFlow id="f3" sourceRef="T2" targetRef="End"/></bpmn:process></bpmn:definitions>`},
    {id:'security',name:'Security Flow',xml:`<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" targetNamespace="http://bpmn.io/schema/bpmn"><bpmn:process id="Security" isExecutable="false"><bpmn:startEvent id="S1" name="Arrival"/><bpmn:task id="BagScan" name="Bag Scan"/><bpmn:exclusiveGateway id="G1" name="Clear?"/><bpmn:task id="Manual" name="Manual Inspection"/><bpmn:endEvent id="Done" name="Cleared"/><bpmn:sequenceFlow id="sf1" sourceRef="S1" targetRef="BagScan"/><bpmn:sequenceFlow id="sf2" sourceRef="BagScan" targetRef="G1"/><bpmn:sequenceFlow id="sf3" sourceRef="G1" targetRef="Done"/><bpmn:sequenceFlow id="sf4" sourceRef="G1" targetRef="Manual"/><bpmn:sequenceFlow id="sf5" sourceRef="Manual" targetRef="Done"/></bpmn:process></bpmn:definitions>`},
    {id:'skeleton',name:'Empty Skeleton',xml:`<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" targetNamespace="http://bpmn.io/schema/bpmn"><bpmn:process id="Process_${Date.now()}" isExecutable="false"><bpmn:startEvent id="StartEvent_1"/><bpmn:endEvent id="EndEvent_1"/><bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="EndEvent_1"/></bpmn:process></bpmn:definitions>`}
  ];

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
      // Activate linting overlay (shows badges) if available
      try {
        const linting = m.get('linting');
        if (linting && linting.toggle && !linting._active) linting.toggle();
      } catch {}
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
  const newDiagram=async()=>{
    // Poprawiony XML z elementem bpmndi:BPMNDiagram
    const processId = `Process_${Date.now()}`;
    const empty = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_${Date.now()}" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="${processId}" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${processId}">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

    try {
      console.log("Tworzenie nowego diagramu...");
      await modelerRef.current.importXML(empty);
      modelerRef.current.get('canvas').zoom('fit-viewport');
      localStorage.setItem('diagram', empty);
      setFileName('diagram');
      runLint();
      console.log("Nowy diagram utworzony pomyślnie");
    } catch(error) {
      console.error("Błąd tworzenia nowego diagramu:", error);
      alert('Tworzenie nowego diagramu nie powiodło się');
    }
  };
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
  const loadTemplate = async t => { 
    if(!t) return; 
    try {
      console.log('Loading template:', t.name);
      await modelerRef.current.importXML(t.xml); 
      modelerRef.current.get('canvas').zoom('fit-viewport'); 
      localStorage.setItem('diagram', t.xml); 
      setFileName(t.id); 
      runLint(); 
      setShowTemplates(false);
      console.log('Template loaded successfully');
    } catch(err) {
      console.error('Template error:', err);
      alert('Template error: ' + (err.message || String(err)));
    }
  };
  
  // Dodajmy funkcje do debugowania
  const toggleTemplates = () => {
    console.log('Toggle Templates clicked');
    setShowTemplates(prev => {
      const newState = !prev;
      console.log('Templates visibility changing to:', newState);
      return newState;
    });
  };
  
  const toggleCatalog = () => {
    console.log('Toggle Catalog clicked');
    setShowCatalog(prev => {
      const newState = !prev;
      console.log('Catalog visibility changing to:', newState);
      return newState;
    });
  };
  
  const toggleSaveOptions = () => {
    console.log('Toggle Save Options clicked');
    setShowSaveOptions(prev => {
      const newState = !prev;
      console.log('Save Options visibility changing to:', newState);
      return newState;
    });
  };

  const exportSVG=async()=>{ try{ const {svg}=await modelerRef.current.saveSVG(); const blob=new Blob([svg],{type:'image/svg+xml'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${fileName}.svg`; a.click(); URL.revokeObjectURL(url);}catch{alert('SVG export failed')}};
  const exportPNG=async()=>{ try{ const {svg}=await modelerRef.current.saveSVG(); const c=document.createElement('canvas'); const ctx=c.getContext('2d'); const v=await Canvg.from(ctx,svg); await v.render(); c.toBlob(b=>{ if(!b)return; const url=URL.createObjectURL(b); const a=document.createElement('a'); a.href=url; a.download=`${fileName}.png`; a.click(); URL.revokeObjectURL(url); });}catch{alert('PNG export failed')}};
  const exportPDF=async()=>{ try{ const {svg}=await modelerRef.current.saveSVG(); const pdf=new jsPDF({orientation:'landscape',unit:'pt',format:'a4'}); const c=document.createElement('canvas'); const ctx=c.getContext('2d'); const v=await Canvg.from(ctx,svg); await v.render(); const img=c.toDataURL('image/png'); pdf.addImage(img,'PNG',20,20,pdf.internal.pageSize.getWidth()-40,pdf.internal.pageSize.getHeight()-40); pdf.save(`${fileName}.pdf`);}catch{alert('PDF export failed')}};
  const exportCSV=()=>{ try{ const reg=modelerRef.current.get('elementRegistry'); const rows=['id;name;systems;data']; reg.getAll().forEach(el=>{ const bo=el.businessObject; if(bo&&/Task$/.test(bo.$type)){ rows.push(`${bo.id};${(bo.name||'').replace(/;/g,',')};${bo.get('systemTags')||''};${bo.get('dataTags')||''}`); }}); const blob=new Blob([rows.join('\n')],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${fileName}_report.csv`; a.click(); URL.revokeObjectURL(url);}catch{alert('CSV export failed')}};
  const focus=id=>{ try{const el=modelerRef.current.get('elementRegistry').get(id); if(el){modelerRef.current.get('selection').select(el); modelerRef.current.get('canvas').scrollToElement(el);} }catch{} };

  useEffect(() => {
    if (!modelerRef.current) return;
    const reg = modelerRef.current.get('elementRegistry');
    const canvas = modelerRef.current.get('canvas');
  // Build color index map for systems so stroke color stable
  const colorIndex = new Map();
  systems.forEach((s,i)=>colorIndex.set(s.id, i % 10));
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
    if (first) gfx.setAttribute('data-system-color', String(colorIndex.get(first) ?? 0));
        else gfx.removeAttribute('data-system-color');
      } else {
        gfx.removeAttribute('data-system-color');
      }
    });
  }, [filterSystem, filterData, colorize, selected, systems, dataEntities]);

  const H=60;
  return (<div className="h-screen w-full overflow-hidden flex flex-col bg-white" style={{paddingTop:H}}>
    <div className="fixed top-0 left-0 right-0 h-[60px] flex items-center flex-wrap gap-2 px-4 z-[9000] bg-neutral-900/90 backdrop-blur border-b border-white/10 shadow-lg">
      <span className="text-lg font-semibold text-white tracking-wide mr-2">Process Studio</span>
      <button onClick={newDiagram} className="btn btn-secondary text-xs" title="New">🆕</button>
      <button onClick={()=>fileRef.current?.click()} className="btn btn-secondary text-xs" title="Open">📂</button>
      <input ref={fileRef} type="file" accept=".bpmn,.xml" onChange={openFile} className="hidden" />
      <button onClick={toggleSaveOptions} className="btn btn-primary text-xs" title="Save Options">💾 Zapisz</button>
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
  <button onClick={toggleTemplates} className={`btn ${showTemplates ? 'btn-success' : 'btn-primary'} text-xs`} title="Templates">📦 Templates</button>
  <button onClick={toggleCatalog} className={`btn ${showCatalog ? 'btn-success' : 'btn-primary'} text-xs`} title="Catalog">🗂 Catalog</button>
      <button onClick={exportSVG} className="btn btn-secondary text-xs" title="SVG">🧬</button>
      <button onClick={exportPNG} className="btn btn-secondary text-xs" title="PNG">🖼</button>
      <button onClick={exportPDF} className="btn btn-secondary text-xs" title="PDF">📄</button>
    </div>
    <div ref={containerRef} onDragOver={e=>{e.preventDefault(); setDrag(true);}} onDragLeave={e=>{e.preventDefault(); setDrag(false);}} onDrop={async e=>{e.preventDefault(); setDrag(false); const f=e.dataTransfer.files?.[0]; if(!f)return; if(!/\.(bpmn|xml)$/i.test(f.name)){alert('Not BPMN');return;} const txt=await f.text(); try{await modelerRef.current.importXML(txt); modelerRef.current.get('canvas').zoom('fit-viewport'); localStorage.setItem('diagram',txt); setFileName(f.name.replace(/\.bpmn$/i,'').replace(/\.xml$/i,'')); runLint();}catch{alert('Import failed')}}} className={`flex-1 relative border border-gray-400/40 rounded-lg overflow-hidden w-full ${drag?'ring-4 ring-blue-400 ring-offset-2':''}`} style={{minHeight:0}}>
      {drag && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center text-gray-700 text-lg font-semibold pointer-events-none">Drop .bpmn / .xml file</div>}
    </div>

    {/* Issues Panel */}
    {showIssues && (
      <div className="fixed bottom-4 right-4 max-h-60 w-72 bg-white backdrop-blur border border-amber-300 rounded-lg shadow-lg overflow-auto text-xs z-[9999]">
        <div className="sticky top-0 bg-amber-100 px-2 py-1 font-semibold text-amber-800 flex justify-between items-center text-[11px]">
          <span>Issues ({issues.length})</span>
          <div className="flex gap-1">
            <button onClick={runLint} className="bg-amber-500 text-white px-2 py-0.5 rounded" title="Refresh">↻</button>
            <button onClick={()=>setShowIssues(false)} className="bg-amber-300 text-amber-800 px-2 py-0.5 rounded" title="Close">✕</button>
          </div>
        </div>
        {issues.length===0 && <div className="p-2 text-green-600">No issues 🎉</div>}
        {issues.map((iss,i)=>(
          <button key={i} onClick={()=>focus(iss.elementId)} className={`block w-full text-left px-2 py-1 border-b last:border-b-0 hover:bg-amber-50 ${iss.level==='errors'?'text-red-600':'text-amber-700'}`} title={iss.id}>
            <span className="font-medium">[{iss.level==='errors'?'ERR':'WARN'}]</span> {iss.message}
            <div className="text-[10px] opacity-70">{iss.elementId}</div>
          </button>
        ))}
      </div>
    )}

    {/* Templates Modal with Backdrop - Redesigned */}
    {showTemplates && (
      <>
        <div className="modal-backdrop" onClick={toggleTemplates}></div>
        <div className="modal-container templates-modal">
          <div className="modal-header">
            <h2>Szablony procesów</h2>
            <button onClick={toggleTemplates} className="modal-close-btn">×</button>
          </div>
          <div className="modal-body">
            <p className="mb-3 text-gray-600 text-sm">Wybierz jeden z gotowych szablonów procesów aby rozpocząć modelowanie:</p>
            {templates.map(t=>(
              <div key={t.id} onClick={()=>loadTemplate(t)} className="template-item">
                <div className="template-name">{t.name}</div>
                <div className="template-id">ID: {t.id}</div>
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <small>Wybrany szablon zastąpi aktualny diagram. Upewnij się, że zapisałeś bieżącą pracę.</small>
          </div>
        </div>
      </>
    )}

    {/* Catalog Modal with Backdrop - Redesigned */}
    {showCatalog && (
      <>
        <div className="modal-backdrop" onClick={toggleCatalog}></div>
        <div className="modal-container catalog-modal">
          <div className="modal-header">
            <h2>Katalog systemów i encji danych</h2>
            <button onClick={toggleCatalog} className="modal-close-btn">×</button>
          </div>
          <div className="modal-body">
            <section className="catalog-section">
              <h4 className="catalog-section-title">Systemy</h4>
              <div className="input-group">
                <input value={newSystem.id} onChange={e=>setNewSystem(s=>({...s,id:e.target.value}))} 
                       placeholder="Identyfikator" className="input-field w-24"/>
                <input value={newSystem.name} onChange={e=>setNewSystem(s=>({...s,name:e.target.value}))} 
                       placeholder="Nazwa systemu" className="input-field flex-1"/>
                <button onClick={addSystem} className="btn btn-blue">Dodaj</button>
              </div>
              <div className="tag-container">
                {systems.map(s=>(
                  <div key={s.id} className="tag">
                    <span>{s.id}</span>
                    <span className="tag-remove" onClick={()=>remSystem(s.id)} title="Usuń">×</span>
                  </div>
                ))}
                {!systems.length && <div className="empty-placeholder">Brak zdefiniowanych systemów</div>}
              </div>
            </section>
            
            <section className="catalog-section">
              <h4 className="catalog-section-title">Encje danych</h4>
              <div className="input-group">
                <input value={newData} onChange={e=>setNewData(e.target.value)} 
                       placeholder="Nazwa encji danych" className="input-field flex-1"/>
                <button onClick={addData} className="btn btn-blue">Dodaj</button>
              </div>
              <div className="tag-container">
                {dataEntities.map(d=>(
                  <div key={d} className="tag">
                    <span>{d}</span>
                    <span className="tag-remove" onClick={()=>remData(d)} title="Usuń">×</span>
                  </div>
                ))}
                {!dataEntities.length && <div className="empty-placeholder">Brak zdefiniowanych encji danych</div>}
              </div>
            </section>
            
            {selected ? (
              <section className="catalog-section">
                <h4 className="catalog-section-title">Tagowanie wybranego elementu</h4>
                <div className="task-tagging-section">
                  <div className="mb-3">
                    <div className="text-xs font-semibold mb-1 text-gray-700">Systemy powiązane z zadaniem:</div>
                    <div className="tag-selection">
                      {systems.map(s=>{
                        const active=getTags('system').includes(s.id);
                        return (
                          <button key={s.id} onClick={()=>toggleTag('system',s.id)} 
                                 className={`tag-btn ${active ? 'tag-btn-active' : 'tag-btn-inactive'}`}>
                            {s.id}
                          </button>
                        );
                      })}
                      {!systems.length && <span className="text-gray-400">Brak systemów</span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-1 text-gray-700">Encje danych powiązane z zadaniem:</div>
                    <div className="tag-selection">
                      {dataEntities.map(d=>{
                        const active=getTags('data').includes(d);
                        return (
                          <button key={d} onClick={()=>toggleTag('data',d)} 
                                 className={`tag-btn ${active ? 'tag-btn-active' : 'tag-btn-inactive'}`}>
                            {d}
                          </button>
                        );
                      })}
                      {!dataEntities.length && <span className="text-gray-400">Brak encji danych</span>}
                    </div>
                  </div>
                </div>
                <div className="info-box mt-2">
                  Oznaczanie zadań systemami i danymi pozwala na analizę przepływów informacji między systemami oraz identyfikację przetwarzanych danych.
                </div>
              </section>
            ) : (
              <div className="empty-placeholder mt-4">
                Wybierz zadanie (Task) w diagramie, aby przypisać mu tagi systemów i danych.
              </div>
            )}
          </div>
        </div>
      </>
    )}
    
    {/* Save Options Modal with Backdrop */}
    {showSaveOptions && (
      <>
        <div className="modal-backdrop" onClick={toggleSaveOptions}></div>
        <div className="modal-container save-options-modal">
          <div className="modal-header">
            <h2>Zapisz diagram</h2>
            <button onClick={toggleSaveOptions} className="modal-close-btn">×</button>
          </div>
          <div className="modal-body">
            <div className="save-option" onClick={() => { save(); toggleSaveOptions(); }}>
              <div className="save-option-icon">📄</div>
              <div className="save-option-content">
                <div className="save-option-title">BPMN (.bpmn)</div>
                <div className="save-option-desc">Standardowy format XML dla diagramów procesów biznesowych</div>
              </div>
            </div>
            
            <div className="save-option" onClick={() => { exportSVG(); toggleSaveOptions(); }}>
              <div className="save-option-icon">🧬</div>
              <div className="save-option-content">
                <div className="save-option-title">SVG (.svg)</div>
                <div className="save-option-desc">Wektorowy format graficzny, idealny do umieszczenia w dokumentacji</div>
              </div>
            </div>
            
            <div className="save-option" onClick={() => { exportPNG(); toggleSaveOptions(); }}>
              <div className="save-option-icon">🖼️</div>
              <div className="save-option-content">
                <div className="save-option-title">PNG (.png)</div>
                <div className="save-option-desc">Rastrowy format graficzny z przezroczystością</div>
              </div>
            </div>
            
            <div className="save-option" onClick={() => { exportPDF(); toggleSaveOptions(); }}>
              <div className="save-option-icon">📕</div>
              <div className="save-option-content">
                <div className="save-option-title">PDF (.pdf)</div>
                <div className="save-option-desc">Format dokumentu, dobry do drukowania i udostępniania</div>
              </div>
            </div>
            
            <div className="save-option" onClick={() => { exportCSV(); toggleSaveOptions(); }}>
              <div className="save-option-icon">📊</div>
              <div className="save-option-content">
                <div className="save-option-title">Raport CSV (.csv)</div>
                <div className="save-option-desc">Eksport zadań i ich tagów do pliku CSV</div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <small>Pliki będą zapisane z nazwą: {fileName}</small>
          </div>
        </div>
      </>
    )}
  </div>);
}
