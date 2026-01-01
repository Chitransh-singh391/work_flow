import React, { useState, useRef, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  useReactFlow,
  Background,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import Sidebar from './Sidebar';
import { DnDProvider, useDnD } from './DnDContext';

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'input node' },
    position: { x: 250, y: 5 },
  },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

const DnDFlow = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();
  //background
  const [varient, setVarient] = useState('lines');

  //edit hooks
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [selectedId, setSelectedId] = useState();

  //function for edit
  const onNodeClick = (e, val) => {
    setEditValue(val.data.label ?? '');
    setSelectedId(val.id);
    setIsEditing(true);
  }

  //handle change function
  const handleChange = (e) => {
    setEditValue(e.target.value);
  }

  const handleEdit = () => {
    const res = nodes.map((item) => {
      if (item.id === selectedId) {
        item.data = {
          ...item.data,
          label: editValue
        }
      }
      return item
    })
    setNodes(res);
    setEditValue('')
    setIsEditing(false);

  }

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({
          ...params,
          label: 'to the',
          type: 'step',
          animated: true,
          style: { stroke: 'blue' },
        }, eds)), []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      // check if the dropped element is valid
      if (!type) {
        return;
      }

      // project was renamed to screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type],
  );

  const onDragStart = (event, nodeType) => {
    setType(nodeType);
    event.dataTransfer.setData('text/plain', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  const handleCancel=() => {
    setIsEditing(false);
    setEditValue('');
  }
  return (
    <div className="dndflow">
      {isEditing && (
        <div className='updatenode_controls'>
          <label>label: </label><br />
          <input type='text' value={editValue} onChange={handleChange} /><br />
          <button onClick={handleEdit} type='submit' className="btn">Update</button><br />
          <button onClick={handleCancel} type='submit' className="btn">Cancel</button><br />
        </div>

      )}

      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={(e, val) => onNodeClick(e, val)}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          fitView
        >
          <Controls />
          <Background color='#99b3ec' variant={varient} />
        </ReactFlow>
      </div>
      <Sidebar />
    </div>
  );
};

export default () => (
  <ReactFlowProvider>
    <DnDProvider>
      <DnDFlow />
    </DnDProvider>
  </ReactFlowProvider>
);
