import polyline2bezier from '../libs/polyline2bezier.js'

export const traceToSVGPolyline = function(trace, scale = 1, origin = {x:0,y:0}) {
    var ePolylineStr = ''
		
    var ePoly_start = '<polyline points="'
    var ePoly_end = '" />'

    var polyStr = ''
    for(let i = 0; i < trace.length-1; i++) {
        var point = trace[i]
        //var nextPoint = trace[1+1]
        polyStr += `${(point.x-origin.x)*scale},${(point.y-origin.y)*scale} `
    }
            
    ePolylineStr = `${ePoly_start}${polyStr}${ePoly_end}
`
        
    return ePolylineStr
}

const traceToBezier = function(trace, scale = 1, origin = {x:0,y:0}) {
    var bezierCurves = []
    var clearTrace = []
    var diffLimit = 7

    // interpolate 'duplicated' points
    clearTrace.push([trace[0].x, trace[0].y])

    var p1, p2, p3
    for (let i = 1; i < trace.length-1; i++) {
        p1 = trace[i-1]
        p2 = trace[i]
        var dist = Math.sqrt( Math.pow(p1.x-p2.x,2) + Math.pow(p1.y-p2.y,2) )
        if (dist > diffLimit) clearTrace.push([ p2.x,p2.y ])
        else if (i < trace.length-2) {
            p1 = trace[i-1]
            p2 = trace[i]
            p3 = trace[i+1]
            clearTrace.push([ p2.x + (p1.x-p2.x)/2, p2.y + (p1.y-p2.y)/2 ])
            clearTrace.push([p2.x, p2.y])
            clearTrace.push([ p2.x + (p3.x-p2.x)/2, p2.y + (p3.y-p2.y)/2 ])
            /*
             *p1 = trace[i]
             *p2 = trace[i+1]
             *dist = Math.sqrt( Math.pow(p1.x-p2.x,2) + Math.pow(p1.y-p2.y,2) )
             *if (dist > diffLimit*2+1) {
             *    // intepolate
             *    clearTrace.push([ p2.x + (p1.x-p2.x)/2, p2.y + (p1.y-p2.y)/2 ])
             *}
             */
        }
    }

    if ( clearTrace.length < 2)
        bezierCurves = false
    else {
        var arr = clearTrace.map(t=>[(t[0]-origin.x)*scale,(t[1]-origin.y)*scale])
        bezierCurves = polyline2bezier(arr)
    }

    return bezierCurves
}

export const traceToSVGPath = function(trace, scale = 1, origin = {x:0,y:0}) {
    var ePathStr = ''

    var ePath_start = '<path d="'
    var ePath_end = '" />'

    var bezierCurves = traceToBezier(trace, scale, origin)
    if (bezierCurves) {
        var pathStr = `M${bezierCurves[0][0].x},${bezierCurves[0][0].y} C`

        for (let segment of bezierCurves) {
            for (let i = 1; i <= 3; i++) {
                var point = segment[i]
                pathStr += ` ${point.x},${point.y}`
            }
        }

        ePathStr = `${ePath_start}${pathStr}${ePath_end}
    `
    }

    return ePathStr
}

export const getBoundingBox = function(traces) {
    var maxX = 0, maxY = 0
    var minX = 9999, minY = 9999
    for (let trace of traces) {
        for (let point of trace) {
            maxX = point.x > maxX ? point.x : maxX
            maxY = point.y > maxY ? point.y : maxY
            minX = point.x < minX ? point.x : minX
            minY = point.y < minY ? point.y : minY
        }
    }

    return {maxX, maxY, minX, minY}
}

export const countTraces = function(traces) {
    var result = {
        accumulated: 0,
        painting: 0,
        flying: 0
    }
    var p1, p2

    for (let trace = 0; trace < traces.length; trace++) {
        if (trace > 0 && trace < traces.length) {
            p1 = traces[trace-1][traces[trace-1].length-1]
            p2 = traces[trace][0]
            result.flying += Math.sqrt( Math.pow(p1.x-p2.x,2) + Math.pow(p1.y-p2.y,2) )
        }
        result.accumulated += traces[trace].length
        for (let point = 1; point < traces[trace].length; point++) {
            p1 = traces[trace][point-1]
            p2 = traces[trace][point]
            result.painting += Math.sqrt( Math.pow(p1.x-p2.x,2) + Math.pow(p1.y-p2.y,2) )
        }
    }

    return result
}

export const getSVGHeader = function(width, height, description = '', UI = false) {
    var viewBox = `viewBox="0 0 ${width} ${height}"`
    var size = ''

    if (UI) size = 'width="100%" height="100%"'
    else size = `width="${width}mm" height="${height}mm"`

    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
    ${viewBox}
    ${size}
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    desc="${description}"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:svg="http://www.w3.org/2000/svg">
`
}

export const getGlobal = function(color, strokeWidth) {
    return `<g fill="none" stroke="${color}" stroke-width="${strokeWidth*10}" stroke-linecap="round" stroke-linejoin="round">`
}

export const exportSVG = function(traces, boundingBox, scale) {
    var SVGString = ''
    var description = ''

    var {maxX, maxY, minX, minY} = boundingBox

    var strokeWidth = 10
    var w = (maxX-minX)*scale, h = (maxY-minY)*scale

    var SVGHeader = getSVGHeader(w, h, description) 
    var SVGGlobalStyle = getGlobal('#ff0000',strokeWidth)
    var SVGEnd ='</g></svg>'

    var eStr = ''
    for (let trace of traces) {
        //eStr += traceToSVGPolyline(trace, scale, {x:minX, y:minY})
        eStr += traceToSVGPath(trace, scale, {x:minX, y:minY})
    }

    SVGString = SVGHeader + SVGGlobalStyle + eStr + SVGEnd

    return SVGString
}
