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
} from 'react-leaflet';
import { GeoJSON, useMapEvents, useMap } from 'react-leaflet';
import osloForestGeoJSON from 'assets/data/osloForestGeoJSON';
import forestSubTreesGeoJSON from 'assets/data/forestSubtreesGeoJSON';
import DetailSidebar from 'components/DetailSidebar/DetailSidebar';
import { WMSGetFeatureInfo } from 'ol/format';

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
  const [isSkogbruksplanOn, setIsSkogbruksplanOn] = useState(true);

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

  // Define a new component
  const MapEvents = () => {
    const map = useMap();

    map.on('overlayadd', function (e) {
      if (e.name === 'Skogbruksplan') {
        setIsSkogbruksplanOn(true);
      }
    });

    map.on('overlayremove', function (e) {
      if (e.name === 'Skogbruksplan') {
        setIsSkogbruksplanOn(false);
        map.closePopup();
      }
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
          language: 'nor',
          SERVICE: 'WMS',
          VERSION: '1.3.0',
          REQUEST: 'GetFeatureInfo',
          BBOX,
          CRS,
          WIDTH: size.x,
          HEIGHT: size.y,
          LAYERS: 'hogstklasser',
          STYLES: '',
          FORMAT: 'image/png',
          QUERY_LAYERS: 'hogstklasser',
          INFO_FORMAT: 'application/vnd.ogc.gml', // text/html, application/vnd.ogc.gml, text/plain
          I: Math.round(e.containerPoint.x),
          J: Math.round(e.containerPoint.y),
          FEATURE_COUNT: 10,
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
  // <WMSTileLayer
  //             url="https://prodtest.matrikkel.no/geoservergeo/wms?"
  //             layers="matrikkel:TEIGWFS"
  //             format="image/png"
  //             transparent={true}
  //             version="1.1.1"
  //             username="vintertjenn_matrikkeltest"
  //             password="ygx2gcj@vju8WKH5pudz"
  //           />
  return (
    <>
      <MapContainer
        zoomControl={false}
        center={position}
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
        {isSkogbruksplanOn && <MapEvents />}
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
          <Overlay name="Hogstklasser">
            <WMSTileLayer
              url="https://wms.nibio.no/cgi-bin/skogbruksplan?"
              layers="hogstklasser"
              format="image/png"
              transparent={true}
              version="1.3.0"
            />
          </Overlay>
          {osloForestGeoJSON && (
            <Overlay name="Mad's Dad's Forest">
              <GeoJSON
                data={forestSubTreesGeoJSON}
                style={style}
                onEachFeature={onEachFeature}
              />
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
