import madsForestAR50CRS4326 from 'assets/data/QGIS/ar50-clip-RH-fixed.js';
import bjoernForestPNGImage from 'assets/data/QGIS/bjoern-forest.png';
import bjoernForest from 'assets/data/QGIS/bjoern-polygons.js';
import bjoernTeig from 'assets/data/QGIS/bjoern-teig.js';
import madsForestCLCClipCRS4326 from 'assets/data/QGIS/mads-forest-clc-clip-crs4326-right-hand-fixed.js';
import madsForestSievePolySimplified from 'assets/data/QGIS/mads-forest-sieve-poly-simplified.js';
import madsForestPNGImage from 'assets/data/QGIS/mads-hogst-forest-3857.png';
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
  useMap,
} from 'react-leaflet';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'reactstrap';
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
    Forests: true,
    MadsForest: false,
    AR50: false,
    CLS: false,
  });

  const forest1 = mapCoordinations.madsForestPosition;
  const forest2 = mapCoordinations.bjoernForestPosition;

  const [clickedOnLine, setClickedOnLine] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(MAP_DEFAULT_ZOOM_LEVEL);
  const [selectedForest, setSelectedForest] = useState(forest1); // Default to forest 1
  const [selectedForestFirstTime, setSelectedForestFirstTime] = useState(false); // Default to forest 1
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const madsForestImageBounds = [
    [59.9283312840000022, 11.6844372829999994], // Bottom-left corner
    [59.9593366419999967, 11.7499393919999999], // Top-right corner
  ];
  const bjoernForestImageBounds = [
    [59.963530782, 11.892033508], // Bottom-left corner
    [60.033538097, 11.694021503], // Top-right corner
  ];

  useEffect(() => {
    setTimeout(() => {
      hideLayerControlLabel('HogstklasserWMS');
      hideLayerControlLabel('Forests');
    }, 0);
  }, [zoomLevel]); // Include dependencies in the useEffect hook

  // 59.951966,11.706162
  let activeGeoJSONLayer = null;
  const onEachFeature = (feature, geoJSONLayer) => {
    geoJSONLayer.setStyle({
      fillColor: 'transparent',
      fillOpacity: 0,
    }); // Set default transparent style for the GeoJSON layer

    geoJSONLayer.on({
      click: () => {
        setActiveFeature(feature);
        // Highlight the selected polygon
        if (activeGeoJSONLayer) {
          activeGeoJSONLayer.setStyle({
            fillColor: 'transparent',
            fillOpacity: 0,
          }); // Reset style of previous active layer
        }
        if (feature.properties.DN !== 99) {
          geoJSONLayer.setStyle({
            fillColor: 'rgb(255, 255, 0)',
            fillOpacity: 1,
          }); // Set style of current active layer to neon yellow
        } else {
          return {}; // Default style for other features
        }
        activeGeoJSONLayer = geoJSONLayer; // Update active layer
      },
    });
  };

  // eslint-disable-next-line react/prop-types
  const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    selectedForestFirstTime && map.setView(center, zoom);
    // To solve the issue with the always centering the map after choosing a forest
    setSelectedForestFirstTime(false);
    return null;
  };

  const handleForestSelectChange = (event) => {
    const selected = event;
    if (!selectedForestFirstTime) {
      setSelectedForestFirstTime(true);
      setSelectedForest(selected === 'forest1' ? forest1 : forest2);
    }
  };

  const DDStyle = {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 9999,
  };

  return (
    <>
      <Dropdown isOpen={dropdownOpen} toggle={toggle} style={DDStyle}>
        <DropdownToggle caret color="info">
          Choose your Forest
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem onClick={() => handleForestSelectChange('forest1')}>
            Forest 1
          </DropdownItem>
          <DropdownItem onClick={() => handleForestSelectChange('forest2')}>
            Forest 2
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <MapContainer
        id="SkogAppMapContainer"
        zoomControl={false}
        center={selectedForest}
        zoom={zoomLevel}
        continuousWorld={true}
        worldCopyJump={false}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '100vw',
        }}
      >
        <ChangeView center={selectedForest} zoom={zoomLevel} />
        <CustomMapEvents
          activeOverlay={activeOverlay}
          setActiveOverlay={setActiveOverlay}
          setActiveFeature={setActiveFeature}
          hideLayerControlLabel={hideLayerControlLabel}
          madsTeig={madsTeig}
          bjoernTeig={bjoernTeig}
          setZoomLevel={setZoomLevel}
          zoomLevel={zoomLevel}
          clickedOnLine={clickedOnLine}
          setClickedOnLine={setClickedOnLine}
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
          {madsForestPNGImage && (
            <Overlay
              checked={
                zoomLevel > HIDE_POLYGON_ZOOM_LEVEL &&
                activeOverlay['Hogstklasser']
              }
              name="Hogstklasser"
            >
              <ImageOverlay
                url={madsForestPNGImage}
                bounds={madsForestImageBounds}
                opacity={1}
              />
              {activeFeature &&
                activeOverlay['HogstklasserWMS'] &&
                activeOverlay['Forests'] && (
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
          {bjoernForestPNGImage && (
            <Overlay
              checked={
                zoomLevel > HIDE_POLYGON_ZOOM_LEVEL &&
                activeOverlay['Hogstklasser']
              }
              name="Hogstklasser"
            >
              <ImageOverlay
                url={bjoernForestPNGImage}
                bounds={bjoernForestImageBounds}
                opacity={1}
              />
              {activeFeature &&
                activeOverlay['HogstklasserWMS'] &&
                activeOverlay['Forests'] && (
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
              name="Forests"
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
          {bjoernForest && (
            <Overlay
              name="Forest 2"
              checked={
                zoomLevel > HIDE_POLYGON_ZOOM_LEVEL &&
                activeOverlay['Hogstklasser']
              }
            >
              <GeoJSON
                data={bjoernForest}
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
