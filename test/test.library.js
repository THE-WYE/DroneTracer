var assert = chai.assert
var expect = chai.expect
var should = chai.should()

import DroneTracer from '/src/DroneTracer/main.js'
import imageFile from '/files/base64File.js'


describe('Library', () => {
	describe('#require', () => {
		it('Shoud load UMD lirary', () => {
			DroneTracer.should.not.be.undefined
		})
		it('Default should be exposed', () => {
            expect(DroneTracer.default).to.be.undefined
		})
	})

    describe('#DroneTracer class', () => {
        it('Should check constructor options', ()=> {
            let construct = function() {
                new DroneTracer({gpsLocation: [0,0], dimensions: [0,0]})
            }
            expect(construct).to.throw()

            var tracer = new DroneTracer({
                wallId: 'WID01', gpsLocation: [0,0], 
                wallSize: [0,0], canvasSize: [0, 0], canvasPosition: [0,0]
            })
            tracer.paintingConfig.wallId.should.be.equals('WID01')
        })
    })

    describe('#Transform', () => {
        var tracer = new DroneTracer({
            wallId: 1, gpsLocation: [0,0], 
            wallSize: [0,0], canvasSize: [0, 0], canvasPosition: [0,0],
            minimumImageSize: [10,10]
        })
        it('Should check parameters', () => {
            expect(tracer.transform).to.throw()

            var callTransform = function() {
                tracer.transform(imageFile)
            }
            expect(callTransform).to.not.throw()
        })
        it('Should return a Promise', ()=> {
            tracer.transform(imageFile).should.be.a('promise');
        })

        it('Transform should return a valid DronePaint instance', async ()=> {
            var dronePaint = await tracer.transform(imageFile)

            // TODO: check with DronePaint object

            //console.log('DronePaint', dronePaint)
            dronePaint.should.not.be.undefined
            dronePaint.sourceImage.should.be.equals(imageFile)
            //dronePaint.estimatedTime.should.be.equals(180000)
        }).timeout(10000)
    })

    describe('#DronePaint object', () => {
        var tracer = new DroneTracer({
            wallId: 1, gpsLocation: [0,0], 
            wallSize: [0,0], canvasSize: [10000, 20000], canvasPosition: [0,0],
            minimumImageSize: [10,10]
        })

        it('Should not accept negative scaling factors', async ()=> {
            var dronePaint = await tracer.transform(imageFile)

            dronePaint.setPaintingScale(2)
            dronePaint.setPaintingScale(0.3)
            dronePaint.paintingScale.should.be.equals(2)
        }).timeout(10000)

        it('Should not accept out of bound parameters', async ()=> {
            var dronePaint = await tracer.transform(imageFile)

            dronePaint.setPaintingScale(200)
            dronePaint.paintingScale.should.be.equals(1)

            dronePaint.setPaintingPosition(10000,0)
            dronePaint.paintingPosition.should.be.eql([0,0])

            dronePaint.setPaintingPosition(1000,0)
            dronePaint.paintingPosition.should.be.eql([1000,0])
        }).timeout(10000)
    })
})
