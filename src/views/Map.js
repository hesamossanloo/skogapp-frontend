import React, { useEffect, useState } from 'react';
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
  ImageOverlay,
} from 'react-leaflet';
import { WMSGetFeatureInfo } from 'ol/format';
import { mapCoordinations } from 'variables/forest';
import { nibioGetFeatInfoBaseParams } from 'variables/forest';
import madsForestCLCClipCRS4326 from 'assets/data/QGIS/mads-forest-clc-clip-crs4326-right-hand-fixed.js';
import madsForestAR50CRS4326 from 'assets/data/QGIS/ar50-clip-RH-fixed.js';
import PNGImage from 'assets/data/QGIS/hogst-forest-4236.png';
import FeaturePopup from 'utilities/Map/FeaturePopup';
import { hideLayerControlLabel } from 'utilities/Map/utils';

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
    HogstklasserPNG: true,
    HogstklasserWMS: false,
    MadsForest: false,
    AR50: false,
    CLS: false,
  });

  const [activeFeature, setActiveFeature] = useState(null);
  const imageBounds = [
    [59.9283312840000022, 11.6844372829999994], // Bottom-left corner
    [59.9593366419999967, 11.7499393919999999], // Top-right corner
  ];

  useEffect(() => {
    // Wait for the next render cycle to ensure the layer control has been updated
    setTimeout(() => {
      hideLayerControlLabel('HogstklasserWMS');
    }, 0);
  }, []); // Empty dependency array means this effect runs once when the component mounts

  // 59.951966,11.706162
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
        if (
          activeOverlay['HogstklasserWMS'] ||
          activeOverlay['HogstklasserPNG']
        ) {
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
        if (
          activeOverlay['HogstklasserPNG'] ||
          activeOverlay['HogstklasserWMS']
        ) {
          // #root > div.wrapper > div.main-panel > div > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div.leaflet-control-layers.leaflet-control > section > div.leaflet-control-layers-overlays > label:nth-child(5)
          // document.querySelector("#root > div.wrapper > div.main-panel > div > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div.leaflet-control-layers.leaflet-control > section > div.leaflet-control-layers-overlays > label:nth-child(5)")

          // Wait for the next render cycle to ensure the layer control has been updated
          setTimeout(() => {
            hideLayerControlLabel('HogstklasserWMS');
          }, 0);

          setActiveOverlay((prevOverlay) => ({
            ...prevOverlay,
            HogstklasserPNG: true,
            HogstklasserWMS: true,
          }));
        }
        setActiveOverlay((prevOverlay) => ({
          ...prevOverlay,
          [e.name]: true,
        }));
      },
      overlayremove: async (e) => {
        if (
          activeOverlay['HogstklasserPNG'] ||
          activeOverlay['HogstklasserWMS'] ||
          activeOverlay['CLC'] ||
          activeOverlay['AR50']
        ) {
          map.closePopup();
          setActiveFeature(null);
        }
        if (
          activeOverlay['HogstklasserPNG'] ||
          activeOverlay['HogstklasserWMS']
        ) {
          // Wait for the next render cycle to ensure the layer control has been updated
          setTimeout(() => {
            hideLayerControlLabel('HogstklasserWMS');
          }, 0);
          setActiveOverlay((prevOverlay) => ({
            ...prevOverlay,
            HogstklasserPNG: false,
            HogstklasserWMS: false,
          }));
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
          {PNGImage && (
            <Overlay checked name="HogstklasserPNG">
              <ImageOverlay url={PNGImage} bounds={imageBounds} />
              {activeFeature && activeOverlay['HogstklasserWMS'] && (
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
          {madsForestAR50CRS4326 && (
            <Overlay name="AR50">
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
          <Overlay
            checked={activeOverlay['HogstklasserPNG']}
            name="HogstklasserWMS"
          >
            <WMSTileLayer
              url="https://wms.nibio.no/cgi-bin/skogbruksplan?"
              layers="hogstklasser"
              format="image/png"
              transparent={true}
              version="1.3.0"
              opacity={0}
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
