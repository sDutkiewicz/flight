# User Guide: Flight BPMN Process Editor

This comprehensive guide will help you get started with the Flight BPMN Process Editor and learn how to effectively use all its features to document and analyze aviation processes.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Interface Overview](#interface-overview)
3. [Creating Diagrams](#creating-diagrams)
4. [Working with Systems and Data](#working-with-systems-and-data)
5. [Advanced Features](#advanced-features)
6. [Exporting and Sharing](#exporting-and-sharing)
7. [Tips and Best Practices](#tips-and-best-practices)
8. [Troubleshooting](#troubleshooting)

## Getting Started

### First-Time Setup

1. **Access the Application**
   - Open the application in a modern web browser
   - No login is required as data is stored locally in your browser

2. **Welcome Screen**
   - From the main screen, you can:
     - Create a new blank diagram
     - Choose a template
     - Open a previously saved diagram

3. **Browser Support**
   - For optimal experience, use Chrome, Firefox, Edge, or Safari
   - Enable local storage in your browser settings

### Application Layout

The editor is divided into several key areas:
- Top toolbar with main actions
- Left palette with BPMN elements
- Main canvas for diagram editing
- Right panel for properties and systems/data management

## Interface Overview

### Main Toolbar

The toolbar at the top of the screen provides access to the following functions:

- **New**: Start a new diagram
- **Templates**: Choose from pre-defined diagram templates
- **Open**: Import an existing BPMN file
- **Save**: Export the current diagram as a BPMN file
- **Export**: Access additional export options (SVG, PNG, PDF)
- **Systems & Data**: Open the systems and data management panel
- **Filter Controls**: Filter diagram elements by system or data entity

### BPMN Palette

The palette on the left side contains all available BPMN elements:

- **Events**: Start, intermediate, and end events
- **Activities**: Tasks, sub-processes
- **Gateways**: Decision points (exclusive, parallel, etc.)
- **Connecting Objects**: Sequence flows, associations
- **Artifacts**: Data objects, groups, annotations

### Canvas

The main working area where you create and edit your BPMN diagrams:

- **Pan**: Hold space + drag or middle mouse button
- **Zoom**: Use mouse wheel or pinch gesture
- **Select**: Click on elements
- **Move**: Drag selected elements
- **Resize**: Drag handles of selected elements
- **Connect**: Drag from one element to another

### Properties Panel

When an element is selected, the properties panel allows you to edit:

- Element name and description
- Associated systems
- Associated data entities
- Other BPMN-specific properties

## Creating Diagrams

### Starting a New Diagram

1. Click the "New" button in the toolbar
2. Choose between a blank diagram or a template
3. If selecting a template, choose one from the available options
4. The new diagram will appear in the canvas

### Adding Elements

1. Select an element type from the left palette
2. Click on the canvas where you want to place it, or
3. Drag from the palette to the desired position on the canvas

### Connecting Elements

1. Hover over the edge of a source element
2. Small connection points will appear
3. Click and drag from a connection point to the target element
4. Release to create the connection

### Editing Text

1. Select an element
2. Either:
   - Double-click to edit inline
   - Edit the name in the properties panel

### Organizing Your Diagram

1. **Moving Elements**:
   - Select one or multiple elements (hold Shift to select multiple)
   - Drag to reposition

2. **Aligning Elements**:
   - Select multiple elements
   - Right-click and choose alignment options

3. **Resizing**:
   - Select an element
   - Drag the handles to resize

## Working with Systems and Data

### Managing Systems

1. **Open Systems Panel**:
   - Click "Systems & Data" in the toolbar

2. **Add New System**:
   - Enter system ID (e.g., "DCS") and name (e.g., "Departure Control System")
   - Click "Add System"

3. **Edit System**:
   - Click on a system's name or ID to edit
   - Click "Save" to confirm changes

4. **Delete System**:
   - Click the "×" button next to a system

### Managing Data Entities

1. **Add Data Entity**:
   - Enter entity name (e.g., "Passenger")
   - Click "Add Data"

2. **Delete Data Entity**:
   - Click the "×" button next to an entity

### Tagging Tasks with Systems and Data

1. **Select a Task** in your diagram
2. Open the "Systems & Data" panel if not already open
3. **Tag with System**:
   - Click on a system name in the list
   - The system will be added to the task
4. **Tag with Data Entity**:
   - Click on a data entity name
   - The data entity will be added to the task
5. **Remove Tags**:
   - Click on a tag to toggle it off

### Filtering by System or Data Entity

1. Use the dropdown selectors in the toolbar to:
   - Select a system to filter tasks by that system
   - Select a data entity to filter tasks by that data entity
2. Only tasks tagged with the selected system/data will remain visible
3. Click "Clear" to reset filters and show all elements

## Advanced Features

### Process Templates

The application includes several aviation-specific templates:

1. **Passenger Check-In Process**:
   - Standard passenger processing workflow
   - Pre-configured with common systems

2. **Aircraft Turnaround**:
   - Complete aircraft servicing process
   - Includes all ground operations

3. **Baggage Handling**:
   - Baggage flow from check-in to claim
   - Integrated with security screening

### BPMN Linting

The editor includes automatic verification of your diagrams:

1. **Syntax Checking**:
   - Validates BPMN diagram structure
   - Identifies missing connections or elements

2. **Best Practice Validation**:
   - Suggests improvements to your diagram
   - Highlights potential issues

### Process Simulation

Visualize the flow through your process:

1. **Simulation Controls**:
   - Start/stop simulation
   - Adjust simulation speed

2. **Token Flow**:
   - Watch tokens move through the process
   - Identify bottlenecks and parallel paths

## Exporting and Sharing

### BPMN XML Export

1. Click "Save" in the toolbar
2. Choose a filename
3. The BPMN XML file will be downloaded

### Graphic Exports

1. Click "Export" in the toolbar
2. Choose from:
   - **SVG**: Vector format for web or documents
   - **PNG**: Raster image for presentations
   - **PDF**: Document format with additional options

### PDF Configuration

When exporting to PDF, you can configure:

1. **Paper Size**: A4, Letter, etc.
2. **Orientation**: Portrait or landscape
3. **Margins**: Adjust document margins
4. **Include Metadata**: Process name, author, date, etc.

## Tips and Best Practices

### Diagram Organization

1. **Use Lanes for Responsibilities**:
   - Organize tasks by role or department
   - Show clear handoffs between parties

2. **Group Related Elements**:
   - Use sub-processes for complex parts
   - Create logical sections with groups

3. **Clear Naming**:
   - Use verb-noun format for tasks
   - Be specific and consistent

### System Tagging Strategy

1. **Primary vs. Supporting Systems**:
   - Tag with primary system first
   - Add supporting systems as needed

2. **System Boundaries**:
   - Use system tags to identify integration points
   - Document where data crosses system boundaries

### Data Flow Documentation

1. **Data Entity Lifecycle**:
   - Tag tasks that create, read, update, or delete data
   - Show the complete lifecycle of key data entities

2. **Data Objects**:
   - Use BPMN data objects to show inputs and outputs
   - Connect to tasks with data associations

## Troubleshooting

### Common Issues

1. **Diagram Not Saving**:
   - Check browser storage permissions
   - Clear some browser storage if full

2. **Elements Not Connecting**:
   - Ensure you're dragging from connection points
   - Check if element types can be connected

3. **Performance Issues**:
   - Large diagrams may cause slowdown
   - Split into multiple diagrams if needed
   - Use sub-processes to simplify complex parts

### Data Recovery

1. **Browser Crash Recovery**:
   - The application auto-saves your work
   - Reopen the application to recover

2. **Version History**:
   - Use the "Recent" menu to access previous versions
   - Export important milestones regularly

### Getting Help

If you need assistance:
- Check the documentation
- Look for tooltips and helper text in the interface
- Contact support with specific questions

---

This user guide covers the basics to get you started with the Flight BPMN Process Editor. As you become more familiar with the tool, you'll discover additional features and workflows that can help you document and improve your aviation processes.
