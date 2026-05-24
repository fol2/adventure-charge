import { Text } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import type { MapNode } from "../game/types";

interface RouteNodeMeshProps {
  node: MapNode;
  available: boolean;
  completed: boolean;
  current: boolean;
  onChoose: (nodeId: string) => void;
}

export function RouteNodeMesh({ node, available, completed, current, onChoose }: RouteNodeMeshProps) {
  const position = getNodePosition(node);
  const colour = getNodeColour(node.type, available, completed, current);
  const scale = available ? 1.18 : current ? 1.08 : 0.92;

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();

    if (available) {
      onChoose(node.id);
    }
  }

  return (
    <group position={position} scale={scale}>
      <mesh onClick={handleClick}>
        {node.type === "shop" ? <boxGeometry args={[0.72, 0.34, 0.72]} /> : <sphereGeometry args={[0.38, 24, 18]} />}
        <meshStandardMaterial color={colour} roughness={0.62} metalness={node.type === "treasure" ? 0.35 : 0.06} />
      </mesh>
      {available ? (
        <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.52, 0.62, 32]} />
          <meshBasicMaterial color="#f6c85f" transparent opacity={0.86} />
        </mesh>
      ) : null}
      <Text
        position={[0, 0.58, 0]}
        rotation={[-0.85, 0, 0]}
        fontSize={0.17}
        maxWidth={1.35}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color="#f7f5ef"
      >
        {node.label}
      </Text>
    </group>
  );
}

export function getNodePosition(node: MapNode): [number, number, number] {
  return [node.lane * 1.45, 0.2, node.row * -1.35 + 1.5];
}

function getNodeColour(type: MapNode["type"], available: boolean, completed: boolean, current: boolean) {
  if (current) {
    return "#f6c85f";
  }

  if (completed) {
    return "#49b86f";
  }

  if (!available) {
    return "#697069";
  }

  if (type === "shop") {
    return "#f6c85f";
  }

  if (type === "rest") {
    return "#49b86f";
  }

  if (type === "treasure") {
    return "#54b9c7";
  }

  if (type === "elite") {
    return "#a779df";
  }

  if (type === "guardian" || type === "finalBoss") {
    return "#ef6f55";
  }

  return "#d96d4f";
}
