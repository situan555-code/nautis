import React, { useEffect } from 'react';
import { Leva, folder, useControls } from 'leva';

export function SunderWordmarkTuningPanel({ defaults, themeName, onChange }) {
  const values = useControls(
    'Sunder 3D Hero',
    {
      Wordmark: folder({
        wordPositionX: { value: defaults.wordPosition[0], min: -6, max: 6, step: 0.01 },
        wordPositionY: { value: defaults.wordPosition[1], min: -3, max: 3, step: 0.01 },
        wordPositionZ: { value: defaults.wordPosition[2], min: -2, max: 5, step: 0.01 },
        wordRotationX: { value: defaults.wordRotation[0], min: -Math.PI, max: Math.PI, step: 0.01 },
        wordRotationY: { value: defaults.wordRotation[1], min: -Math.PI, max: Math.PI, step: 0.01 },
        wordRotationZ: { value: defaults.wordRotation[2], min: -Math.PI, max: Math.PI, step: 0.01 },
        wordScale: { value: defaults.wordScale, min: 1, max: 6, step: 0.01 },
        textDepth: { value: defaults.textDepth, min: 0.02, max: 0.7, step: 0.01 },
        bevelSize: { value: defaults.bevelSize, min: 0, max: 0.08, step: 0.001 },
      }),
      Period: folder({
        periodRadius: { value: defaults.periodRadius, min: 0.04, max: 0.42, step: 0.005 },
        periodDepth: { value: defaults.periodDepth, min: 0.02, max: 0.42, step: 0.005 },
        periodPositionX: { value: defaults.periodPosition[0], min: 3.4, max: 5.4, step: 0.005 },
        periodPositionY: { value: defaults.periodPosition[1], min: -0.45, max: 0.45, step: 0.005 },
        periodPositionZ: { value: defaults.periodPosition[2], min: -0.2, max: 0.45, step: 0.005 },
      }),
      Grid: folder({
        gridCellSize: { value: defaults.gridCellSize, min: 0.5, max: 5, step: 0.05 },
        gridMinorOpacity: { value: defaults.gridMinorOpacity, min: 0, max: 1, step: 0.01 },
        gridMajorOpacity: { value: defaults.gridMajorOpacity, min: 0, max: 1, step: 0.01 },
        gridCrossOpacity: { value: defaults.gridCrossOpacity, min: 0, max: 1, step: 0.01 },
      }),
      Material: folder({
        materialTransmission: { value: defaults.materialTransmission, min: 0, max: 1, step: 0.01 },
        materialRoughness: { value: defaults.materialRoughness, min: 0, max: 0.5, step: 0.001 },
        materialThickness: { value: defaults.materialThickness, min: 0.02, max: 1.2, step: 0.01 },
      }),
      Lighting: folder({
        keyLightIntensity: { value: defaults.keyLightIntensity, min: 0, max: 8, step: 0.05 },
        rimLightIntensity: { value: defaults.rimLightIntensity, min: 0, max: 8, step: 0.05 },
      }),
      Colors: folder({
        backgroundColor: { value: defaults.backgroundColor },
        wordColor: { value: defaults.wordColor },
        attenuationColor: { value: defaults.attenuationColor },
        gridColor: { value: defaults.gridColor },
        gridCenterColor: { value: defaults.gridCenterColor },
        lightColor: { value: defaults.lightColor },
      }),
    },
    { collapsed: false },
    [themeName],
  );

  useEffect(() => {
    onChange(values);
  }, [onChange, values]);

  return <Leva collapsed={false} oneLineLabels />;
}
