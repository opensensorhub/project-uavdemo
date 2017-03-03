# UAV Demo

This project is a demonstration of OSH capabilities for tasking a UAV platform and collecting/processing UAV data including navigation and imagery. It also shows how the drone data can be effectively combined with other sources of data such as:

- Other video camera (with or without PTZ tasking)
- Mobile phone sensors


This demonstration uses several components:

- The [osh-ground-station](./osh-ground-station) node, running on a field computer with Internet connectivity (usually through LTE) and acting as a relay between the UAV and other locally connected field sensors, and a larger OSH server running in the cloud

- The [osh-android-app](./osh-android-app) node, running on an Android phone or tablet to collect data from the device's sensors and send it to the cloud server directly. No specific app was developped for this demo and we just use OSH Demo Android App that's available [here](https://github.com/opensensorhub/osh-android).

- The [osh-cloud-server](./osh-cloud-server) node, designed to receive all incoming sensor data streams and store it in a database for later retrieval. It also runs a web mapping application that can be used to monitor data collected by all the sensors on the field.


The following diagram illustrates the demo setup:

