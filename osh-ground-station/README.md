### Build

run `./gradlew build` in the parent folder


### Install

  * Copy the .zip file created in the `build/distributions` folder during the build process
  * Unzip the file on the GCS computer
  * Run OSH using the `./launch.sh` script
  * Make sure it is working properly by connecting to <http://localhost:8181/sensorhub/admin>  
  
  
### Run and Connect to the UAV

_Note: The following instructions assume you have properly setup your Solo and optionally updated the firmware to get gimbal data._ 

  1. Connect the GCS computer to the Internet (if you're on the field, use a mobile phone connected to USB to get Internet via 4G/LTE)
  1. Connect the GCS computer to the SoloLink WiFi network using the password you set in the Solo App
  1. Launch OSH on GCS using the `./launch.sh` script
  1. Start the 'Solo Telemetry' driver by right clicking it and selecting 'Start' in the context menu
  1. Check that data is received by selecting the driver and clicking the 'Refresh' button next to 'Outputs' in the right panel
     (data should update every second)
  
