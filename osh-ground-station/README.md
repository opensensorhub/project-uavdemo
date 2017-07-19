### Build

  * See OSH [Developer's Guide](http://docs.opensensorhub.org/dev/dev-guide/#building-from-source) to clone the needed 'osh-core', 'osh-comm', 'osh-sensors' and 'osh-video' repositories
  * Run `./gradlew build` in the 'project-uavdemo' folder


### Install and Run

  * Copy the .zip file created in the `build/distributions` folder during the build process
  * Unzip it on the computer you want to use as GCS
  * Run OSH using the `./launch.sh` script
  * Make sure it is working properly by connecting to <http://localhost:8181/sensorhub/admin>. You should see:
      * Two sensors 'Solo Telemetry' and 'Solo Video Cam' in the _LOADED_ state
      * Two corresponding storages in the 'STARTING' state
      * The SOS Service should be in the 'STARTED' state
  
  
### Connect to the Solo UAV

_Note: The following instructions assume you have properly setup your Solo with a GoPro mounted on the gimbal and optionally updated the firmware to get gimbal data._ 

  1. Connect the GCS computer to the Internet (if you're on the field, use a mobile phone connected to USB to get Internet via 4G/LTE)
  1. Connect the GCS computer to the SoloLink WiFi network using the password you set in the Solo App
  1. Launch OSH on GCS using the `./launch.sh` script
  1. Open the [Web Admin](http://docs.opensensorhub.org/user/web-admin/) at <http://localhost:8181/sensorhub/admin>  
  1. Start the _Solo Telemetry_ sensor adapter by right clicking it in the _Sensors_ section and selecting _Start_ in the context menu
  1. Check that data is received by selecting _Solo Telemetry_ in the list (you need to click again so the information on the right panel refreshes) and clicking the _Refresh_ button next to _Outputs_ in the right panel (data should update every second)
  1. Repeat the previous two steps with the _Solo Video Cam_ sensor adapter
  
  
### View the data

You can start the client in a browser right away:

  1. Wait for Solo to get a GPS lock
  1. Start the web client by connecting to <http://localhost:8181/client/index.html>
     You should see the video data coming from the Solo GoPro as well as the altitude chart
     
To get correct geolocation of the video on the 3D map, you have to customize a few more things in the Javascript code:

  1. Open the `osh-config.js` file located in the `web/client/js` folder (part of the package you unzipped during install)
  1. Adjust the MSL to WGS84 offset on line 19
  1. Input the correct camera matrix and distortion coefficients on line 276
  1. Restart the client
  
  
### Updating the Solo's firmware

In order to get precise gimbal angles from the Solo, you'll have to update the on-board firmware (ardupilot) with our own version. You can download this version [here](https://drive.google.com/file/d/0B3EZQJqOfG9sbUNNMEgzN0VaZzA/view?usp=sharing).

Follow the steps indicated in this [3DR Solo Guide](http://ardupilot.org/dev/docs/solo.html) to upload this firmware to the Solo






  
