# ✈️ Flight BPMN Process Editor

![BPMN Process Editor](./screenshots/bpmn-editor.png)

## What is this project?

The Flight BPMN Process Editor is a specialized web application designed for aviation professionals, a## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.ort operators, and process analysts to model, document, and optimize operational processes within the aviation ecosystem. This tool allows you to create, edit, and export BPMN (Business Process Model and Notation) diagrams with a focus on flight operations, airport management, and related systems.

## Purpose & Applications

### For Aviation Operations
This editor helps aviation operations teams document and optimize critical workflows such as:
- Aircraft turnaround processes
- Passenger boarding and deplaning procedures
- Baggage handling operations
- Flight dispatch and preparation sequences
- Crew management and assignment workflows
- Maintenance scheduling and tracking

### For IT & Systems Integration
The system tagging feature allows IT teams and system architects to:
- Map which aviation systems (DCS, BHS, CRM, etc.) are involved in each process step
- Document data flows between different airport systems
- Identify integration points and dependencies
- Plan system upgrades with clear visualization of process impacts
- Track which data entities (Passenger, Flight, Baggage, etc.) are processed at each step

### For Compliance & Training
Process documentation created with this tool supports:
- Regulatory compliance documentation for aviation authorities
- Standard Operating Procedure (SOP) development
- Training material creation for ground staff and flight crew
- Process auditing and optimization
- Safety management system documentation

## 🚀 Features

- **Intuitive BPMN Diagram Editor**: User-friendly interface for creating and editing BPMN processes
- **System and Data Entity Tagging**: Tag tasks with related systems and data entities
- **Filtering**: Filter diagram elements based on system/data tags
- **Template Library**: Pre-configured templates to get started quickly
- **Export Options**: Export diagrams as BPMN XML, SVG, or PNG formats
- **PDF Export**: Generate professional PDF documentation from your diagrams
- **Local Storage**: Automatically saves your work in the browser's local storage
- **System & Data Catalogs**: Manage reusable system and data entity definitions

## 📷 Screenshots

### Main Editor Interface
![Main Editor](./screenshots/editor-interface.png)

### System and Data Entity Management
![Systems and Data](./screenshots/system-data-management.png)

### Export Options
![Export Options](./screenshots/export-options.png)

## 🛠️ Technology Stack

- **Frontend**: React 19
- **BPMN Modeling**: bpmn-js
- **Styling**: TailwindCSS 4
- **Build Tool**: Vite 7
- **Export Formats**: SVG, PNG (via Canvg), PDF (via jsPDF)
- **Linting**: ESLint with bpmnlint integration
- **Storage**: Browser LocalStorage API

## 🚦 Getting Started

### Prerequisites

- Node.js (v16.0.0 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sDutkiewicz/flight.git
   cd flight/bpmn-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```
   (or the port shown in your terminal)

## 🧰 Usage Guide

### Creating a New Diagram

1. Click on "New" to start with a blank diagram, or
2. Click on "Templates" to choose a pre-configured template

### Adding Elements

- Use the BPMN palette on the left side to add elements to your diagram
- Click on an element type and then click on the canvas to place it
- Connect elements by clicking and dragging from one element to another

### Tagging Tasks with Systems and Data

1. Click on a task in your diagram
2. Open the Systems/Data panel by clicking the "Systems & Data" button
3. Click on a system or data entity to tag the selected task
4. Tagged tasks will show the system/data references

### Filtering Elements

1. Use the dropdown selectors in the toolbar to filter elements by system or data entity
2. Only elements tagged with the selected system/data will remain visible
3. Click "Clear" to reset filters and show all elements

### Saving and Exporting

1. Click the "Save" button to download your diagram as a BPMN XML file
2. Click "Export" to access additional export options:
   - SVG: Vector graphics suitable for presentations
   - PNG: Raster image format
   - PDF: Document format with additional options

## 🧪 Development Notes

### Project Structure

- `src/`
  - `App.jsx`: Main application component
  - `BpmnEditorClean.jsx`: Core editor implementation
  - `assets/`: Static assets and icons
  - `components/`: Reusable UI components
  - `data/`: Default data and templates
  - `utils/`: Helper functions and utilities

### Building for Production

To create a production-ready build:

```bash
npm run build
```

The compiled files will be located in the `dist/` directory.

## � Technical Implementation Details

### System Architecture

The Flight BPMN Process Editor is built as a single-page application (SPA) using modern web technologies. The architecture focuses on:

1. **Front-End Only Operation**: The application runs entirely in the browser with no backend dependencies, making it easy to deploy and use without complex infrastructure.

2. **Modular Component Design**: The editor is composed of reusable React components that handle specific aspects of functionality:
   - BPMN modeling canvas
   - System and data entity management
   - Export functionality
   - Template library

3. **Persistent Storage**: The application uses browser localStorage to save:
   - System catalog definitions
   - Data entity definitions
   - Current diagram state
   - User preferences

### Key Technical Features

#### System Tagging Mechanism
The editor extends the standard BPMN format with custom properties:
- `systemTags`: Associates tasks with aviation/airport systems
- `dataTags`: Links tasks with specific data entities being processed

This tagging system enables:
- Filtering diagram elements based on system or data entity
- Understanding cross-system processes and data flows
- Identifying which systems are involved in different process steps

#### Visual Task Filtering
Tasks can be filtered by:
- Associated system (e.g., only show tasks involving the Departure Control System)
- Data entity (e.g., only show tasks that process Passenger data)

#### Integration Capabilities
The exported BPMN XML files:
- Maintain compatibility with standard BPMN tools
- Include custom extensions for aviation-specific metadata
- Can be imported back into the editor for further editing

## 📈 Use Cases & Workflows

### Process Documentation Workflow
1. **Create** a new BPMN diagram or start from a template
2. **Model** the operational process with appropriate BPMN elements
3. **Tag** tasks with relevant systems and data entities
4. **Document** additional details using annotations and text
5. **Export** as BPMN XML for storage in documentation systems
6. **Share** as PDF or images for presentations and reporting

### System Integration Analysis
1. **Model** the end-to-end process spanning multiple systems
2. **Tag** each task with the system that performs it
3. **Filter** by system to see each system's responsibilities
4. **Identify** integration points between systems
5. **Document** data exchange requirements at integration points

### Process Improvement Cycle
1. **Document** the current state process ("as-is")
2. **Analyze** inefficiencies and bottlenecks
3. **Design** improved process flows ("to-be")
4. **Compare** current and future states
5. **Implement** changes with clear documentation
6. **Monitor** process performance after changes

## �📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [bpmn.io](https://bpmn.io/) for their excellent BPMN modeling library
- [TailwindCSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vite](https://vitejs.dev/) for the blazing fast build tool

---

Created with ❤️ by [sDutkiewicz](https://github.com/sDutkiewicz)
