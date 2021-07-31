export class SpriteMeshGeometry extends PIXI.MeshGeometry {
    constructor() {
        super(
            new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
            new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
            new Uint16Array([0, 1, 2, 0, 2, 3])
        );

        this._anchor = new PIXI.ObservablePoint(this._onAnchorUpdate, this, 0, 0);
        this._width = 1;
        this._height = 1;
    }

    get anchor() {
        return this._anchor;
    }

    set anchor(value) {
        this._anchor.copyFrom(value);
    }

    get width() {
        return this._width;
    }

    set width(value) {
        if (this._width !== value) {
            this._width = value;
            this._updateVerticesBuffer();
        }
    }

    get height() {
        return this._height;
    }

    set height(value) {
        if (this._height !== value) {
            this._height = value;
            this._updateVerticesBuffer();
        }
    }

    resize(width, height) {
        if (this._width !== width || this._height !== height) {
            this._width = width;
            this._height = height;
            this._updateVerticesBuffer();
        }
    }

    _updateVerticesBuffer() {
        const verticesBuffer = this.buffers[0];
        const vertices = verticesBuffer.data;

        vertices[0] = -this._anchor.x * this._width;
        vertices[1] = -this._anchor.y * this._height;
        vertices[2] = (1 - this._anchor.x) * this._width;
        vertices[3] = -this._anchor.y * this._height;
        vertices[4] = (1 - this._anchor.x) * this._width;
        vertices[5] = (1 - this._anchor.y) * this._height;
        vertices[6] = -this._anchor.x * this._width;
        vertices[7] = (1 - this._anchor.y) * this._height;

        verticesBuffer.update();
    }

    _onAnchorUpdate() {
        this._updateVerticesBuffer();
    }
}

export class SpriteMesh extends PIXI.Mesh {
    constructor(shader) {
        const geometry = new SpriteMeshGeometry();

        super(geometry, shader);

        const texture = shader.texture;

        this.texture = texture;

        if (texture) {
            this.anchor.set(texture.defaultAnchor.x, texture.defaultAnchor.y);
        }
    }

    get anchor() {
        return this.geometry.anchor;
    }

    set anchor(value) {
        this.geometry.anchor = value;
    }

    get width() {
        return Math.abs(this.scale.x) * this.geometry.width;
    }

    set width(value) {
        if (this.geometry.width !== 0) {
            this.scale.x = value / this.geometry.width;
        } else {
            this.scale.x = 1;
        }

        this._width = value;
    }

    get height() {
        return Math.abs(this.scale.y) * this.geometry.height;
    }

    set height(value) {
        if (this.geometry.height !== 0) {
            this.scale.y = value / this.geometry.height;
        } else {
            this.scale.y = 1;
        }

        this._height = value;
    }

    get texture() {
        return this.shader.texture;
    }

    set texture(value) {
        this.shader.texture = value;

        if (this._texture) {
            this._texture.off("update", this._onTextureUpdate, this);
        }

        if (value) {
            this._texture = value;

            if (this._texture.baseTexture.valid) {
                this._onTextureUpdate();
            } else {
                this._texture.once("update", this._onTextureUpdate, this);
            }
        } else {
            this._texture = null;
        }
    }

    _onTextureUpdate() {
        if (this._texture) {
            this.geometry.resize(this._texture.width, this._texture.height);
            this._texture = null;

            if (this._width) {
                this.scale.x = Math.sign(this.scale.x) * this._width / this.geometry.width;
            }

            if (this._height) {
                this.scale.y = Math.sign(this.scale.y) * this._height / this.geometry.height;
            }
        }
    }
}