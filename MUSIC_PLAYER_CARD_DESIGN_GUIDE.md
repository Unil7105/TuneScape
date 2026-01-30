# Music Player Card Design Update Guide

## Overview
The music player card design is rendered on a canvas in the `drawPlayerCanvas` function located in `components/MusicSpace.tsx` (lines 51-223). The card is then used as a texture on a 3D plane in a Three.js scene.

## Card Structure

The card is divided into 5 main sections:

### 1. **Card Frame** (Lines 68-94)
- **Location**: Outer container of the card
- **Current Design**: Dark gray gradient with glassmorphism effect
- **Key Parameters**:
  - `cardRadius = 45` - Rounded corner radius
  - `padding = 18` - Padding from edges
  - Colors: `#2d2d2d` (active) / `#2a2a2a` (inactive) at top, `#1f1f1f` (active) / `#222222` (inactive) at bottom
  - Border: `rgba(255, 255, 255, 0.18)` (active) / `rgba(255, 255, 255, 0.1)` (inactive)

**To Update:**
```typescript
// Change card size
canvas.width = 512;  // Card width in pixels
canvas.height = 760; // Card height in pixels

// Change corner radius
const cardRadius = 45; // Increase for more rounded, decrease for sharper

// Change colors
cardGradient.addColorStop(0, '#YOUR_COLOR_1'); // Top color
cardGradient.addColorStop(1, '#YOUR_COLOR_2'); // Bottom color

// Change border
ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'; // Border color and opacity
ctx.lineWidth = 1.5; // Border thickness
```

### 2. **White Display Area** (Lines 96-117)
- **Location**: Top 2/3 of the card (where album art appears)
- **Current Design**: White gradient background with rounded corners
- **Key Parameters**:
  - `displayHeight = Math.floor(h * (2/3))` - Exactly 2/3 of card height (506px)
  - `displayRadius = 32` - Rounded corner radius for display area
  - Colors: `#ffffff` (top) to `#fafafa` (bottom)

**To Update:**
```typescript
// Change display area size (currently 2/3 of card height)
const displayHeight = Math.floor(h * (2/3)); // Change ratio: 0.5 for half, 0.7 for 70%, etc.

// Change display area colors
displayGradient.addColorStop(0, '#ffffff'); // Top color
displayGradient.addColorStop(1, '#fafafa'); // Bottom color

// Change inner border
ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)'; // Border color
ctx.lineWidth = 1.5; // Border thickness
```

### 3. **Song Title & Artist** (Lines 119-154)
- **Location**: Between display area and progress bar
- **Current Design**: White text with different weights
- **Key Parameters**:
  - Title: `bold 22px "Inter", sans-serif` - White color
  - Artist: `500 15px "Inter", sans-serif` - 75% opacity white
  - `titleAreaTop = displayTop + displayHeight + 20` - Position from top
  - `titleAreaHeight = 52` - Height of title area

**To Update:**
```typescript
// Change title styling
ctx.fillStyle = '#ffffff'; // Title color
ctx.font = 'bold 22px "Inter", sans-serif'; // Font weight, size, family

// Change artist styling
ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'; // Artist color and opacity
ctx.font = '500 15px "Inter", sans-serif'; // Font weight, size, family

// Change spacing
const titleAreaTop = displayTop + displayHeight + 20; // Adjust 20 for more/less spacing
```

### 4. **Progress Bar** (Lines 156-190)
- **Location**: Below title area
- **Current Design**: Thin white progress bar with time indicators
- **Key Parameters**:
  - `progressBarHeight = 2.5` - Bar thickness
  - Track color: `rgba(255, 255, 255, 0.28)`
  - Fill color: `rgba(255, 255, 255, 0.6)` (active)
  - Time text: `600 12px "Inter", sans-serif`

**To Update:**
```typescript
// Change progress bar thickness
const progressBarHeight = 2.5; // Increase for thicker bar

// Change progress bar colors
ctx.fillStyle = 'rgba(255, 255, 255, 0.28)'; // Track color
ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; // Fill color (active)

// Change time text styling
ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'; // Time text color
ctx.font = '600 12px "Inter", sans-serif'; // Font weight, size, family

// Change spacing
const progressBarTop = titleAreaTop + titleAreaHeight + 16; // Adjust 16 for spacing
```

### 5. **Playback Controls** (Lines 192-220)
- **Location**: Bottom of card
- **Current Design**: Large white emoji icons (⏮ ▶ ⏸ ⏭)
- **Key Parameters**:
  - `iconSize = 40` - Size of prev/next icons
  - `playIconSize = 62` - Size of play/pause icon
  - `iconSpacing = 110` - Space between icons
  - `controlsTop = progressBarTop + 45` - Position from top

**To Update:**
```typescript
// Change icon sizes
const iconSize = 40; // Prev/Next icon size
const playIconSize = 62; // Play/Pause icon size

// Change spacing between icons
const iconSpacing = 110; // Horizontal spacing

// Change control colors
ctx.fillStyle = '#ffffff'; // Icon color

// Change position
const controlsTop = progressBarTop + 45; // Adjust 45 for vertical spacing
```

## Quick Design Customization Examples

### Example 1: Change to Light Theme
```typescript
// Card frame - light colors
cardGradient.addColorStop(0, '#f5f5f5');
cardGradient.addColorStop(1, '#e8e8e8');
ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';

// Text - dark colors
ctx.fillStyle = '#1a1a1a'; // Title
ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Artist
```

### Example 2: Change to Colorful Theme
```typescript
// Card frame - gradient colors
cardGradient.addColorStop(0, '#667eea'); // Purple
cardGradient.addColorStop(1, '#764ba2'); // Dark purple

// Display area - colored
displayGradient.addColorStop(0, '#f093fb');
displayGradient.addColorStop(1, '#f5576c');
```

### Example 3: Change Card Dimensions
```typescript
// Make card wider
canvas.width = 600; // Increase from 512

// Make card taller
canvas.height = 900; // Increase from 760

// Note: You'll also need to update the Three.js geometry:
// const geometry = new THREE.PlaneGeometry(4, 5.8); // Adjust these values proportionally
```

### Example 4: Change Fonts
```typescript
// Use different font family
ctx.font = 'bold 22px "Roboto", sans-serif';
ctx.font = '500 15px "Roboto", sans-serif';

// Use serif fonts
ctx.font = 'bold 22px "Georgia", serif';
```

### Example 5: Add Shadows or Effects
```typescript
// Add shadow to card frame
ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
ctx.shadowBlur = 20;
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 10;
// ... draw card ...
ctx.shadowBlur = 0; // Reset
```

## Important Notes

1. **Canvas Dimensions**: The canvas is 512x760 pixels. If you change these, you'll need to update the Three.js geometry proportionally (line 264).

2. **Display Area**: The display area is exactly 2/3 of the card height. The album art positioning code (lines 276-382) depends on this ratio.

3. **Three.js Integration**: The card is used as a texture on a 3D plane. The geometry is `4 x 5.8` units (line 264), which matches the 512x760 pixel canvas aspect ratio.

4. **Active State**: The card changes appearance when `active = true` (when it's the currently playing song). You can add more active state styling.

5. **Real-time Updates**: The card is redrawn whenever `currentSong`, `isPlaying`, or `currentTime` changes (see useEffect at line 506).

## File Location
- **Main File**: `components/MusicSpace.tsx`
- **Function**: `drawPlayerCanvas` (lines 51-223)
- **Canvas Size**: 512x760 pixels
- **Three.js Geometry**: 4 x 5.8 units

## Testing Your Changes

After making changes:
1. Save the file
2. The card will automatically redraw when the song changes or playback state updates
3. Check both active (current song) and inactive states
4. Verify the album art still displays correctly in the white display area
