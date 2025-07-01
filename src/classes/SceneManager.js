import {
  AmbientLight, DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  TextureLoader,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons";
import { CONFIG } from "../config/config.js";
import scene from "three/addons/offscreen/scene.js";

/**
 * Class responsible for managing the 3D scene, camera, and renderer
 */
export class SceneManager {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.earth = null;
    this.animationId = null;
    this.rotationEnabled = true;
    this.rotationAngle = 0;
    this.cameraRadius = CONFIG.SCENE.CAMERA_RADIUS;
    this.issMarker = null; // Référence pour l'animation
    this.lastTime = 0;

    this.initialize().then(() => {
      console.log("Scene manager initialized");
    });
  }

  /**
   * Initialize the scene, camera, renderer, and controls
   */
  async initialize() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createLighting();
    await this.createEarth();
    this.createControls();
    this.setupEventListeners();
  }

  /**
   * Create the Three.js scene
   */
  createScene() {
    this.scene = new Scene();
  }

  /**
   * Create the perspective camera
   */
  createCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new PerspectiveCamera(
      CONFIG.SCENE.CAMERA_FOV,
      aspect,
      CONFIG.SCENE.CAMERA_NEAR,
      CONFIG.SCENE.CAMERA_FAR
    );
    this.camera.position.z = CONFIG.SCENE.CAMERA_INITIAL_Z;
  }

  /**
   * Create the WebGL renderer
   */
  createRenderer() {
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
  }

  /**
   * Create ambient lighting for the scene
   */
  createLighting() {
    const ambientLight = new AmbientLight(
      CONFIG.VISUAL.AMBIENT_LIGHT_COLOR,
      CONFIG.VISUAL.AMBIENT_LIGHT_INTENSITY
    );
    this.scene.add(ambientLight);

    this.createSunlight();
  }

  createSunlight(){
    const sunlight = new DirectionalLight(0xffffff, 1.5);
    sunlight.position.set(5, 3, 5)
    this.scene.add(sunlight);
  }

  /**
   * Create the Earth sphere with texture
   */
  createEarth() {
    try {
      const textureLoader = new TextureLoader();
      const earthTexture = textureLoader.load("/earth.jpg");

      const geometry = new SphereGeometry(
        CONFIG.SCENE.EARTH_RADIUS,
        CONFIG.VISUAL.EARTH_SEGMENTS,
        CONFIG.VISUAL.EARTH_SEGMENTS
      );
      const material = new MeshStandardMaterial({ map: earthTexture });

      this.earth = new Mesh(geometry, material);
      this.scene.add(this.earth);
      this.camera.lookAt(this.earth.position);

      console.log("Earth created and added to scene");
    } catch (error) {
      console.error("Error creating Earth:", error);
      this.createFallbackEarth();
    }
  }

  /**
   * Create a fallback Earth without texture
   */
  createFallbackEarth() {
    const geometry = new SphereGeometry(
      CONFIG.SCENE.EARTH_RADIUS,
      CONFIG.VISUAL.EARTH_SEGMENTS,
      CONFIG.VISUAL.EARTH_SEGMENTS
    );
    const material = new MeshStandardMaterial({ color: 0x1e90ff });
    this.earth = new Mesh(geometry, material);
    this.scene.add(this.earth);
    console.log("Fallback Earth created");
  }

  /**
   * Create orbit controls for camera interaction
   */
  createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = CONFIG.CONTROLS.ENABLE_DAMPING;
    this.controls.dampingFactor = CONFIG.CONTROLS.DAMPING_FACTOR;
    this.controls.rotateSpeed = CONFIG.CONTROLS.ROTATE_SPEED;
    this.controls.enableZoom = CONFIG.CONTROLS.ENABLE_ZOOM;
    this.controls.enablePan = CONFIG.CONTROLS.ENABLE_PAN;
  }

  /**
   * Setup event listeners for window resize
   */
  setupEventListeners() {
    window.addEventListener("resize", () => this.handleResize());
  }

  /**
   * Handle window resize
   */
  handleResize() {
    if (!this.camera || !this.renderer) return;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    console.log("Scene resized");
  }

  /**
   * Start the animation loop
   */
  startAnimation() {
    if (this.animationId) {
      console.warn("Animation already running");
      return;
    }

    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.updateAnimation();
      this.render();
    };

    animate();
    console.log("Animation started");
  }

  /**
   * Stop the animation loop
   */
  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      console.log("Animation stopped");
    }
  }
  /**
   * Update animation frame
   */
  updateAnimation() {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    if (this.rotationEnabled) {
      this.rotationAngle += CONFIG.SCENE.ROTATION_SPEED;
      this.camera.position.x = this.cameraRadius * Math.sin(this.rotationAngle);
      this.camera.position.z = this.cameraRadius * Math.cos(this.rotationAngle);
      this.camera.lookAt(this.earth.position);
    }

    // Animer le marqueur ISS s'il existe
    if (this.issMarker) {
      this.issMarker.animate(deltaTime);
    }

    if (this.controls) {
      this.controls.update();
    }
  }

  /**
   * Render the scene
   */
  render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Toggle automatic camera rotation
   * @param {boolean} enabled - Whether rotation should be enabled
   */
  setRotationEnabled(enabled) {
    this.rotationEnabled = enabled;
    console.log(`Camera rotation ${enabled ? "enabled" : "disabled"}`);
  }

  /**
   * Set ISS marker reference for animation
   * @param {ISSMarker} issMarker - The ISS marker instance
   */
  setISSMarker(issMarker) {
    this.issMarker = issMarker;
  }

  /**
   * Get the scene object
   * @returns {Scene} The Three.js scene
   */
  getScene() {
    return this.scene;
  }

  /**
   * Get the camera object
   * @returns {PerspectiveCamera} The camera
   */
  getCamera() {
    return this.camera;
  }

  /**
   * Get the renderer object
   * @returns {WebGLRenderer} The renderer
   */
  getRenderer() {
    return this.renderer;
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.stopAnimation();

    if (this.controls) {
      this.controls.dispose();
    }

    if (this.earth) {
      this.earth.geometry.dispose();
      this.earth.material.dispose();
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    window.removeEventListener("resize", this.handleResize);

    console.log("Scene manager disposed");
  }
}
