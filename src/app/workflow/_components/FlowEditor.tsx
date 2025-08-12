import { Workflow } from '@/generated/prisma'
import React from 'react'
import "@xyflow/react/dist/style.css"
import { Background, BackgroundVariant, Controls, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react'
import { CreateFlowNode } from '@/lib/workflow/createFlowNode'
import { TaskType } from '../../../../types/task'
import NodeComponent from './nodes/NodeComponent'

const nodeTypes={
    SynthScrapeNode:NodeComponent
}

const FlowEditor = ({ workflow }: { workflow: Workflow }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([ CreateFlowNode(TaskType.LAUNCH_BROWSER)]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    return (
        <main className='h-full w-full'>
            <ReactFlow nodes={nodes} edges={edges} onEdgesChange={onEdgesChange} onNodesChange={onNodesChange} nodeTypes={nodeTypes}>
                <Controls position='top-left' />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </main>
    )
}

export default FlowEditor