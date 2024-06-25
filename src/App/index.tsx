import { useCallback, useRef } from "react";
import ReactFlow, {
  ConnectionLineType,
  Controls,
  Node,
  NodeOrigin,
  OnConnectEnd,
  OnConnectStart,
  Panel,
  useReactFlow,
  useStoreApi,
} from "reactflow";
import shallow from "zustand/shallow";

import MindMapEdge from "./MindMapEdge";
import MindMapNode from "./MindMapNode";
import useStore, { RFState } from "./store";

import "reactflow/dist/style.css";
import DownloadButton from "../component/download-button";

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  addChildNode: state.addChildNode,
  exportToJson: state.exportToJson,
});

const nodeTypes = {
  mindmap: MindMapNode,
};

const edgeTypes = {
  mindmap: MindMapEdge,
};

const nodeOrigin: NodeOrigin = [0.5, 0.5];

const connectionLineStyle = { stroke: "#F6AD55", strokeWidth: 3 };
const defaultEdgeOptions = { style: connectionLineStyle, type: "mindmap" };

function Flow() {
  const store = useStoreApi();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    addChildNode,
    exportToJson,
  } = useStore(selector, shallow);
  const { project } = useReactFlow();
  const connectingNodeId = useRef<string | null>(null);

  const getChildNodePosition = (event: MouseEvent, parentNode?: Node) => {
    const { domNode } = store.getState();

    if (
      !domNode ||
      !parentNode?.positionAbsolute ||
      !parentNode?.width ||
      !parentNode?.height
    ) {
      return;
    }

    const { top, left } = domNode.getBoundingClientRect();

    const panePosition = project({
      x: event.clientX - left,
      y: event.clientY - top,
    });

    return {
      x: panePosition.x - parentNode.positionAbsolute.x + parentNode.width / 2,
      y: panePosition.y - parentNode.positionAbsolute.y + parentNode.height / 2,
    };
  };

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      const { nodeInternals } = store.getState();
      const targetIsPane = (event.target as Element).classList.contains(
        "react-flow__pane"
      );
      const node = (event.target as Element).closest(".react-flow__node");

      if (node) {
        node.querySelector("input")?.focus({ preventScroll: true });
      } else if (targetIsPane && connectingNodeId.current) {
        const parentNode = nodeInternals.get(connectingNodeId.current);

        if (event instanceof MouseEvent) {
          const childNodePosition = getChildNodePosition(event, parentNode);

          if (parentNode && childNodePosition) {
            addChildNode(parentNode, childNodePosition);
          }
        } else if (event instanceof TouchEvent) {
          const touch = event.touches[0];
          const mouseEvent = new MouseEvent("click", {
            clientX: touch.clientX,
            clientY: touch.clientY,
          });
          const childNodePosition = getChildNodePosition(
            mouseEvent,
            parentNode
          );

          if (parentNode && childNodePosition) {
            addChildNode(parentNode, childNodePosition);
          }
        }
      }
    },
    [getChildNodePosition]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnectStart={onConnectStart}
      onConnectEnd={onConnectEnd}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodeOrigin={nodeOrigin}
      defaultEdgeOptions={defaultEdgeOptions}
      connectionLineStyle={connectionLineStyle}
      connectionLineType={ConnectionLineType.Straight}
      fitView
    >
      <Controls showInteractive={false} />
      <Panel position="top-left" className="header">
        React Flow - Glory
      </Panel>
      <Controls showInteractive={false} />
      <Panel position="top-left" className="panel-title">
        React Flow - Glory
      </Panel>
      <Panel position="top-right" className="react-flow__panel-save-restore">
        <DownloadButton />

        <button
          onClick={exportToJson}
          style={{ cursor: "pointer" }}
          className="panel-save-restore__export-btn"
        >
          Export
        </button>
      </Panel>
    </ReactFlow>
  );
}

export default Flow;
