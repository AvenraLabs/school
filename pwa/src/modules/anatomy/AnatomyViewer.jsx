import React, { useRef, useState, useMemo, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import { Autorenew, Visibility, FitScreen, Label, LabelOff } from "@mui/icons-material";

// Preload default organ GLTF model for faster initial render (others lazy load on demand)
const modelPaths = {
  heart: "/models/heart.glb",
  brain: "/models/brain.glb",
  lungs: "/models/lungs.glb",
  kidneys: "/models/kidneys.glb",
  eyeball: "/models/eyeball.glb",
  liver: "/models/liver.glb",
  skin: "/models/skin.glb",
};

try {
  useGLTF.preload(modelPaths.heart);
} catch (e) {
  // Ignore preload error for missing models
}

/**
 * GLTF 3D Organ Model Component
 * Loads authentic GLTF/GLB models, auto-centers, and scales them appropriately.
 */
function GltfOrganModel({ modelPath, wireframe }) {
  const { scene } = useGLTF(modelPath);

  // Memoize scene cloning strictly on loaded scene change to prevent GC lag
  const clonedScene = useMemo(() => {
    if (!scene) return null;
    const clone = scene.clone(true);

    // Compute bounding box to auto-center and normalize scale
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = maxDim > 0 ? 2.2 / maxDim : 1.0;

    clone.position.x = -center.x * scaleFactor;
    clone.position.y = -center.y * scaleFactor;
    clone.position.z = -center.z * scaleFactor;
    clone.scale.set(scaleFactor, scaleFactor, scaleFactor);

    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.roughness = 0.45;
        child.material.metalness = 0.15;
      }
    });

    return clone;
  }, [scene]);

  // Update wireframe property reactively without re-cloning full mesh graph
  useEffect(() => {
    if (!clonedScene) return;
    clonedScene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.wireframe = !!wireframe;
        child.material.needsUpdate = true;
      }
    });
  }, [clonedScene, wireframe]);

  return clonedScene ? <primitive object={clonedScene} /> : null;
}

/**
 * Error Boundary for GLTF Model loading with graceful fallback to Procedural Mesh
 */
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn("GLTF model fallback triggered:", error);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.modelPath !== this.props.modelPath) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * Procedural 3D Mesh Generator Fallback
 */
function ProceduralOrganMesh({ organ, wireframe }) {
  const meshRef = useRef();

  const materialProps = useMemo(() => {
    return {
      color: organ.accent || "#EE7C6A",
      roughness: 0.35,
      metalness: 0.15,
      wireframe: wireframe,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2,
    };
  }, [organ, wireframe]);

  switch (organ.id) {
    case "heart":
      return (
        <group ref={meshRef} position={[0, -0.1, 0]} scale={0.9}>
          <mesh position={[0, -0.2, 0]}>
            <sphereGeometry args={[1.0, 24, 24]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          <mesh position={[-0.3, 0.9, 0]} rotation={[0, 0, -0.3]}>
            <torusGeometry args={[0.45, 0.18, 12, 24, Math.PI * 1.2]} />
            <meshPhysicalMaterial color="#DC2626" roughness={0.3} wireframe={wireframe} />
          </mesh>
          <mesh position={[0.4, 0.7, 0.2]} rotation={[0.2, 0, 0.4]}>
            <cylinderGeometry args={[0.18, 0.2, 0.8, 12]} />
            <meshPhysicalMaterial color="#2563EB" roughness={0.3} wireframe={wireframe} />
          </mesh>
        </group>
      );

    case "brain":
      return (
        <group ref={meshRef} position={[0, -0.1, 0]} scale={0.85}>
          <mesh position={[-0.45, 0.2, 0]}>
            <sphereGeometry args={[0.85, 20, 20]} />
            <meshPhysicalMaterial {...materialProps} color="#C58696" roughness={0.6} />
          </mesh>
          <mesh position={[0.45, 0.2, 0]}>
            <sphereGeometry args={[0.85, 20, 20]} />
            <meshPhysicalMaterial {...materialProps} color="#C58696" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.6, -0.4]}>
            <sphereGeometry args={[0.55, 16, 16]} />
            <meshPhysicalMaterial color="#9D5C68" roughness={0.4} wireframe={wireframe} />
          </mesh>
          <mesh position={[0, -0.9, -0.1]} rotation={[0.2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.18, 0.7, 12]} />
            <meshPhysicalMaterial color="#E2B4BD" roughness={0.5} wireframe={wireframe} />
          </mesh>
        </group>
      );

    case "lungs":
      return (
        <group ref={meshRef} position={[0, -0.15, 0]} scale={0.85}>
          <mesh position={[0, 1.1, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.9, 12]} />
            <meshPhysicalMaterial color="#E4E1D8" roughness={0.3} wireframe={wireframe} />
          </mesh>
          <mesh position={[-0.65, 0.1, 0]} rotation={[0, 0, 0.1]}>
            <capsuleGeometry args={[0.5, 1.1, 12, 24]} />
            <meshPhysicalMaterial {...materialProps} color="#DD8F8B" />
          </mesh>
          <mesh position={[0.65, 0.1, 0]} rotation={[0, 0, -0.1]}>
            <capsuleGeometry args={[0.45, 1.0, 12, 24]} />
            <meshPhysicalMaterial {...materialProps} color="#DD8F8B" />
          </mesh>
        </group>
      );

    case "kidneys":
      return (
        <group ref={meshRef} position={[0, 0, 0]} scale={0.85}>
          <mesh position={[-0.7, 0, 0]} rotation={[0, 0, -0.2]}>
            <torusGeometry args={[0.6, 0.35, 12, 24]} />
            <meshPhysicalMaterial {...materialProps} color="#6393D8" />
          </mesh>
          <mesh position={[0.7, -0.1, 0]} rotation={[0, 0, 0.2]}>
            <torusGeometry args={[0.6, 0.35, 12, 24]} />
            <meshPhysicalMaterial {...materialProps} color="#6393D8" />
          </mesh>
        </group>
      );

    case "eyeball":
      return (
        <group ref={meshRef} position={[0, 0, 0]} scale={0.85}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1.1, 24, 24]} />
            <meshPhysicalMaterial color="#FAFAF8" roughness={0.1} clearcoat={1.0} wireframe={wireframe} />
          </mesh>
          <mesh position={[0, 0, 0.95]}>
            <circleGeometry args={[0.45, 24]} />
            <meshBasicMaterial color="#3B82F6" />
          </mesh>
          <mesh position={[0, 0, 0.97]}>
            <circleGeometry args={[0.2, 24]} />
            <meshBasicMaterial color="#09090B" />
          </mesh>
          <mesh position={[0.2, -0.2, -1.2]} rotation={[0.4, -0.2, 0]}>
            <cylinderGeometry args={[0.15, 0.18, 0.8, 12]} />
            <meshPhysicalMaterial color="#F2A33B" roughness={0.4} wireframe={wireframe} />
          </mesh>
        </group>
      );

    default:
      return (
        <mesh ref={meshRef} position={[0, 0, 0]} scale={0.85}>
          <icosahedronGeometry args={[1.1, 2]} />
          <meshPhysicalMaterial {...materialProps} />
        </mesh>
      );
  }
}

/**
 * Organ Model Selector Component
 * Checks GLTF model availability and renders GLTF model or procedural fallback.
 */
function RenderOrganModel({ organ, wireframe }) {
  const modelPath = modelPaths[organ.id];

  const proceduralFallback = <ProceduralOrganMesh organ={organ} wireframe={wireframe} />;

  if (!modelPath) {
    return proceduralFallback;
  }

  return (
    <ModelErrorBoundary modelPath={modelPath} fallback={proceduralFallback}>
      <Suspense fallback={proceduralFallback}>
        <GltfOrganModel modelPath={modelPath} wireframe={wireframe} />
      </Suspense>
    </ModelErrorBoundary>
  );
}

/**
 * Non-intrusive 3D Hotspot Pin Markers
 */
function HotspotMarkers({ hotspots, activeHotspot, onSelectHotspot, showLabels }) {
  return (
    <>
      {hotspots?.map((hs, index) => {
        const isSelected = activeHotspot?.id === hs.id;
        return (
          <group key={hs.id} position={hs.position}>
            {/* HTML Overlay Pin */}
            <Html center zIndexRange={[10, 0]}>
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectHotspot(hs);
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.6,
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "transform 0.15s ease",
                  transform: isSelected ? "scale(1.15)" : "scale(1)",
                }}
              >
                {/* Numbered Circle Dot Badge */}
                <Box
                  sx={{
                    width: isSelected ? 26 : 22,
                    height: isSelected ? 26 : 22,
                    borderRadius: "50%",
                    bgcolor: isSelected ? "#FFFFFF" : hs.color || "#2F6F5E",
                    color: isSelected ? hs.color || "#2F6F5E" : "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 800,
                    boxShadow: isSelected
                      ? `0 0 0 4px ${hs.color || "#2F6F5E"}80, 0 4px 12px rgba(0,0,0,0.4)`
                      : "0 2px 8px rgba(0,0,0,0.3)",
                    border: "2px solid #FFFFFF",
                  }}
                >
                  {index + 1}
                </Box>

                {/* Text Label Pill - Only visible if showLabels is true or if selected */}
                {(showLabels || isSelected) && (
                  <Box
                    sx={{
                      bgcolor: isSelected ? hs.color || "#2F6F5E" : "rgba(13, 19, 31, 0.92)",
                      color: "#FFFFFF",
                      px: 1,
                      py: 0.4,
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      maxWidth: "150px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {hs.label}
                  </Box>
                )}
              </Box>
            </Html>
          </group>
        );
      })}
    </>
  );
}

export default function AnatomyViewer({
  organ,
  activeHotspot,
  onSelectHotspot,
  autoRotate,
  onToggleAutoRotate,
}) {
  const [wireframe, setWireframe] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const controlsRef = useRef();

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%", bgcolor: "#0D131F", overflow: "hidden" }}>
      {/* 3D Control Overlay Toolbar */}
      <Box
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 10,
          display: "flex",
          gap: 0.8,
          bgcolor: "rgba(20, 33, 61, 0.85)",
          backdropFilter: "blur(8px)",
          p: 0.6,
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        <Tooltip title={showLabels ? "Hide Label Text" : "Show Label Text"}>
          <IconButton
            size="small"
            onClick={() => setShowLabels(!showLabels)}
            sx={{ color: showLabels ? "#2F6F5E" : "#94A3B8" }}
          >
            {showLabels ? <Label fontSize="small" /> : <LabelOff fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Tooltip title={autoRotate ? "Pause Auto-Rotate" : "Auto-Rotate 3D"}>
          <IconButton
            size="small"
            onClick={onToggleAutoRotate}
            sx={{ color: autoRotate ? "#2F6F5E" : "#94A3B8" }}
          >
            <Autorenew fontSize="small" className={autoRotate ? "animate-spin" : ""} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Toggle Wireframe Mesh">
          <IconButton
            size="small"
            onClick={() => setWireframe(!wireframe)}
            sx={{ color: wireframe ? "#2F6F5E" : "#94A3B8" }}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Reset Camera View">
          <IconButton
            size="small"
            onClick={handleResetCamera}
            sx={{ color: "#94A3B8", "&:hover": { color: "#FFFFFF" } }}
          >
            <FitScreen fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Organ Header Tag */}
      <Box
        sx={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "rgba(20, 33, 61, 0.85)",
          backdropFilter: "blur(8px)",
          px: 1.2,
          py: 0.6,
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        <Typography variant="body1" sx={{ fontSize: 18 }}>
          {organ.icon}
        </Typography>
        <Box>
          <Typography variant="subtitle2" sx={{ color: "#FFFFFF", fontWeight: 700, lineHeight: 1.1, fontSize: 13 }}>
            {organ.name}
          </Typography>
        </Box>
      </Box>

      {/* Three.js R3F Canvas */}
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5.0], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={["#0D131F"]} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, -10, -5]} intensity={0.6} color="#6393D8" />

        <Suspense fallback={null}>
          <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.15}>
            <RenderOrganModel organ={organ} wireframe={wireframe} />
          </Float>

          <HotspotMarkers
            hotspots={organ.hotspots}
            activeHotspot={activeHotspot}
            onSelectHotspot={onSelectHotspot}
            showLabels={showLabels}
          />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          autoRotate={autoRotate}
          autoRotateSpeed={2.0}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2.0}
          maxDistance={8.0}
        />
      </Canvas>
    </Box>
  );
}

