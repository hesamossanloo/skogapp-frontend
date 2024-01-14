import React, { useState } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  LayersControl,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
} from 'react-leaflet';
import { GeoJSON } from 'react-leaflet';
import osloForestGeoJSON from 'assets/data/osloForestGeoJSON';
import forestSubTreesGeoJSON from 'assets/data/forestSubtreesGeoJSON';
import DetailSidebar from 'components/DetailSidebar/DetailSidebar';

const { BaseLayer, Overlay } = LayersControl;
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function Map() {
  const [detailSidebarOpen, setDetailSidebarOpen] = useState(false);
  const [detailSidebarInfo, setDetailSidebarInfo] = useState(null);

  const homePosition = [59.9287, 11.7025]; // Coordinates for Mads' House
  const position = [59.945, 11.695]; // Coordinates for Mads' Dad's Forest
  // const position = [59.9139, 10.7522]; // Coordinates for Oslo, Norway
  const colorMap = {
    Pine: 'green',
    Oak: 'brown',
    Spruce: 'yellow',
    Birch: 'white',
    Alder: 'black',
    Cherry: 'red',
  };

  const style = (feature) => {
    return {
      color: colorMap[feature.properties.species],
    };
  };
  const handleOverlayClick = (e) => {
    setDetailSidebarInfo(e.target.feature.properties);
    setDetailSidebarOpen(true);
  };
  // Function to handle click on forest feature
  const onEachFeature = (feature, layer) => {
    layer.on({
      click: handleOverlayClick,
    });
  };
  const closeDetailSidebar = () => {
    setDetailSidebarOpen(false);
  };
  return (
    <>
      <MapContainer
        zoomControl={false}
        center={position}
        zoom={13}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '100vw',
        }}
      >
        <ZoomControl position="bottomright" /> {/* Add new ZoomControl here */}
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
          {osloForestGeoJSON && (
            <Overlay checked name="Mad's Dad's Forest">
              <GeoJSON
                data={forestSubTreesGeoJSON}
                style={style}
                onEachFeature={onEachFeature}
              />
              {/* <GeoJSON data={osloForestGeoJSON} onEachFeature={onEachFeature} /> */}
            </Overlay>
          )}
        </LayersControl>
        <Marker position={homePosition}>
          <Popup>Mads was born in this House!</Popup>
        </Marker>
      </MapContainer>
      <DetailSidebar
        open={detailSidebarOpen}
        onClose={closeDetailSidebar}
        info={detailSidebarInfo}
      />
    </>
  );
}

export default Map;
