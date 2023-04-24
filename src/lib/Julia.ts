import type BoundingBox from "$lib/BoundingBox";
import Complex from "$lib/Complex";
import Fractal from "$lib/Fractal";

export default class Julia extends Fractal {
    constructor(
        public boundingBox: BoundingBox,
        public maxIterations: number,
        public distancePerPixel: number,
        public c?: Complex,
    ) {
        super(boundingBox, maxIterations, distancePerPixel);
    }

    render() {
        if (this.c === undefined) {
            throw new Error('c cannot be undefined when rendering Julia fractal');
        }
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const z = new Complex(
                    this.boundingBox.x0 + x * this.distancePerPixel,
                    this.boundingBox.y0 + y * this.distancePerPixel
                );
                this.data[y * this.width + x] = this.juliaIteration(z);
            }
        }
    }

    private juliaIteration(z: Complex) {
        for (let i = 0; i < this.maxIterations; i++) {
            z = z.mul(z).add(this.c as Complex);
            if (z.abs() > 2) {
                return i / this.maxIterations;
            }
        }
        return 1;
    }
}