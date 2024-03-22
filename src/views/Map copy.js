import akselForestPNGImage from 'assets/data/QGIS/aksel/aksel-forest.png';
import akselPolygons from 'assets/data/QGIS/aksel/aksel-polygonized.js';
import akselTeig from 'assets/data/QGIS/aksel/aksel-teig.js';
import madsForestAR50CRS4326 from 'assets/data/QGIS/ar50-clip-RH-fixed.js';
import bjoernForestPNGImage from 'assets/data/QGIS/bjoern/bjoern-forest.png';
import bjoernPolygons from 'assets/data/QGIS/bjoern/bjoern-polygons.js';
import bjoernTeig from 'assets/data/QGIS/bjoern/bjoern-teig.js';
import knutPolygons from 'assets/data/QGIS/knut/knut-dissolved-polygons.js';
import knutForestPNGImage from 'assets/data/QGIS/knut/knut-dissolved.png';
import knutTeig from 'assets/data/QGIS/knut/knut-teig.js';
import madsForestCLCClipCRS4326 from 'assets/data/QGIS/mads-forest-clc-clip-crs4326-right-hand-fixed.js';
import madsPolygons from 'assets/data/QGIS/mads-forest-sieve-poly-simplified.js';
import madsForestPNGImage from 'assets/data/QGIS/mads-hogst-forest-3857.png';
import madsTeig from 'assets/data/QGIS/mads-teig-polygon-RH-fixed.js';
import L from 'leaflet';
import { useState } from 'react';
import {
  GeoJSON,
  LayerGroup,
  LayersControl,
  MapContainer,
  TileLayer,
  WMSTileLayer,
  ZoomControl,
  useMap,
} from 'react-leaflet';
import ForestSelector from 'utilities/Map/components/ForestSelector';
import GeoJsonWithPopup from 'utilities/Map/components/GeoJsonWithPopup';
import ImageOverlayWithPopup from 'utilities/Map/components/ImageOverlayWithPopup';
import CustomMapEvents from 'utilities/Map/CustomMapEvents';
import { hideLayerControlLabel } from 'utilities/Map/utililtyFunctions';
import {
  HIDE_POLYGON_ZOOM_LEVEL,
  MAP_DEFAULT_ZOOM_LEVEL,
  akselForestImageBounds,
  bjoernForestImageBounds,
  knutForestImageBounds,
  madsForestImageBounds,
  mapCoordinations,
} from 'variables/forest';
import '../utilities/Map/PopupMovable.js';
import '../utilities/Map/SmoothWheelZoom.js';

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
    Hogstklasser: true,
    MadsForest: false,
    AR50: false,
    CLS: false,
  });

  const forest1 = mapCoordinations.madsForestPosition;
  const forest2 = mapCoordinations.bjoernForestPosition;
  const forest3 = mapCoordinations.knutForestPosition;
  const forest4 = mapCoordinations.akselForestPosition;

  const [clickedOnLine, setClickedOnLine] = useState(false);
  const [activeFeatures, setActiveFeatures] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(MAP_DEFAULT_ZOOM_LEVEL);
  const [selectedForest, setSelectedForest] = useState(forest1); // Default to forest 1
  const [selectedForestFirstTime, setSelectedForestFirstTime] = useState(false); // Default to forest 1
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  let activeGeoJSONLayer = null;
  const onEachFeature = (feature, geoJSONLayer) => {
    geoJSONLayer.setStyle({
      fillColor: 'transparent',
      fillOpacity: 0,
    }); // Set default transparent style for the GeoJSON layer

    geoJSONLayer.on({
      click: () => {
        const featureIndex = activeFeatures.findIndex(
          (f) => f.id === feature.id
        );
        if (featureIndex === -1) {
          // If feature is not already selected, add it to the selection.
          setActiveFeatures([...activeFeatures, feature]);
        } else {
          // If feature is already selected, remove it from the selection.
          setActiveFeatures(
            activeFeatures.filter((_, index) => index !== featureIndex)
          );
        }
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
      setSelectedForest(
        selected === 'forest1'
          ? forest1
          : selected === 'forest2'
            ? forest2
            : selected === 'forest3'
              ? forest3
              : forest4
      );
    }
  };

  return (
    <>
      <ForestSelector
        isOpen={dropdownOpen}
        toggle={toggle}
        onSelectForest={handleForestSelectChange}
      />
      <MapContainer
        id="SkogAppMapContainer"
        popupMovable={true}
        popupMovableZoomMode="relative"
        scrollWheelZoom={false} // disable original zoom function
        smoothWheelZoom={true} // enable smooth zoom
        smoothSensitivity={10} // zoom speed. default is 1
        closePopupOnClick={false}
        zoomControl={false}
        center={selectedForest.coord}
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
        <ChangeView
          center={selectedForest.coord}
          zoom={selectedForest.name === 'forest3' ? 12 : 13}
        />
        <CustomMapEvents
          activeOverlay={activeOverlay}
          setActiveOverlay={setActiveOverlay}
          setActiveFeatures={setActiveFeatures}
          hideLayerControlLabel={hideLayerControlLabel}
          madsTeig={madsTeig}
          bjoernTeig={bjoernTeig}
          knutTeig={knutTeig}
          akselTeig={akselTeig}
          setZoomLevel={setZoomLevel}
          zoomLevel={zoomLevel}
          clickedOnLine={clickedOnLine}
          selectedForest={selectedForest}
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
          <Overlay
            checked={
              zoomLevel > HIDE_POLYGON_ZOOM_LEVEL &&
              activeOverlay['Hogstklasser']
            }
            name="Hogstklasser"
          >
            <LayerGroup>
              {selectedForest.name === 'forest1' && (
                <ImageOverlayWithPopup
                  image={madsForestPNGImage}
                  bounds={madsForestImageBounds}
                  zoomLevel={zoomLevel}
                  activeOverlay={activeOverlay}
                  overlayNames={['Hogstklasser']}
                  activeFeatures={activeFeatures}
                  setActiveFeatures={setActiveFeatures}
                />
              )}
              {selectedForest.name === 'forest2' && (
                <ImageOverlayWithPopup
                  image={bjoernForestPNGImage}
                  bounds={bjoernForestImageBounds}
                  zoomLevel={zoomLevel}
                  activeOverlay={activeOverlay}
                  overlayNames={['Hogstklasser']}
                  activeFeatures={activeFeatures}
                  setActiveFeatures={setActiveFeatures}
                />
              )}
              {selectedForest.name === 'forest3' && (
                <ImageOverlayWithPopup
                  image={knutForestPNGImage}
                  bounds={knutForestImageBounds}
                  zoomLevel={zoomLevel}
                  activeOverlay={activeOverlay}
                  overlayNames={['Hogstklasser']}
                  activeFeatures={activeFeatures}
                  setActiveFeatures={setActiveFeatures}
                />
              )}
              {selectedForest.name === 'forest4' && (
                <ImageOverlayWithPopup
                  image={akselForestPNGImage}
                  bounds={akselForestImageBounds}
                  zoomLevel={zoomLevel}
                  activeOverlay={activeOverlay}
                  overlayNames={['Hogstklasser']}
                  activeFeatures={activeFeatures}
                  setActiveFeatures={setActiveFeatures}
                />
              )}
              <WMSTileLayer
                url="https://wms.nibio.no/cgi-bin/skogbruksplan?"
                layers="hogstklasser"
                format="image/png"
                transparent={true}
                version="1.3.0"
                opacity={0}
              />
              {madsPolygons && selectedForest.name === 'forest1' && (
                <GeoJSON
                  data={madsPolygons}
                  onEachFeature={onEachFeature}
                  style={{ stroke: false }}
                />
              )}
              {bjoernPolygons && selectedForest.name === 'forest2' && (
                <GeoJSON
                  data={bjoernPolygons}
                  onEachFeature={onEachFeature}
                  style={{ stroke: false }}
                />
              )}
              {knutPolygons && selectedForest.name === 'forest3' && (
                <GeoJSON
                  data={knutPolygons}
                  onEachFeature={onEachFeature}
                  style={{ stroke: false }}
                />
              )}
              {akselPolygons && selectedForest.name === 'forest4' && (
                <GeoJSON
                  data={akselPolygons}
                  onEachFeature={onEachFeature}
                  style={{ stroke: false }}
                />
              )}
            </LayerGroup>
          </Overlay>
          {madsForestAR50CRS4326 && (
            <Overlay
              name="AR50"
              checked={
                zoomLevel > HIDE_POLYGON_ZOOM_LEVEL && activeOverlay['AR50']
              }
            >
              <GeoJsonWithPopup
                data={madsForestAR50CRS4326}
                onEachFeature={onEachFeature}
                activeFeatures={activeFeatures}
                activeOverlay={activeOverlay}
                overlayName="AR50"
                setActiveFeatures={setActiveFeatures}
              />
            </Overlay>
          )}
          {madsForestCLCClipCRS4326 && (
            <Overlay
              name="CLC"
              checked={
                zoomLevel > HIDE_POLYGON_ZOOM_LEVEL && activeOverlay['CLC']
              }
            >
              <GeoJsonWithPopup
                data={madsForestCLCClipCRS4326}
                onEachFeature={onEachFeature}
                activeFeatures={activeFeatures}
                activeOverlay={activeOverlay}
                overlayName="CLC"
                setActiveFeatures={setActiveFeatures}
              />
            </Overlay>
          )}
        </LayersControl>
      </MapContainer>
    </>
  );
}

export default Map;
