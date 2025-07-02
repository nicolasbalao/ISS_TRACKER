import {
  Group,
  Mesh,
  MeshStandardMaterial, RepeatWrapping,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
} from "three";
import { CONFIG } from "../config/config.js";

export class Earth {
  constructor(scene, resourceLoader = null) {
    this.scene = scene;
    this.resourceLoader = resourceLoader;
    this.clouds = null;
    this.earthGroup = new Group();
    this.textureLoader = new TextureLoader();

    this.initialize();
  }

  initialize() {
    this.createEarth();
    this.createClouds();
    this.scene.add(this.earthGroup);
  }

  createEarth() {
    let earthTexture, bumpTexture, oceanTexture;

    oceanTexture = new TextureLoader().load("./Ocean.png");
    // Try to get textures from resource loader first
    if (this.resourceLoader) {
      earthTexture = this.resourceLoader.getResource("earth_diffuse");
      bumpTexture = this.resourceLoader.getResource("earth_bump");
    }

    // Fallback to loading textures if not available
    if (!earthTexture) {
      earthTexture = this.textureLoader.load("./earth.jpg");
      earthTexture.colorSpace = SRGBColorSpace;
      console.warn("Earth texture not found in resources, loading default.");
    }

    if (!bumpTexture) {
      bumpTexture = this.textureLoader.load("./Bump.jpg");
      console.warn("Bump texture not found in resources, loading default.");
    }

    const geometry = new SphereGeometry(
      CONFIG.VISUAL.EARTH_RADIUS,
      CONFIG.VISUAL.EARTH_SEGMENTS,
      CONFIG.VISUAL.EARTH_SEGMENTS
    );

    const cloudsMap = this.resourceLoader.getResource("clouds_alpha");

    const material = new MeshStandardMaterial({
      map: earthTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.01,
      roughnessMap: oceanTexture,
      metalness: 0.1,
      metalnessMap: oceanTexture
    });


    material.onBeforeCompile = function( shader ) {
      shader.uniforms.tClouds = { value: cloudsMap }
      shader.uniforms.tClouds.value.wrapS = RepeatWrapping;
      shader.uniforms.uv_xOffset = { value: 0 }
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `
        #include <common>
        uniform sampler2D tClouds;
        uniform float uv_xOffset;
      `);
      shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', `
        float roughnessFactor = roughness;

        #ifdef USE_ROUGHNESSMAP

          vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
          // reversing the black and white values because we provide the ocean map
          texelRoughness = vec4(1.0) - texelRoughness;

          // reads channel G, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
          roughnessFactor *= clamp(texelRoughness.g, 0.5, 1.0);

        #endif
      `);
      shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', `
        float cloudsMapValue = texture2D(tClouds, vec2(vMapUv.x - uv_xOffset, vMapUv.y)).r;
        diffuseColor.rgb *= max(1.0 - cloudsMapValue, 0.2 );
      `)
    }

    const earth = new Mesh(geometry, material);
    this.earthGroup.add(earth);
  }

  createClouds() {
    let cloudTexture;

    // Try to get cloud texture from resource loader first
    if (this.resourceLoader) {
      cloudTexture = this.resourceLoader.getResource("clouds_alpha");
    }

    // Fallback to loading texture if not available
    if (!cloudTexture) {
      cloudTexture = this.textureLoader.load("./Clouds.png");
      console.warn("Cloud texture not found in resources, loading default.");
    }

    // Rayon légèrement plus grand que la Terre pour que les nuages apparaissent au-dessus
    const cloudRadius = CONFIG.SCENE.EARTH_RADIUS * 1.005;
    const cloudGeo = new SphereGeometry(
      cloudRadius,
      CONFIG.VISUAL.EARTH_SEGMENTS,
      CONFIG.VISUAL.EARTH_SEGMENTS
    );
    const cloudMaterial = new MeshStandardMaterial({
      alphaMap: cloudTexture,
      transparent: true,
    });

    this.clouds = new Mesh(cloudGeo, cloudMaterial);
    this.earthGroup.add(this.clouds);
  }

  cloudsRotation(deltaTime) {
    if (this.clouds) {
      this.clouds.rotateY(
        deltaTime * 0.01 * CONFIG.SCENE.CLOUDS_ROTATION_SPEED
      );
    }
  }

  get position() {
    return this.earthGroup.position;
  }

  dispose() {
    if (this.clouds) {
      this.clouds.geometry.dispose();
      this.clouds.material.dispose();
    }
    this.earthGroup.children.forEach((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    this.scene.remove(this.earthGroup);
  }
}
