import React, { useEffect, useRef } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import jsPDF from 'jspdf';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

export default function BpmnEditor() {
  const containerRef = useRef(null);
  const modelerRef = useRef(null);

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
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.bpmn';
      a.click();
      URL.revokeObjectURL(url);
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

      // Konwersja SVG -> Canvas -> PNG
      const img = new Image();
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 1000;
        canvas.height = img.height || 700;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        const pngData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        pdf.addImage(pngData, 'PNG', 20, 20, 800, 550);
        pdf.save('diagram.pdf');
      };

      img.src = url;
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
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white 
                     rounded-lg shadow hover:from-blue-700 hover:to-blue-600 transition 
                     border border-gray-400"
        >
          💾 Zapisz diagram
        </button>

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
