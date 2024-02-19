import madsForestAR50CRS4326 from 'assets/data/QGIS/ar50-clip-RH-fixed.js';
import PNGImage from 'assets/data/QGIS/hogst-forest-3857.png';
import madsForestCLCClipCRS4326 from 'assets/data/QGIS/mads-forest-clc-clip-crs4326-right-hand-fixed.js';
import madsForestSievePolySimplified from 'assets/data/QGIS/mads-forest-sieve-poly-simplified.js';
import madsTeig from 'assets/data/QGIS/mads-teig-polygon-RH-fixed.js';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import {
  GeoJSON,
  ImageOverlay,
  LayersControl,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  WMSTileLayer,
  ZoomControl,
} from 'react-leaflet';
import CustomMapEvents from 'utilities/Map/CustomMapEvents';
import FeaturePopup from 'utilities/Map/FeaturePopup';
import { hideLayerControlLabel } from 'utilities/Map/utililtyFunctions';
import {
  HIDE_POLYGON_ZOOM_LEVEL,
  MAP_DEFAULT_ZOOM_LEVEL,
  mapCoordinations,
} from 'variables/forest';

const { BaseLayer, Overlay } = LayersControl;
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

/* eslint-disable react/react-in-jsx-scope */
function Map() {
  const [activeOverlay, setActiveOverlay] = useState({
    Matrikkel: false,
    Hogstklasser: true,
    HogstklasserWMS: true,
    Polygons: true,
    MadsForest: false,
    AR50: false,
    CLS: false,
  });

  const [activeFeature, setActiveFeature] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(MAP_DEFAULT_ZOOM_LEVEL);
  const imageBounds = [
    [59.9283312840000022, 11.6844372829999994], // Bottom-left corner
    [59.9593366419999967, 11.7499393919999999], // Top-right corner
  ];

  useEffect(() => {
    // Wait for the next render cycle to ensure the layer control has been updated
    setTimeout(() => {
      hideLayerControlLabel('HogstklasserWMS');
      hideLayerControlLabel('Polygons');
    }, 0);
  }, [zoomLevel]); // Empty dependency array means this effect runs once when the component mounts

  // 59.951966,11.706162
  let activeGeoJSONLayer = null;
  const onEachFeature = (feature, geoJSONLayer) => {
    geoJSONLayer.setStyle({
      fillColor: 'transparent',
      fillOpacity: 0,
    }); // Set default transparent style for the GeoJSON layer

    geoJSONLayer.on({
      click: () => {
        if (feature.properties.DN !== 99) {
          setActiveFeature(feature);
          // Highlight the selected polygon
          if (activeGeoJSONLayer) {
            activeGeoJSONLayer.setStyle({
              fillColor: 'transparent',
              fillOpacity: 0,
            }); // Reset style of previous active layer
          }
          geoJSONLayer.setStyle({
            fillColor: 'rgb(255, 255, 0)',
            fillOpacity: 1,
          }); // Set style of current active layer to neon yellow
          activeGeoJSONLayer = geoJSONLayer; // Update active layer
        }
      },
    });
  };
  return (
    <>
      <MapContainer
        id="SkogAppMapContainer"
        zoomControl={false}
        center={mapCoordinations.centerPosition}
        zoom={zoomLevel}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '100vw',
        }}
      >
        <CustomMapEvents
          activeOverlay={activeOverlay}
          setActiveOverlay={setActiveOverlay}
          setActiveFeature={setActiveFeature}
          hideLayerControlLabel={hideLayerControlLabel}
          desiredGeoJSON={madsTeig}
          setZoomLevel={setZoomLevel}
          zoomLevel={zoomLevel}
        />
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
            <Overlay
              checked={
                zoomLevel > HIDE_POLYGON_ZOOM_LEVEL &&
                activeOverlay['Hogstklasser']
              }
              name="Hogstklasser"
            >
              <ImageOverlay url={PNGImage} bounds={imageBounds} opacity={1} />
              {activeFeature &&
                activeOverlay['HogstklasserWMS'] &&
                activeOverlay['Polygons'] && (
                  <FeaturePopup
                    activeOverlay={activeOverlay}
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
          <Overlay
            checked={
              zoomLevel > HIDE_POLYGON_ZOOM_LEVEL &&
              activeOverlay['Hogstklasser']
            }
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
          {madsForestSievePolySimplified && (
            <Overlay
              name="Polygons"
              checked={
                zoomLevel > HIDE_POLYGON_ZOOM_LEVEL &&
                activeOverlay['Hogstklasser']
              }
            >
              <GeoJSON
                data={madsForestSievePolySimplified}
                onEachFeature={onEachFeature}
                style={{ stroke: false }}
              />
            </Overlay>
          )}
          {madsForestAR50CRS4326 && (
            <Overlay
              name="AR50"
              checked={
                zoomLevel > HIDE_POLYGON_ZOOM_LEVEL && activeOverlay['AR50']
              }
            >
              <GeoJSON
                data={madsForestAR50CRS4326}
                onEachFeature={onEachFeature}
              />
              {activeFeature && activeOverlay['AR50'] && (
                <FeaturePopup
                  activeOverlay={activeOverlay}
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
            <Overlay
              name="CLC"
              checked={
                zoomLevel > HIDE_POLYGON_ZOOM_LEVEL && activeOverlay['CLC']
              }
            >
              <GeoJSON
                data={madsForestCLCClipCRS4326}
                onEachFeature={onEachFeature}
              />
              {activeFeature && activeOverlay['CLC'] && (
                <FeaturePopup
                  activeOverlay={activeOverlay}
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
          <Overlay
            name="Matrikkel"
            checked={
              zoomLevel > HIDE_POLYGON_ZOOM_LEVEL && activeOverlay['Matrikkel']
            }
          >
            <WMSTileLayer
              url="https://openwms.statkart.no/skwms1/wms.matrikkelkart"
              layers="matrikkelkart"
              format="image/png"
              transparent={true}
              crossOrigin={true}
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
