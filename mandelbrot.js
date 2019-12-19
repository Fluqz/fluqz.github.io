

window.onload = ()=> {

    let w = window.innerHeight;
    let h = window.innerHeight;

    console.log(w, h)

    let center = { x: w/2, y: h/2 }

    let zoomFactor = 1
    let rangeFactor = 2

    let minX = -2
    let maxX = 2
    let minY = -2
    let maxY = 2

    let mousedown = false
    let mmReduc = Date.now()
    let storedMM = center

    let resetBtn = document.querySelector('#reset-btn')
   
    let map = (x, minIn, maxIn, minOut, maxOut) => {

        return (x - minIn) * (maxOut - minOut) / (maxIn -minIn) + minOut
    }

    let setRangeByCenter = (_x, _y)=> {
        
        let x = map(_x, 0, w, minX, maxX)
        let y = map(_y, 0, h, minY, maxY)

        minX = (-rangeFactor * zoomFactor) + x
        maxX = (rangeFactor * zoomFactor) + x

        minY = (-rangeFactor * zoomFactor) + y
        maxY = (rangeFactor * zoomFactor) + y

        console.log('range', minX, maxX, minY, maxY)
    }
    setRangeByCenter(center.x, center.y)

    let container = document.querySelector('#webGL')
    container.style.width = w + 'px'
    container.style.height = h + 'px'
    let ctx = container.getContext('2d')

    ctx.canvas.width = w
    ctx.canvas.height = h
    
    let imageData = ctx.getImageData(0, 0, w, h)
    let data = imageData.data

    // let renderer = new THREE.WebGLRenderer({ antialias: true });
    // renderer.setSize(w, h);
    // renderer.setClearColor(new THREE.Color(0x999999));
    // let camera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, .1, 1000);
    // camera.position.set(center.x, 100, center.z);
    // camera.lookAt(center);

    // let orbit = new THREE.OrbitControls(camera, renderer.domElement)

    // let scene = new THREE.Scene();
    // scene.background = new THREE.Color(0x999999);

    // container.append(renderer.domElement);

    // let light = new THREE.AmbientLight()
    // scene.add(light)


    // let geo = new THREE.PlaneBufferGeometry(1, 1)
    // geo.rotateX(-Math.PI / 2)

    // let mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x000000)})

    // let mesh = new THREE.Mesh(geo, mat)
    // scene.add(mesh)


    let mandelbrotDraw = ()=> {

        // scene.children.forEach(o=> {
        //     scene.remove(o)
        // })

        let maxIterations = 100

        for(let x = 0; x < w; x++) {

            for(let y = 0; y < h; y++) {

                let a = map(x, 0, w, minX, maxX)
                let b = map(y, 0, h, minY, maxY)

                let complexA = a
                let complexB = b
                
                let n = 0
                for(; n <= maxIterations; n++) {
                    
                    let A = a * a - b * b
                    let B = 2 * a * b

                    a = A + complexA
                    b = B + complexB

                    if(a + b > 100)
                        break
                }

                // let bright = map(x*y, 0, w*h, 0, 255)
                bright = 0

                if(n >= maxIterations) 
                    bright = 255
                
                // DRAW PIXEL

                let pix = (x + y * w) * 4
                data[pix + 0] = bright
                data[pix + 1] = map(x, 0, w, 0, 255)
                data[pix + 2] = map(y, 0, h, 0, 255)
                data[pix + 3] = 255

                // let m = mat.clone()
                // m.color = new THREE.Color().setRGB(bright, bright, bright)

                // let mesh = new THREE.Mesh(geo, m)
                // mesh.position.set(x, 0, y)

                // scene.add(mesh)

            }
        }

    }

    // let renderTime = Date.now()
    // let loop = ()=> {

    //     requestAnimationFrame(loop);


    //     if(Date.now() - renderTime > 100) {
    //         renderTime = Date.now()
    //     }
    //     else return

    //     // renderer.render(scene, camera)
        
    // }
    // loop()


    // renderer.render(scene, camera)


    mandelbrotDraw()

    ctx.putImageData(imageData, 0, 0)






    let reset = ()=> {

        zoomFactor = 1

        minX = -2
        maxX = 2
        minY = -2
        maxY = 2

        setRangeByCenter(center.x, center.y)

        mandelbrotDraw()

        ctx.putImageData(imageData, 0, 0)

    }
    resetBtn.addEventListener('click', reset, false)


    container.addEventListener('mousedown', (e)=> {

        mousedown = true

        storedMM = { x: e.clientX, y: e.clientY }

        document.body.style.cursor = 'all-scroll';

    }, false)
    
    container.addEventListener('mouseup', (e)=> {

        // console.log('up')

        mousedown = false

        document.body.style.cursor = 'default';

    }, false)
    
    container.addEventListener('mousemove', (e)=> {

        // console.log('move', e.clientY)

        if(Date.now() - mmReduc > 70) {
            mmReduc = Date.now()
        }
        else return

        if(mousedown) {

            let x = e.clientX
                y = e.clientY

            let c = { x: center.x + (storedMM.x - x), y: center.y + (storedMM.y - y)}

            setRangeByCenter(c.x, c.y)

            mandelbrotDraw()

            ctx.putImageData(imageData, 0, 0)

            storedMM = { x: x, y: y }
        }

    }, false)
    
    container.addEventListener('mousewheel', (e)=> {

        if(Date.now() - mmReduc > 70) {
            mmReduc = Date.now()
        }
        else return

        if(e.deltaY > 0) zoomFactor *= 1.5
        else if(e.deltaY < 0) zoomFactor *= .5

        console.log(zoomFactor)

        let rect = container.getClientRects()

        // let mX = (minX + maxX) / 2

        // let mY = (minY + maxY) / 2

        // console.log(mX, mY)
 
        // setRangeByCenter(map(mX, minX, maxX, 0, w), map(mY, minY, maxY, 0, h))
        
        setRangeByCenter(e.clientX - rect[0].x, e.clientY - rect[0].y)

        mandelbrotDraw()

        ctx.putImageData(imageData, 0, 0)

    }, false)

    container.addEventListener('touchstart', (e)=> { this.onmousedown(e) }, false)
    container.addEventListener('touchmove', (e)=> { this.onmousemove(e) }, false)
    container.addEventListener('touchend', (e)=> { this.onmouseup(e) }, false)

    document.addEventListener('keyup', (e)=> {

        if(e.key == '+') zoomFactor *= .5
        else if(e.key == '-') zoomFactor *= 1.5

        console.log(zoomFactor)

        setRangeByCenter(center.x, center.y)

        mandelbrotDraw()

        ctx.putImageData(imageData, 0, 0)

    }, false)

    window.onresize = () => {

        w = window.innerHeight
        h = window.innerHeight

        container.style.width = w + 'px'
        container.style.height = h + 'px'
        ctx = container.getContext('2d')

        ctx.canvas.width = w
        ctx.canvas.height = h

        imageData = ctx.getImageData(0, 0, w, h)
        data = imageData.data

        center = { x: w/2, y: h/2 }

        mandelbrotDraw()

        ctx.putImageData(imageData, 0, 0)
    }
}