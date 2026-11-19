import { DeviceCapabilities, GraphicsConfig, GraphicsPreset } from './types';

export const GRAPHICS_PRESET_CONFIGS: Record<Exclude<GraphicsPreset, 'custom'>, GraphicsConfig> = {
  low: {
    preset: 'low',
    shadowResolution: 0,
    shadowDistance: 35,
    textureQuality: 'low',
    geometryQuality: 'low',
    renderScale: 0.65,
    antialias: false,
    ambientOcclusion: false,
    viewDistance: 125,
    foliageDensity: 0.45,
    npcSimDistance: 28,
    particleDensity: 0.45,
    postProcessing: false,
  },
  medium: {
    preset: 'medium',
    shadowResolution: 512,
    shadowDistance: 48,
    textureQuality: 'medium',
    geometryQuality: 'medium',
    renderScale: 0.85,
    antialias: false,
    ambientOcclusion: true,
    viewDistance: 170,
    foliageDensity: 0.7,
    npcSimDistance: 42,
    particleDensity: 0.75,
    postProcessing: false,
  },
  high: {
    preset: 'high',
    shadowResolution: 1024,
    shadowDistance: 62,
    textureQuality: 'high',
    geometryQuality: 'high',
    renderScale: 1.0,
    antialias: true,
    ambientOcclusion: true,
    viewDistance: 220,
    foliageDensity: 1.0,
    npcSimDistance: 56,
    particleDensity: 1.0,
    postProcessing: false,
  },
  ultra: {
    preset: 'ultra',
    shadowResolution: 2048,
    shadowDistance: 78,
    textureQuality: 'high',
    geometryQuality: 'high',
    renderScale: 1.15,
    antialias: true,
    ambientOcclusion: true,
    viewDistance: 260,
    foliageDensity: 1.0,
    npcSimDistance: 72,
    particleDensity: 1.25,
    postProcessing: true,
  },
  extreme: {
    preset: 'extreme',
    shadowResolution: 2048,
    shadowDistance: 92,
    textureQuality: 'high',
    geometryQuality: 'high',
    renderScale: 1.35,
    antialias: true,
    ambientOcclusion: true,
    viewDistance: 290,
    foliageDensity: 1.0,
    npcSimDistance: 85,
    particleDensity: 1.5,
    postProcessing: true,
  },
};

export function getPresetConfig(preset: GraphicsPreset, currentCustom?: GraphicsConfig): GraphicsConfig {
  if (preset === 'custom' && currentCustom) {
    return { ...currentCustom, preset: 'custom' };
  }
  const base = GRAPHICS_PRESET_CONFIGS[preset === 'custom' ? 'high' : preset];
  return { ...base };
}

export function detectDeviceCapabilities(): DeviceCapabilities {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      isMobile: false,
      isLowEndMobile: false,
      isSoftwareGl: false,
      maxTextureSize: 4096,
      supportsExtreme: true,
      recommendedPreset: 'high',
      hardwareSummary: 'Desktop Padrão',
    };
  }

  const width = window.innerWidth || 1280;
  const dpr = window.devicePixelRatio || 1;
  const hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints ?? 0) > 0;
  const isMobile = width < 820 || hasTouch;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memoryGb = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4;

  let isSoftwareGl = false;
  let maxTextureSize = 4096;
  let gpuName = 'WebGL2';

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      isSoftwareGl = true;
    } else {
      maxTextureSize = Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || 4096;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      gpuName = String(gl.getParameter(param));
      isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpuName);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch {
    isSoftwareGl = true;
  }

  const isLowEndMobile = isMobile && (memoryGb <= 3 || cores <= 4 || maxTextureSize <= 2048);
  const supportsExtreme = !isMobile && !isSoftwareGl && cores >= 4 && maxTextureSize >= 4096;

  let recommendedPreset: GraphicsPreset = 'high';
  if (isSoftwareGl) {
    recommendedPreset = 'medium';
  } else if (isLowEndMobile) {
    recommendedPreset = 'low';
  } else if (isMobile) {
    recommendedPreset = dpr >= 2.5 && memoryGb >= 6 ? 'high' : 'medium';
  } else if (supportsExtreme && cores >= 8 && memoryGb >= 8) {
    recommendedPreset = 'ultra';
  }

  const tierLabel = isSoftwareGl
    ? 'WebGL Software'
    : isLowEndMobile
      ? 'Celular Econômico'
      : isMobile
        ? 'Celular Otimizado'
        : supportsExtreme
          ? 'PC Alto Desempenho'
          : 'Desktop Padrão';

  return {
    isMobile,
    isLowEndMobile,
    isSoftwareGl,
    maxTextureSize,
    supportsExtreme,
    recommendedPreset,
    hardwareSummary: `${tierLabel} · ${cores} núcleos · DPR ${dpr.toFixed(1)}`,
  };
}
