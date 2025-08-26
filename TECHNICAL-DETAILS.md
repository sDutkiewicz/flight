# Technical Documentation: Flight BPMN Process Editor

This document provides detailed technical information about the Flight BPMN Process Editor, including its architecture, component structure, data flow, and implementation details.

## System Architecture

### Overview

The Flight BPMN Process Editor is a client-side web application built with React that allows users to create, edit, and analyze BPMN diagrams for flight and airport operations. The application is built as a single-page application (SPA) with no server-side components, making it lightweight and easy to deploy.

```
┌─────────────────────────────────────────────────────────┐
│                     React Application                    │
├─────────────┬─────────────────────────┬─────────────────┤
│  BPMN-JS    │    UI Components        │  Storage Layer  │
│  Library    │                         │                 │
├─────────────┼─────────────────────────┼─────────────────┤
│ XML Parsing │ - Toolbar               │ - LocalStorage  │
│ Rendering   │ - Property Panel        │ - File Export   │
│ Interaction │ - System/Data Manager   │ - File Import   │
└─────────────┴─────────────────────────┴─────────────────┘
```

### Key Components

1. **BPMN Modeling Core**
   - Uses bpmn-js library for rendering and manipulating BPMN diagrams
   - Extends the standard BPMN format with custom attributes for aviation systems
   - Handles diagram interactions (add, edit, delete elements)

2. **User Interface Layer**
   - React components for application UI
   - Modal dialogs for template selection and exports
   - System and data entity management panels
   - Responsive design with Tailwind CSS

3. **Data Storage Layer**
   - Browser's LocalStorage for persisting system and data catalogs
   - File system integration for import/export
   - PDF and image generation for documentation

## Data Model

### Core Entities

1. **BPMN Diagram**
   - Standard BPMN 2.0 XML structure
   - Custom extensions for aviation-specific metadata

2. **System Catalog**
   - Collection of systems used in the organization
   - Each system has:
     - `id`: Short identifier (e.g., "DCS")
     - `name`: Descriptive name (e.g., "Departure Control System")

3. **Data Entity Catalog**
   - Collection of data entities used across systems
   - Simple string identifiers (e.g., "Passenger", "Flight", "Baggage")

### Custom BPMN Extensions

The application extends standard BPMN elements with custom attributes:

```xml
<bpmn:task id="Task_1">
  <bpmn:extensionElements>
    <custom:systemTags>DCS,BHS</custom:systemTags>
    <custom:dataTags>Passenger,Baggage</custom:dataTags>
  </bpmn:extensionElements>
  <bpmn:name>Check-in Passenger</bpmn:name>
</bpmn:task>
```

## Implementation Details

### BPMN-JS Integration

The application uses bpmn-js as its core modeling library:

1. **Initialization**
   - Creates a new BpmnModeler instance
   - Configures additional modules like linting
   - Sets up event listeners for element selection and changes

2. **Custom Modules**
   - Extends the property panel with system tagging options
   - Implements custom rendering for tagged elements
   - Adds filtering capabilities based on tags

### State Management

The application uses React's useState and useEffect hooks for state management:

1. **Core State**
   - BPMN diagram XML
   - Selected element
   - UI visibility controls (panels, modals)

2. **Catalog State**
   - System definitions
   - Data entity definitions

3. **Filter State**
   - Active system filter
   - Active data entity filter

### LocalStorage Integration

The application persists several types of data in localStorage:

1. **System Catalog**
   - Stored as JSON under "systemsCatalog" key
   - Loaded on application startup
   - Updated when systems are added or modified

2. **Data Entity Catalog**
   - Stored as JSON under "dataCatalog" key
   - Managed similar to system catalog

3. **Last Edited Diagram**
   - Stored as XML under "diagram" key
   - Auto-saved when changes are made
   - Restored on application startup

### Export Functionality

The application supports multiple export formats:

1. **BPMN XML**
   - Native format using bpmn-js saveXML method
   - Preserves all metadata including custom extensions

2. **SVG**
   - Vector representation using bpmn-js saveSVG method
   - Good for embedding in documents

3. **PNG**
   - Raster image created by rendering SVG to canvas
   - Uses Canvg library for conversion

4. **PDF**
   - Document format created with jsPDF
   - Embeds the SVG diagram
   - Includes metadata and title

## Performance Considerations

1. **Rendering Optimization**
   - BPMN diagrams can become complex
   - Uses efficient DOM updates via bpmn-js
   - Implements debounced updates for filtering

2. **Memory Management**
   - Cleans up resources when unmounting components
   - Avoids memory leaks with proper useEffect cleanup

3. **LocalStorage Limits**
   - Aware of browser storage limits (typically 5-10MB)
   - Implements graceful fallbacks if limits are reached

## Browser Compatibility

The application is designed to work with modern browsers:

- Chrome 60+
- Firefox 60+
- Edge 79+
- Safari 12+

Legacy browser support is not a priority due to the modern tooling and ES6+ features used throughout the codebase.

## Future Enhancements

1. **Cloud Synchronization**
   - Optional backend for diagram storage
   - User accounts and sharing capabilities

2. **Collaborative Editing**
   - Real-time collaboration features
   - Comments and review functionality

3. **Advanced Analytics**
   - Process metrics and statistics
   - Performance bottleneck identification

4. **Mobile Support**
   - Responsive design for tablet use
   - Touch-friendly interactions

## Development Guidelines

1. **Code Organization**
   - Follow component-based architecture
   - Separate business logic from UI components
   - Use custom hooks for shared functionality

2. **Performance Practices**
   - Memoize expensive computations
   - Use React.memo for pure components
   - Implement virtualization for large lists

3. **Testing Strategy**
   - Unit tests for utility functions
   - Component tests with React Testing Library
   - Integration tests for core workflows
