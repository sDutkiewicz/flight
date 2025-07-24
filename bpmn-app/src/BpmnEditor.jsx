import React, { useEffect, useRef } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import jsPDF from 'jspdf';

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

  // 📥 Zapisz diagram jako .bpmn (XML)
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

  // 📤 Wczytaj plik .bpmn z dysku
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

  // 📄 Eksport do PDF (zrzut diagramu)
  const handleExportPDF = async () => {
    try {
      const svg = await modelerRef.current.saveSVG();
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
      });

      const svgBlob = new Blob([svg.svg], { type: 'image/svg+xml' });
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
    <div>
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          💾 Zapisz diagram
        </button>

        <label className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          📤 Wczytaj diagram
          <input
            type="file"
            accept=".bpmn,.xml"
            onChange={handleOpen}
            className="hidden"
          />
        </label>

        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          📄 Eksportuj do PDF
        </button>
      </div>

      <div className="w-full h-[80vh] border" ref={canvasRef}></div>
    </div>
  );
}
