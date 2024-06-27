import { FeatureInfosContext } from 'contexts/FeatureInfosContext';
import L from 'leaflet';
import { WMSGetFeatureInfo } from 'ol/format';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import {
  MIS_BESTAND_IDs,
  nibioGetFeatInfoMISBaseParams,
} from 'variables/forest';
import SkogbrukWMSFeaturesHandler from './SkogbrukWMSFeaturesHandler';
import {
  calculateBoundingBox,
  isPointInsidePolygon,
  isPointInsideTeig,
  WFSFeatureLayerNamefromXML,
} from './utililtyFunctions';

CustomMapEvents.propTypes = {
  activeOverlay: PropTypes.shape({
    Teig: PropTypes.bool,
    MIS: PropTypes.bool,
    Stands: PropTypes.bool,
    Skogbruksplan: PropTypes.bool,
  }).isRequired,
  setActiveOverlay: PropTypes.func.isRequired,
  setDeselectPolygons: PropTypes.func.isRequired,
  clickedOnNotBestandRef: PropTypes.object.isRequired,
  selectedVectorFeatureRef: PropTypes.object.isRequired,
  multiPolygonSelect: PropTypes.bool.isRequired,
  deselectPolygons: PropTypes.bool.isRequired,
  madsTeig: PropTypes.object.isRequired,
  bjoernTeig: PropTypes.object.isRequired,
  knutTeig: PropTypes.object.isRequired,
  akselTeig: PropTypes.object.isRequired,
  selectedForest: PropTypes.object.isRequired,
};

export default function CustomMapEvents(props) {
  const {
    activeOverlay,
    setActiveOverlay,
    setDeselectPolygons,
    clickedOnNotBestandRef,
    selectedVectorFeatureRef,
    madsTeig,
    bjoernTeig,
    knutTeig,
    akselTeig,
    multiPolygonSelect,
    deselectPolygons,
    selectedForest,
  } = props;
  const map = useMap();
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const { records, isFetching } = useContext(FeatureInfosContext);

  // Check if the click is within the coordinates of a GeoJSON
  // In this case I am passing in the Mad's forest Teig Polygon
  const forests = [madsTeig, bjoernTeig, knutTeig, akselTeig];
  const forestName = selectedForest.name;
  const chosenForest = forests.find((forest) => forest.name === forestName);

  useEffect(() => {
    if (deselectPolygons) {
      map.closePopup();
      setSelectedFeatures([]);
      setDeselectPolygons(false);
    } else {
      // This will reset the selected features when multiPolygonSelect changes
      setSelectedFeatures([...selectedFeatures]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiPolygonSelect, deselectPolygons]); // Dependency array includes multiPolygonSelect

  useMapEvents({
    click: async (e) => {
      // Assuming leaflet-pip is already included in your project
      let clickedOnHKGeoJSON = false;

      map.eachLayer((layer) => {
        if (layer instanceof L.GeoJSON) {
          // Check each feature in the GeoJSON layer
          layer.eachLayer((feature) => {
            // Get the polygon from the feature
            const polygon = feature.toGeoJSON();

            if (
              polygon.properties.teig_best_nr &&
              isPointInsidePolygon(e.latlng, polygon.geometry.coordinates)
            ) {
              clickedOnHKGeoJSON = true;
            }
          });
        }
      });

      if (
        isPointInsideTeig(
          e.latlng,
          chosenForest.features[0].geometry.coordinates
        ) &&
        (clickedOnNotBestandRef.current || !clickedOnHKGeoJSON)
      ) {
        L.popup({ interactive: true })
          .setLatLng(e.latlng)
          .setContent(
            '<h5 style="color: black; text-align: center;">This is not a Bestand!</h5>'
          )
          .openOn(map);
      }
      if (
        !clickedOnNotBestandRef.current &&
        (activeOverlay['Stands'] || activeOverlay['Skogbruksplan']) &&
        clickedOnHKGeoJSON
      ) {
        // By default we are closing all the popups, in case there are any opens
        // an then we will show the pop up after the new call to the WMS and once
        // the data are fetched.
        map.closePopup();

        if (
          chosenForest &&
          isPointInsideTeig(
            e.latlng,
            chosenForest.features[0].geometry.coordinates
          ) &&
          selectedVectorFeatureRef.current &&
          selectedVectorFeatureRef.current.properties
        ) {
          let MISClickedFeatureInfos;
          // In case the selected feature is already in the array,
          // which means the user has clicked on it before, we don't
          // need to add it to the array. That's why we check if the teigBestNr
          // already exists or not!
          // const teigBestNrLastSelected = newFeatures[0]?.properties?.teig_best_nr;

          const teigBestNrLastSelected =
            selectedVectorFeatureRef.current.properties.teig_best_nr;
          if (
            activeOverlay['MIS'] &&
            MIS_BESTAND_IDs.indexOf(teigBestNrLastSelected) > -1
          ) {
            // Preparing the request to GetFeatreInfo for MIS WMS
            // The NIBIO WMS expects the Query params to follow certain patterns. After
            // analysing how QGIS made the WMS call, reverse engineered the call
            // and here we are building one of those params, i.e. BBOX, size.x, size.y and the CRS
            const { CRS, size, BBOX } = calculateBoundingBox(map);
            // The params should be in uppercase, unless the WMS won't accept it
            const params = {
              ...nibioGetFeatInfoMISBaseParams,
              BBOX,
              CRS,
              WIDTH: size.x,
              HEIGHT: size.y,
              I: Math.round(e.containerPoint.x),
              J: Math.round(e.containerPoint.y),
            };
            const url = `https://wms.nibio.no/cgi-bin/mis?${new URLSearchParams(params).toString()}`;
            const response = await fetch(url);
            const data = await response.text();
            const WMSFeatureInfoRaw = new WMSGetFeatureInfo();
            const layerNames = WFSFeatureLayerNamefromXML(data);
            MISClickedFeatureInfos = WMSFeatureInfoRaw.readFeatures(data);
            // Assuming layerNames is an array of strings and MISClickedFeatureInfos is an array of objects
            if (layerNames.length === MISClickedFeatureInfos.length) {
              // Loop through each feature info
              MISClickedFeatureInfos.forEach((featureInfo, index) => {
                // Assign the corresponding layer name from layerNames to this feature info
                // Assuming you're adding a new property 'layerName' to each feature info object
                featureInfo.layerName = layerNames[index];
              });
            } else {
              console.error(
                'The count of layerNames does not match the count of MISClickedFeatureInfos'
              );
            }
          }
          // Reset selected features if not in multiPolygonSelect mode
          if (!multiPolygonSelect) {
            setSelectedFeatures([selectedVectorFeatureRef.current]); // Only the last selected feature is kept
            if (!isFetching) {
              // Ensure data is loaded
              SkogbrukWMSFeaturesHandler(
                e,
                [selectedVectorFeatureRef.current],
                map,
                multiPolygonSelect,
                MISClickedFeatureInfos,
                records
              );
            }
          } else {
            if (
              teigBestNrLastSelected &&
              !selectedFeatures.some(
                (feature) =>
                  feature.properties?.teig_best_nr === teigBestNrLastSelected
              )
            ) {
              // Add to selected features for multi selection mode
              setSelectedFeatures([
                ...selectedFeatures,
                selectedVectorFeatureRef.current,
              ]);
              if (!isFetching) {
                SkogbrukWMSFeaturesHandler(
                  e,
                  selectedFeatures.concat([selectedVectorFeatureRef.current]),
                  map,
                  multiPolygonSelect,
                  MISClickedFeatureInfos,
                  records
                );
              }
            } else {
              if (!isFetching) {
                SkogbrukWMSFeaturesHandler(
                  e,
                  selectedFeatures,
                  map,
                  multiPolygonSelect,
                  MISClickedFeatureInfos,
                  records
                );
              }
            }
          }
        }
      }
    },
    overlayadd: async (e) => {
      setActiveOverlay((prevOverlay) => ({
        ...prevOverlay,
        [e.name]: true,
      }));
    },
    overlayremove: async (e) => {
      if (activeOverlay['Stands'] || activeOverlay['Skogbruksplan']) {
        map.closePopup();
      }
    },
  });

  return null;
}
