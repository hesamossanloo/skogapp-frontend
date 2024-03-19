import madsForestAR50CRS4326 from 'assets/data/QGIS/ar50-clip-RH-fixed.js';
import bjoernForestPNGImage from 'assets/data/QGIS/bjoern/bjoern-forest.png';
import bjoernPolygons from 'assets/data/QGIS/bjoern/bjoern-polygons.js';
import bjoernTeig from 'assets/data/QGIS/bjoern/bjoern-teig.js';
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
  bjoernForestImageBounds,
  madsForestImageBounds,
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
  const ChangeView = ({ center }) => {
    const map = useMap();
    selectedForestFirstTime && map.setView(center, 13);
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

  return (
    <>
      <ForestSelector
        isOpen={dropdownOpen}
        toggle={toggle}
        onSelectForest={handleForestSelectChange}
      />
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
        <ChangeView center={selectedForest} />
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
          <Overlay
            checked={
              zoomLevel > HIDE_POLYGON_ZOOM_LEVEL &&
              activeOverlay['Hogstklasser']
            }
            name="Hogstklasser"
          >
            <LayerGroup>
              <ImageOverlayWithPopup
                image={madsForestPNGImage}
                bounds={madsForestImageBounds}
                zoomLevel={zoomLevel}
                activeOverlay={activeOverlay}
                overlayNames={['Hogstklasser']}
                activeFeature={activeFeature}
                setActiveFeature={setActiveFeature}
              />
              <ImageOverlayWithPopup
                image={bjoernForestPNGImage}
                bounds={bjoernForestImageBounds}
                zoomLevel={zoomLevel}
                activeOverlay={activeOverlay}
                overlayNames={['Hogstklasser']}
                activeFeature={activeFeature}
                setActiveFeature={setActiveFeature}
              />
              <WMSTileLayer
                url="https://wms.nibio.no/cgi-bin/skogbruksplan?"
                layers="hogstklasser"
                format="image/png"
                transparent={true}
                version="1.3.0"
                opacity={0}
              />
              {madsPolygons && (
                <GeoJSON
                  data={madsPolygons}
                  onEachFeature={onEachFeature}
                  style={{ stroke: false }}
                />
              )}
              {bjoernPolygons && (
                <GeoJSON
                  data={bjoernPolygons}
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
                activeFeature={activeFeature}
                activeOverlay={activeOverlay}
                overlayName="AR50"
                setActiveFeature={setActiveFeature}
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
                activeFeature={activeFeature}
                activeOverlay={activeOverlay}
                overlayName="CLC"
                setActiveFeature={setActiveFeature}
              />
            </Overlay>
          )}
        </LayersControl>
      </MapContainer>
    </>
  );
}

export default Map;
