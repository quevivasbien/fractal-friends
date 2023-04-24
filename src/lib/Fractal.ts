import type BoundingBox from '$lib/BoundingBox';

export default abstract class Fractal {
    width: number = 0;
    height: number = 0;
    data: Array<number> = [];

    constructor(
        public boundingBox: BoundingBox,
        public maxIterations: number,
        public distancePerPixel: number,
    ) {
        this.setDistancePerPixel(distancePerPixel);
    }

    setDistancePerPixel(distancePerPixel: number): void {
        this.distancePerPixel = distancePerPixel;
        this.width = Math.ceil(this.boundingBox.width / this.distancePerPixel);
        this.height = Math.ceil(this.boundingBox.height / this.distancePerPixel);
        this.data = Array(this.width * this.height);
    }

    // render updates this.data with fractal values
    abstract render(): void;
}
