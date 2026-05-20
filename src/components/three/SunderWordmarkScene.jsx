import React, { useEffect, useMemo, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import {
  AccumulativeShadows,
  Center,
  Environment,
  Instance,
  Instances,
  Lightformer,
  MeshTransmissionMaterial,
  OrbitControls,
  RandomizedLight,
  Text3D,
} from '@react-three/drei';
import { RGBELoader } from 'three-stdlib';
import interLikeBold from 'three/examples/fonts/helvetiker_bold.typeface.json';

export const MAX_DPR = 1.5;
export const ENABLE_POSTPROCESSING = false;
export const ENABLE_TRANSMISSION = true;
export const MOBILE_ENABLE_3D = false;
export const REDUCED_MOTION_DISABLE_ANIMATION = true;
export const HERO_RENDER_WHEN_VISIBLE_ONLY = true;
export const TARGET_FPS_MODE = 'on-demand';
export const DEV_TUNING_ENABLED = import.meta.env.DEV && import.meta.env.VITE_ENABLE_3D_TUNING === 'true';
export const ENABLE_ACCUMULATIVE_SHADOWS = true;
export const USE_EXTERNAL_HDR_BACKGROUND = true;
export const HDR_BACKGROUND_URL =
  'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/aerodynamics_workshop_1k.hdr';

export const WORD_TEXT = 'Sunder';
export const WORDMARK_CENTER_SCALE = [0.8, 1, 1];
export const WORDMARK_POSITION = [0, -1, 2.25];
export const WORDMARK_ROTATION = [-Math.PI / 2, 0, 0];
export const WORDMARK_SCALE = 5;
export const TEXT_DEPTH = 0.25;
export const TEXT_BEVEL_SIZE = 0.01;
export const TEXT_BEVEL_THICKNESS = 0.01;
export const TEXT_BEVEL_SEGMENTS = 10;
export const TEXT_CURVE_SEGMENTS = 128;
export const LETTER_SPACING = -0.03;

export const PERIOD_RADIUS = 0.15;
export const PERIOD_DEPTH = 0.18;
export const PERIOD_OFFSET_X = 4.48;
export const PERIOD_OFFSET_Y = 0.08;
export const PERIOD_OFFSET_Z = 0.12;

export const CAMERA_POSITION = [10, 20, 20];
export const CAMERA_ZOOM = 80;
export const CAMERA_MIN_ZOOM = 40;
export const CAMERA_MAX_ZOOM = 140;

export const GRID_NUMBER = 23;
export const GRID_CELL_SIZE = 2;
export const GRID_DIVISIONS = GRID_NUMBER - 1;
export const GRID_SIZE = GRID_CELL_SIZE * GRID_DIVISIONS;
export const GRID_CROSS_EVERY = 1;
export const GRID_CROSS_SIZE = 0.5;
export const GRID_LINE_WIDTH = 0.026;
export const GRID_MINOR_COLOR = 'gridColor';
export const GRID_MAJOR_COLOR = 'gridHelperColor';
export const GRID_CROSS_COLOR = 'gridColor';
export const GRID_POSITION_Y = -1.02;
export const GRID_OPACITY = 1;
export const GRID_POSITION = [0, GRID_POSITION_Y, 0];

export const MATERIAL_BACKSIDE = true;
export const MATERIAL_BACKSIDE_THICKNESS = 0.3;
export const MATERIAL_SAMPLES = 16;
export const MATERIAL_RESOLUTION = 1024;
export const MATERIAL_TRANSMISSION = 1;
export const MATERIAL_CLEARCOAT = 0;
export const MATERIAL_CLEARCOAT_ROUGHNESS = 0;
export const MATERIAL_THICKNESS = 0.3;
export const MATERIAL_CHROMATIC_ABERRATION = 5;
export const MATERIAL_ANISOTROPY = 0.3;
export const MATERIAL_ROUGHNESS = 0;
export const MATERIAL_DISTORTION = 0.5;
export const MATERIAL_DISTORTION_SCALE = 0.1;
export const MATERIAL_TEMPORAL_DISTORTION = 0;
export const MATERIAL_IOR = 1.5;

export const ENVIRONMENT_RESOLUTION = 32;
export const KEY_LIGHT_INTENSITY = 20;
export const SIDE_LIGHT_INTENSITY = 2;
export const RING_LIGHT_INTENSITY = 2;

const THEME_SCENE = {
  light: {
    backgroundColor: '#f2f2f5',
    wordColor: '#ff9cf5',
    attenuationColor: '#ff7eb3',
    shadowColor: '#750d57',
    gridColor: '#999999',
    gridHelperColor: '#bbbbbb',
    lightColor: '#ffffff',
  },
  dark: {
    backgroundColor: '#08080d',
    wordColor: '#ff9cf5',
    attenuationColor: '#ff7eb3',
    shadowColor: '#750d57',
    gridColor: '#6d6778',
    gridHelperColor: '#84808d',
    lightColor: '#ffffff',
  },
};

function getCurrentTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function getTuningDefaults(themeName) {
  const palette = THEME_SCENE[themeName];
  return {
    useCustomColors: false,
    wordPosition: WORDMARK_POSITION,
    wordRotation: WORDMARK_ROTATION,
    wordScale: WORDMARK_SCALE,
    textDepth: TEXT_DEPTH,
    bevelSize: TEXT_BEVEL_SIZE,
    periodRadius: PERIOD_RADIUS,
    periodDepth: PERIOD_DEPTH,
    periodPosition: [PERIOD_OFFSET_X, PERIOD_OFFSET_Y, PERIOD_OFFSET_Z],
    gridCellSize: GRID_CELL_SIZE,
    gridOpacity: GRID_OPACITY,
    materialTransmission: MATERIAL_TRANSMISSION,
    materialRoughness: MATERIAL_ROUGHNESS,
    materialThickness: MATERIAL_THICKNESS,
    keyLightIntensity: KEY_LIGHT_INTENSITY,
    rimLightIntensity: SIDE_LIGHT_INTENSITY,
    backgroundColor: palette.backgroundColor,
    wordColor: palette.wordColor,
    attenuationColor: palette.attenuationColor,
    shadowColor: palette.shadowColor,
    gridColor: palette.gridColor,
    gridHelperColor: palette.gridHelperColor,
    lightColor: palette.lightColor,
  };
}

function resolveTuning(themeName, values) {
  const defaults = getTuningDefaults(themeName);
  const useCustomColors = values?.useCustomColors ?? defaults.useCustomColors;

  return {
    useCustomColors,
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
    gridOpacity: values?.gridOpacity ?? defaults.gridOpacity,
    materialTransmission: values?.materialTransmission ?? defaults.materialTransmission,
    materialRoughness: values?.materialRoughness ?? defaults.materialRoughness,
    materialThickness: values?.materialThickness ?? defaults.materialThickness,
    keyLightIntensity: values?.keyLightIntensity ?? defaults.keyLightIntensity,
    rimLightIntensity: values?.rimLightIntensity ?? defaults.rimLightIntensity,
    backgroundColor: (useCustomColors ? values?.backgroundColor : undefined) ?? defaults.backgroundColor,
    wordColor: (useCustomColors ? values?.wordColor : undefined) ?? defaults.wordColor,
    attenuationColor: (useCustomColors ? values?.attenuationColor : undefined) ?? defaults.attenuationColor,
    shadowColor: (useCustomColors ? values?.shadowColor : undefined) ?? defaults.shadowColor,
    gridColor: (useCustomColors ? values?.gridColor : undefined) ?? defaults.gridColor,
    gridHelperColor: (useCustomColors ? values?.gridHelperColor : undefined) ?? defaults.gridHelperColor,
    lightColor: (useCustomColors ? values?.lightColor : undefined) ?? defaults.lightColor,
  };
}

function EpoxyMaterial({ tuning, backgroundTexture }) {
  if (!ENABLE_TRANSMISSION) {
    return (
      <meshPhysicalMaterial
        color={tuning.wordColor}
        roughness={tuning.materialRoughness}
        transmission={tuning.materialTransmission}
        thickness={tuning.materialThickness}
        ior={MATERIAL_IOR}
        clearcoat={MATERIAL_CLEARCOAT}
        clearcoatRoughness={MATERIAL_CLEARCOAT_ROUGHNESS}
      />
    );
  }

  return (
    <MeshTransmissionMaterial
      background={backgroundTexture}
      color={tuning.wordColor}
      backside={MATERIAL_BACKSIDE}
      backsideThickness={MATERIAL_BACKSIDE_THICKNESS}
      samples={MATERIAL_SAMPLES}
      resolution={MATERIAL_RESOLUTION}
      transmission={tuning.materialTransmission}
      clearcoat={MATERIAL_CLEARCOAT}
      clearcoatRoughness={MATERIAL_CLEARCOAT_ROUGHNESS}
      thickness={tuning.materialThickness}
      chromaticAberration={MATERIAL_CHROMATIC_ABERRATION}
      anisotropy={MATERIAL_ANISOTROPY}
      roughness={tuning.materialRoughness}
      distortion={MATERIAL_DISTORTION}
      distortionScale={MATERIAL_DISTORTION_SCALE}
      temporalDistortion={MATERIAL_TEMPORAL_DISTORTION}
      ior={MATERIAL_IOR}
      attenuationColor={tuning.attenuationColor}
    />
  );
}

function Grid({ tuning }) {
  const gridSize = tuning.gridCellSize * GRID_DIVISIONS;
  const halfGridSize = gridSize / 2;
  const halfDivisions = GRID_DIVISIONS / 2;
  const crossIndices = Array.from({ length: GRID_DIVISIONS + 1 }, (_, index) => index).filter(
    (index) => index % GRID_CROSS_EVERY === 0,
  );

  return (
    <group position={GRID_POSITION}>
      <gridHelper
        args={[gridSize, GRID_DIVISIONS, tuning[GRID_MAJOR_COLOR], tuning[GRID_MINOR_COLOR]]}
        position={[0, -0.01, 0]}
        material-transparent
        material-opacity={tuning.gridOpacity}
      />
      <Instances>
        <planeGeometry args={[GRID_LINE_WIDTH, GRID_CROSS_SIZE]} />
        <meshBasicMaterial color={tuning[GRID_CROSS_COLOR]} transparent opacity={tuning.gridOpacity} toneMapped={false} />
        {crossIndices.flatMap((zIndex) =>
          crossIndices.map((xIndex) => (
          <group
            key={`${xIndex}:${zIndex}`}
            position={[
              (xIndex - halfDivisions) * tuning.gridCellSize,
              -0.01,
              (zIndex - halfDivisions) * tuning.gridCellSize,
            ]}
          >
            <Instance rotation={[-Math.PI / 2, 0, 0]} />
            <Instance rotation={[-Math.PI / 2, 0, Math.PI / 2]} />
          </group>
          )),
        )}
      </Instances>
    </group>
  );
}

function Wordmark({ tuning }) {
  const backgroundTexture = useLoader(RGBELoader, HDR_BACKGROUND_URL);

  return (
    <group>
      <Center scale={WORDMARK_CENTER_SCALE} front top position={tuning.wordPosition} rotation={tuning.wordRotation}>
        <group scale={tuning.wordScale}>
          <Text3D
            castShadow
            bevelEnabled
            font={interLikeBold}
            scale={1}
            letterSpacing={LETTER_SPACING}
            height={tuning.textDepth}
            bevelSize={tuning.bevelSize}
            bevelSegments={TEXT_BEVEL_SEGMENTS}
            curveSegments={TEXT_CURVE_SEGMENTS}
            bevelThickness={TEXT_BEVEL_THICKNESS}
          >
            {WORD_TEXT}
            <EpoxyMaterial
              tuning={tuning}
              backgroundTexture={USE_EXTERNAL_HDR_BACKGROUND ? backgroundTexture : undefined}
            />
          </Text3D>
          <mesh position={tuning.periodPosition} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[tuning.periodRadius, tuning.periodRadius, tuning.periodDepth, 48]} />
            <EpoxyMaterial
              tuning={tuning}
              backgroundTexture={USE_EXTERNAL_HDR_BACKGROUND ? backgroundTexture : undefined}
            />
          </mesh>
        </group>
      </Center>
      <Grid tuning={tuning} />
    </group>
  );
}

function Scene({ themeName, tuning }) {
  return (
    <>
      <color attach="background" args={[tuning.backgroundColor]} />
      <Wordmark tuning={tuning} />
      <OrbitControls
        autoRotate={false}
        zoomSpeed={0.25}
        minZoom={CAMERA_MIN_ZOOM}
        maxZoom={CAMERA_MAX_ZOOM}
        enableZoom={false}
        enablePan={false}
        dampingFactor={0.05}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 3}
        minAzimuthAngle={-0.65}
        maxAzimuthAngle={0.65}
      />
      <Environment resolution={ENVIRONMENT_RESOLUTION}>
        <group rotation={[-Math.PI / 4, -0.3, 0]}>
          <Lightformer
            intensity={tuning.keyLightIntensity}
            rotation-x={Math.PI / 2}
            position={[0, 5, -9]}
            scale={[10, 10, 1]}
            color={tuning.lightColor}
          />
          <Lightformer
            intensity={tuning.rimLightIntensity}
            rotation-y={Math.PI / 2}
            position={[-5, 1, -1]}
            scale={[10, 2, 1]}
            color={tuning.lightColor}
          />
          <Lightformer
            intensity={tuning.rimLightIntensity}
            rotation-y={Math.PI / 2}
            position={[-5, -1, -1]}
            scale={[10, 2, 1]}
            color={tuning.lightColor}
          />
          <Lightformer
            intensity={tuning.rimLightIntensity}
            rotation-y={-Math.PI / 2}
            position={[10, 1, 0]}
            scale={[20, 2, 1]}
            color={tuning.lightColor}
          />
          <Lightformer
            type="ring"
            intensity={RING_LIGHT_INTENSITY}
            rotation-y={Math.PI / 2}
            position={[-0.1, -1, -5]}
            scale={10}
            color={tuning.lightColor}
          />
        </group>
      </Environment>
      {ENABLE_ACCUMULATIVE_SHADOWS && (
        <AccumulativeShadows
          frames={80}
          color={tuning.shadowColor}
          colorBlend={5}
          toneMapped
          alphaTest={0.9}
          opacity={1}
          scale={30}
          position={[0, -1.01, 0]}
        >
          <RandomizedLight
            amount={4}
            radius={10}
            ambient={0.5}
            intensity={Math.PI}
            position={[0, 10, -10]}
            size={15}
            mapSize={1024}
            bias={0.0001}
          />
        </AccumulativeShadows>
      )}
    </>
  );
}

export function SunderWordmarkScene({ isVisible = true, reducedMotion = false }) {
  const [themeName, setThemeName] = useState(getCurrentTheme);
  const [DevTuningPanel, setDevTuningPanel] = useState(null);
  const [tuningValues, setTuningValues] = useState(null);
  const tuningDefaults = useMemo(() => getTuningDefaults(themeName), [themeName]);
  const tuning = useMemo(() => resolveTuning(themeName, tuningValues), [themeName, tuningValues]);

  useEffect(() => {
    const handleThemeChange = (event) => setThemeName(event.detail.theme);
    window.addEventListener('themechange', handleThemeChange);
    return () => window.removeEventListener('themechange', handleThemeChange);
  }, []);

  useEffect(() => {
    if (!DEV_TUNING_ENABLED) return;

    const tuningPanelPath = ['/src', 'components', 'three', 'SunderWordmarkTuningPanel.local.jsx'].join('/');

    import(
      /* @vite-ignore */
      tuningPanelPath
    )
      .then((module) => {
        setDevTuningPanel(() => module.SunderWordmarkTuningPanel);
      })
      .catch(() => {
        setDevTuningPanel(null);
      });
  }, []);

  useEffect(() => {
    setTuningValues((currentValues) => {
      if (!currentValues || currentValues.useCustomColors) return currentValues;

      return {
        ...currentValues,
        backgroundColor: tuningDefaults.backgroundColor,
        wordColor: tuningDefaults.wordColor,
        attenuationColor: tuningDefaults.attenuationColor,
        shadowColor: tuningDefaults.shadowColor,
        gridColor: tuningDefaults.gridColor,
        gridHelperColor: tuningDefaults.gridHelperColor,
        lightColor: tuningDefaults.lightColor,
      };
    });
  }, [tuningDefaults]);

  const shouldRenderScene = isVisible && !(REDUCED_MOTION_DISABLE_ANIMATION && reducedMotion);

  return (
    <div className="sunder-wordmark-canvas">
      <Canvas
        shadows={ENABLE_ACCUMULATIVE_SHADOWS}
        aria-hidden="true"
        orthographic
        camera={{ position: CAMERA_POSITION, zoom: CAMERA_ZOOM }}
        dpr={[1, MAX_DPR]}
        frameloop={TARGET_FPS_MODE === 'on-demand' ? 'demand' : 'always'}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: DEV_TUNING_ENABLED,
        }}
      >
        {shouldRenderScene && <Scene key={themeName} themeName={themeName} tuning={tuning} />}
      </Canvas>
      {DevTuningPanel && (
        <DevTuningPanel defaults={tuningDefaults} themeName={themeName} onChange={setTuningValues} />
      )}
    </div>
  );
}
