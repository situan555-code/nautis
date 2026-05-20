import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Center, Environment, Lightformer, MeshTransmissionMaterial, OrbitControls, Text3D } from '@react-three/drei';
import * as THREE from 'three';
import interLikeBold from 'three/examples/fonts/helvetiker_bold.typeface.json';

// Production renderer policy:
// This hero intentionally uses React Three Fiber's default WebGL renderer.
// WebGPU is not enabled by default; explore it only as a separate experiment with feature detection and WebGL fallback.
export const MAX_DPR = 1.5;
export const ENABLE_POSTPROCESSING = false;
export const ENABLE_TRANSMISSION = true;
export const MOBILE_ENABLE_3D = false;
export const REDUCED_MOTION_DISABLE_ANIMATION = true;
export const HERO_RENDER_WHEN_VISIBLE_ONLY = true;
export const TARGET_FPS_MODE = 'on-demand';
export const DEV_TUNING_ENABLED = import.meta.env.DEV;
export const MATERIAL_TRANSMISSION = {
  dark: 0.74,
  light: 0.56,
};
export const MATERIAL_THICKNESS = {
  dark: 0.42,
  light: 0.36,
};
export const MATERIAL_ROUGHNESS = {
  dark: 0.025,
  light: 0.035,
};
export const MATERIAL_CLEARCOAT = 1;
export const MATERIAL_CLEARCOAT_ROUGHNESS = 0.015;
export const MATERIAL_ENV_INTENSITY = {
  dark: 1.55,
  light: 1.25,
};
export const MATERIAL_OPACITY = {
  dark: 0.74,
  light: 0.82,
};
export const MATERIAL_IOR = 1.52;
export const MATERIAL_ATTENUATION_DISTANCE = {
  dark: 2.8,
  light: 2.2,
};
export const MATERIAL_TRANSMISSION_RESOLUTION = 512;
export const MATERIAL_TRANSMISSION_SAMPLES = 8;
export const MATERIAL_CHROMATIC_ABERRATION = 0.16;
export const MATERIAL_DISTORTION = 0.07;
export const KEY_LIGHT_INTENSITY = {
  dark: 3.2,
  light: 2.4,
};
export const RIM_LIGHT_INTENSITY = {
  dark: 2.6,
  light: 1.8,
};
export const FILL_LIGHT_INTENSITY = {
  dark: 0.8,
  light: 0.65,
};

// Performance tuning:
// - MAX_DPR controls sharpness vs GPU cost.
// - ENABLE_TRANSMISSION can be disabled for a cheaper physical material.
// - MOBILE_ENABLE_3D keeps small screens on the CSS fallback until the scene is tuned for mobile.
// - ENABLE_POSTPROCESSING stays false for production readability and render cost.
export const WORD_TEXT = 'Sunder';
export const WORD_SCALE = 3.35;
export const WORD_POSITION = [0, -0.86, 1.3];
export const WORD_ROTATION = [-Math.PI / 2, 0, 0];
export const TEXT_DEPTH = 0.18;
export const TEXT_BEVEL_SIZE = 0.01;
export const TEXT_BEVEL_THICKNESS = 0.01;

export const PERIOD_RADIUS = 0.18;
export const PERIOD_DEPTH = TEXT_DEPTH;
export const PERIOD_OFFSET_X = 4.36;
export const PERIOD_OFFSET_Y = 0.06;
export const PERIOD_OFFSET_Z = TEXT_DEPTH / 2;

export const WORDMARK_GROUP_POSITION = [0, 0, 0];
export const WORDMARK_GROUP_ROTATION = [0, 0, 0];
export const GRID_POSITION = [0, -1.02, 0];
export const GRID_ROTATION = [0, 0, 0];
export const GRID_SIZE = 56;
export const GRID_DIVISIONS = 28;
export const GRID_OPACITY = {
  dark: 0.34,
  light: 0.24,
};
export const GRID_CELL_SIZE = 2;
export const GRID_MINOR_LINE_OPACITY = {
  dark: 0.16,
  light: 0.12,
};
export const GRID_MAJOR_EVERY = 4;
export const GRID_MAJOR_LINE_OPACITY = {
  dark: 0.38,
  light: 0.28,
};
export const GRID_CROSS_EVERY = 4;
export const GRID_CROSS_SIZE = 0.42;
export const GRID_CROSS_OPACITY = {
  dark: 0.5,
  light: 0.4,
};
export const GRID_PLANE_SIZE = 56;
export const GRID_Y_POSITION = -1.02;
export const GRID_Z_POSITION = 0;
export const GRID_FADE_DISTANCE = 28;
export const GRID_THEME_DARK_COLOR = '#aeb4bf';
export const GRID_THEME_LIGHT_COLOR = '#5d626b';
export const GRID_GROUND_SHADOW_OPACITY = {
  dark: 0.3,
  light: 0.12,
};

export const CAMERA_POSITION = [10, 20, 20];
export const CAMERA_FOV = 39;
export const CAMERA_ZOOM = 64;
export const DRAG_ROTATION_STRENGTH = 1;
export const MAX_DRAG_ROTATION_X = Math.PI / 3;
export const MAX_DRAG_ROTATION_Y = Math.PI / 3;
export const RETURN_TO_CENTER_STRENGTH = 0;

const THEME_SCENE = {
  dark: {
    background: '#020202',
    grid: '#6f737a',
    gridCenter: '#b9bec6',
    word: '#e6e8ec',
    attenuation: '#f5f6f8',
    light: '#ffffff',
  },
  light: {
    background: '#f7f5ef',
    grid: '#aeb1b7',
    gridCenter: '#5f636b',
    word: '#2a2d32',
    attenuation: '#4a4f58',
    light: '#ffffff',
  },
};

function getTuningDefaults(themeName) {
  return {
    wordPosition: WORD_POSITION,
    wordRotation: WORD_ROTATION,
    wordScale: WORD_SCALE,
    textDepth: TEXT_DEPTH,
    bevelSize: TEXT_BEVEL_SIZE,
    periodRadius: PERIOD_RADIUS,
    periodDepth: PERIOD_DEPTH,
    periodPosition: [PERIOD_OFFSET_X, PERIOD_OFFSET_Y, PERIOD_OFFSET_Z],
    gridCellSize: GRID_CELL_SIZE,
    gridMinorOpacity: GRID_MINOR_LINE_OPACITY[themeName],
    gridMajorOpacity: GRID_MAJOR_LINE_OPACITY[themeName],
    gridCrossOpacity: GRID_CROSS_OPACITY[themeName],
    materialTransmission: MATERIAL_TRANSMISSION[themeName],
    materialRoughness: MATERIAL_ROUGHNESS[themeName],
    materialThickness: MATERIAL_THICKNESS[themeName],
    keyLightIntensity: KEY_LIGHT_INTENSITY[themeName],
    rimLightIntensity: RIM_LIGHT_INTENSITY[themeName],
    backgroundColor: THEME_SCENE[themeName].background,
    wordColor: THEME_SCENE[themeName].word,
    attenuationColor: THEME_SCENE[themeName].attenuation,
    gridColor: themeName === 'light' ? GRID_THEME_LIGHT_COLOR : GRID_THEME_DARK_COLOR,
    gridCenterColor: THEME_SCENE[themeName].gridCenter,
    lightColor: THEME_SCENE[themeName].light,
  };
}

function resolveTuning(themeName, values) {
  const defaults = getTuningDefaults(themeName);

  return {
    wordPosition: [
      values?.wordPositionX ?? defaults.wordPosition[0],
      values?.wordPositionY ?? defaults.wordPosition[1],
      values?.wordPositionZ ?? defaults.wordPosition[2],
    ],
    wordRotation: [
      values?.wordRotationX ?? defaults.wordRotation[0],
      values?.wordRotationY ?? defaults.wordRotation[1],
      values?.wordRotationZ ?? defaults.wordRotation[2],
    ],
    wordScale: values?.wordScale ?? defaults.wordScale,
    textDepth: values?.textDepth ?? defaults.textDepth,
    bevelSize: values?.bevelSize ?? defaults.bevelSize,
    periodRadius: values?.periodRadius ?? defaults.periodRadius,
    periodDepth: values?.periodDepth ?? defaults.periodDepth,
    periodPosition: [
      values?.periodPositionX ?? defaults.periodPosition[0],
      values?.periodPositionY ?? defaults.periodPosition[1],
      values?.periodPositionZ ?? defaults.periodPosition[2],
    ],
    gridCellSize: values?.gridCellSize ?? defaults.gridCellSize,
    gridMinorOpacity: values?.gridMinorOpacity ?? defaults.gridMinorOpacity,
    gridMajorOpacity: values?.gridMajorOpacity ?? defaults.gridMajorOpacity,
    gridCrossOpacity: values?.gridCrossOpacity ?? defaults.gridCrossOpacity,
    materialTransmission: values?.materialTransmission ?? defaults.materialTransmission,
    materialRoughness: values?.materialRoughness ?? defaults.materialRoughness,
    materialThickness: values?.materialThickness ?? defaults.materialThickness,
    keyLightIntensity: values?.keyLightIntensity ?? defaults.keyLightIntensity,
    rimLightIntensity: values?.rimLightIntensity ?? defaults.rimLightIntensity,
    backgroundColor: values?.backgroundColor ?? defaults.backgroundColor,
    wordColor: values?.wordColor ?? defaults.wordColor,
    attenuationColor: values?.attenuationColor ?? defaults.attenuationColor,
    gridColor: values?.gridColor ?? defaults.gridColor,
    gridCenterColor: values?.gridCenterColor ?? defaults.gridCenterColor,
    lightColor: values?.lightColor ?? defaults.lightColor,
  };
}

function getCurrentTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function ResinMaterial({ themeName, tuning }) {
  if (!ENABLE_TRANSMISSION) {
    return (
      <meshPhysicalMaterial
        color={tuning.wordColor}
        roughness={tuning.materialRoughness}
        metalness={0}
        transmission={tuning.materialTransmission * 0.55}
        thickness={tuning.materialThickness}
        ior={MATERIAL_IOR}
        clearcoat={MATERIAL_CLEARCOAT}
        clearcoatRoughness={MATERIAL_CLEARCOAT_ROUGHNESS}
        envMapIntensity={MATERIAL_ENV_INTENSITY[themeName]}
        transparent
        opacity={MATERIAL_OPACITY[themeName]}
      />
    );
  }

  return (
    <MeshTransmissionMaterial
      color={tuning.wordColor}
      backside
      backsideThickness={tuning.materialThickness}
      samples={MATERIAL_TRANSMISSION_SAMPLES}
      resolution={MATERIAL_TRANSMISSION_RESOLUTION}
      transmission={tuning.materialTransmission}
      attenuationColor={tuning.attenuationColor}
      attenuationDistance={MATERIAL_ATTENUATION_DISTANCE[themeName]}
      clearcoat={MATERIAL_CLEARCOAT}
      clearcoatRoughness={MATERIAL_CLEARCOAT_ROUGHNESS}
      thickness={tuning.materialThickness}
      chromaticAberration={MATERIAL_CHROMATIC_ABERRATION}
      anisotropy={0.32}
      roughness={tuning.materialRoughness}
      distortion={MATERIAL_DISTORTION}
      distortionScale={0.04}
      envMapIntensity={MATERIAL_ENV_INTENSITY[themeName]}
      temporalDistortion={0}
      ior={MATERIAL_IOR}
      specularIntensity={1}
      transparent
      opacity={MATERIAL_OPACITY[themeName]}
    />
  );
}

function WordmarkGroup({ themeName, tuning }) {
  return (
    <group position={WORDMARK_GROUP_POSITION} rotation={WORDMARK_GROUP_ROTATION}>
      <Center>
        <group position={tuning.wordPosition} rotation={tuning.wordRotation} scale={tuning.wordScale}>
          <Text3D
            font={interLikeBold}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={1}
            size={1}
            depth={tuning.textDepth}
            curveSegments={96}
            bevelEnabled
            bevelSize={tuning.bevelSize}
            bevelThickness={TEXT_BEVEL_THICKNESS}
            bevelSegments={8}
            letterSpacing={-0.035}
          >
            {WORD_TEXT}
            <ResinMaterial themeName={themeName} tuning={tuning} />
          </Text3D>
          <mesh position={tuning.periodPosition} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[tuning.periodRadius, tuning.periodRadius, tuning.periodDepth, 48]} />
            <ResinMaterial themeName={themeName} tuning={tuning} />
          </mesh>
        </group>
      </Center>
    </group>
  );
}

function createLineGeometry(points) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  return geometry;
}

function ReferenceGrid({ themeName, tuning }) {
  const { minorGeometry, majorGeometry, crossGeometry } = useMemo(() => {
    const halfSize = GRID_PLANE_SIZE / 2;
    const lineExtent = Math.min(halfSize, GRID_FADE_DISTANCE);
    const cellsPerSide = Math.floor(halfSize / tuning.gridCellSize);
    const minorPoints = [];
    const majorPoints = [];
    const crossPoints = [];

    for (let index = -cellsPerSide; index <= cellsPerSide; index += 1) {
      const position = index * tuning.gridCellSize;
      const target = index % GRID_MAJOR_EVERY === 0 ? majorPoints : minorPoints;

      target.push(-lineExtent, 0, position, lineExtent, 0, position);
      target.push(position, 0, -lineExtent, position, 0, lineExtent);
    }

    for (let xIndex = -cellsPerSide; xIndex <= cellsPerSide; xIndex += GRID_CROSS_EVERY) {
      for (let zIndex = -cellsPerSide; zIndex <= cellsPerSide; zIndex += GRID_CROSS_EVERY) {
        const x = xIndex * tuning.gridCellSize;
        const z = zIndex * tuning.gridCellSize;
        const crossHalf = GRID_CROSS_SIZE / 2;

        if (Math.abs(x) <= lineExtent && Math.abs(z) <= lineExtent) {
          crossPoints.push(x - crossHalf, 0.002, z, x + crossHalf, 0.002, z);
          crossPoints.push(x, 0.002, z - crossHalf, x, 0.002, z + crossHalf);
        }
      }
    }

    return {
      minorGeometry: createLineGeometry(minorPoints),
      majorGeometry: createLineGeometry(majorPoints),
      crossGeometry: createLineGeometry(crossPoints),
    };
  }, [tuning.gridCellSize]);

  const shadowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(128, 128, 8, 128, 128, 124);
    gradient.addColorStop(0, themeName === 'light' ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(0.5, themeName === 'light' ? 'rgba(0, 0, 0, 0.22)' : 'rgba(0, 0, 0, 0.45)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [themeName]);

  return (
    <group position={[GRID_POSITION[0], GRID_Y_POSITION, GRID_Z_POSITION]} rotation={GRID_ROTATION}>
      <lineSegments geometry={minorGeometry} renderOrder={1}>
        <lineBasicMaterial color={tuning.gridColor} transparent opacity={tuning.gridMinorOpacity} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={majorGeometry} renderOrder={2}>
        <lineBasicMaterial color={tuning.gridColor} transparent opacity={tuning.gridMajorOpacity} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={crossGeometry} renderOrder={3}>
        <lineBasicMaterial color={tuning.gridCenterColor} transparent opacity={tuning.gridCrossOpacity} depthWrite={false} />
      </lineSegments>
      <mesh position={[0, 0.003, 1.35]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={0}>
        <planeGeometry args={[16, 5.4]} />
        <meshBasicMaterial
          map={shadowTexture}
          transparent
          opacity={GRID_GROUND_SHADOW_OPACITY[themeName]}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function Scene({ themeName, tuning }) {
  return (
    <>
      <color attach="background" args={[tuning.backgroundColor]} />
      <ambientLight intensity={themeName === 'light' ? 0.38 : 0.22} />
      <directionalLight position={[2, 9, 7]} color={tuning.lightColor} intensity={tuning.keyLightIntensity} />
      <directionalLight position={[-8, 5, -7]} color={tuning.lightColor} intensity={tuning.rimLightIntensity} />
      <directionalLight position={[6, 3, -5]} color={tuning.lightColor} intensity={FILL_LIGHT_INTENSITY[themeName]} />
      <Environment resolution={64}>
        <Lightformer form="rect" intensity={themeName === 'light' ? 2 : 3.2} position={[0, 7, 5]} scale={[9, 2, 1]} />
        <Lightformer form="rect" intensity={themeName === 'light' ? 1.4 : 2.4} position={[-5, 3, -3]} scale={[2, 7, 1]} />
        <Lightformer form="ring" intensity={themeName === 'light' ? 1.2 : 2} position={[5, 4, 1]} scale={[3, 3, 1]} />
      </Environment>
      <ReferenceGrid themeName={themeName} tuning={tuning} />
      <WordmarkGroup themeName={themeName} tuning={tuning} />
      <OrbitControls
        enableRotate
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.45}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 3}
        minAzimuthAngle={-0.65}
        maxAzimuthAngle={0.65}
        makeDefault={false}
      />
    </>
  );
}

export function SunderWordmarkScene({ isVisible = true, reducedMotion = false }) {
  const [themeName, setThemeName] = useState(getCurrentTheme);
  const [DevTuningPanel, setDevTuningPanel] = useState(null);
  const [tuningValues, setTuningValues] = useState(null);
  const tuningDefaults = useMemo(() => getTuningDefaults(themeName), [themeName]);
  const tuning = useMemo(() => resolveTuning(themeName, tuningValues), [themeName, tuningValues]);
  const handleTuningChange = useCallback((values) => setTuningValues(values), []);

  useEffect(() => {
    const handleThemeChange = (event) => setThemeName(event.detail.theme);
    window.addEventListener('themechange', handleThemeChange);
    return () => window.removeEventListener('themechange', handleThemeChange);
  }, []);

  useEffect(() => {
    if (!DEV_TUNING_ENABLED) return;

    import('./SunderWordmarkTuningPanel.jsx').then((module) => {
      setDevTuningPanel(() => module.SunderWordmarkTuningPanel);
    });
  }, []);

  const shouldRenderScene = isVisible && !(REDUCED_MOTION_DISABLE_ANIMATION && reducedMotion);

  return (
    <div className="sunder-wordmark-canvas">
      <Canvas
        aria-hidden="true"
        orthographic
        camera={{ position: CAMERA_POSITION, zoom: CAMERA_ZOOM }}
        dpr={[1, MAX_DPR]}
        frameloop={TARGET_FPS_MODE === 'on-demand' ? 'demand' : 'always'}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        {shouldRenderScene && <Scene themeName={themeName} tuning={tuning} />}
      </Canvas>
      {DevTuningPanel && (
        <DevTuningPanel defaults={tuningDefaults} themeName={themeName} onChange={handleTuningChange} />
      )}
    </div>
  );
}
