import { Line } from "@react-three/drei";
import type { MapNode } from "../game/types";
import { getNodePosition } from "./RouteNodeMesh";

interface MapPathProps {
  from: MapNode;
  to: MapNode;
  active: boolean;
}

export function MapPath({ from, to, active }: MapPathProps) {
  const start = getNodePosition(from);
  const end = getNodePosition(to);

  return (
    <Line
      points={[
        [start[0], 0.03, start[2]],
        [end[0], 0.03, end[2]]
      ]}
      color={active ? "#f6c85f" : "#6f766f"}
      lineWidth={active ? 4 : 2}
      transparent
      opacity={active ? 0.9 : 0.45}
    />
  );
}
