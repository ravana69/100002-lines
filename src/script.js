class _ {
    static limit(value, min, max) {
        return Math.max(min, Math.min(value, max));
    }
}


class CanvasUtils {
    static getLinePixels(startX, startY, endX, endY) {
        const pixels = [];
        let x1 = startX;
        let x2 = endX;
        const y1 = startY;
        const y2 = endY;
        const deltaX = x2 - x1;
        const deltaY = y2 - y1;

        if (x2 < x1) {
            [x1, x2] = [x2, x1];
        }

        for (let x = x1; x < x2; x++) {
            const y = startY + deltaY * (x - x1) / deltaX;
            const pixel = [Math.floor(x), Math.floor(y)];

            pixels.push(pixel);
        }

        return pixels;
    }

    static getColorIndices(x, y, width) {
        const red = 4 * (y * width + x);
        const indices = [red, red + 1, red + 2, red + 3];

        return indices;
    }

    static getAverageColor(colors) {
        const N = colors.length;
        const sum = [0, 0, 0];

        for (let i = 0; i < N; i++) {
            sum[0] += colors[i][0];
            sum[1] += colors[i][1];
            sum[2] += colors[i][2];
        }

        const result = [
            sum[0] / N,
            sum[1] / N,
            sum[2] / N
        ];

        return result;
    }

    static getRandomColorRGB() {
        const r = Math.random() * 255;
        const g = Math.random() * 255;
        const b = Math.random() * 255;
        const color = `rgb(${r}, ${g}, ${b})`;

        return color;
    }
}


class Example {
    #root;
    #canvas;
    #context;
    #imageData;
    #frameRequestId;
    #lastX;
    #lastY;

    constructor(root, url) {
        this.#root = root;
        this.#canvas = document.createElement('canvas');
        this.#context = this.#canvas.getContext('2d');
        this.#root.appendChild(this.#canvas);

        this.#initEventListeners();
        this.#updateSize();
    }

    #initEventListeners() {
        window.addEventListener('resize', this.#updateSize.bind(this));
    }

    #updateSize() {
        this.#canvas.width = window.innerWidth;
        this.#canvas.height = window.innerHeight;

        this.restart();
    }

    #clear() {
        this.#context.fillStyle = '#000000';
        this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    #drawInitialImage() {
        const height = this.#canvas.height;
        const width = this.#canvas.width;
        const m = Math.min(width, height);
        const numberOfCircles = 7;

        this.#context.fillStyle = '#000000';
        this.#context.fillRect(0, 0, width, height);

        for (let i = 0; i < numberOfCircles; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = 0.5 * (Math.random() * m + m / 4);
            const lineWidth = 0.05 * m;

            this.#context.strokeStyle = CanvasUtils.getRandomColorRGB();
            this.#context.lineWidth = lineWidth;
            this.#context.beginPath();
            this.#context.arc(x, y, radius, 0, 2 * Math.PI);
            this.#context.stroke();
        }
    }

    #saveImageData() {
        const width = this.#canvas.width;
        const height = this.#canvas.height;

        this.#imageData = this.#context.getImageData(0, 0, width, height);
    }

    #getLineColors(startX, startY, endX, endY) {
        const pixels = CanvasUtils.getLinePixels(startX, startY, endX, endY);
        const colors = [];
        const numberOfPixels = pixels.length;
        const width = this.#canvas.width;

        for (let i = 0; i < numberOfPixels; i++) {
            const x = pixels[i][0];
            const y = pixels[i][1];
            const colorIndices = CanvasUtils.getColorIndices(x, y, width);
            const r = this.#imageData.data[colorIndices[0]];
            const g = this.#imageData.data[colorIndices[1]];
            const b = this.#imageData.data[colorIndices[2]];
            const color = [r, g, b];

            colors.push(color);
        }

        return colors;
    }

    #drawLine() {
        const time = performance.now();
        const sizeModifier = _.limit((Math.cos(time / 1000) + 1) / 2, 0.05, 0.8);
        const width = this.#canvas.width;
        const height = this.#canvas.height;
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        const angle = Math.random() * 2 * Math.PI;
        const length = 0.5 * sizeModifier * Math.max(width, height);
        const endX = _.limit(startX + length * Math.cos(angle), 0, width);
        const endY = _.limit(startY + length * Math.sin(angle), 0, height);
        const lineColors = this.#getLineColors(startX, startY, endX, endY);
        const averageColor = CanvasUtils.getAverageColor(lineColors);
        const r = averageColor[0];
        const g = averageColor[1];
        const b = averageColor[2];
        const strokeStyle = `rgb(${r}, ${g}, ${b})`;
        const lineWidth = 1;

        this.#context.strokeStyle = strokeStyle;
        this.#context.lineWidth = lineWidth;
        this.#context.lineCap = 'round';
        this.#context.beginPath();
        this.#context.moveTo(startX, startY);
        this.#context.lineTo(endX, endY);
        this.#context.stroke();

        this.#lastX = endX;
        this.#lastY = endY;
    }

    #startDrawingLoop() {
        if (this.#frameRequestId) {
            return;
        }

        const drawFrame = () => {
            const linesPerFrame = 300;

            for (let i = 0; i < linesPerFrame; i++) {
                this.#drawLine();
            }

            requestAnimationFrame(drawFrame);
        };

        requestAnimationFrame(drawFrame);
    }

    #stopDrawingLoop() {
        cancelAnimationFrame(this.#frameRequestId);

        this.#frameRequestId = null;
    }

    #start() {
        this.#clear();
        this.#drawInitialImage();
        this.#saveImageData();
        this.#clear();
        this.#startDrawingLoop();
    }

    #stop() {
        this.#stopDrawingLoop();
    }

    restart() {
        this.#stop();
        this.#start();
    }
}

function main() {
    const root = document.getElementById('root');
    const example = new Example(root);

    setTimeout(() => {
        root.classList.remove('-hidden');
    }, 100);

    setInterval(() => {
        root.classList.add('-hidden');
        setTimeout(() => {
            example.restart();
            root.classList.remove('-hidden');
        }, 250);
    }, 1000 * Math.PI * 4);
}

document.addEventListener('DOMContentLoaded', main);
