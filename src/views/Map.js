import React, { useState } from 'react';
import L from 'leaflet';
import 'leaflet-wms-header';
import {
  MapContainer,
  LayersControl,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  WMSTileLayer,
} from 'react-leaflet';
import { useMapEvents, useMap } from 'react-leaflet';
import { WMSGetFeatureInfo } from 'ol/format';
import { colorMap } from 'variables/forest';
import { mapCoordinations } from 'variables/forest';
import { nibioGetFeatInfoBaseParams } from 'variables/forest';

const { BaseLayer, Overlay } = LayersControl;
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function Map() {
  const [activeOverlay, setActiveOverlay] = useState({
    Matrikkel: true,
    Hogstklasser: false,
    MadsForest: false,
  });

  // Define a new component
  const MapEvents = () => {
    const map = useMap();

    map.on('overlayadd', function (e) {
      setActiveOverlay((prevOverlay) => ({
        ...prevOverlay,
        [e.name]: true,
      }));
    });

    map.on('overlayremove', function (e) {
      if (activeOverlay['Hogstklasser']) {
        map.closePopup();
      }
      setActiveOverlay((prevOverlay) => ({
        ...prevOverlay,
        [e.name]: false,
      }));
    });

    map.on('click', function () {
      map.closePopup();
    });
    const CRS = map.options.crs.code;
    // We need to make sure that the BBOX is in the EPSG:3857 format
    // For that we must to do following
    const size = map.getSize();
    const bounds = map.getBounds();
    const southWest = map.options.crs.project(bounds.getSouthWest());
    const northEast = map.options.crs.project(bounds.getNorthEast());
    const BBOX = [southWest.x, southWest.y, northEast.x, northEast.y].join(',');

    useMapEvents({
      click: async (e) => {
        const params = {
          ...nibioGetFeatInfoBaseParams,
          BBOX,
          CRS,
          WIDTH: size.x,
          HEIGHT: size.y,
          I: Math.round(e.containerPoint.x),
          J: Math.round(e.containerPoint.y),
        };
        const url = `https://wms.nibio.no/cgi-bin/skogbruksplan?language=nor&${new URLSearchParams(params).toString()}`;
        const response = await fetch(url);
        const data = await response.text();
        const format = new WMSGetFeatureInfo();
        const features = format.readFeatures(data);
        handleWMSFeatures(e, features, map);
      },
    });

    return null;
  };

  const handleWMSFeatures = (e, features, map) => {
    if (features.length > 0 && features[0]) {
      const feature = features[0];
      const values = feature.values_;

      let content = '<table>';
      for (const key in values) {
        if (key !== 'boundedBy') {
          content += `<tr><td>${key}</td><td>${values[key]}</td></tr>`;
        }
      }
      content += '</table>';

      L.popup().setLatLng(e.latlng).setContent(content).openOn(map);
    }
  };
  return (
    <>
      <MapContainer
        zoomControl={false}
        center={mapCoordinations.centerPosition}
        zoom={13}
        crs={L.CRS.EPSG3857}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '100vw',
        }}
      >
        {activeOverlay && <MapEvents />}
        <ZoomControl position="bottomright" />
        <LayersControl position="bottomright">
          <BaseLayer checked name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </BaseLayer>
          <BaseLayer name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a> contributors'
            />
          </BaseLayer>
          <Overlay checked name="Matrikkel">
            <WMSTileLayer
              url="https://prodtest.matrikkel.no/geoservergeo/wms?"
              layers="matrikkel:TEIGWFS"
              format="image/png"
              transparent={true}
              version="1.1.1"
              username={process.env.REACT_APP_MATRIKKEL_UN_PRODTEST}
              password={process.env.REACT_APP_MATRIKKEL_PSW_PRODTEST}
            />
          </Overlay>
          <Overlay name="Hogstklasser">
            <WMSTileLayer
              url="https://wms.nibio.no/cgi-bin/skogbruksplan?"
              layers="hogstklasser"
              format="image/png"
              transparent={true}
              version="1.3.0"
            />
          </Overlay>
        </LayersControl>
        <Marker position={mapCoordinations.homePosition}>
          <Popup>Mads was born in this House!</Popup>
        </Marker>
      </MapContainer>
    </>
  );
}

export default Map;
