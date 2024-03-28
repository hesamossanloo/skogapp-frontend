import akselPolygons from 'assets/data/QGIS/aksel/aksel-polygons.js';
import akselPolygonsPNG from 'assets/data/QGIS/aksel/aksel-polygons.png';
import akselTeig from 'assets/data/QGIS/aksel/aksel-teig.js';
import bjoernPolygons from 'assets/data/QGIS/bjoern/bjoern-polygons.js';
import bjoernPolygonsPNG from 'assets/data/QGIS/bjoern/bjoern-polygons.png';
import bjoernTeig from 'assets/data/QGIS/bjoern/bjoern-teig.js';
import knutPolygons from 'assets/data/QGIS/knut/knut-polygons.js';
import knutPolygonsPNG from 'assets/data/QGIS/knut/knut-polygons.png';
import knutTeig from 'assets/data/QGIS/knut/knut-teig.js';
import madsPolygons from 'assets/data/QGIS/mads/mads-polygons.js';
import madsPolygonsPNG from 'assets/data/QGIS/mads/mads-polygons.png';
import madsTeig from 'assets/data/QGIS/mads/mads-teig.js';
import ToggleSwitch from 'components/ToggleSwitch/ToggleSwitch.js';
import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import {
  GeoJSON,
  ImageOverlay,
  LayerGroup,
  LayersControl,
  MapContainer,
  TileLayer,
  WMSTileLayer,
  ZoomControl,
  useMap,
} from 'react-leaflet';
import { Button } from 'reactstrap';
import ForestSelector from 'utilities/Map/components/ForestSelector';
import CustomMapEvents from 'utilities/Map/CustomMapEvents';
import {
  HIDE_POLYGON_ZOOM_LEVEL,
  MAP_DEFAULT_ZOOM_LEVEL,
  akselPolygonsPNGBounds,
  bjoernPolygonsPNGBounds,
  knutPolygonsPNGBounds,
  madsPolygonsPNGBounds,
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
  });

  const forest1 = mapCoordinations.madsForestPosition;
  const forest2 = mapCoordinations.bjoernForestPosition;
  const forest3 = mapCoordinations.knutForestPosition;
  const forest4 = mapCoordinations.akselForestPosition;

  const [clickedOnLine, setClickedOnLine] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(MAP_DEFAULT_ZOOM_LEVEL);
  const [selectedForest, setSelectedForest] = useState(forest1); // Default to forest 1
  const [selectedForestFirstTime, setSelectedForestFirstTime] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [multiPolygonSelect, setMultiPolygonSelect] = useState(false);
  const [deselectPolygons, setDeselectPolygons] = useState(false);
  const multiPolygonSelectRef = useRef(multiPolygonSelect);
  const previousGeoJSONLayersRef = useRef([]);

  // Update the ref every time multiPolygonSelect changes
  useEffect(() => {
    multiPolygonSelectRef.current = multiPolygonSelect;
  }, [multiPolygonSelect]);
  const toggleDD = () => setDropdownOpen((prevState) => !prevState);

  const onEachFeature = (feature, geoJSONLayer) => {
    geoJSONLayer.setStyle({
      fillColor: 'transparent',
      fillOpacity: 0,
    }); // Set default transparent style for the GeoJSON layer

    geoJSONLayer.on({
      click: () => {
        if (feature.properties.DN !== 99) {
          // If multiPolygonSelectRef.current is false, unhighlight the previous layer
          if (!multiPolygonSelectRef.current) {
            previousGeoJSONLayersRef.current.forEach((layer) => {
              layer.setStyle({
                fillColor: 'transparent',
                fillOpacity: 0,
              });
            });
            previousGeoJSONLayersRef.current = []; // Reset the list of previous layers
            // Highlight the clicked layer
            geoJSONLayer.setStyle({
              fillColor: 'rgb(255, 255, 0)',
              fillOpacity: 1,
            });

            previousGeoJSONLayersRef.current = [geoJSONLayer];
          } else {
            // If multiPolygonSelectRef.current is true, just highlight the clicked layer

            geoJSONLayer.setStyle({
              fillColor: 'rgb(255, 255, 0)',
              fillOpacity: 1,
            });

            previousGeoJSONLayersRef.current.push(geoJSONLayer);
          }
        }
      },
    });
  };

  // eslint-disable-next-line react/prop-types
  const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    selectedForestFirstTime && map.setView(center, zoom);
    // To solve the issue with the always centering the map after choosing a forest
    useEffect(() => {
      setSelectedForestFirstTime(false);
    }, []);
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
  const toggleSelectMultiPolygons = () => {
    setMultiPolygonSelect((prevState) => !prevState);
  };
  const resetHighlightedFeatures = () => {
    previousGeoJSONLayersRef.current.forEach((layer) => {
      layer.setStyle({
        fillColor: 'transparent',
        fillOpacity: 0,
      });
    });
    // Clear the array after resetting styles
    setDeselectPolygons(true);
  };
  return (
    <>
      <ForestSelector
        isOpen={dropdownOpen}
        toggle={toggleDD}
        onSelectForest={handleForestSelectChange}
      />
      <ToggleSwitch
        id="multiPolygon"
        disabled={!activeOverlay['Hogstklasser']}
        checked={multiPolygonSelect}
        optionLabels={['Multi Select', 'Single Select']}
        onChange={toggleSelectMultiPolygons}
      />
      <Button
        color="warning"
        style={{
          zIndex: '10',
          position: 'fixed',
          right: '10px',
          top: '120px',
          width: '115px',
          padding: '10px 0 10px 0',
        }}
        onClick={resetHighlightedFeatures} // Update this line
      >
        Deselect
      </Button>
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
          multiPolygonSelect={multiPolygonSelect}
          deselectPolygons={deselectPolygons}
          madsTeig={madsTeig}
          bjoernTeig={bjoernTeig}
          knutTeig={knutTeig}
          akselTeig={akselTeig}
          setZoomLevel={setZoomLevel}
          zoomLevel={zoomLevel}
          clickedOnLine={clickedOnLine}
          selectedForest={selectedForest}
          setClickedOnLine={setClickedOnLine}
          setDeselectPolygons={setDeselectPolygons}
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
                <ImageOverlay
                  url={madsPolygonsPNG}
                  bounds={madsPolygonsPNGBounds}
                  opacity={0.5}
                />
              )}
              {selectedForest.name === 'forest2' && (
                <ImageOverlay
                  url={bjoernPolygonsPNG}
                  bounds={bjoernPolygonsPNGBounds}
                  opacity={0.5}
                />
              )}
              {selectedForest.name === 'forest3' && (
                <ImageOverlay
                  url={knutPolygonsPNG}
                  bounds={knutPolygonsPNGBounds}
                  opacity={0.5}
                />
              )}
              {selectedForest.name === 'forest4' && (
                <ImageOverlay
                  url={akselPolygonsPNG}
                  bounds={akselPolygonsPNGBounds}
                  opacity={0.5}
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
        </LayersControl>
      </MapContainer>
    </>
  );
}

export default Map;
