export default class BoundingBox {
    constructor(public x0: number, public y0: number, public x1: number, public y1: number) {}

    get width() {
        return this.x1 - this.x0;
    }

    get height() {
        return this.y1 - this.y0;
    }
}