import type BoundingBox from "$lib/BoundingBox";
import Complex from "$lib/Complex";
import Fractal from "$lib/Fractal";

export default class Mandelbrot extends Fractal {
    
    constructor(
        public boundingBox: BoundingBox,
        public maxIterations: number,
        public distancePerPixel: number,
    ) {
        super(boundingBox, maxIterations, distancePerPixel);
    }

    render() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const c = new Complex(
                    this.boundingBox.x0 + x * this.distancePerPixel,
                    this.boundingBox.y0 + y * this.distancePerPixel
                );
                this.data[y * this.width + x] = this.mandelbrotIteration(c);
            }
        }
    }

    private mandelbrotIteration(c: Complex) {
        let z = c;
        for (let i = 0; i < this.maxIterations; i++) {
            z = z.mul(z).add(c);
            if (z.abs() > 2) {
                return i / this.maxIterations;
            }
        }
        return 1;
    }

    coordFromMousePosition(x: number, y: number) {
        const { x0, y0, x1, y1 } = this.boundingBox;
        const { width, height } = this;
        const xCoord = x0 + x / width * (x1 - x0);
        const yCoord = y0 + y / height * (y1 - y0);
        return new Complex(xCoord, yCoord);
    }
}
