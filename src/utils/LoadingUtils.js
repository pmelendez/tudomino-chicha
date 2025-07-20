import * as PIXI from 'pixi.js';

/**
 * Utility functions for asset loading
 */

/**
 * Create loading screen
 * @param {PIXI.Application} app - PIXI application
 * @returns {PIXI.Container} Loading screen container
 */
export function createLoadingScreen(app) {
    const container = new PIXI.Container();
    
    // Background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000);
    bg.drawRect(0, 0, app.screen.width, app.screen.height);
    bg.endFill();
    container.addChild(bg);
    
    // Loading text
    const text = new PIXI.Text('Loading...', {
        fontFamily: 'Arial',
        fontSize: 48,
        fill: 0xffffff,
        align: 'center'
    });
    text.anchor.set(0.5);
    text.x = app.screen.width / 2;
    text.y = app.screen.height / 2;
    container.addChild(text);
    
    return container;
}

/**
 * Preload assets with progress tracking
 * @param {string[]} assetPaths - Array of asset paths
 * @param {Function} onProgress - Progress callback (progress: 0-1)
 * @returns {Promise<void>}
 */
export async function preloadAssets(assetPaths, onProgress = null) {
    let loaded = 0;
    const total = assetPaths.length;
    
    const promises = assetPaths.map(async (path) => {
        try {
            await PIXI.Texture.fromURL(path);
            loaded++;
            if (onProgress) {
                onProgress(loaded / total);
            }
        } catch (error) {
            console.warn(`Failed to preload: ${path}`, error);
            loaded++;
            if (onProgress) {
                onProgress(loaded / total);
            }
        }
    });
    
    await Promise.all(promises);
}