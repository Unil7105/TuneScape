
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Song } from '../types';

interface MusicSpaceProps {
  songs: Song[];
  currentSong: Song;
  onSelectSong: (song: Song) => void;
  isPlaying: boolean;
  currentTime: number;
}

const MusicSpace: React.FC<MusicSpaceProps> = ({ songs, currentSong, onSelectSong, isPlaying, currentTime }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    cards: { group: THREE.Group; texture: THREE.CanvasTexture; song: Song }[];
    cardGroup: THREE.Group;
    targetZoom: number;
    // Orbit controls - camera orbits around center
    orbitAngle: number;  // Horizontal angle (theta)
    orbitPitch: number;  // Vertical angle (phi)
  } | null>(null);

  // Helper function to format time for canvas display
  const formatTimeForCanvas = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Polyfill for roundRect if not available
  const ensureRoundRect = (ctx: CanvasRenderingContext2D) => {
    if (!ctx.roundRect) {
      (ctx as any).roundRect = function (x: number, y: number, w: number, h: number, r: number) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
      };
    }
  };

  const drawPlayerCanvas = (song: Song, active: boolean, playing: boolean, progress: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 760;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Ensure roundRect is available
    ensureRoundRect(ctx);

    const w = canvas.width;
    const h = canvas.height;
    const cardRadius = 45; // Rounded corners for card frame
    const padding = 18; // Padding from edges

    ctx.clearRect(0, 0, w, h);

    // 1. Premium Dark Gray Card Frame with Enhanced Glassmorphism
    // Gradient background for depth
    const cardGradient = ctx.createLinearGradient(0, 0, 0, h);
    cardGradient.addColorStop(0, active ? '#2d2d2d' : '#2a2a2a');
    cardGradient.addColorStop(1, active ? '#1f1f1f' : '#222222');
    ctx.fillStyle = cardGradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, cardRadius);
    ctx.fill();

    // Enhanced glassmorphism overlay with multiple layers
    ctx.globalAlpha = 0.08;
    const glassGradient = ctx.createLinearGradient(0, 0, 0, h * 0.5);
    glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    glassGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = glassGradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, cardRadius);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Premium border with active state enhancement
    ctx.strokeStyle = active ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = active ? 1.5 : 1;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, cardRadius);
    ctx.stroke();

    // 2. Premium White Display Area - Exactly 2/3 of card height
    const displayHeight = Math.floor(h * (2 / 3)); // 506px out of 760px
    const displayTop = padding;
    const displayLeft = padding;
    const displayWidth = w - (padding * 2);
    const displayRadius = 32;

    // White background with subtle gradient
    const displayGradient = ctx.createLinearGradient(0, displayTop, 0, displayTop + displayHeight);
    displayGradient.addColorStop(0, '#ffffff');
    displayGradient.addColorStop(1, '#fafafa');
    ctx.fillStyle = displayGradient;
    ctx.beginPath();
    ctx.roundRect(displayLeft, displayTop, displayWidth, displayHeight, displayRadius);
    ctx.fill();

    // Refined inner border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(displayLeft, displayTop, displayWidth, displayHeight, displayRadius);
    ctx.stroke();

    // 3. Song Title and Artist - Premium typography between display and controls
    const titleAreaTop = displayTop + displayHeight + 20;
    const titleAreaHeight = 52;

    // Song Title - Bold, prominent
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Inter", sans-serif';

    // Truncate long titles
    const maxTitleWidth = displayWidth - 10;
    let displayTitle = song.title;
    const titleMetrics = ctx.measureText(displayTitle);
    if (titleMetrics.width > maxTitleWidth) {
      while (ctx.measureText(displayTitle + '...').width > maxTitleWidth && displayTitle.length > 0) {
        displayTitle = displayTitle.slice(0, -1);
      }
      displayTitle += '...';
    }
    ctx.fillText(displayTitle, displayLeft, titleAreaTop);

    // Artist Name - Lighter, smaller
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = '500 15px "Inter", sans-serif';

    // Truncate long artist names
    let displayArtist = song.artist;
    const artistMetrics = ctx.measureText(displayArtist);
    if (artistMetrics.width > maxTitleWidth) {
      while (ctx.measureText(displayArtist + '...').width > maxTitleWidth && displayArtist.length > 0) {
        displayArtist = displayArtist.slice(0, -1);
      }
      displayArtist += '...';
    }
    ctx.fillText(displayArtist, displayLeft, titleAreaTop + 28);

    // 4. Progress Bar - Below title area with proper spacing
    const progressBarTop = titleAreaTop + titleAreaHeight + 16;
    const progressBarHeight = 2.5;
    const progressBarLeft = displayLeft;
    const progressBarWidth = displayWidth;

    // Progress bar track (light gray)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.beginPath();
    ctx.roundRect(progressBarLeft, progressBarTop, progressBarWidth, progressBarHeight, progressBarHeight / 2);
    ctx.fill();

    // Progress bar fill (brighter for active state)
    if (active && progress > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.roundRect(progressBarLeft, progressBarTop, progressBarWidth * progress, progressBarHeight, progressBarHeight / 2);
      ctx.fill();
    }

    // Time indicators - Left and right of progress bar
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '600 12px "Inter", sans-serif';

    // Current time on left
    ctx.textAlign = 'left';
    const currentTimeStr = formatTimeForCanvas(song.duration * progress);
    ctx.fillText(currentTimeStr, progressBarLeft, progressBarTop + 6);

    // Remaining time on right (negative format)
    ctx.textAlign = 'right';
    const remainingTime = song.duration * (1 - progress);
    const remainingTimeStr = `-${formatTimeForCanvas(remainingTime)}`;
    ctx.fillText(remainingTimeStr, progressBarLeft + progressBarWidth, progressBarTop + 6);

    // 5. Playback Controls - Large white icons centered, properly spaced
    // Position controls with good spacing below progress bar
    const controlsTop = progressBarTop + 45; // Good spacing below progress bar
    const centerX = w / 2;
    const iconSize = 40;
    const playIconSize = 62; // Larger play/pause for prominence
    const iconSpacing = 110;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';

    // Previous icon
    ctx.font = `bold ${iconSize}px sans-serif`;
    ctx.fillText('⏮', centerX - iconSpacing, controlsTop);

    // Play/Pause icon (centered, larger) - enhanced for active state
    ctx.font = `bold ${playIconSize}px sans-serif`;
    if (active && playing) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    } else {
      ctx.fillStyle = '#ffffff';
    }
    ctx.fillText(active && playing ? '⏸' : '▶', centerX, controlsTop);
    ctx.fillStyle = '#ffffff';

    // Next icon
    ctx.font = `bold ${iconSize}px sans-serif`;
    ctx.fillText('⏭', centerX + iconSpacing, controlsTop);

    return canvas;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    // Premium subtle background - soft white with slight warmth
    scene.background = new THREE.Color(0xfafafa);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 4000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Ensure renderer doesn't block pointer events
    renderer.domElement.style.pointerEvents = 'auto';
    renderer.domElement.style.touchAction = 'none';
    containerRef.current.appendChild(renderer.domElement);

    // Premium lighting setup for glassmorphism effect
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.8);
    scene.add(ambientLight);

    // Add subtle directional light for depth
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    const cardGroup = new THREE.Group();
    scene.add(cardGroup);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous'; // Enable CORS for YouTube thumbnails
    const cards: { group: THREE.Group; texture: THREE.CanvasTexture; song: Song }[] = [];

    songs.forEach((song, idx) => {
      const group = new THREE.Group();
      const canvas = drawPlayerCanvas(song, song.id === currentSong.id, isPlaying, 0);
      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 8;

      const geometry = new THREE.PlaneGeometry(4, 5.8);
      // Enhanced material with better transparency and reflection for glassmorphism
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        roughness: 0.1,
        metalness: 0.05
      });
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);

      // Album art overlay - positioned in the white display area with perfect fit
      // Canvas dimensions: 512x760 pixels
      // Three.js card geometry: 4 units wide x 5.8 units tall

      const loadAlbumArt = (url: string, retries = 3) => {
        textureLoader.load(
          url,
          (texture) => {
            // Calculate display area dimensions in pixels - exactly matching canvas drawing
            const canvasWidth = 512;
            const canvasHeight = 760;
            const padding = 18; // pixels (matching card padding exactly)
            const displayAreaWidthPx = canvasWidth - (padding * 2); // 476px
            const displayAreaHeightPx = Math.floor(canvasHeight * (2 / 3)); // 506px (exactly 2/3, matching canvas)

            // Convert to Three.js units (card is 4x5.8 units)
            const pixelsPerUnitX = canvasWidth / 4; // 128px per unit
            const pixelsPerUnitY = canvasHeight / 5.8; // ~131.03px per unit

            // Display area dimensions in Three.js units
            const displayAreaWidth = displayAreaWidthPx / pixelsPerUnitX; // ~3.72 units
            const displayAreaHeight = displayAreaHeightPx / pixelsPerUnitY; // ~3.87 units

            // Add margin to account for rounded corners and ensure no overflow
            // Using 3% margin for better safety
            const margin = 0.03;
            const availableWidth = displayAreaWidth * (1 - margin);
            const availableHeight = displayAreaHeight * (1 - margin);

            // Get image dimensions from texture
            const img = texture.image;
            if (!img || !img.width || !img.height) {
              console.warn('Invalid image dimensions for', song.title);
              if (retries > 0) {
                setTimeout(() => loadAlbumArt(url, retries - 1), 500);
              }
              return;
            }

            const imageAspect = img.width / img.height;
            const displayAspect = availableWidth / availableHeight;

            // Calculate image size using CONTAIN strategy - fit completely within bounds
            // This ensures no overflow in either axis
            let artWidth, artHeight;
            if (imageAspect > displayAspect) {
              // Image is wider than display - fit to width
              artWidth = availableWidth;
              artHeight = availableWidth / imageAspect;
              // Verify height doesn't exceed
              if (artHeight > availableHeight) {
                artHeight = availableHeight;
                artWidth = availableHeight * imageAspect;
              }
            } else {
              // Image is taller or square - fit to height
              artHeight = availableHeight;
              artWidth = availableHeight * imageAspect;
              // Verify width doesn't exceed
              if (artWidth > availableWidth) {
                artWidth = availableWidth;
                artHeight = availableWidth / imageAspect;
              }
            }

            // Final safety check - ensure dimensions are within bounds
            artWidth = Math.min(artWidth, availableWidth);
            artHeight = Math.min(artHeight, availableHeight);

            // Create geometry with calculated dimensions
            const artGeo = new THREE.PlaneGeometry(artWidth, artHeight);

            // Configure texture properly - flipY true to fix upside down images
            texture.flipY = true;
            texture.needsUpdate = true;

            // Create material with proper texture settings
            const artMat = new THREE.MeshBasicMaterial({
              map: texture,
              transparent: true,
              side: THREE.DoubleSide,
              depthWrite: false
            });

            const artMesh = new THREE.Mesh(artGeo, artMat);

            // Calculate position: display area starts at padding from top
            // Card center is at (0, 0), top edge is at y = 2.9
            // Card height is 5.8 units, so top is at y = 2.9, bottom is at y = -2.9
            const cardTopY = 2.9; // Top of card in Three.js units
            const paddingInUnits = padding / pixelsPerUnitY; // ~0.137 units

            // Display area top edge (from card top, going down)
            const displayAreaTopY = cardTopY - paddingInUnits;

            // Display area center Y (from top, going down by half the height)
            const displayAreaCenterY = displayAreaTopY - (displayAreaHeight / 2);

            // Position image at exact center of display area
            // X: 0 (centered horizontally)
            // Y: displayAreaCenterY (centered vertically in display area)
            // Z: slightly in front of card to ensure visibility
            artMesh.position.set(0, displayAreaCenterY, 0.02);

            // Add to main group
            group.add(artMesh);
          },
          undefined,
          (error) => {
            console.error('Error loading album art for', song.title, ':', error);
            // Retry on error
            if (retries > 0) {
              setTimeout(() => loadAlbumArt(url, retries - 1), 1000);
            }
          }
        );
      };

      // Start loading with retry mechanism
      loadAlbumArt(song.coverUrl);

      // Fibonacci Sphere Distribution for a more structured look
      const phi = Math.acos(-1 + (2 * idx) / songs.length);
      const theta = Math.sqrt(songs.length * Math.PI) * phi;
      const radius = 35 + (idx % 3) * 8; // Multi-layered depth

      group.position.set(
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi)
      );

      group.lookAt(0, 0, 0);
      group.userData = { song };

      cardGroup.add(group);
      cards.push({ group, texture, song });
    });

    sceneRef.current = {
      scene, camera, renderer, cards, cardGroup,
      targetZoom: 50,
      orbitAngle: 0,    // Start facing front
      orbitPitch: 0.3   // Slight downward angle
    };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // SCROLL CONTROL: In/Out movement (Z-axis ONLY)
    const onWheel = (e: WheelEvent) => {
      if (!sceneRef.current || !containerRef.current) return;
      e.preventDefault();
      e.stopPropagation();

      // Adaptive zoom - faster when far, precise when close
      const currentDistance = sceneRef.current.targetZoom;
      const distanceMultiplier = Math.max(0.8, Math.min(2.5, currentDistance / 50));
      const zoomDelta = e.deltaY * 0.12 * distanceMultiplier;

      // Wider zoom range for better movement
      sceneRef.current.targetZoom = Math.max(10, Math.min(300, sceneRef.current.targetZoom + zoomDelta));
    };

    let isMouseDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let hasDragged = false;

    const onMouseDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      // Accept both left (0) and right (2) mouse buttons for dragging
      if (e.button === 0 || e.button === 2) {
        isMouseDown = true;
        hasDragged = false;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        containerRef.current.style.cursor = 'grabbing';
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      // Reset on any button release
      if (e.button === 0 || e.button === 2 || e.button === undefined) {
        isMouseDown = false;
        if (containerRef.current) {
          containerRef.current.style.cursor = 'grab';
        }
      }
    };

    // DRAG CONTROL: Orbit camera around sphere center
    const onMouseMove = (e: MouseEvent) => {
      if (!sceneRef.current || !containerRef.current) return;
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (isMouseDown) {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        const dragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Only consider it a drag if moved more than 5 pixels
        if (dragDistance > 5) {
          hasDragged = true;
          // Update orbit angles - horizontal drag rotates around Y, vertical changes pitch
          const sensitivity = 0.002;
          sceneRef.current.orbitAngle += deltaX * sensitivity;
          sceneRef.current.orbitPitch = Math.max(-1.2, Math.min(1.2,
            sceneRef.current.orbitPitch + deltaY * sensitivity));
        }

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      }
    };

    const onClick = (e: MouseEvent) => {
      if (!sceneRef.current) return;
      // Only handle click if we didn't drag
      if (hasDragged) {
        hasDragged = false;
        return;
      }
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cardGroup.children, true);
      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && !obj.userData.song) obj = obj.parent;
        if (obj.userData.song) onSelectSong(obj.userData.song);
      }
    };

    // Touch event handlers for mobile support
    let lastTouchX = 0;
    let lastTouchY = 0;
    let touchStartDistance = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (!containerRef.current || e.touches.length === 0) return;
      e.preventDefault();
      if (e.touches.length === 1) {
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        hasDragged = false;
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDistance = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!sceneRef.current || !containerRef.current || e.touches.length === 0) return;
      e.preventDefault();

      if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - lastTouchX;
        const deltaY = e.touches[0].clientY - lastTouchY;
        const dragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (dragDistance > 5) {
          hasDragged = true;
          sceneRef.current.rotationTarget.y += deltaX * 0.002;
          sceneRef.current.rotationTarget.x += deltaY * 0.002;
        }

        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        const zoomDelta = (touchStartDistance - currentDistance) * 0.5;
        if (sceneRef.current) {
          sceneRef.current.targetZoom = Math.max(15, Math.min(250, sceneRef.current.targetZoom + zoomDelta));
        }
        touchStartDistance = currentDistance;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!containerRef.current) return;
      e.preventDefault();
      if (e.touches.length === 0 && !hasDragged) {
        // Handle tap/click on touch devices
        const touch = e.changedTouches[0];
        if (touch) {
          mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(cardGroup.children, true);
          if (intersects.length > 0) {
            let obj = intersects[0].object;
            while (obj.parent && !obj.userData.song) obj = obj.parent;
            if (obj.userData.song) onSelectSong(obj.userData.song);
          }
        }
      }
      hasDragged = false;
    };

    // Attach events to container instead of window
    if (containerRef.current) {
      // Prevent right-click context menu
      containerRef.current.addEventListener('contextmenu', (e) => e.preventDefault());
      containerRef.current.addEventListener('wheel', onWheel, { passive: false });
      containerRef.current.addEventListener('mousemove', onMouseMove);
      containerRef.current.addEventListener('mousedown', onMouseDown);
      containerRef.current.addEventListener('mouseup', onMouseUp);
      containerRef.current.addEventListener('mouseleave', onMouseUp); // Reset on mouse leave
      containerRef.current.addEventListener('click', onClick);
      // Touch events for mobile
      containerRef.current.addEventListener('touchstart', onTouchStart, { passive: false });
      containerRef.current.addEventListener('touchmove', onTouchMove, { passive: false });
      containerRef.current.addEventListener('touchend', onTouchEnd, { passive: false });
    }

    let frame = 0;
    const animate = () => {
      frame += 0.002;
      requestAnimationFrame(animate);
      if (!sceneRef.current) return;

      const { camera, targetZoom, orbitAngle, orbitPitch } = sceneRef.current;

      // Calculate camera position using spherical coordinates
      const radius = targetZoom;
      const targetX = radius * Math.sin(orbitAngle) * Math.cos(orbitPitch);
      const targetY = radius * Math.sin(orbitPitch);
      const targetZ = radius * Math.cos(orbitAngle) * Math.cos(orbitPitch);

      // Smooth camera movement
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.1);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.1);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.1);

      // Camera always looks at center of sphere
      camera.lookAt(0, 0, 0);

      cards.forEach((c, i) => {
        const timeOffset = frame + i * 500;
        // Subtle floating animation for all cards
        const basePhi = Math.acos(-1 + (2 * i) / songs.length);
        const baseTheta = Math.sqrt(songs.length * Math.PI) * basePhi;
        const cardRadius = 35 + (i % 3) * 8;
        const baseY = cardRadius * Math.sin(baseTheta) * Math.sin(basePhi);
        c.group.position.y = baseY + Math.sin(timeOffset * 0.2) * 0.5;

        // All cards same scale
        const targetScale = 1.0;
        c.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('wheel', onWheel);
        containerRef.current.removeEventListener('mousemove', onMouseMove);
        containerRef.current.removeEventListener('mousedown', onMouseDown);
        containerRef.current.removeEventListener('mouseup', onMouseUp);
        containerRef.current.removeEventListener('mouseleave', onMouseUp);
        containerRef.current.removeEventListener('click', onClick);
        containerRef.current.removeEventListener('touchstart', onTouchStart);
        containerRef.current.removeEventListener('touchmove', onTouchMove);
        containerRef.current.removeEventListener('touchend', onTouchEnd);
      }
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [songs]);

  // Optimize: Only update current song card, throttle time updates
  const lastTimeRef = useRef(0);

  useEffect(() => {
    if (!sceneRef.current) return;

    // Throttle time updates to every 500ms to reduce lag
    const timeDiff = Math.abs(currentTime - lastTimeRef.current);
    const shouldUpdateTime = timeDiff >= 0.5;

    sceneRef.current.cards.forEach(c => {
      const isCurrent = c.song.id === currentSong.id;

      // Only redraw if: song changed, play state changed, or significant time passed for current song
      if (isCurrent && (shouldUpdateTime || timeDiff === 0)) {
        const progress = currentTime / (c.song.duration || 100);
        const canvas = drawPlayerCanvas(c.song, true, isPlaying, progress);
        c.texture.image = canvas;
        c.texture.needsUpdate = true;
      } else if (!isCurrent && c.texture.image) {
        // Only update non-current cards if they need to show non-playing state
        // Check if card was previously current
        const wasPlaying = (c.texture.image as HTMLCanvasElement).dataset?.playing === 'true';
        if (wasPlaying) {
          const canvas = drawPlayerCanvas(c.song, false, false, 0);
          c.texture.image = canvas;
          c.texture.needsUpdate = true;
        }
      }
    });

    if (shouldUpdateTime) {
      lastTimeRef.current = currentTime;
    }
  }, [currentSong.id, isPlaying, Math.floor(currentTime * 2) / 2]); // Update every 0.5s instead of every frame

  return <div ref={containerRef} className="fixed inset-0 z-0 bg-white cursor-grab active:cursor-grabbing" style={{ touchAction: 'none', userSelect: 'none' }} />;
};

export default MusicSpace;
