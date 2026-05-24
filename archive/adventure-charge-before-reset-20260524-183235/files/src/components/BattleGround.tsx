const STALACTITES = [
  [-2.8, 2.2, -1.7],
  [-1.3, 2.45, -2.25],
  [0.2, 2.15, -2.05],
  [1.6, 2.38, -1.9],
  [2.75, 2.05, -1.55]
] as const;

const ROCKS = [
  [-2.9, 0.18, 0.9, 0.42],
  [-2.25, 0.16, -0.2, 0.28],
  [2.15, 0.14, 0.55, 0.33],
  [2.85, 0.2, -0.55, 0.48],
  [0.25, 0.08, 1.45, 0.18]
] as const;

const PUDDLES = [
  [-1.7, 0.012, 0.85, 0.62, 0.26],
  [1.55, 0.014, 0.72, 0.76, 0.3],
  [0.6, 0.016, -0.82, 0.48, 0.2]
] as const;

export function BattleGround() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
        <planeGeometry args={[7.2, 5.2]} />
        <meshStandardMaterial color="#241f18" roughness={0.96} metalness={0.02} />
      </mesh>

      <mesh position={[0, 1.05, -2.15]} receiveShadow>
        <boxGeometry args={[7.4, 2.5, 0.32]} />
        <meshStandardMaterial color="#2c2923" roughness={0.98} />
      </mesh>
      <mesh position={[-3.55, 0.76, -0.15]} rotation={[0, 0.22, 0]} receiveShadow>
        <boxGeometry args={[0.38, 1.9, 4.8]} />
        <meshStandardMaterial color="#28251f" roughness={0.98} />
      </mesh>
      <mesh position={[3.55, 0.76, -0.15]} rotation={[0, -0.22, 0]} receiveShadow>
        <boxGeometry args={[0.38, 1.9, 4.8]} />
        <meshStandardMaterial color="#28251f" roughness={0.98} />
      </mesh>

      <mesh position={[0, 1.32, -2.02]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1.08, 0.16, 18, 48]} />
        <meshStandardMaterial color="#373229" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.58, -2]} receiveShadow>
        <boxGeometry args={[1.74, 1.18, 0.36]} />
        <meshStandardMaterial color="#11130f" roughness={1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0.12]}>
        <planeGeometry args={[0.74, 5.1]} />
        <meshStandardMaterial color="#30422d" roughness={0.42} metalness={0.08} transparent opacity={0.82} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0.12]}>
        <planeGeometry args={[0.32, 5.1]} />
        <meshStandardMaterial color="#718044" roughness={0.2} metalness={0.12} transparent opacity={0.5} />
      </mesh>

      {PUDDLES.map(([x, y, z, width, depth], index) => (
        <mesh key={`puddle-${index}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, y, z]} scale={[width, depth, 1]}>
          <circleGeometry args={[1, 28]} />
          <meshStandardMaterial
            color="#3d5337"
            roughness={0.16}
            metalness={0.18}
            transparent
            opacity={0.46}
          />
        </mesh>
      ))}

      <Pipe position={[-2.65, 0.86, -2.02]} rotation={[Math.PI / 2, 0, 0.08]} />
      <Pipe position={[2.68, 0.72, -2.02]} rotation={[Math.PI / 2, 0, -0.08]} />

      {STALACTITES.map(([x, y, z], index) => (
        <mesh key={`stalactite-${index}`} position={[x, y, z]} rotation={[Math.PI, 0, 0]} castShadow>
          <coneGeometry args={[0.18 + index * 0.015, 0.82, 7]} />
          <meshStandardMaterial color="#39352d" roughness={0.95} />
        </mesh>
      ))}

      {ROCKS.map(([x, y, z, scale], index) => (
        <mesh key={`rock-${index}`} position={[x, y, z]} scale={scale} rotation={[0.2, index * 0.7, -0.18]} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={index % 2 === 0 ? "#343026" : "#25231f"} roughness={0.98} />
        </mesh>
      ))}

      <mesh position={[0, 0.04, -1.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 2.36, 64]} />
        <meshBasicMaterial color="#6f7b47" transparent opacity={0.28} />
      </mesh>
    </group>
  );
}

function Pipe({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.72, 28, 1, true]} />
        <meshStandardMaterial color="#4a463b" roughness={0.78} metalness={0.32} />
      </mesh>
      <mesh position={[0, 0.38, 0]} castShadow>
        <torusGeometry args={[0.34, 0.045, 10, 28]} />
        <meshStandardMaterial color="#756647" roughness={0.82} metalness={0.25} />
      </mesh>
      <mesh position={[0, -0.39, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.31, 28]} />
        <meshStandardMaterial color="#0d120c" roughness={0.9} />
      </mesh>
    </group>
  );
}
