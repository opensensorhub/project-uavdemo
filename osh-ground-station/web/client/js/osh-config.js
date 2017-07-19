function init() {
    
    var hostName = "localhost:8181";

    // time settings
    // for real-time
    var startTime = "now";
    var endTime = "2080-01-01T00:00:00Z";
    var sync = false;
    
    // for replay
    /*var startTime = "2017-03-09T16:10:40Z";
    var endTime = "2017-03-09T16:15:10.529Z";
    var sync = true;*/

    var replaySpeed = "1";
    var bufferingTime = 300;
    var dataStreamTimeOut = 4000;
    var useFFmpegWorkers = true;
        
    // MSL to ellipsoid correction
    //var mslToWgs84 = 53.5; // Toulouse
    //var mslToWgs84 = -29.5+5; // Huntsville Airport Road
    //var mslToWgs84 = -29-4; // Madison
    var mslToWgs84 = -23;//-17.374; // Colorado Springs
    var soloHeadingAdjust = 0.0;
    var soloAltitudeAdjust = 0.0; 
    
    // menu ids
    var treeMenuId = "tree-menu-";
    var mapMenuId = "map-menu-";
    var menuGroupId = "allmenus";
    
    
    // ---------------------------------------------------------------//
    // ------------------- Data Sources Controller -------------------//
    // ---------------------------------------------------------------//

    var dataSourceController = new OSH.DataReceiver.DataReceiverController({
        replayFactor: 1.0
    });
    
    
    //--------------------------------------------------------------//
    //------------------------  Map View(s)  -----------------------//
    //--------------------------------------------------------------//
        
    var cesiumView = new OSH.UI.CesiumView("main-container", []);
    
    
    // --------------------------------------------------------------//
    // ------------------------- Entities ---------------------------//
    // --------------------------------------------------------------//
    
    var treeItems = [];
    addSoloUav("solo1", "3DR Solo", "urn:osh:solo-nav", "urn:osh:solo-video");
    addAndroidPhone("android1", "Alex - Nexus5", "urn:android:device:a0e0eac2fea3f614-sos", null, 0.0);
    //addArduino(...)
    

    // --------------------------------------------------------------//
    // ------------------------ Tree View ---------------------------//
    // --------------------------------------------------------------//
    
    var entityTreeDialog = new OSH.UI.DialogView(document.body.id, {
        css: "tree-dialog",
        name: "Entities",
        show: true,
        draggable: true,
        dockable: false,
        closeable: true
    });
    
    var entityTreeView = new OSH.UI.EntityTreeView(entityTreeDialog.popContentDiv.id,
        treeItems,
        { css: "tree-container" }
    );
    
    // time slider view
    if (startTime !== "now") {
        var rangeSlider = new OSH.UI.RangeSlider("rangeSlider",{
            startTime: startTime,
            endTime: endTime
        });
    }    

    // start streams and display
    dataSourceController.connectAll();


    //--------------------------------------------------------------//
    //------ Helper methods to add specific types of sensors -------//
    //--------------------------------------------------------------//
    
    function addSoloUav(entityID, entityName, navOfferingID, videoOfferingID) {
        
        // create data sources
        var videoData = new OSH.DataReceiver.VideoH264("Video", {
            protocol : "ws",
            service: "SOS",
            endpointUrl: hostName + "/sensorhub/sos",
            offeringID: videoOfferingID,
            observedProperty: "http://sensorml.com/ont/swe/property/VideoFrame",
            startTime: startTime,
            endTime: endTime,
            replaySpeed: "1",
            syncMasterTime: sync,
            bufferingTime: bufferingTime,
            timeOut: dataStreamTimeOut
        });
        
        var locationData = new OSH.DataReceiver.LatLonAlt("Location", {
            protocol : "ws",
            service: "SOS",
            endpointUrl: hostName + "/sensorhub/sos",
            offeringID: navOfferingID,
            observedProperty: "http://www.opengis.net/def/property/OGC/0/PlatformLocation",
            startTime: startTime,
            endTime: endTime,
            replaySpeed: "1",
            syncMasterTime: sync,
            bufferingTime: bufferingTime,
            timeOut: dataStreamTimeOut
        });
        
        var attitudeData = new OSH.DataReceiver.EulerOrientation("Orientation", {
            protocol : "ws",
            service: "SOS",
            endpointUrl: hostName + "/sensorhub/sos",
            offeringID: navOfferingID,
            observedProperty: "http://www.opengis.net/def/property/OGC/0/PlatformOrientation",
            startTime: startTime,
            endTime: endTime,
            replaySpeed: "1",
            syncMasterTime: sync,
            bufferingTime: bufferingTime,
            timeOut: dataStreamTimeOut
        });
        
        var gimbalData = new OSH.DataReceiver.EulerOrientation("Orientation", {
            protocol : "ws",
            service: "SOS",
            endpointUrl: hostName + "/sensorhub/sos",
            offeringID: navOfferingID,
            observedProperty: "http://sensorml.com/ont/swe/property/OSH/0/GimbalOrientation",
            startTime: startTime,
            endTime: endTime,
            replaySpeed: "1",
            syncMasterTime: sync,
            bufferingTime: bufferingTime,
            timeOut: dataStreamTimeOut
        });
        
        // create entity
        var entity = {
            id: entityID,
            name: entityName,
            dataSources: [videoData, locationData, attitudeData, gimbalData]
        };
        dataSourceController.addEntity(entity);
        
        // add item to tree
        treeItems.push({
            entity : entity,
            path: "UAVs",
            treeIcon : "images/drone.png",
            contextMenuId: treeMenuId + entityID
        });
        
        // video view
        var videoDialog = new OSH.UI.DialogView("dialog-main-container", {
            draggable: false,
            css: "video-dialog",
            name: entityName,
            show: true,
            dockable: true,
            closeable: true,
            canDisconnect : true,
            swapId: "main-container",
            connectionIds: [videoData.getId()]
        });
        
        var videoView = new OSH.UI.FFMPEGView(videoDialog.popContentDiv.id, {
            dataSourceId: videoData.getId(),
            entityId : entity.id,
            css: "video",
            cssSelected: "video-selected",
            useWorker: useFFmpegWorkers,
            width: 1280,
            height: 720
        });
        /*var videoView = new OSH.UI.H264View(soloVideoDialog.popContentDiv.id, {
            dataSourceId: videoData.getId(),
            entityId : entity.id,
            css: "video",
            cssSelected: "video-selected",
            width: 1280,
            height: 720
        });*/
        
        // add 3D model marker to Cesium view
        var pointMarker = new OSH.UI.Styler.PointMarker({
            label: "3DR Solo",
            locationFunc : {
                dataSourceIds : [locationData.getId()],
                handler : function(rec) {
                    return {
                        x : rec.lon,
                        y : rec.lat,
                        z : rec.alt+mslToWgs84-5. // model offset
                    };
                }
            },
            orientationFunc : {
                dataSourceIds : [attitudeData.getId()],
                handler : function(rec) {
                    return {
                        heading : rec.heading
                    };
                }
            },
            icon: "./models/Drone+06B.glb"
        });
        
        cesiumView.addViewItem({
            name: "3DR Solo",
            entityId: entityID,
            styler:  pointMarker,
            contextMenuId: mapMenuId+entityID
        });        
        
        // add draped imagery to Cesium view
        var videoCanvas = document.getElementById(videoView.getId()).getElementsByTagName("canvas")[0];
        cesiumView.addViewItem({
            name: "Geolocated Imagery",
            entityId: entityID,
            styler:  new OSH.UI.Styler.ImageDraping({
                platformLocationFunc: {
                    dataSourceIds: [locationData.getId()],
                    handler: function(rec) {
                        return {
                            x: rec.lon,
                            y: rec.lat,
                            z: rec.alt + mslToWgs84 + soloAltitudeAdjust
                        };
                    }
                },
                platformOrientationFunc: {
                    dataSourceIds: [attitudeData.getId()],
                    handler: function(rec) {
                        return {
                            heading: rec.heading + soloHeadingAdjust,
                            pitch: 0,// rec.pitch,
                            roll: 0,// rec.roll
                        };
                    }
                },
                gimbalOrientation: {
                    heading: 0,
                    pitch: -90,
                    roll: 0
                },
                gimbalOrientationFunc: {
                    dataSourceIds: [gimbalData.getId()],
                    handler: function(rec) {
                        return {
                            heading: rec.heading,
                            pitch: rec.pitch, //-90,
                            roll: 0,// rec.roll
                        };
                    }
                },
                snapshotFunc: function() {
                    var enabled = takePicture;
                    takePicture = false; return enabled;
                },                
                /* GoPro Alex */
                /*
                 * cameraModel: { camProj: new Cesium.Matrix3(435.48/752., 0.0,
                 * 370.20/752., 0.0, 436.62/423., 216.52/423., 0.0, 0.0, 1.0),
                 * camDistR: new Cesium.Cartesian3(-2.60e-01, 8.02e-02, 0.0),
                 * camDistT: new Cesium.Cartesian2(-2.42e-04, 2.61e-04) },
                 */
                /* GoPro Mike */
                cameraModel: {
                    camProj: new Cesium.Matrix3(747.963/1280.,     0.0,       650.66/1280.,
                                                   0.0,        769.576/738.,  373.206/738.,
                                                   0.0,            0.0,          1.0),
                    camDistR: new Cesium.Cartesian3(-2.644e-01, 8.4e-02, 0.0),
                    camDistT: new Cesium.Cartesian2(-8.688e-04, 6.123e-04)
                },
                imageSrc: videoCanvas
            })
        });
        
        // altitude chart view        
        var altChartDialog = new OSH.UI.DialogView("dialog-main-container", {
            draggable: false,
            css: "video-dialog",
            name: entityName + " - Altitude",
            show: true,
            dockable: true,
            closeable: true,
            canDisconnect : true,
            swapId: "main-container",
            connectionIds: [locationData.getId()]
        });
        
        var altChartView = new OSH.UI.Nvd3CurveChartView(altChartDialog.popContentDiv.id,
        [{
            styler: new OSH.UI.Styler.Curve({
                valuesFunc: {
                    dataSourceIds: [locationData.getId()],
                    handler: function (rec, timeStamp) {
                        return {
                            x: timeStamp,
                            y: rec.alt+mslToWgs84
                        };
                    }
                }
            })
        }],
        {
            dataSourceId: locationData.getId(),
            yLabel: 'Altitude (m)',
            xLabel: 'Time',
            maxPoints: 200,
            css:"chart-view",
            cssSelected: "video-selected"
        });
        
        // add tree and map context menus        
        var treeMenuItems = [{
            name: "Show Video",
            viewId: videoDialog.getId(),
            css: "fa fa-video-camera",
            action: "show"
        },{
            name: "Show Altitude",
            viewId: altChartDialog.getId(),
            css: "fa fa-bar-chart",
            action: "show"
        }];
        
        var mapView = cesiumView;
        var mapMenuItems = [{
            name: "Go Here",
            viewId: mapView.getId(),
            css: "fa fa-crosshairs fa-3x",
            action: "uav:goto"
        },{
            name: "Orbit Here",
            viewId: mapView.getId(),
            css: "fa fa-undo fa-3x",
            action: "uav:orbit"
        },{
            name: "Look Here",
            viewId: mapView.getId(),
            css: "fa fa-eye fa-3x",
            action: "uav:lookat"
        },{
            name: "Land Here",
            viewId: mapView.getId(),
            css: "fa fa-download fa-3x",
            action: "uav:land"
        }];
    
        var treeMenu = new OSH.UI.ContextMenu.StackMenu({id: treeMenuId+entityID, groupId: menuGroupId, items: treeMenuItems});   
        var mapMenu = new OSH.UI.ContextMenu.CircularMenu({id:mapMenuId+entityID, groupId: menuGroupId, items: mapMenuItems});
        
        return entity;
    }
    
    
    function addAndroidPhone(entityID, entityName, offeringID, flirOfferingID, headingOffset) {
        
        // create data sources
        var videoData = new OSH.DataReceiver.VideoH264("Video", {
            protocol : "ws",
            service: "SOS",
            endpointUrl: hostName + "/sensorhub/sos",
            offeringID: offeringID,
            observedProperty: "http://sensorml.com/ont/swe/property/VideoFrame",
            startTime: startTime,
            endTime: endTime,
            replaySpeed: "1",
            syncMasterTime: sync,
            bufferingTime: bufferingTime,
            timeOut: dataStreamTimeOut
        });
        
        var locationData = new OSH.DataReceiver.LatLonAlt("Location", {
            protocol : "ws",
            service: "SOS",
            endpointUrl: hostName + "/sensorhub/sos",
            offeringID: offeringID,
            observedProperty: "http://sensorml.com/ont/swe/property/Location",
            startTime: startTime,
            endTime: endTime,
            replaySpeed: "1",
            syncMasterTime: sync,
            bufferingTime: bufferingTime,
            timeOut: dataStreamTimeOut
        });
    
        var attitudeData = new OSH.DataReceiver.OrientationQuaternion("Orientation", {
            protocol : "ws",
            service: "SOS",
            endpointUrl: hostName + "/sensorhub/sos",
            offeringID: offeringID,
            observedProperty: "http://sensorml.com/ont/swe/property/OrientationQuaternion",
            startTime: startTime,
            endTime: endTime,
            replaySpeed: "1",
            syncMasterTime: sync,
            bufferingTime: bufferingTime,
            timeOut: dataStreamTimeOut
        });
        
        var flirVideo = null;
        if (typeof(flirOfferingID) != "undefined" && flirOfferingID != null) {
            flirVideo = new OSH.DataReceiver.VideoMjpeg("FLIR Video", {
                protocol : "ws",
                service: "SOS",
                endpointUrl: hostName + "/sensorhub/sos",
                offeringID: flirOfferingID,
                observedProperty: "http://sensorml.com/ont/swe/property/VideoFrame",
                startTime: startTime,
                endTime: endTime,
                replaySpeed: "1",
                syncMasterTime: sync,
                bufferingTime: bufferingTime,
                timeOut: dataStreamTimeOut
            });
        }
        
        // create entity
        var entity = {
            id: entityID,
            name: entityName,
            dataSources: [videoData, locationData, attitudeData]
        };
        
        if (flirVideo != null)
            entity.dataSources.push(flirVideo);
        
        dataSourceController.addEntity(entity);
        
        // add item to tree
        treeItems.push({
            entity : entity,
            path: "Body Cams",
            treeIcon : "images/cameralook.png",
            contextMenuId: treeMenuId + entity.id
        })
        
        // add marker to map
        cesiumView.addViewItem({
            name: entityName,
            entityId : entity.id,
            styler : new OSH.UI.Styler.PointMarker({
                locationFunc : {
                    dataSourceIds : [locationData.getId()],
                    handler : function(rec) {
                        return {
                            x : rec.lon,
                            y : rec.lat,
                            z : rec.alt
                        };
                    }
                },
                orientationFunc : {
                    dataSourceIds : [attitudeData.getId()],
                    handler : function(rec) {
                        return {
                            heading : rec.heading + headingOffset
                        };
                    }
                },
                icon : 'images/cameralook.png',
                iconFunc : {
                    dataSourceIds: [locationData.getId()],
                    handler : function(rec,timeStamp,options) {
                        if(options.selected) {
                            return 'images/cameralook-selected.png'
                        } else {
                            return 'images/cameralook.png';
                        }
                    }
                }
            }),
            contextMenuId: mapMenuId+entityID                     
        });
        
        // video view
        var videoDialog = new OSH.UI.DialogView("dialog-main-container", {
            draggable: false,
            css: "video-dialog-43",
            name: entityName,
            show: false,
            dockable: true,
            closeable: true,
            canDisconnect : true,
            swapId: "main-container",
            connectionIds: [videoData.getId()]
        });
        
        var videoView = new OSH.UI.FFMPEGView(videoDialog.popContentDiv.id, {
            dataSourceId: videoData.getId(),
            entityId : entity.id,
            css: "video",
            cssSelected: "video-selected",
            useWorker: useFFmpegWorkers,
            width: 800,
            height: 600
        });
        
        var flirVideoDialog = null;
        if (flirVideo != null) {
            flirVideoDialog = new OSH.UI.DialogView("dialog-main-container", {
                draggable: false,
                css: "video-dialog",
                name: entityName + " - FLIR Cam",
                show: false,
                dockable: true,
                closeable: true,
                canDisconnect : true,
                swapId: "main-container",
                connectionIds: [flirVideo.getId()]
            });
            
            var flirVideoView = new OSH.UI.MjpegView(flirVideoDialog.popContentDiv.id, {
                dataSourceId: flirVideo.getId(),
                entityId : entity.id,
                css: "video",
                cssSelected: "video-selected",
                rotation: -90
            });
        }
        
        // add tree and map context menus
        var menuItems = [];
        menuItems.push({
            name: "Show Video",
            viewId: videoDialog.getId(),
            css: "fa fa-video-camera",
            action: "show"
        });
        
        if (flirVideoDialog != null) {
            menuItems.push({
                name: "Show FLIR Video",
                viewId: flirVideoDialog.getId(),
                css: "fa fa-video-camera",
                action: "show"
            });
        }
    
        var markerMenu = new OSH.UI.ContextMenu.CircularMenu({id:mapMenuId+entityID, groupId: menuGroupId, items: menuItems});
        var treeMenu = new OSH.UI.ContextMenu.StackMenu({id: treeMenuId+entityID, groupId: menuGroupId, items: menuItems});
        
        return entity;
    }


    function addAdjusmentSliders() {
        
        var headingAdj = document.getElementById("headingAdj");
        var headingAdjVal = document.getElementById("headingAdjVal");
        headingAdj.min = -200;
        headingAdj.max = 200;
        headingAdj.value = 0;
        headingAdj.oninput = function() {
            soloHeadingAdjust = headingAdj.value/10.0;
            headingAdjVal.innerHTML = " "+soloHeadingAdjust+"°";
        };

        var altitudeAdj = document.getElementById("altitudeAdj");
        var altitudeAdjVal = document.getElementById("altitudeAdjVal");
        altitudeAdj.min = -250;
        altitudeAdj.max = 250;
        altitudeAdj.value = 0;
        altitudeAdj.oninput = function() {
            soloAltitudeAdjust = altitudeAdj.value/10.0;
            altitudeAdjVal.innerHTML = " "+soloAltitudeAdjust+"m";
        };
    }

} // end init()



var takePicture = false;
function snapshotClick () {
    takePicture=true;
}
