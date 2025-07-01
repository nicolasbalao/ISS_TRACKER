import {
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
} from "three";
import { CONFIG } from "../config/config.js";

export class Earth {
  constructor(scene) {
    this.scene = scene;
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
    const texture = this.textureLoader.load("/earth.jpg");
    texture.colorSpace = SRGBColorSpace;
    const geometry = new SphereGeometry(
      CONFIG.VISUAL.EARTH_RADIUS,
      CONFIG.VISUAL.EARTH_SEGMENTS,
      CONFIG.VISUAL.EARTH_SEGMENTS
    );

    const material = new MeshStandardMaterial({
      map: texture,
      bumpMap: this.textureLoader.load("/Bump.jpg"),
      bumpScale: 0.1,
    });
    const earth = new Mesh(geometry, material);
    this.earthGroup.add(earth);
  }

  createClouds() {
    const cloudTexture = this.textureLoader.load("/Clouds.png");
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
