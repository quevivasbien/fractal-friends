<script lang="ts">
    import BoundingBox from "$lib/BoundingBox";
    import type Complex from "$lib/Complex";
    import Julia from "$lib/Julia";
    import Mandelbrot from "$lib/Mandelbrot";
    import { dataToRGBA, palettes } from "$lib/colors";
    import { onMount } from "svelte";

    let mandelbrotCanvas: HTMLCanvasElement;
    let mandelbrotCtx: CanvasRenderingContext2D | null;
    let juliaCanvas: HTMLCanvasElement;
    let juliaCtx: CanvasRenderingContext2D | null;

    let pageLoaded = false;

    let paletteName: string = "Volcanic";
    let palette = palettes[paletteName];
    $: updatePaletteName(paletteName);

    function updatePaletteName(paletteName: string) {
        palette = palettes[paletteName];
        if (pageLoaded) {
            drawMandelbrot(false);
            if (julia && julia.c) {
                drawJulia(julia.c, false);
            }
        }
    }
    
    let canvas_relwidth = 0.8;
    let canvas_maxwidth = 600;

    const mandelbrotBoundingBox = new BoundingBox(-2, -1.4, 1, 1.4);
    let mandelbrot: Mandelbrot;

    const juliaBoundingBox = new BoundingBox(-1.75, -1.75, 1.75, 1.75);
    let julia: Julia;

    let maxIters = 50;
    $: updateMaxIters(maxIters);

    function updateMaxIters(maxIters: number) {
        console.log("Updating max iterations");
        if (mandelbrot) {
            mandelbrot.maxIterations = maxIters;
            drawMandelbrot();
        }
        if (julia) {
            julia.maxIterations = maxIters;
            if (julia.c) {
                drawJulia(julia.c);
            }
        }
    }

    let curveParam = -0.5;
    let curveFn: (x: number) => number;
    $: updateCurveParam(curveParam);

    function updateCurveParam(curveParam: number) {
        curveFn = (x: number) => Math.pow(x, Math.pow(10, curveParam));
        if (mandelbrot) {
            drawMandelbrot(false);
        }
        if (julia && julia.c) {
            drawJulia(julia.c, false);
        }
    }
    
    onMount(() => {
        const displayWidth = Math.min(
            window.innerWidth * canvas_relwidth,
            canvas_maxwidth
        );

        mandelbrotCtx = mandelbrotCanvas.getContext("2d");
        mandelbrot = new Mandelbrot(
            mandelbrotBoundingBox,
            maxIters,
            mandelbrotBoundingBox.width / displayWidth,
        );
        mandelbrotCanvas.width = mandelbrot.width;
        mandelbrotCanvas.height = mandelbrot.height;
            
        juliaCtx = juliaCanvas.getContext("2d");
        julia = new Julia(
            juliaBoundingBox,
            maxIters,
            juliaBoundingBox.width / displayWidth,
        );
        juliaCanvas.width = julia.width;
        juliaCanvas.height = julia.height;
            
        drawMandelbrot();
        pageLoaded = true;

        window.addEventListener("resize", () => {
            console.log("Resizing");
            const displayWidth = Math.min(
                window.innerWidth * canvas_relwidth,
                canvas_maxwidth
            );
            mandelbrot.setDistancePerPixel(mandelbrotBoundingBox.width / displayWidth);
            drawMandelbrot();
            mandelbrotCanvas.width = mandelbrot.width;
            mandelbrotCanvas.height = mandelbrot.height;
            julia.setDistancePerPixel(juliaBoundingBox.width / displayWidth);
            if (julia.c) {
                drawJulia(julia.c);
            }
            juliaCanvas.width = julia.width;
            juliaCanvas.height = julia.height;
        });
    });

    function drawMandelbrot(rerender: boolean = true) {
        console.log("Drawing mandelbrot");
        if (!mandelbrotCtx) {
            throw new Error("No mandelbrot context");
        }
        if (!mandelbrot) {
            throw new Error("No mandelbrot");
        }
        if (rerender) {
            mandelbrot.render();
        }
        const colorData = dataToRGBA(mandelbrot.data, palette, curveFn);
        const imageData = mandelbrotCtx.createImageData(mandelbrot.width, mandelbrot.height);
        imageData.data.set(colorData);
        mandelbrotCtx.putImageData(imageData, 0, 0);
    }

    function drawJulia(c?: Complex, rerender: boolean = true) {
        if (!juliaCtx) throw new Error("no julia contex");
        juliaCanvas.width = julia.width;
        juliaCanvas.height = julia.height;
        if (rerender) {
            if (!c) throw new Error("c must be defined when rerendering");
            julia.c = c;
            julia.render();
        }
        const colorData = dataToRGBA(julia.data, palette, curveFn);
        const imageData = juliaCtx.createImageData(julia.width, julia.height);
        imageData.data.set(colorData);
        juliaCtx.putImageData(imageData, 0, 0);
    }

    function drawX(ctx: CanvasRenderingContext2D, x: number, y: number, color: string = "red") {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 5);
        ctx.lineTo(x + 5, y + 5);
        ctx.moveTo(x - 5, y + 5);
        ctx.lineTo(x + 5, y - 5);
        ctx.stroke();
    }

    function drawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, color: string = "red") {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 5);
        ctx.lineTo(x + 5, y - 5);
        ctx.lineTo(x, y + 5);
        ctx.lineTo(x - 5, y - 5);
        ctx.fill();
    }

    function onMandelbrotCanvasClick(e: MouseEvent) {
        // when we click on mandelbrot canvas, draw corresponding julia set
        const c = mandelbrot.coordFromMousePosition(e.offsetX, e.offsetY);
        console.log("Clicked at", e.offsetX, e.offsetY, "which is", c);
        if (mandelbrotCtx) {
            drawMandelbrot(false);
            // mandelbrotCtx.clearRect(0, 0, mandelbrot.width, mandelbrot.height);

            drawX(mandelbrotCtx, e.offsetX, e.offsetY);
            // drawTriangle(mandelbrotCtx, e.offsetX, e.offsetY);
        }
        else {
            console.log("No mandelbrot context");
        }
        drawJulia(c);
    }
</script>

<h1 class="text-center text-xl m-6">fractal-friends</h1>
<div class="text-center m-4 space-y-2">
    <div>
        <label for="palette">Palette</label>
        <select class="p-1 rounded  text-center" name="palette" bind:value={paletteName}>
            {#each Object.keys(palettes) as name}
                <option value={name}>{name}</option>
            {/each}
        </select>
    </div>
    <div>
        <label for="maxIters">Max iterations</label>
        <input class="p-1 rounded border border-gray-200 w-20" type="number" name="maxIters" bind:value={maxIters} />
    </div>
    <div class="flex flex-row justify-center space-x-4">
        <label for="curveParam">Color fade:</label>
        <input class="p-1" type="range" min="-1" max="0" step="0.01" bind:value={curveParam} />
    </div>
</div>
<div class="flex flex-row justify-center flex-wrap space-2">
    <div class="flex justify-center align-center m-1 p-2 drop-shadow rounded-md" style:background-color={palette[0].toRGBA()}>
        <canvas class="cursor-pointer self-center" bind:this={mandelbrotCanvas} on:click={(e) => onMandelbrotCanvasClick(e)}></canvas>
    </div>
    <div class="relative justify-center align-center">
        {#if !julia || !julia.c}
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-center rounded-md bg-white p-4 bg-opacity-20">
                <p>Click on the Mandelbrot set to see the corresponding Julia set</p>
            </div>
        {/if}
        <div class="flex justify-center align-center m-1 p-2 drop-shadow rounded-md self-center" style:background-color={palette[0].toRGBA()}>
            <canvas class="" bind:this={juliaCanvas}></canvas>
        </div>
    </div>
</div>
