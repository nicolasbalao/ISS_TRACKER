import {
  AmbientLight,
  AxesHelper,
  Clock,
  DirectionalLight,
  FloatType,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls, RGBELoader } from "three/addons";
import {CONFIG, ENVIRONMENT} from "../config/config.js";
import { getAllResources } from "../config/resources.js";
import scene from "three/addons/offscreen/scene.js";
import { Earth } from "./Earth.js";
import { ResourceLoader } from "./ResourceLoader.js";

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
    this.rotationAngle = 0;
    this.cameraRadius = CONFIG.SCENE.CAMERA_RADIUS;
    this.issMarker = null; // Référence pour l'animation
    this.clock = new Clock();
    this.resourceLoader = new ResourceLoader();
    this.pmremGenerator = null;

    // Camera modes
    this.cameraMode = "orbit"; // 'orbit', 'follow-iss', 'static'
    this.followOffset = new Vector3(0, 0, 0); // Offset pour la caméra qui suit l'ISS

    // Loading state
    this.isResourcesLoaded = false;
    this.loadingPromise = null;
  }

  /**
   * Initialize the scene, camera, renderer, and controls
   */
  async initialize() {
    // Create basic scene components first
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createControls();
    this.setupEventListeners();

    // Create PMREM generator for HDR processing
    this.pmremGenerator = new PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();

    // Define all resources to load using centralized configuration
    const resources = getAllResources(false); // Exclude optional resources for now

    // Setup resource loader
    this.resourceLoader.defineResources(resources);

    // Start loading resources
    this.loadingPromise = this.resourceLoader.startLoading();

    return this.loadingPromise;
  }

  /**
   * Complete scene setup after resources are loaded
   */
  completeInitialization() {
    if (this.isResourcesLoaded) {
      console.warn("Scene already initialized");
      return;
    }

    // Setup HDR environment
    this.setupHDREnvironment();

    // Create lighting and objects
    this.createLighting();
    this.createEarth();

    // Add helpers
    if(ENVIRONMENT.isDevelopment) {
      const axesHelper = new AxesHelper(5);
      this.scene.add(axesHelper);
    }

    this.isResourcesLoaded = true;
    console.log("Scene manager initialization completed");
  }

  /**
   * Setup HDR environment using loaded HDR texture
   */
  setupHDREnvironment() {
    const hdrTexture = this.resourceLoader.getResource("hdr_environment");
    if (hdrTexture && this.pmremGenerator) {
      const envMap =
        this.pmremGenerator.fromEquirectangular(hdrTexture).texture;

      this.scene.environment = envMap;
      this.scene.background = envMap;

      // Clean up
      hdrTexture.dispose();
    } else {
      console.warn("HDR texture not found, using fallback lighting");
    }
  }

  /**
   * Get resource loader instance for external access
   */
  getResourceLoader() {
    return this.resourceLoader;
  }

  /**
   * Wait for resources to be loaded
   */
  async waitForResources() {
    if (this.loadingPromise) {
      await this.loadingPromise;
      this.completeInitialization();
    }
    return this.isResourcesLoaded;
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
    // this.camera.position.z = CONFIG.SCENE.CAMERA_INITIAL_Z;
  }

  /**
   * Create the WebGL renderer
   */
  createRenderer() {
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputColorSpace = SRGBColorSpace;
  }

  createHDRI() {
    // This method is now handled by the resource loader
    // Keep for backward compatibility but functionality moved to setupHDREnvironment
    console.log("HDR setup is now handled by ResourceLoader");
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

  createSunlight() {
    const sunlight = new DirectionalLight(
      CONFIG.VISUAL.SUN_LIGHT_COLOR,
      CONFIG.VISUAL.SUN_LIGHT_INTENSITY
    );
    sunlight.position.set(1, 1, -100);
    this.scene.add(sunlight);
  }

  /**
   * Create the Earth sphere with texture
   */
  createEarth() {
    // Pass the resource loader to Earth class
    this.earth = new Earth(this.scene, this.resourceLoader);
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
    const deltaTime = this.clock.getDelta();

    // Mettre à jour la caméra selon le mode sélectionné
    this.updateCamera(deltaTime);

    // Animer le marqueur ISS s'il existe
    if (this.issMarker) {
      this.issMarker.animate(deltaTime);
    }

    if (this.controls) {
      this.controls.update();
    }

    if (this.earth) {
      this.earth.cloudsRotation(deltaTime);
    }
  }

  /**
   * Update camera based on current mode
   */
  updateCamera(deltaTime) {
    switch (this.cameraMode) {
      case "orbit":
        this.updateOrbitCamera();
        break;
      case "follow-iss":
        this.updateFollowISSCamera();
        break;
      case "static":
        // Ne rien faire, la caméra reste statique
        break;
    }
  }

  /**
   * Update orbit camera (rotation autour de la Terre)
   */
  updateOrbitCamera() {
    this.rotationAngle += CONFIG.SCENE.ROTATION_SPEED;
    this.camera.position.x = this.cameraRadius * Math.sin(this.rotationAngle);
    this.camera.position.z = this.cameraRadius * Math.cos(this.rotationAngle);
    this.camera.lookAt(this.earth.position);
  }

  /**
   * Update camera to follow ISS
   */
  updateFollowISSCamera() {
    if (this.issMarker && this.issMarker.getMesh()) {
      const issPosition = this.issMarker.getMesh().position;
      const earthCenter = this.earth.earthGroup.position;

      const issDirection = issPosition.clone().sub(earthCenter).normalize();

      const heightOffset = 1;
      const backwardOffset = 0.3;

      const upVector = issDirection.clone();

      const tangent = new Vector3(
        -issDirection.z,
        0,
        issDirection.x
      ).normalize();

      const cameraPosition = issPosition
        .clone()
        .add(upVector.clone().multiplyScalar(heightOffset))
        .add(tangent.clone().multiplyScalar(-backwardOffset));

      this.camera.position.lerp(cameraPosition, 0.5);
      this.camera.lookAt(earthCenter);
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
   * Set ISS marker reference for animation
   * @param {ISSMarker} issMarker - The ISS marker instance
   */
  setISSMarker(issMarker) {
    this.issMarker = issMarker;
  }

  /**
   * Set camera mode
   * @param {string} mode - Camera mode: 'orbit', 'follow-iss', 'static'
   */
  setCameraMode(mode) {
    const validModes = ["orbit", "follow-iss", "static"];
    if (!validModes.includes(mode)) {
      console.warn(`Invalid camera mode: ${mode}. Valid modes:`, validModes);
      return;
    }

    this.cameraMode = mode;

    // Ajuster les contrôles selon le mode
    if (this.controls) {
      if (mode === "follow-iss") {
        this.controls.enabled = false; // Désactiver les contrôles manuels
      } else {
        this.controls.enabled = true; // Réactiver les contrôles manuels
      }
    }

    console.log(`Camera mode set to: ${mode}`);
  }

  /**
   * Get the scene object
   * @returns {Scene} The Three.js scene
   */
  getScene() {
    return this.scene;
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
      this.earth.dispose();
    }

    if (this.pmremGenerator) {
      this.pmremGenerator.dispose();
    }

    if (this.resourceLoader) {
      this.resourceLoader.dispose();
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    window.removeEventListener("resize", this.handleResize);

    console.log("Scene manager disposed");
  }

  /**
   * Public method to start initialization
   */
  async startInitialization() {
    if (!this.loadingPromise) {
      this.loadingPromise = this.initialize();
    }
    return this.loadingPromise;
  }
}
