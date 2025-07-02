import { RGBELoader } from "three/addons";
import { TextureLoader, FloatType } from "three";

/**
 * Resource Loader class to manage loading of all assets (HDR, textures, models)
 * with progress tracking and loading screen management
 */
export class ResourceLoader {
  constructor() {
    this.loadingProgress = 0;
    this.totalResources = 0;
    this.loadedResources = 0;
    this.resources = new Map();
    this.loadingCallbacks = [];
    this.completeCallbacks = [];
    this.errorCallbacks = [];

    // Loaders
    this.textureLoader = new TextureLoader();
    this.hdrLoader = new RGBELoader();
    this.hdrLoader.setDataType(FloatType);

    this.isLoading = false;
    this.isComplete = false;
  }

  /**
   * Add a callback for loading progress updates
   * @param {Function} callback - Callback function (progress, loadedCount, totalCount)
   */
  onProgress(callback) {
    this.loadingCallbacks.push(callback);
  }

  /**
   * Add a callback for when loading is complete
   * @param {Function} callback - Callback function (resources)
   */
  onComplete(callback) {
    this.completeCallbacks.push(callback);
  }

  /**
   * Add a callback for loading errors
   * @param {Function} callback - Callback function (error, resourceName)
   */
  onError(callback) {
    this.errorCallbacks.push(callback);
  }

  /**
   * Define all resources to load
   * @param {Array} resourceList - Array of resource definitions
   */
  defineResources(resourceList) {
    this.totalResources = resourceList.length;
    this.resourceList = resourceList;

    // Reset counters
    this.loadedResources = 0;
    this.loadingProgress = 0;
    this.resources.clear();
    this.isComplete = false;
  }

  /**
   * Start loading all defined resources
   */
  async startLoading() {
    if (this.isLoading) {
      console.warn("Resource loading already in progress");
      return;
    }

    if (!this.resourceList || this.resourceList.length === 0) {
      console.warn("No resources defined to load");
      this.completeLoading();
      return;
    }

    this.isLoading = true;
    this.updateProgress();

    console.log(`Starting to load ${this.totalResources} resources...`);

    // Load all resources in parallel
    const loadPromises = this.resourceList.map((resource) => this.loadResource(resource));

    try {
      await Promise.all(loadPromises);
      this.completeLoading();
    } catch (error) {
      console.error("Error loading resources:", error);
      this.triggerError(error, "general");
    }
  }

  /**
   * Load a single resource
   * @param {Object} resource - Resource definition {name, type, url, options}
   */
  async loadResource(resource) {
    const { name, type, url, options = {} } = resource;

    try {
      console.log(`Loading ${type}: ${name} from ${url}`);

      let loadedResource;

      switch (type) {
        case "hdr":
          loadedResource = await this.loadHDR(url);
          break;
        case "texture":
          loadedResource = await this.loadTexture(url, options);
          break;
        default:
          throw new Error(`Unsupported resource type: ${type}`);
      }

      this.resources.set(name, loadedResource);
      this.resourceLoaded();
      console.log(`✓ Loaded ${type}: ${name}`);
    } catch (error) {
      console.error(`✗ Failed to load ${type}: ${name}`, error);
      this.triggerError(error, name);
      this.resourceLoaded(); // Still increment counter to avoid hanging
    }
  }

  /**
   * Load HDR environment map
   * @param {string} url - HDR file URL
   */
  loadHDR(url) {
    return new Promise((resolve, reject) => {
      this.hdrLoader.load(
        url,
        (texture) => resolve(texture),
        undefined,
        (error) => reject(error)
      );
    });
  }

  /**
   * Load texture
   * @param {string} url - Texture file URL
   * @param {Object} options - Texture options
   */
  loadTexture(url, options = {}) {

    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          // Apply options to texture
          if (options.colorSpace) {
            texture.colorSpace = options.colorSpace;
          }
          if (options.wrapS) texture.wrapS = options.wrapS;
          if (options.wrapT) texture.wrapT = options.wrapT;
          if (options.flipY !== undefined) texture.flipY = options.flipY;

          resolve(texture);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  /**
   * Called when a resource finishes loading (success or failure)
   */
  resourceLoaded() {
    this.loadedResources++;
    this.updateProgress();
  }

  /**
   * Update loading progress and trigger callbacks
   */
  updateProgress() {
    this.loadingProgress =
      this.totalResources > 0
        ? (this.loadedResources / this.totalResources) * 100
        : 100;

    // Trigger progress callbacks
    this.loadingCallbacks.forEach((callback) => {
      try {
        callback(
          this.loadingProgress,
          this.loadedResources,
          this.totalResources
        );
      } catch (error) {
        console.error("Error in progress callback:", error);
      }
    });
  }

  /**
   * Complete the loading process
   */
  completeLoading() {
    this.isLoading = false;
    this.isComplete = true;
    this.loadingProgress = 100;

    console.log(
      `✓ All resources loaded! (${this.loadedResources}/${this.totalResources})`
    );

    // Trigger complete callbacks
    this.completeCallbacks.forEach((callback) => {
      try {
        callback(this.resources);
      } catch (error) {
        console.error("Error in complete callback:", error);
      }
    });
  }

  /**
   * Trigger error callbacks
   * @param {Error} error - The error that occurred
   * @param {string} resourceName - Name of the resource that failed
   */
  triggerError(error, resourceName) {
    this.errorCallbacks.forEach((callback) => {
      try {
        callback(error, resourceName);
      } catch (callbackError) {
        console.error("Error in error callback:", callbackError);
      }
    });
  }

  /**
   * Get a loaded resource by name
   * @param {string} name - Resource name
   * @returns {*} The loaded resource or null
   */
  getResource(name) {
    return this.resources.get(name) || null;
  }

  /**
   * Check if all resources are loaded
   * @returns {boolean} True if loading is complete
   */
  isLoadingComplete() {
    return this.isComplete;
  }

  /**
   * Get current loading progress (0-100)
   * @returns {number} Loading progress percentage
   */
  getProgress() {
    return this.loadingProgress;
  }

  /**
   * Dispose of all loaded resources
   */
  dispose() {
    this.resources.forEach((resource, name) => {
      if (resource && typeof resource.dispose === "function") {
        resource.dispose();
      }
    });

    this.resources.clear();
    this.loadingCallbacks = [];
    this.completeCallbacks = [];
    this.errorCallbacks = [];

    console.log("Resource loader disposed");
  }
}
