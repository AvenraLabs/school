import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { CAMERA, ROBOT_GLTF_PATH, ROBOT_POSITION, ROBOT_SCALE } from "./robot.constants";
import { useRobot } from "./useRobot";

function RobotModel({ speaking }) {
  const { scene } = useGLTF(ROBOT_GLTF_PATH);
  const { blink } = useRobot({ speaking });

  // 🔴 PLACEHOLDER animation flags
  // Later: morphTargets for eyes / mouth
  scene.traverse((obj) => {
    if (obj.isMesh) {
      obj.material.emissiveIntensity = speaking ? 0.4 : 0.1;
    }
  });

  return (
    <primitive
      object={scene}
      position={ROBOT_POSITION}
      scale={ROBOT_SCALE}
    />
  );
}

export default function RobotScene({ speaking }) {
  return (
    <Canvas
      camera={{
        position: CAMERA.position,
        fov: CAMERA.fov,
      }}
      style={{ height: 260, width: "100%" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 3]} intensity={1} />

      <RobotModel speaking={speaking} />

      {/* lock controls for now */}
      <OrbitControls enableZoom={false} enableRotate={false} />
    </Canvas>
  );
}
