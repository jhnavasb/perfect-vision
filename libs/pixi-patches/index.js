import "./abstract-renderer.js";
import "./array-resource.js";
import "./base-image-resource.js";
import "./base-render-texture.js";
import "./base-texture.js";
import "./canvas-render-target.js";
import "./filter-system.js";
import "./framebuffer-system.js";
import "./framebuffer.js";
import "./mask-data.js";
import "./mask-system.js";
import "./render-texture.js";
import "./render-texture-pool.js";
import "./render-texture-system.js";
import "./renderer.js";
import "./scissor-system.js";
import "./stencil-system.js";
import "./texture-system.js";

// https://github.com/pixijs/pixijs/issues/6822
Hooks.once("canvasInit", () => {
    const renderer = canvas.app.renderer;
    const gl = renderer.gl;
    const pixel = new Uint8Array(4);
    const texture = PIXI.RenderTexture.create({ width: 1, height: 1 });
    const container = new PIXI.Container();

    container.addChild(new PIXI.Graphics()).beginFill(0xFFFFFF).drawRect(0, 0, 1, 1).endFill();
    container.mask = container.addChild(new PIXI.Graphics());

    renderer.render(container, texture, true);
    renderer.renderTexture.bind(texture);

    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

    if (pixel[0] !== 0) {
        renderer.render(container, texture, true);
        renderer.renderTexture.bind(texture);

        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        if (pixel[0] !== 0) {
            ui.notifications.error("Rendering bug detected. Workaround is NOT working! Please switch to a Chromium-based browser!");
        } else {
            ui.notifications.warn("Rendering bug detected. Workaround enabled. Consider switching to a Chromium-based browser!");

            const render = PIXI.Renderer.prototype.render;
            PIXI.Renderer.prototype.render = function () {
                render.apply(this, arguments);

                if (!this.renderingToScreen) {
                    render.apply(this, arguments);
                }
            }
        }
    }

    renderer.renderTexture.bind(null);

    texture.destroy(true);
});