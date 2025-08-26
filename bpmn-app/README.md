# BPMN Process Editor App

This directory contains the React application for the Flight BPMN Process Editor.

## Development

### Prerequisites

- Node.js (v16.0.0 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Starting the Development Server

```bash
npm run dev
```

The application will be available at http://localhost:5173 (or another port if 5173 is already in use).

### Building for Production

```bash
npm run build
```

The compiled application will be placed in the `dist/` directory.

### Running Linting

```bash
npm run lint
```

## Dependencies

This project uses:

- **React**: UI library
- **bpmn-js**: BPMN diagram modeling library
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Build tool
- **jsPDF & canvg**: For PDF and image exports

## Directory Structure

- `public/`: Static assets served as-is
- `src/`: Source code
  - `assets/`: Images and icons
  - `components/`: Reusable React components
  - `utils/`: Helper functions
  - `data/`: Default data and templates
  - `App.jsx`: Main application component
  - `BpmnEditorClean.jsx`: Core editor implementation
  - `index.css`: Global styles
  - `main.jsx`: Application entry point

## Key Features

- BPMN diagram creation and editing
- System and data entity tagging for tasks
- Filtering based on tagged properties
- Multiple export formats (BPMN XML, SVG, PNG, PDF)
- Template library
- Local storage persistence

For more detailed information, see the main [README.md](../README.md) in the project root.
