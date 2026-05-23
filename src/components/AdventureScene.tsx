import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useAssetManifest } from "../game/useAssetManifest";
import { FINAL_BOSS_NODE, getCurrentMap } from "../game/maps";
import type { MapNode, RunState } from "../game/types";
import { BattleGround } from "./BattleGround";
import { MapPath } from "./MapPath";
import { getNodePosition, RouteNodeMesh } from "./RouteNodeMesh";
import { OptionalGlbModel, SplatScene } from "./SceneAssets";

interface AdventureSceneProps {
  state: RunState;
  availableNodes: MapNode[];
  onChooseNode: (nodeId: string) => void;
}

const BATTLE_PLAYER_POSITION: [number, number, number] = [-1.25, 0.52, -0.2];
const BATTLE_ENEMY_POSITION: [number, number, number] = [1.25, 0.52, -0.2];

export function AdventureScene({ state, availableNodes, onChooseNode }: AdventureSceneProps) {
  const assetManifest = useAssetManifest();
  const nodes = getSceneNodes(state, availableNodes);
  const isBattle = state.phase === "battle";
  const availableIds = new Set(availableNodes.map((node) => node.id));
  const completedIds = new Set(state.completedNodeIds);
  const playerPosition = isBattle ? BATTLE_PLAYER_POSITION : getFigurePosition(nodes, state.currentNodeId, -0.45);
  const enemyPosition = isBattle ? BATTLE_ENEMY_POSITION : getFigurePosition(nodes, state.currentNodeId, 0.45);

  return (
    <div className="scene-layer">
      <Canvas camera={{ position: [0, 5.4, 6.7], fov: 48 }} shadows>
        <color attach="background" args={["#171a16"]} />
        <fog attach="fog" args={["#171a16", 7, 16]} />
        <ambientLight intensity={0.65} />
        <hemisphereLight args={["#eaf7ff", "#2b332a", 0.8]} />
        <directionalLight position={[3.5, 6, 3]} intensity={1.45} castShadow />
        <SplatScene asset={assetManifest.scene} />
        {isBattle ? (
          <BattleGround />
        ) : (
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, -1.05]} receiveShadow>
              <planeGeometry args={[10, 8]} />
              <meshStandardMaterial color="#263328" roughness={0.88} />
            </mesh>
            {nodes.flatMap((node) =>
              node.nextIds
                .map((nextId) => nodes.find((candidate) => candidate.id === nextId))
                .filter((nextNode): nextNode is MapNode => Boolean(nextNode))
                .map((nextNode) => (
                  <MapPath
                    key={`${node.id}-${nextNode.id}`}
                    from={node}
                    to={nextNode}
                    active={completedIds.has(node.id) && (availableIds.has(nextNode.id) || completedIds.has(nextNode.id))}
                  />
                ))
            )}
            {nodes.map((node) => (
              <RouteNodeMesh
                key={node.id}
                node={node}
                available={availableIds.has(node.id)}
                completed={completedIds.has(node.id)}
                current={state.currentNodeId === node.id}
                onChoose={onChooseNode}
              />
            ))}
          </>
        )}
        <OptionalGlbModel
          asset={assetManifest.skins[state.selectedSkinId]}
          position={playerPosition}
          fallback={
            <mesh position={playerPosition} castShadow>
              <capsuleGeometry args={[0.16, 0.52, 8, 16]} />
              <meshStandardMaterial color="#f6c85f" roughness={0.52} />
            </mesh>
          }
        />
        {state.phase === "battle" && state.currentEnemy ? (
          <OptionalGlbModel
            asset={assetManifest.enemies[state.currentEnemy.id]}
            position={enemyPosition}
            rotation={[0, Math.PI, 0]}
            fallback={
              <mesh position={enemyPosition} castShadow>
                <coneGeometry args={[0.24, 0.64, 6]} />
                <meshStandardMaterial color="#ef6f55" roughness={0.48} />
              </mesh>
            }
          />
        ) : null}
        <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.55} maxPolarAngle={1.12} />
      </Canvas>
    </div>
  );
}

function getSceneNodes(state: RunState, availableNodes: MapNode[]): MapNode[] {
  const currentMap = getCurrentMap(state.mapIndex);

  if (currentMap) {
    return currentMap.nodes;
  }

  return [
    {
      id: "boss-gate",
      type: "start",
      label: state.keys >= 3 ? "3 keys ready" : "Locked gate",
      detail: "The storm gate waits.",
      row: 0,
      lane: 0,
      nextIds: availableNodes.map((node) => node.id)
    },
    FINAL_BOSS_NODE
  ];
}

function getFigurePosition(nodes: MapNode[], nodeId: string, offsetX: number): [number, number, number] {
  const node = nodes.find((candidate) => candidate.id === nodeId) ?? nodes[0];
  const [x, , z] = getNodePosition(node);

  return [x + offsetX, 0.58, z + 0.18];
}
