import React, { useEffect, useRef } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import jsPDF from 'jspdf';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';

export default function BpmnEditor() {
  const canvasRef = useRef(null);
  const modelerRef = useRef(null);

  useEffect(() => {
    modelerRef.current = new BpmnModeler({
      container: canvasRef.current,
    });

    modelerRef.current.createDiagram();

    return () => {
      modelerRef.current.destroy();
    };
  }, []);

  // 📥 Zapisz diagram jako .bpmn
  const handleSave = async () => {
    try {
      const result = await modelerRef.current.saveXML({ format: true });
      const blob = new Blob([result.xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.bpmn';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Błąd zapisu:', err);
    }
  };

  // 📤 Wczytaj plik .bpmn
  const handleOpen = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await modelerRef.current.importXML(reader.result);
      } catch (err) {
        console.error('Błąd importu:', err);
      }
    };
    reader.readAsText(file);
  };

  // 📄 Eksportuj do PDF
  const handleExportPDF = async () => {
    try {
      const { svg } = await modelerRef.current.saveSVG();
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

      const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        pdf.addImage(img, 'PNG', 20, 20, 800, 550);
        pdf.save('diagram.pdf');
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (err) {
      console.error('Błąd eksportu PDF:', err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap gap-4 mb-6 items-center bg-gray-100 p-4 rounded-lg shadow-sm border">
        <button onClick={handleSave} className="btn btn-blue">
          💾 Zapisz diagram
        </button>

        <label className="btn btn-green cursor-pointer">
          📤 Wczytaj diagram
          <input type="file" accept=".bpmn,.xml" onChange={handleOpen} className="hidden" />
        </label>

        <button onClick={handleExportPDF} className="btn btn-purple">
          📄 Eksportuj do PDF
        </button>
      </div>

      <div className="w-full h-[80vh] border rounded-md" ref={canvasRef}></div>
    </div>
  );
}
