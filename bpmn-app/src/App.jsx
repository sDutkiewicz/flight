import BpmnEditorClean from './BpmnEditorClean';

function App() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-white flex items-center gap-3">
        <span className="text-4xl">✈️</span> 
        Flight BPMN Process Editor
        <span className="text-sm bg-blue-600 text-white px-2 py-1 rounded-full ml-3">v1.0</span>
      </h1>
      <BpmnEditorClean />
    </div>
  );
}

export default App;
