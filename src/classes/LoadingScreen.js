/**
 * Loading Screen Manager - Handles the visual loading interface
 */
export class LoadingScreen {
  constructor() {
    this.loadingElement = null;
    this.progressBar = null;
    this.progressText = null;
    this.statusText = null;
    this.detailsList = null;
    this.isVisible = false;

    this.createLoadingScreen();
  }

  /**
   * Create the loading screen HTML structure
   */
  createLoadingScreen() {
    // Create main loading overlay
    this.loadingElement = document.createElement("div");
    this.loadingElement.id = "advanced-loading-overlay";
    this.loadingElement.className = "advanced-loading-overlay";

    // Create loading content container
    const loadingContent = document.createElement("div");
    loadingContent.className = "advanced-loading-content";

    // Logo and title
    const header = document.createElement("div");
    header.className = "loading-header";
    header.innerHTML = `
      <div class="loading-logo">🛰️</div>
      <h2 class="loading-title">ISS Tracker 3D</h2>
      <p class="loading-subtitle">Chargement des ressources...</p>
    `;

    // Progress section
    const progressSection = document.createElement("div");
    progressSection.className = "progress-section";

    // Progress bar container
    const progressContainer = document.createElement("div");
    progressContainer.className = "progress-container";

    this.progressBar = document.createElement("div");
    this.progressBar.className = "progress-bar";

    const progressFill = document.createElement("div");
    progressFill.className = "progress-fill";
    this.progressBar.appendChild(progressFill);

    progressContainer.appendChild(this.progressBar);

    // Progress text
    this.progressText = document.createElement("div");
    this.progressText.className = "progress-text";
    this.progressText.textContent = "0%";

    // Status text
    this.statusText = document.createElement("div");
    this.statusText.className = "status-text";
    this.statusText.textContent = "Initialisation...";

    progressSection.appendChild(progressContainer);
    progressSection.appendChild(this.progressText);
    progressSection.appendChild(this.statusText);

    // Details section
    const detailsSection = document.createElement("div");
    detailsSection.className = "details-section";

    const detailsTitle = document.createElement("h3");
    detailsTitle.className = "details-title";
    detailsTitle.textContent = "Ressources:";

    this.detailsList = document.createElement("ul");
    this.detailsList.className = "details-list";

    detailsSection.appendChild(detailsTitle);
    detailsSection.appendChild(this.detailsList);

    // Assemble everything
    loadingContent.appendChild(header);
    loadingContent.appendChild(progressSection);
    loadingContent.appendChild(detailsSection);
    this.loadingElement.appendChild(loadingContent);

    // Add CSS styles
    this.addStyles();
  }

  /**
   * Add CSS styles for the loading screen
   */
  addStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .advanced-loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 1;
        transition: opacity 0.5s ease-out;
      }

      .advanced-loading-overlay.fade-out {
        opacity: 0;
      }

      .advanced-loading-content {
        text-align: center;
        color: white;
        max-width: 500px;
        padding: 2rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }

      .loading-header {
        margin-bottom: 2rem;
      }

      .loading-logo {
        font-size: 4rem;
        margin-bottom: 1rem;
        animation: float 3s ease-in-out infinite;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }

      .loading-title {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
        background: linear-gradient(45deg, #64b5f6, #42a5f5, #2196f3);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .loading-subtitle {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1rem;
        margin: 0.5rem 0 0 0;
        opacity: 0.8;
      }

      .progress-section {
        margin-bottom: 2rem;
      }

      .progress-container {
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 1rem;
      }

      .progress-bar {
        width: 100%;
        height: 100%;
        position: relative;
      }

      .progress-fill {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #64b5f6, #42a5f5, #2196f3);
        border-radius: 4px;
        transition: width 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .progress-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: shimmer 2s infinite;
      }

      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      .progress-text {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: #64b5f6;
      }

      .status-text {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 0.9rem;
        opacity: 0.7;
        margin-bottom: 1rem;
      }

      .details-section {
        text-align: left;
      }

      .details-title {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1rem;
        margin: 0 0 1rem 0;
        text-align: center;
        opacity: 0.8;
      }

      .details-list {
        list-style: none;
        padding: 0;
        margin: 0;
        max-height: 120px;
        overflow-y: auto;
        font-size: 0.8rem;
      }

      .details-list::-webkit-scrollbar {
        width: 4px;
      }

      .details-list::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
      }

      .details-list::-webkit-scrollbar-thumb {
        background: rgba(100, 181, 246, 0.5);
        border-radius: 2px;
      }

      .resource-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.3rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .resource-item:last-child {
        border-bottom: none;
      }

      .resource-name {
        flex-grow: 1;
        opacity: 0.8;
      }

      .resource-status {
        font-size: 0.7rem;
        padding: 0.2rem 0.5rem;
        border-radius: 10px;
        font-weight: 600;
      }

      .resource-status.loading {
        background: rgba(255, 193, 7, 0.2);
        color: #ffc107;
      }

      .resource-status.loaded {
        background: rgba(76, 175, 80, 0.2);
        color: #4caf50;
      }

      .resource-status.error {
        background: rgba(244, 67, 54, 0.2);
        color: #f44336;
      }

      .loading-spinner {
        display: inline-block;
        width: 12px;
        height: 12px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid #ffc107;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-left: 0.5rem;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Show the loading screen
   */
  show() {
    if (!this.isVisible) {
      document.body.appendChild(this.loadingElement);
      this.isVisible = true;
    }
  }

  /**
   * Hide the loading screen with fade out animation
   */
  hide() {
    if (this.isVisible) {
      this.loadingElement.classList.add("fade-out");
      setTimeout(() => {
        if (this.loadingElement.parentNode) {
          document.body.removeChild(this.loadingElement);
        }
        this.isVisible = false;
      }, 500);
    }
  }

  /**
   * Update progress display
   * @param {number} progress - Progress percentage (0-100)
   * @param {number} loaded - Number of loaded resources
   * @param {number} total - Total number of resources
   */
  updateProgress(progress, loaded, total) {
    if (this.progressBar) {
      const progressFill = this.progressBar.querySelector(".progress-fill");
      progressFill.style.width = `${progress}%`;
    }

    if (this.progressText) {
      this.progressText.textContent = `${Math.round(progress)}%`;
    }

    if (this.statusText) {
      if (progress >= 100) {
        this.statusText.textContent = "Finalisation...";
      } else {
        this.statusText.textContent = `Chargement... (${loaded}/${total})`;
      }
    }
  }

  /**
   * Add or update a resource in the details list
   * @param {string} name - Resource name
   * @param {string} status - Resource status ('loading', 'loaded', 'error')
   */
  updateResourceStatus(name, status) {
    if (!this.detailsList) return;

    let resourceItem = this.detailsList.querySelector(
      `[data-resource="${name}"]`
    );

    if (!resourceItem) {
      resourceItem = document.createElement("li");
      resourceItem.className = "resource-item";
      resourceItem.setAttribute("data-resource", name);

      const resourceName = document.createElement("span");
      resourceName.className = "resource-name";
      resourceName.textContent = name;

      const resourceStatus = document.createElement("span");
      resourceStatus.className = "resource-status";

      resourceItem.appendChild(resourceName);
      resourceItem.appendChild(resourceStatus);
      this.detailsList.appendChild(resourceItem);
    }

    const statusElement = resourceItem.querySelector(".resource-status");
    statusElement.className = `resource-status ${status}`;

    switch (status) {
      case "loading":
        statusElement.innerHTML =
          'Chargement <span class="loading-spinner"></span>';
        break;
      case "loaded":
        statusElement.textContent = "✓ Chargé";
        break;
      case "error":
        statusElement.textContent = "✗ Erreur";
        break;
    }
  }

  /**
   * Set a custom status message
   * @param {string} message - Status message
   */
  setStatus(message) {
    if (this.statusText) {
      this.statusText.textContent = message;
    }
  }

  /**
   * Dispose of the loading screen
   */
  dispose() {
    this.hide();
    this.loadingElement = null;
    this.progressBar = null;
    this.progressText = null;
    this.statusText = null;
    this.detailsList = null;
  }
}
