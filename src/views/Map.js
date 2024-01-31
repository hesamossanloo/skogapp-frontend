import React, { useState } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  LayersControl,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  WMSTileLayer,
  GeoJSON,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import { WMSGetFeatureInfo } from 'ol/format';
import { mapCoordinations } from 'variables/forest';
import { nibioGetFeatInfoBaseParams } from 'variables/forest';
import madsForestCLCClipCRS4326 from 'assets/data/QGIS/mads-forest-clc-clip-crs4326-right-hand-fixed.js';
import madsForestAR50CRS4326 from 'assets/data/QGIS/ar50-clip-RH-fixed.js';
import FeaturePopup from 'utilities/Map/FeaturePopup';

const { BaseLayer, Overlay } = LayersControl;
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function Map() {
  const [activeOverlay, setActiveOverlay] = useState({
    Matrikkel: false,
    Hogstklasser: false,
    MadsForest: false,
    AR50: true,
    CLS: false,
  });

  const [activeFeature, setActiveFeature] = useState(null);

  let activeGeoJSONLayer = null;
  const onEachFeature = (feature, geoJSONLayer) => {
    geoJSONLayer.on({
      click: () => {
        setActiveFeature(feature);
        // Highlight the selected polygon
        if (activeGeoJSONLayer) {
          activeGeoJSONLayer.setStyle({ fillColor: 'blue', fillOpacity: 0 }); // Reset style of previous active layer
        }
        geoJSONLayer.setStyle({ fillColor: 'red', fillOpacity: 0.5 }); // Set style of current active layer
        activeGeoJSONLayer = geoJSONLayer; // Update active layer
      },
    });
  };

  // Define a new component
  const MapEvents = () => {
    const map = useMap();

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
        map.closePopup();
        if (activeOverlay['Hogstklasser']) {
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
          handleSkogbrukWMSFeatures(e, features, map);
        }
      },
      overlayadd: async (e) => {
        setActiveOverlay((prevOverlay) => ({
          ...prevOverlay,
          [e.name]: true,
        }));
      },
      overlayremove: async (e) => {
        if (
          activeOverlay['Hogstklasser'] ||
          activeOverlay['CLC'] ||
          activeOverlay['AR50']
        ) {
          map.closePopup();
          setActiveFeature(null);
        }
        setActiveOverlay((prevOverlay) => ({
          ...prevOverlay,
          [e.name]: false,
        }));
      },
    });

    return null;
  };

  const handleSkogbrukWMSFeatures = (e, features, map) => {
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
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '100vw',
        }}
      >
        <MapEvents />
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
          {madsForestAR50CRS4326 && (
            <Overlay checked name="AR50">
              <GeoJSON
                data={madsForestAR50CRS4326}
                onEachFeature={onEachFeature}
              />
              {activeFeature && activeOverlay['AR50'] && (
                <FeaturePopup
                  activeFeature={{
                    lng: activeFeature.geometry.coordinates[0][0][0][1],
                    lat: activeFeature.geometry.coordinates[0][0][0][0],
                    properties: activeFeature.properties,
                  }}
                  setActiveFeature={setActiveFeature}
                />
              )}
            </Overlay>
          )}
          {madsForestCLCClipCRS4326 && (
            <Overlay name="CLC">
              <GeoJSON
                data={madsForestCLCClipCRS4326}
                onEachFeature={onEachFeature}
              />
              {activeFeature && activeOverlay['CLC'] && (
                <FeaturePopup
                  activeFeature={{
                    lng: activeFeature.geometry.coordinates[0][0][0][1],
                    lat: activeFeature.geometry.coordinates[0][0][0][0],
                    properties: activeFeature.properties,
                  }}
                  setActiveFeature={setActiveFeature}
                />
              )}
            </Overlay>
          )}
          <Overlay name="Matrikkel">
            <WMSTileLayer
              url="https://openwms.statkart.no/skwms1/wms.matrikkelkart"
              layers="matrikkelkart"
              format="image/png"
              transparent={true}
              crossOrigin={true}
              version="1.3.0"
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
