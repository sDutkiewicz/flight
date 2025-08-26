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

export default function BpmnEditorClean() {
  const containerRef = useRef(null);
  const modelerRef = useRef(null);
  const fileRef = useRef(null);
  const [fileName, setFileName] = useState('diagram');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [drag, setDrag] = useState(false);
  const [selected, setSelected] = useState(null);
  const [systems, setSystems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('systemsCatalog') || '[]');
    } catch {
      return [];
    }
  });
  const [dataEntities, setDataEntities] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dataCatalog') || '[]');
    } catch {
      return [];
    }
  });
  const [newSystem, setNewSystem] = useState({id: '', name: ''});
  const [newData, setNewData] = useState('');
  const [filterSystem, setFilterSystem] = useState('');
  const [filterData, setFilterData] = useState('');

  useEffect(() => {
    if (!systems.length) {
      const seed = [
        { id: 'DCS', name: 'Departure Control' },
        { id: 'CRM', name: 'CRM' },
        { id: 'BHS', name: 'Baggage Handling' },
        { id: 'SEC', name: 'Security' },
        { id: 'FUEL', name: 'Fuel Ops' }
      ];
      setSystems(seed);
      localStorage.setItem('systemsCatalog', JSON.stringify(seed));
    }
    
    if (!dataEntities.length) {
      const d = ['Passenger', 'Booking', 'BagTag', 'Flight', 'Gate', 'Payment'];
      setDataEntities(d);
      localStorage.setItem('dataCatalog', JSON.stringify(d));
    }
    
    // This will run once when the component mounts
    console.log('Systems and data entities initialized');
  }, []);

  const templates=[
    {
      id:'empty_process', 
      name:'Empty Process', 
      xml:`<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_${Date.now()}" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_${Date.now()}" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Start" />
    <bpmn:endEvent id="EndEvent_1" name="End" />
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_${Date.now()}">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="155" y="145" width="30" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="562" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="560" y="145" width="40" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="120" />
        <di:waypoint x="562" y="120" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`
    },
    {
      id:'decision_process', 
      name:'Process with Decision', 
      xml:`<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Definitions_${Date.now()}" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_${Date.now()}" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Process Start">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Activity_1" name="Data Analysis">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:exclusiveGateway id="Gateway_1" name="Decision Condition">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:task id="Activity_2" name="Execute Task A">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Activity_3" name="Execute Task B">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1" name="Process End">
      <bpmn:incoming>Flow_5</bpmn:incoming>
      <bpmn:incoming>Flow_6</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Activity_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Activity_1" targetRef="Gateway_1" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Gateway_1" targetRef="Activity_2" name="Condition Met">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">condition == true</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Gateway_1" targetRef="Activity_3" name="Condition Not Met">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">condition == false</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Activity_2" targetRef="EndEvent_1" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Activity_3" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_${Date.now()}">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="129" y="145" width="82" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1_di" bpmnElement="Activity_1">
        <dc:Bounds x="240" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_1_di" bpmnElement="Gateway_1" isMarkerVisible="true">
        <dc:Bounds x="395" y="95" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="395" y="65" width="50" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_2_di" bpmnElement="Activity_2">
        <dc:Bounds x="500" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_3_di" bpmnElement="Activity_3">
        <dc:Bounds x="500" y="190" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="652" y="132" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="631" y="175" width="79" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="120" />
        <di:waypoint x="240" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="340" y="120" />
        <di:waypoint x="395" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <di:waypoint x="445" y="120" />
        <di:waypoint x="500" y="120" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="442" y="102" width="60" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
        <di:waypoint x="420" y="145" />
        <di:waypoint x="420" y="230" />
        <di:waypoint x="500" y="230" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="431" y="205" width="58" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5">
        <di:waypoint x="600" y="120" />
        <di:waypoint x="626" y="120" />
        <di:waypoint x="626" y="150" />
        <di:waypoint x="652" y="150" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_6_di" bpmnElement="Flow_6">
        <di:waypoint x="600" y="230" />
        <di:waypoint x="626" y="230" />
        <di:waypoint x="626" y="150" />
        <di:waypoint x="652" y="150" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`
    },
    {
      id:'parallel_process',
      name:'Process with Parallel Paths',
      xml:`<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_${Date.now()}" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_${Date.now()}" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Start">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Activity_0" name="Preparation">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:parallelGateway id="Gateway_1" name="Split Tasks">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:parallelGateway>
    <bpmn:task id="Activity_1" name="Task 1">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Activity_2" name="Task 2">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_7</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Activity_3" name="Task 3">
      <bpmn:incoming>Flow_5</bpmn:incoming>
      <bpmn:outgoing>Flow_8</bpmn:outgoing>
    </bpmn:task>
    <bpmn:parallelGateway id="Gateway_2" name="Join Results">
      <bpmn:incoming>Flow_6</bpmn:incoming>
      <bpmn:incoming>Flow_7</bpmn:incoming>
      <bpmn:incoming>Flow_8</bpmn:incoming>
      <bpmn:outgoing>Flow_9</bpmn:outgoing>
    </bpmn:parallelGateway>
    <bpmn:task id="Activity_4" name="Podsumowanie">
      <bpmn:incoming>Flow_9</bpmn:incoming>
      <bpmn:outgoing>Flow_10</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1" name="Koniec">
      <bpmn:incoming>Flow_10</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Activity_0" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Activity_0" targetRef="Gateway_1" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Gateway_1" targetRef="Activity_1" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Gateway_1" targetRef="Activity_2" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Gateway_1" targetRef="Activity_3" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Activity_1" targetRef="Gateway_2" />
    <bpmn:sequenceFlow id="Flow_7" sourceRef="Activity_2" targetRef="Gateway_2" />
    <bpmn:sequenceFlow id="Flow_8" sourceRef="Activity_3" targetRef="Gateway_2" />
    <bpmn:sequenceFlow id="Flow_9" sourceRef="Gateway_2" targetRef="Activity_4" />
    <bpmn:sequenceFlow id="Flow_10" sourceRef="Activity_4" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_${Date.now()}">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="202" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="148" y="245" width="45" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0_di" bpmnElement="Activity_0">
        <dc:Bounds x="240" y="180" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_1_di" bpmnElement="Gateway_1">
        <dc:Bounds x="395" y="195" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="375" y="165" width="91" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1_di" bpmnElement="Activity_1">
        <dc:Bounds x="500" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_2_di" bpmnElement="Activity_2">
        <dc:Bounds x="500" y="180" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_3_di" bpmnElement="Activity_3">
        <dc:Bounds x="500" y="280" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_2_di" bpmnElement="Gateway_2">
        <dc:Bounds x="655" y="195" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="638" y="165" width="85" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_4_di" bpmnElement="Activity_4">
        <dc:Bounds x="760" y="180" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="912" y="202" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="911" y="245" width="38" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="220" />
        <di:waypoint x="240" y="220" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="340" y="220" />
        <di:waypoint x="395" y="220" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <di:waypoint x="420" y="195" />
        <di:waypoint x="420" y="120" />
        <di:waypoint x="500" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
        <di:waypoint x="445" y="220" />
        <di:waypoint x="500" y="220" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5">
        <di:waypoint x="420" y="245" />
        <di:waypoint x="420" y="320" />
        <di:waypoint x="500" y="320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_6_di" bpmnElement="Flow_6">
        <di:waypoint x="600" y="120" />
        <di:waypoint x="680" y="120" />
        <di:waypoint x="680" y="195" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_7_di" bpmnElement="Flow_7">
        <di:waypoint x="600" y="220" />
        <di:waypoint x="655" y="220" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_8_di" bpmnElement="Flow_8">
        <di:waypoint x="600" y="320" />
        <di:waypoint x="680" y="320" />
        <di:waypoint x="680" y="245" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_9_di" bpmnElement="Flow_9">
        <di:waypoint x="705" y="220" />
        <di:waypoint x="760" y="220" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_10_di" bpmnElement="Flow_10">
        <di:waypoint x="860" y="220" />
        <di:waypoint x="912" y="220" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`
    },
    {
      id:'customer_service',
      name:'Customer Service Process',
      xml:`<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Definitions_${Date.now()}" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_${Date.now()}" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Customer Request Received">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Activity_1" name="Register Request">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Activity_2" name="Analyze Request">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:task>
    <bpmn:exclusiveGateway id="Gateway_1" name="Request Type?">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:task id="Activity_3" name="Solve Technical Problem">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_7</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Activity_4" name="Handle Complaint">
      <bpmn:incoming>Flow_5</bpmn:incoming>
      <bpmn:outgoing>Flow_8</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Activity_5" name="Prepare Offer">
      <bpmn:incoming>Flow_6</bpmn:incoming>
      <bpmn:outgoing>Flow_9</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Activity_6" name="Contact Customer">
      <bpmn:incoming>Flow_7</bpmn:incoming>
      <bpmn:incoming>Flow_8</bpmn:incoming>
      <bpmn:incoming>Flow_9</bpmn:incoming>
      <bpmn:outgoing>Flow_10</bpmn:outgoing>
    </bpmn:task>
    <bpmn:exclusiveGateway id="Gateway_2" name="Is Customer Satisfied?">
      <bpmn:incoming>Flow_10</bpmn:incoming>
      <bpmn:outgoing>Flow_11</bpmn:outgoing>
      <bpmn:outgoing>Flow_12</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:task id="Activity_7" name="Close Request">
      <bpmn:incoming>Flow_11</bpmn:incoming>
      <bpmn:outgoing>Flow_13</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Activity_8" name="Escalate to Manager">
      <bpmn:incoming>Flow_12</bpmn:incoming>
      <bpmn:outgoing>Flow_14</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1" name="Service Completed">
      <bpmn:incoming>Flow_13</bpmn:incoming>
      <bpmn:incoming>Flow_14</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Activity_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Activity_1" targetRef="Activity_2" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Activity_2" targetRef="Gateway_1" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Gateway_1" targetRef="Activity_3" name="Technical Problem" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Gateway_1" targetRef="Activity_4" name="Complaint" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Gateway_1" targetRef="Activity_5" name="Offer Request" />
    <bpmn:sequenceFlow id="Flow_7" sourceRef="Activity_3" targetRef="Activity_6" />
    <bpmn:sequenceFlow id="Flow_8" sourceRef="Activity_4" targetRef="Activity_6" />
    <bpmn:sequenceFlow id="Flow_9" sourceRef="Activity_5" targetRef="Activity_6" />
    <bpmn:sequenceFlow id="Flow_10" sourceRef="Activity_6" targetRef="Gateway_2" />
    <bpmn:sequenceFlow id="Flow_11" sourceRef="Gateway_2" targetRef="Activity_7" name="Yes" />
    <bpmn:sequenceFlow id="Flow_12" sourceRef="Gateway_2" targetRef="Activity_8" name="No" />
    <bpmn:sequenceFlow id="Flow_13" sourceRef="Activity_7" targetRef="EndEvent_1" />
    <bpmn:sequenceFlow id="Flow_14" sourceRef="Activity_8" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_${Date.now()}">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="159" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="137" y="202" width="67" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1_di" bpmnElement="Activity_1">
        <dc:Bounds x="240" y="137" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_2_di" bpmnElement="Activity_2">
        <dc:Bounds x="400" y="137" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_1_di" bpmnElement="Gateway_1" isMarkerVisible="true">
        <dc:Bounds x="565" y="152" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="556" y="122" width="68" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_3_di" bpmnElement="Activity_3">
        <dc:Bounds x="670" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_4_di" bpmnElement="Activity_4">
        <dc:Bounds x="670" y="190" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_5_di" bpmnElement="Activity_5">
        <dc:Bounds x="670" y="300" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_6_di" bpmnElement="Activity_6">
        <dc:Bounds x="830" y="190" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_2_di" bpmnElement="Gateway_2" isMarkerVisible="true">
        <dc:Bounds x="995" y="205" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="976" y="175" width="89" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_7_di" bpmnElement="Activity_7">
        <dc:Bounds x="1100" y="137" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_8_di" bpmnElement="Activity_8">
        <dc:Bounds x="1100" y="247" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="1262" y="212" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1240" y="255" width="81" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="177" />
        <di:waypoint x="240" y="177" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="340" y="177" />
        <di:waypoint x="400" y="177" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <di:waypoint x="500" y="177" />
        <di:waypoint x="565" y="177" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
        <di:waypoint x="590" y="152" />
        <di:waypoint x="590" y="120" />
        <di:waypoint x="670" y="120" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="558" y="102" width="89" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5">
        <di:waypoint x="615" y="177" />
        <di:waypoint x="642" y="177" />
        <di:waypoint x="642" y="230" />
        <di:waypoint x="670" y="230" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="625" y="198" width="55" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_6_di" bpmnElement="Flow_6">
        <di:waypoint x="590" y="202" />
        <di:waypoint x="590" y="340" />
        <di:waypoint x="670" y="340" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="601" y="323" width="88" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_7_di" bpmnElement="Flow_7">
        <di:waypoint x="770" y="120" />
        <di:waypoint x="880" y="120" />
        <di:waypoint x="880" y="190" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_8_di" bpmnElement="Flow_8">
        <di:waypoint x="770" y="230" />
        <di:waypoint x="830" y="230" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_9_di" bpmnElement="Flow_9">
        <di:waypoint x="770" y="340" />
        <di:waypoint x="880" y="340" />
        <di:waypoint x="880" y="270" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_10_di" bpmnElement="Flow_10">
        <di:waypoint x="930" y="230" />
        <di:waypoint x="995" y="230" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_11_di" bpmnElement="Flow_11">
        <di:waypoint x="1020" y="205" />
        <di:waypoint x="1020" y="177" />
        <di:waypoint x="1100" y="177" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1026" y="188" width="18" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_12_di" bpmnElement="Flow_12">
        <di:waypoint x="1020" y="255" />
        <di:waypoint x="1020" y="287" />
        <di:waypoint x="1100" y="287" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1025" y="269" width="17" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_13_di" bpmnElement="Flow_13">
        <di:waypoint x="1200" y="177" />
        <di:waypoint x="1231" y="177" />
        <di:waypoint x="1231" y="230" />
        <di:waypoint x="1262" y="230" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_14_di" bpmnElement="Flow_14">
        <di:waypoint x="1200" y="287" />
        <di:waypoint x="1231" y="287" />
        <di:waypoint x="1231" y="230" />
        <di:waypoint x="1262" y="230" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`
    },
    {
      id:'purchasing_process',
      name:'Purchasing Process',
      xml:`<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Definitions_${Date.now()}" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_${Date.now()}" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Purchase Need">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Activity_1" name="Complete Purchase Request">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Activity_1" />
    <bpmn:task id="Activity_2" name="Manager Approval">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Activity_1" targetRef="Activity_2" />
    <bpmn:exclusiveGateway id="Gateway_1" name="Approved?">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Activity_2" targetRef="Gateway_1" />
    <bpmn:task id="Activity_3" name="Process Purchase">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_4" name="Yes" sourceRef="Gateway_1" targetRef="Activity_3">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">approved == true</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:endEvent id="EndEvent_1" name="Purchase Rejected">
      <bpmn:incoming>Flow_5</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_5" name="No" sourceRef="Gateway_1" targetRef="EndEvent_1">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">approved == false</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:task id="Activity_4" name="Receive Order">
      <bpmn:incoming>Flow_6</bpmn:incoming>
      <bpmn:outgoing>Flow_7</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Activity_3" targetRef="Activity_4" />
    <bpmn:task id="Activity_5" name="Register in System">
      <bpmn:incoming>Flow_7</bpmn:incoming>
      <bpmn:outgoing>Flow_8</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_7" sourceRef="Activity_4" targetRef="Activity_5" />
    <bpmn:endEvent id="EndEvent_2" name="Purchase Completed">
      <bpmn:incoming>Flow_8</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_8" sourceRef="Activity_5" targetRef="EndEvent_2" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_${Date.now()}">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="131" y="145" width="78" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1_di" bpmnElement="Activity_1">
        <dc:Bounds x="240" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_2_di" bpmnElement="Activity_2">
        <dc:Bounds x="400" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_1_di" bpmnElement="Gateway_1" isMarkerVisible="true">
        <dc:Bounds x="555" y="95" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="536" y="65" width="88" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_3_di" bpmnElement="Activity_3">
        <dc:Bounds x="660" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="662" y="212" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="637" y="255" width="86" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_4_di" bpmnElement="Activity_4">
        <dc:Bounds x="820" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_5_di" bpmnElement="Activity_5">
        <dc:Bounds x="980" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_2_di" bpmnElement="EndEvent_2">
        <dc:Bounds x="1142" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1124" y="145" width="72" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="120" />
        <di:waypoint x="240" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="340" y="120" />
        <di:waypoint x="400" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <di:waypoint x="500" y="120" />
        <di:waypoint x="555" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
        <di:waypoint x="605" y="120" />
        <di:waypoint x="660" y="120" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="624" y="102" width="18" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5">
        <di:waypoint x="580" y="145" />
        <di:waypoint x="580" y="230" />
        <di:waypoint x="662" y="230" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="586" y="185" width="17" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_6_di" bpmnElement="Flow_6">
        <di:waypoint x="760" y="120" />
        <di:waypoint x="820" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_7_di" bpmnElement="Flow_7">
        <di:waypoint x="920" y="120" />
        <di:waypoint x="980" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_8_di" bpmnElement="Flow_8">
        <di:waypoint x="1080" y="120" />
        <di:waypoint x="1142" y="120" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`
    },
    // New template with pre-configured tasks - will be used as default
    {
      id:'flight_systems_colored',
      name:'Flight Systems Example (Colored)',
      xml:`<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_${Date.now()}" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_${Date.now()}" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Flight Booking">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Activity_1" name="Check Availability">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Activity_1" />
    <bpmn:task id="Activity_2" name="Process Payment">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Activity_1" targetRef="Activity_2" />
    <bpmn:task id="Activity_3" name="Issue Boarding Pass">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Activity_2" targetRef="Activity_3" />
    <bpmn:task id="Activity_4" name="Baggage Check-in">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Activity_3" targetRef="Activity_4" />
    <bpmn:task id="Activity_5" name="Security Screening">
      <bpmn:incoming>Flow_5</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Activity_4" targetRef="Activity_5" />
    <bpmn:endEvent id="EndEvent_1" name="Boarding Complete">
      <bpmn:incoming>Flow_6</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Activity_5" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_${Date.now()}">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="135" y="145" width="70" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1_di" bpmnElement="Activity_1">
        <dc:Bounds x="240" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_2_di" bpmnElement="Activity_2">
        <dc:Bounds x="400" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_3_di" bpmnElement="Activity_3">
        <dc:Bounds x="560" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_4_di" bpmnElement="Activity_4">
        <dc:Bounds x="720" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_5_di" bpmnElement="Activity_5">
        <dc:Bounds x="880" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="1042" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1017" y="145" width="86" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="120" />
        <di:waypoint x="240" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="340" y="120" />
        <di:waypoint x="400" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <di:waypoint x="500" y="120" />
        <di:waypoint x="560" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
        <di:waypoint x="660" y="120" />
        <di:waypoint x="720" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5">
        <di:waypoint x="820" y="120" />
        <di:waypoint x="880" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_6_di" bpmnElement="Flow_6">
        <di:waypoint x="980" y="120" />
        <di:waypoint x="1042" y="120" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`
    }
  ];

  const runLint = useCallback(() => {
    try {
      const l = modelerRef.current?.get('linting');
      if (!l) return;
      if (typeof l.lint === 'function') {
        try { l.lint(); } catch { /* ignore */ }
      }
      
      // For tasks without a name, add a red border
      const elementRegistry = modelerRef.current.get('elementRegistry');
      const canvas = modelerRef.current.get('canvas');
      
      // Resetowanie wszystkich ramek
      elementRegistry.getAll().forEach(el => {
        const bo = el.businessObject;
        if (bo && /Task$/.test(bo.$type)) {
          const gfx = canvas.getGraphics(el.id);
          if (gfx) {
            gfx.classList.remove('validation-error');
          }
        }
      });
      
      // Find problems and highlight them
      const r = l.getResults ? l.getResults() : (l._currentResult || l._results || null);
      if (!r) return;
      
      ['errors','warnings'].forEach(level => {
        const bucket = r[level] || {};
        Object.keys(bucket).forEach(id => {
          const el = elementRegistry.get(id);
          if (el) {
            const gfx = canvas.getGraphics(id);
            if (gfx && level === 'errors') {
              gfx.classList.add('validation-error');
            }
          }
        });
      });

      console.log('Validation completed');
    } catch (err) {
      console.error('Validation error:', err);
    }
  }, []);

  useEffect(() => {
    if (modelerRef.current) return;
    const m = new BpmnModeler({
      container: containerRef.current,
      additionalModules: [ lintModule ]
    });
    modelerRef.current = m;
    
    // Find our colored template
    const coloredTemplate = templates.find(t => t.id === 'flight_systems_colored');
    const defaultXml = coloredTemplate ? coloredTemplate.xml : `<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" targetNamespace="http://bpmn.io/schema/bpmn"><bpmn:process id="Process_1" isExecutable="false"/></bpmn:definitions>`;
    
    // Use either stored diagram or our default colored template
    (async () => {
      let storedDiagram = localStorage.getItem('diagram');
      let loadedFromStorage = false;
      
      try {
        if (storedDiagram) {
          await m.importXML(storedDiagram);
          loadedFromStorage = true;
        } else {
          // Load our colored template as the default
          await m.importXML(defaultXml);
          localStorage.setItem('diagram', defaultXml);
        }
      } catch (err) {
        console.error('Error loading diagram:', err);
        // Fall back to default template on error
        try {
          await m.importXML(defaultXml);
          localStorage.setItem('diagram', defaultXml);
        } catch (e) {
          console.error('Critical error loading diagram:', e);
        }
      }
      
      try { m.get('canvas').zoom('fit-viewport'); } catch {}
      
      // Activate linting overlay (shows badges) if available
      try {
        const linting = m.get('linting');
        if (linting && linting.toggle && !linting._active) linting.toggle();
      } catch {}
      
      runLint();
      
      // If we loaded a new diagram (not from storage), apply system tags
      if (!loadedFromStorage) {
        console.log('Loading default example');
        setTimeout(() => applyDefaultSystemTags(m), 500);
      }
    })();
    m.on('commandStack.changed', async () => {
      try { const { xml } = await m.saveXML({ format: true }); localStorage.setItem('diagram', xml); } catch {}
      runLint();
    });
    m.on('selection.changed', e => setSelected(e.newSelection?.[0] || null));
    
    // Add system tags to tasks for demonstration if none exist
    setTimeout(() => {
      try {
        const elementRegistry = m.get('elementRegistry');
        const modeling = m.get('modeling');
        
        // Find all tasks in the diagram
        const tasks = elementRegistry.filter(el => 
          el.type?.includes('Task') || el.businessObject?.$type?.includes('Task')
        );
        
        if (tasks.length > 0) {
          console.log(`Found ${tasks.length} tasks in the diagram`);
          
          // Check if any tasks already have system tags
          let hasSystemTags = false;
          tasks.forEach(task => {
            const tags = task.businessObject?.get('systemTags');
            if (tags) {
              hasSystemTags = true;
              console.log(`Task ${task.id} already has system tags: ${tags}`);
            }
          });
          
          // If no tasks have system tags, add them to the first two tasks
          if (!hasSystemTags && systems.length >= 2) {
            console.log('Adding example system tags to tasks');
            
            // Add first system tag to first task
            if (tasks[0]) {
              modeling.updateProperties(tasks[0], {
                systemTags: systems[0].id
              });
              console.log(`Added ${systems[0].id} tag to ${tasks[0].id}`);
            }
            
            // Add second system tag to second task if exists
            if (tasks.length > 1 && systems.length > 1) {
              modeling.updateProperties(tasks[1], {
                systemTags: systems[1].id
              });
              console.log(`Added ${systems[1].id} tag to ${tasks[1].id}`);
            }
            
            // Colorize mode has been removed
          }
        }
      } catch (err) {
        console.error('Error adding example system tags:', err);
      }
    }, 1500); // Wait for diagram to fully load
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
      console.log("New diagram created successfully");
    } catch(error) {
      console.error("Error creating new diagram:", error);
      alert('Failed to create new diagram');
    }
  };
  const undo = () => {
    try {
      modelerRef.current.get('commandStack').undo();
    } catch {}
  };
  
  const redo = () => {
    try {
      modelerRef.current.get('commandStack').redo();
    } catch {}
  };
  
  const zin = () => {
    try {
      const c = modelerRef.current.get('canvas');
      const z = Number(c.zoom()) || 1;
      c.zoom(z * 1.1);
    } catch {}
  };
  
  const zout = () => {
    try {
      const c = modelerRef.current.get('canvas');
      const z = Number(c.zoom()) || 1;
      c.zoom(Math.max(z / 1.1, 0.2));
    } catch {}
  };
  
  const resetView = () => {
    try {
      modelerRef.current.get('canvas').zoom('fit-viewport');
    } catch {}
  };

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
  
  // Function to apply system tags to our default example
  const applyDefaultSystemTags = (modeler) => {
    try {
      console.log('Applying default system tags to example diagram tasks');
      const elementRegistry = modeler.get('elementRegistry');
      const modeling = modeler.get('modeling');
      
      // Map task IDs to specific systems based on their functionality
      const taskSystemMapping = {
        'Activity_1': 'CRM',      // Check Availability - Customer Relationship Management
        'Activity_2': 'DCS',      // Process Payment - Departure Control
        'Activity_3': 'DCS',      // Issue Boarding Pass - Departure Control
        'Activity_4': 'BHS',      // Baggage Check-in - Baggage Handling
        'Activity_5': 'SEC'       // Security Screening - Security
      };
      
      // Apply the mappings
      Object.entries(taskSystemMapping).forEach(([taskId, systemId]) => {
        const taskElement = elementRegistry.get(taskId);
        if (taskElement) {
          console.log(`Adding ${systemId} system tag to ${taskId}`);
          modeling.updateProperties(taskElement, {
            systemTags: systemId
          });
        }
      });
      
      // Add some data tags as well for completeness
      const taskDataMapping = {
        'Activity_1': 'Booking',
        'Activity_2': 'Payment',
        'Activity_3': 'Passenger',
        'Activity_4': 'BagTag',
        'Activity_5': 'Passenger'
      };
      
      Object.entries(taskDataMapping).forEach(([taskId, dataId]) => {
        const taskElement = elementRegistry.get(taskId);
        if (taskElement && dataEntities.includes(dataId)) {
          console.log(`Adding ${dataId} data tag to ${taskId}`);
          modeling.updateProperties(taskElement, {
            dataTags: dataId
          });
        }
      });
      
      console.log('Default system and data tags applied successfully');
      
      // Colorize feature has been removed
      
    } catch (err) {
      console.error('Error applying default system tags:', err);
    }
  };
  const addSystem = () => { 
    if (!newSystem.id.trim()) return; 
    
    const upd = [
      ...systems.filter(s => s.id !== newSystem.id.trim()),
      {
        id: newSystem.id.trim(), 
        name: newSystem.name.trim() || newSystem.id.trim()
      }
    ]; 
    
    setSystems(upd); 
    localStorage.setItem('systemsCatalog', JSON.stringify(upd)); 
    setNewSystem({id: '', name: ''}); 
  };
  const remSystem=id=>{ const upd=systems.filter(s=>s.id!==id); setSystems(upd); localStorage.setItem('systemsCatalog',JSON.stringify(upd)); };
  const addData = () => { 
    const v = newData.trim(); 
    if (!v) return; 
    
    if (!dataEntities.includes(v)) { 
      const upd = [...dataEntities, v]; 
      setDataEntities(upd); 
      localStorage.setItem('dataCatalog', JSON.stringify(upd)); 
    } 
    
    setNewData(''); 
  };
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
  
  // Let's add debugging functions
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

  const exportSVG = async () => { 
    try { 
      const { svg } = await modelerRef.current.saveSVG(); 
      const blob = new Blob([svg], { type: 'image/svg+xml' }); 
      const url = URL.createObjectURL(blob); 
      const a = document.createElement('a'); 
      a.href = url; 
      a.download = `${fileName}.svg`; 
      a.click(); 
      URL.revokeObjectURL(url);
    } catch {
      alert('SVG export failed');
    }
  };
  const exportPNG = async () => { 
    try { 
      const { svg } = await modelerRef.current.saveSVG(); 
      const c = document.createElement('canvas'); 
      const ctx = c.getContext('2d'); 
      const v = await Canvg.from(ctx, svg); 
      await v.render(); 
      c.toBlob(b => { 
        if (!b) return; 
        const url = URL.createObjectURL(b); 
        const a = document.createElement('a'); 
        a.href = url; 
        a.download = `${fileName}.png`; 
        a.click(); 
        URL.revokeObjectURL(url); 
      });
    } catch {
      alert('PNG export failed');
    }
  };
  const exportPDF = async () => { 
    try { 
      const { svg } = await modelerRef.current.saveSVG(); 
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4'
      }); 
      const c = document.createElement('canvas'); 
      const ctx = c.getContext('2d'); 
      const v = await Canvg.from(ctx, svg); 
      await v.render(); 
      const img = c.toDataURL('image/png'); 
      pdf.addImage(
        img,
        'PNG',
        20,
        20,
        pdf.internal.pageSize.getWidth() - 40,
        pdf.internal.pageSize.getHeight() - 40
      ); 
      pdf.save(`${fileName}.pdf`);
    } catch {
      alert('PDF export failed');
    }
  };
  const exportCSV = () => { 
    try { 
      const reg = modelerRef.current.get('elementRegistry'); 
      const rows = ['id;name;systems;data']; 
      
      reg.getAll().forEach(el => { 
        const bo = el.businessObject; 
        if (bo && /Task$/.test(bo.$type)) { 
          rows.push(`${bo.id};${(bo.name || '').replace(/;/g, ',')};${bo.get('systemTags') || ''};${bo.get('dataTags') || ''}`); 
        }
      }); 
      
      const blob = new Blob([rows.join('\n')], { type: 'text/csv' }); 
      const url = URL.createObjectURL(blob); 
      const a = document.createElement('a'); 
      a.href = url; 
      a.download = `${fileName}_report.csv`; 
      a.click(); 
      URL.revokeObjectURL(url);
    } catch {
      alert('CSV export failed');
    }
  };
  
  const focus = id => { 
    try {
      const el = modelerRef.current.get('elementRegistry').get(id); 
      if (el) {
        modelerRef.current.get('selection').select(el); 
        modelerRef.current.get('canvas').scrollToElement(el);
      } 
    } catch {} 
  };

  // Function to apply filtering to diagram elements based on system/data tags
  // Apply filtering for system and data tags
  useEffect(() => {
    if (!modelerRef.current) return;
    
    const reg = modelerRef.current.get('elementRegistry');
    const canvas = modelerRef.current.get('canvas');
    
    // Apply filtering to all task elements
    reg.getAll().forEach(el => {
      const bo = el.businessObject;
      if (!bo) return;
      if (!/Task$/.test(bo.$type)) return;
      
      const gfx = canvas.getGraphics(el.id);
      if (!gfx) return;
      
      // Get system and data tags
      const st = (bo.get('systemTags') || '').split(',').map(s => s.trim()).filter(Boolean);
      const dt = (bo.get('dataTags') || '').split(',').map(s => s.trim()).filter(Boolean);
      
      // Apply filtering
      const okS = !filterSystem || st.includes(filterSystem);
      const okD = !filterData || dt.includes(filterData);
      gfx.style.display = (okS && okD) ? '' : 'none';
    });
  }, [filterSystem, filterData, selected, systems, dataEntities]);

  const H=60;
  return (
    <div className="h-screen w-full overflow-auto flex flex-col bg-gradient-to-br from-slate-50 to-white">
    <div className="sticky top-0 left-0 right-0 h-[60px] flex items-center flex-wrap gap-2 px-4 z-[9000] bg-gradient-to-r from-slate-800 to-slate-700 backdrop-blur border-b border-blue-500/30 shadow-xl">
      <div className="flex items-center gap-2">
        <button onClick={newDiagram} className="btn btn-secondary flex items-center gap-1 bg-white" title="New">
          <span className="text-xs mr-1">🆕</span>
          <span className="inline">New</span>
        </button>
        <button onClick={()=>fileRef.current?.click()} className="btn btn-secondary flex items-center gap-1 bg-white" title="Open">
          <span className="text-xs mr-1">📂</span>
          <span className="inline">Open</span>
        </button>
        <input ref={fileRef} type="file" accept=".bpmn,.xml" onChange={openFile} className="hidden" />
        <button onClick={toggleSaveOptions} className="btn btn-success flex items-center gap-1 bg-white text-green-700 border border-green-300" title="Save Options">
          <span className="text-base mr-1">💾</span>
          <span className="inline">Save</span>
        </button>
        <button onClick={()=>setShowTemplates(true)} className="btn btn-info flex items-center gap-1 bg-white text-indigo-700 border border-indigo-300" title="Templates">
          <span className="text-base mr-1">📄</span>
          <span className="inline">Templates</span>
        </button>
        <button onClick={()=>setShowCatalog(true)} className="btn btn-warning flex items-center gap-1 bg-white text-amber-700 border border-amber-300" title="Catalog">
          <span className="text-base mr-1">📋</span>
          <span className="inline">Catalog</span>
        </button>
      </div>
      
      <div className="flex items-center gap-1 ml-2 bg-white px-2 py-1 rounded-lg shadow-sm">
        <button onClick={undo} className="btn btn-secondary text-xs p-1 px-2 bg-white border border-gray-200" title="Undo">
          ↶
        </button>
        <button onClick={redo} className="btn btn-secondary text-xs p-1 px-2 bg-white border border-gray-200" title="Redo">
          ↷
        </button>
        <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
        <button onClick={zin} className="btn btn-secondary text-xs p-1 px-2 bg-white border border-gray-200" title="Zoom In">
          ＋
        </button>
        <button onClick={zout} className="btn btn-secondary text-xs p-1 px-2 bg-white border border-gray-200" title="Zoom Out">
          －
        </button>
        <button onClick={resetView} className="btn btn-secondary text-xs p-1 px-2 bg-white border border-gray-200" title="Fit">
          ♻
        </button>
      </div>
      
      <div className="flex-grow"></div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center space-x-2">
          <select value={filterSystem} onChange={e=>setFilterSystem(e.target.value)} className="select-modern bg-white text-gray-700">
            <option value="">All Systems</option>
            {systems.map(s=> <option key={s.id} value={s.id}>{s.id}</option>)}
          </select>
          <select value={filterData} onChange={e=>setFilterData(e.target.value)} className="select-modern bg-white text-gray-700">
            <option value="">All Data</option>
            {dataEntities.map(d=> <option key={d} value={d}>{d}</option>)}
          </select>
          <button onClick={()=>{setFilterSystem(''); setFilterData('');}} className="btn btn-secondary text-gray-700 text-xs p-1 px-2 bg-white border border-gray-200" title="Clear filters">
            ✖
          </button>
        </div>
      
        <div className="flex items-center gap-2 ml-2">
          <div className="flex flex-col">
            {/* Colorize button removed */}
          </div>
          
          <button onClick={runLint} className="btn bg-white text-gray-700 border border-gray-300 flex items-center" title="Validate">
            <span className="mr-1">✔</span>
            <span>Validate</span>
          </button>
        </div>
      </div>
      <button onClick={exportCSV} className="btn btn-secondary text-xs bg-white border border-gray-200 flex items-center" title="CSV">
        <span className="text-base mr-1">&#x1F4CA;</span>
        <span>CSV</span>
      </button>

    </div>
    <div ref={containerRef} 
      onDragOver={e=>{e.preventDefault(); setDrag(true);}} 
      onDragLeave={e=>{e.preventDefault(); setDrag(false);}} 
      onDrop={async e=>{
        e.preventDefault(); 
        setDrag(false); 
        const f=e.dataTransfer.files?.[0]; 
        if(!f) return; 
        if(!/\.(bpmn|xml)$/i.test(f.name)){
          alert('Not BPMN');
          return;
        } 
        const txt=await f.text(); 
        try {
          await modelerRef.current.importXML(txt); 
          modelerRef.current.get('canvas').zoom('fit-viewport'); 
          localStorage.setItem('diagram',txt); 
          setFileName(f.name.replace(/\.bpmn$/i,'').replace(/\.xml$/i,'')); 
          runLint();
        } catch {
          alert('Import failed')
        }
      }} 
      className={`flex-1 relative border-2 border-slate-200 rounded-xl overflow-hidden w-full m-4 ${
        drag ? 'ring-4 ring-blue-400 ring-offset-2' : 'shadow-lg hover:shadow-xl transition-shadow duration-300'
      }`} 
      style={{minHeight:0}}>
      
      {drag && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center text-slate-700 text-lg font-semibold pointer-events-none">
        <div className="bg-white/80 p-6 rounded-lg shadow-lg border border-blue-200 flex flex-col items-center">
          <div className="text-blue-600 text-4xl mb-3">📄</div>
          Drop .bpmn / .xml file
        </div>
      </div>}
    </div>

    {/* Templates Modal with Backdrop - Redesigned */}
    {showTemplates && (
      <>
        <div className="modal-backdrop" onClick={toggleTemplates}></div>
        <div className="modal-container templates-modal">
          <div className="modal-header">
            <h2>Process Templates</h2>
            <button onClick={toggleTemplates} className="modal-close-btn">×</button>
          </div>
          <div className="modal-body">
            <p className="mb-3 text-gray-600 text-sm">Choose one of the ready-made process templates to start modeling:</p>
            {templates.map(t=>(
              <div key={t.id} onClick={()=>loadTemplate(t)} className="template-item">
                <div className="template-name">{t.name}</div>
                <div className="template-id">ID: {t.id}</div>
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <small>The selected template will replace the current diagram. Make sure you have saved your current work.</small>
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
            <h2>Systems and Data Entities Catalog</h2>
            <button onClick={toggleCatalog} className="modal-close-btn">×</button>
          </div>
          <div className="modal-body">
            <section className="catalog-section">
              <h4 className="catalog-section-title">Systems</h4>
              <div className="input-group">
                <input value={newSystem.id} onChange={e=>setNewSystem(s=>({...s,id:e.target.value}))} 
                       placeholder="Identyfikator" className="input-field w-24"/>
                <input value={newSystem.name} onChange={e=>setNewSystem(s=>({...s,name:e.target.value}))} 
                       placeholder="Nazwa systemu" className="input-field flex-1"/>
                <button onClick={addSystem} className="btn btn-blue">Add</button>
              </div>
              <div className="tag-container">
                {systems.map(s=>(
                  <div key={s.id} className="tag">
                    <span>{s.id}</span>
                    <span className="tag-remove" onClick={()=>remSystem(s.id)} title="Remove">×</span>
                  </div>
                ))}
                {!systems.length && <div className="empty-placeholder">No defined systems</div>}
              </div>
            </section>
            
            <section className="catalog-section">
              <h4 className="catalog-section-title">Data Entities</h4>
              <div className="input-group">
                <input value={newData} onChange={e=>setNewData(e.target.value)} 
                       placeholder="Data entity name" className="input-field flex-1"/>
                <button onClick={addData} className="btn btn-blue">Add</button>
              </div>
              <div className="tag-container">
                {dataEntities.map(d=>(
                  <div key={d} className="tag">
                    <span>{d}</span>
                    <span className="tag-remove" onClick={()=>remData(d)} title="Remove">×</span>
                  </div>
                ))}
                {!dataEntities.length && <div className="empty-placeholder">No defined data entities</div>}
              </div>
            </section>
            
            {selected ? (
              <section className="catalog-section">
                <h4 className="catalog-section-title">Tagowanie wybranego elementu</h4>
                <div className="task-tagging-section">
                  <div className="mb-3">
                    <div className="text-xs font-semibold mb-1 text-gray-700">Systems linked to task:</div>
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
                      {!systems.length && <span className="text-gray-400">No systems</span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-1 text-gray-700">Data entities linked to task:</div>
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
                      {!dataEntities.length && <span className="text-gray-400">No data entities</span>}
                    </div>
                  </div>
                </div>
                <div className="info-box mt-2">
                  Marking tasks with systems and data allows for analysis of information flow between systems and identification of processed data.
                </div>
              </section>
            ) : (
              <div className="empty-placeholder mt-4">
                Select a task in the diagram to assign system and data tags.
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
            <h2>Save diagram</h2>
            <button onClick={toggleSaveOptions} className="modal-close-btn">×</button>
          </div>
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
            <label className="block text-sm font-medium text-emerald-700 mb-2">File name:</label>
            <div className="relative">
              <input 
                value={fileName} 
                onChange={e=>setFileName(e.target.value)} 
                className="w-full px-4 py-3 border border-emerald-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all pl-10" 
                placeholder="File name" 
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <div className="modal-body">
            <div className="save-option" onClick={() => { save(); toggleSaveOptions(); }}>
              <div className="save-option-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  <path d="M8 11a1 1 0 100-2H7a1 1 0 000 2h1zm2 0a1 1 0 100-2 1 1 0 000 2zm3-1a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1z" />
                </svg>
              </div>
              <div className="save-option-content">
                <div className="save-option-title">BPMN (.bpmn)</div>
                <div className="save-option-desc">Standard XML format for business process diagrams</div>
              </div>
            </div>
            
            <div className="save-option" onClick={() => { exportSVG(); toggleSaveOptions(); }}>
              <div className="save-option-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="save-option-content">
                <div className="save-option-title">SVG (.svg)</div>
                <div className="save-option-desc">Vector graphic format, ideal for embedding in documentation</div>
              </div>
            </div>
            
            <div className="save-option" onClick={() => { exportPNG(); toggleSaveOptions(); }}>
              <div className="save-option-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="save-option-content">
                <div className="save-option-title">PNG (.png)</div>
                <div className="save-option-desc">Raster graphic format with transparency</div>
              </div>
            </div>
            
            <div className="save-option" onClick={() => { exportPDF(); toggleSaveOptions(); }}>
              <div className="save-option-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="save-option-content">
                <div className="save-option-title">PDF (.pdf)</div>
                <div className="save-option-desc">Document format, good for printing and sharing</div>
              </div>
            </div>
            
            <div className="save-option" onClick={() => { exportCSV(); toggleSaveOptions(); }}>
              <div className="save-option-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="save-option-content">
                <div className="save-option-title">CSV Report (.csv)</div>
                <div className="save-option-desc">Export tasks and their tags to a CSV file</div>
              </div>
            </div>
          </div>
          <div className="modal-footer flex justify-between items-center">
            <small>Files will be saved with the specified name and appropriate extension</small>
            <button onClick={toggleSaveOptions} className="btn-secondary text-sm px-3 py-1">Cancel</button>
          </div>
        </div>
      </>
    )}

    {/* Credits Footer */}
    <div className="w-full bg-gradient-to-r from-slate-800 to-slate-700 text-white py-3 px-4 mt-auto border-t border-blue-500/30 shadow-lg">
      <div className="container mx-auto flex flex-col items-center text-center">
        <div className="flex items-center mb-2">
          <span className="text-xl mr-2 footer-icon">✈️</span>
          <span className="font-medium text-lg">Flight BPMN Process Studio</span>
        </div>
        <div className="text-sm text-slate-300 mb-1">
          Modern Business Process Modeling Solution
        </div>
        <div className="text-sm text-slate-300 mb-1">
          © {new Date().getFullYear()} Flight Systems. All rights reserved.
        </div>
        <div className="text-xs text-slate-400">
          <span>Designed & Developed by </span>
          <span className="font-semibold text-white">Stanisław Dutkiewicz</span>
          <span className="mx-1">|</span>
          <span>Version 1.0.0</span>
        </div>
      </div>
    </div>
  </div>);
}






