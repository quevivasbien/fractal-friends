export default class Complex {
    constructor(public re: number, public im: number) {}
    add(other: Complex) {
        return new Complex(this.re + other.re, this.im + other.im);
    }
    mul(other: Complex) {
        return new Complex(
            this.re * other.re - this.im * other.im,
            this.re * other.im + this.im * other.re
        );
    }
    abs() {
        return Math.sqrt(this.re * this.re + this.im * this.im);
    }
}