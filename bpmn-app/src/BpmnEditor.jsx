import React, { useEffect, useRef, useState } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import jsPDF from 'jspdf';
import { Canvg } from 'canvg';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

export default function BpmnEditor() {
  const containerRef = useRef(null);
  const modelerRef = useRef(null);
  const [fileName, setFileName] = useState('diagram');

  useEffect(() => {
    const modeler = new BpmnModeler({
      container: containerRef.current,
    });
    modelerRef.current = modeler;

    const emptyDiagram = `<?xml version="1.0" encoding="UTF-8"?>
      <bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
        xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
        xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
        targetNamespace="http://bpmn.io/schema/bpmn">
        <bpmn:process id="Process_1" isExecutable="false"/>
        <bpmndi:BPMNDiagram id="BPMNDiagram_1">
          <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1"/>
        </bpmndi:BPMNDiagram>
      </bpmn:definitions>`;

    const saved = localStorage.getItem('diagram');
    modeler
      .importXML(saved || emptyDiagram)
      .then(() => {
        const canvas = modeler.get('canvas');
        setTimeout(() => canvas.zoom('fit-viewport'), 50);
      })
      .catch(console.error);

    // Autosave przy każdej zmianie
    modeler.on('commandStack.changed', async () => {
      const { xml } = await modeler.saveXML({ format: true });
      localStorage.setItem('diagram', xml);
    });

    // Obsługa zmiany rozmiaru okna
    const handleResize = () => {
      const canvas = modeler.get('canvas');
      canvas.resized();
      canvas.zoom('fit-viewport');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSave = async () => {
    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      let base = (fileName || 'diagram').trim();
      if (!base.toLowerCase().endsWith('.bpmn')) base += '.bpmn';

      // Jeśli dostępne nowoczesne API zapisu (Chrome / Edge / Opera itp.)
      if (window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: base,
            types: [
              {
                description: 'BPMN Diagram',
                accept: { 'application/xml': ['.bpmn'] }
              }
            ]
          });
          const writable = await handle.createWritable();
          await writable.write(xml);
          await writable.close();
        } catch (pickerErr) {
          if (pickerErr?.name !== 'AbortError') {
            console.warn('Błąd API showSaveFilePicker, używam pobierania anchor.', pickerErr);
            const blob = new Blob([xml], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = base;
            a.click();
            URL.revokeObjectURL(url);
          }
        }
      } else {
        // Fallback klasyczny - przeglądarka zapyta tylko o folder (wg ustawień) albo zapisze w Domyślne Pobrane
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = base;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Błąd zapisu diagramu:', err);
    }
  };

  const handleOpen = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      await modelerRef.current.importXML(text);
      modelerRef.current.get('canvas').zoom('fit-viewport');
      localStorage.setItem('diagram', text);
    } catch (err) {
      console.error('Błąd wczytywania diagramu:', err);
    }
  };

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
      console.error('Błąd eksportu PDF:', err);
    }
  };

  // Zoom In
  const handleZoomIn = () => {
    const canvas = modelerRef.current.get('canvas');
    const currentZoom = canvas.zoom();
    canvas.zoom(currentZoom + 0.1);
  };

  // Zoom Out
  const handleZoomOut = () => {
    const canvas = modelerRef.current.get('canvas');
    const currentZoom = canvas.zoom();
    canvas.zoom(Math.max(currentZoom - 0.1, 0.2)); // minimalne powiększenie
  };

  // Reset View
  const handleResetView = () => {
    modelerRef.current.get('canvas').zoom('fit-viewport');
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gray-50">
      <div className="flex justify-between items-center mb-4 px-4 py-2 max-w-[1920px] mx-auto w-full gap-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Nazwa pliku"
            className="px-3 py-2 border border-gray-300 rounded w-40 focus:outline-none focus:ring focus:ring-blue-300 text-sm"
          />
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white 
                       rounded-lg shadow hover:from-blue-700 hover:to-blue-600 transition 
                       border border-gray-400"
          >
            💾 Zapisz .bpmn
          </button>
        </div>

        <label className="cursor-pointer bg-gradient-to-r from-green-600 to-green-500 
                         text-white px-6 py-2 rounded-lg shadow 
                         hover:from-green-700 hover:to-green-600 transition 
                         border border-gray-400">
          📤 Wczytaj diagram
          <input
            type="file"
            accept=".bpmn,.xml"
            onChange={handleOpen}
            className="hidden"
          />
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white 
                       rounded-lg shadow hover:from-purple-700 hover:to-purple-600 transition 
                       border border-gray-400"
          >
            📄 Eksportuj do PDF
          </button>
          <button onClick={handleZoomIn} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            🔍 Zoom In
          </button>
          <button onClick={handleZoomOut} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            🔎 Zoom Out
          </button>
          <button onClick={handleResetView} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            ♻ Reset
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 border border-gray-400 rounded-lg overflow-hidden max-w-[1920px] mx-auto w-full"
      ></div>
    </div>
  );
}
