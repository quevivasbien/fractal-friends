export class Color {
    constructor(
        public r: number,
        public g: number,
        public b: number,
        public a: number,
    ) {}

    static fromHex(hex: string, alpha: number = 255) {
        if (hex.startsWith('#')) {
            hex = hex.slice(1);
        }
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        if (hex.length !== 6) {
            throw new Error('Invalid hex color');
        }
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return new Color(r, g, b, alpha);
    }

    toHex() {
        return `#${this.r.toString(16)}${this.g.toString(16)}${this.b.toString(16)}`;
    }

    static fromRGBA(rgba: string) {
        if (rgba.startsWith('rgba(')) {
            rgba = rgba.slice(5, -1);
        }
        const [r, g, b, a] = rgba.split(',').map(x => parseInt(x));
        return new Color(r, g, b, a);
    }

    toRGBA() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }

    invert() {
        return new Color(255 - this.r, 255 - this.g, 255 - this.b, this.a);
    }

    interpolate(other: Color, t: number) {
        const r = this.r + (other.r - this.r) * t;
        const g = this.g + (other.g - this.g) * t;
        const b = this.b + (other.b - this.b) * t;
        const a = this.a + (other.a - this.a) * t;
        return new Color(r, g, b, a);
    }

    get values() {
        return [this.r, this.g, this.b, this.a];
    }

}

function paletteFromHex(hexColors: Array<string>) {
    return hexColors.map(hex => Color.fromHex(hex));
}

type Palette = Array<Color>;

export const palettes: Record<string, Palette> = {
    "Honeydew": paletteFromHex(["e1efe6","efcb68","aeb7b3","000411","d6eaff"]),
    "Blue" : paletteFromHex(["03256c","2541b2","1768ac","06bee1","ffffff"]),
    "Volcanic": paletteFromHex(["586f7c","0d1317","bbc5aa","a72608","090c02"]),
    "Spicy": paletteFromHex(["ffffff","f7f7f7","efa00b","d65108","591f0a"]),
    "Sweet": paletteFromHex(["eb5e55","3a3335","d81e5b","fdf0d5","c6d8d3"]),
    "Coquelicot": paletteFromHex(["ffffff","f15025","e6e8e6","ced0ce","191919"]),
}

// takes an array for numbers in the range [0, 1] and returns an array of values to be passed to the canvas
export function dataToRGBA(data: Array<number>, palette: Palette, curve?: (x: number) => number) {
    const result = new Uint8ClampedArray(data.length * 4);
    for (let i = 0; i < data.length; i++) {
        const x = curve ? curve(data[i]) : data[i];
        const rgba = numberToRGBA(x, palette);
        result[i * 4 + 0] = rgba[0];
        result[i * 4 + 1] = rgba[1];
        result[i * 4 + 2] = rgba[2];
        result[i * 4 + 3] = rgba[3];
    }
    return result;
}

function numberToRGBA(x: number, palette: Palette) {
    let color: Color | undefined = undefined;
    const nBoxes = palette.length - 1;
    for (let i = 0; i < nBoxes; i++) {
        if (x <= (i + 1) / nBoxes) {
            color = palette[i].interpolate(palette[i + 1], (x - i / nBoxes) * nBoxes);
            break;
        }
    }
    return (color ?? palette[palette.length - 1]).values;
}