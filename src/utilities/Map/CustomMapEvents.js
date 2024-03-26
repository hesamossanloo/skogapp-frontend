import * as turf from '@turf/turf';
import L from 'leaflet';
import { WMSGetFeatureInfo } from 'ol/format';
import PropTypes from 'prop-types';
import { useMap, useMapEvents } from 'react-leaflet';
import {
  CSV_URLS,
  HIDE_POLYGON_ZOOM_LEVEL,
  SPECIES,
  nibioGetFeatInfoBaseParams,
} from 'variables/forest';
import useCsvData from './useCSVData';
import {
  calculateEstimatedHeightAndCrossSectionArea,
  calculteSpeciesBasedPrice,
  formatNumber,
} from './utililtyFunctions';

CustomMapEvents.propTypes = {
  activeOverlay: PropTypes.shape({
    Hogstklasser: PropTypes.bool,
  }).isRequired,
  setActiveOverlay: PropTypes.func.isRequired,
  setClickedOnLine: PropTypes.func.isRequired,
  setActiveFeatures: PropTypes.func.isRequired,
  setZoomLevel: PropTypes.func.isRequired,
  zoomLevel: PropTypes.number.isRequired,
  clickedOnLine: PropTypes.bool.isRequired,
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
    setClickedOnLine,
    setActiveFeatures,
    setZoomLevel,
    zoomLevel,
    clickedOnLine,
    madsTeig,
    bjoernTeig,
    knutTeig,
    akselTeig,
    selectedForest,
  } = props;
  const map = useMap();

  const granCSVData = useCsvData(CSV_URLS.GRAN).data;
  const furuCSVData = useCsvData(CSV_URLS.FURU).data;

  const desiredAttributes = {
    teig_best_nr: 'Bestand nr',
    hogstkl_verdi: 'Hogstklasse',
    bonitet_beskrivelse: 'Bonitet',
    bontre_beskrivelse: 'Treslag',
    alder: 'Alder',
    areal: 'Areal (daa, rd.)',
    arealm2: 'Areal (daa)',
  };

  const handleSkogbrukWMSFeatures = (e, features, map) => {
    if (features.length > 0 && features[0] && !clickedOnLine) {
      const feature = features[0];
      const values = feature.values_;

      const activeOverlayNames = Object.keys(activeOverlay).filter(
        (key) => activeOverlay[key] === true
      );
      // Step 1 get the H from the Gran and Furu csv files
      let estimatedHeightString;
      // Step 2
      // Gu = exp( -12.920 - 0.021*alder + 2.379*ln(alder) + 0.540*ln(N) + 1.587*ln(Ht40))
      let crossSectionArea;
      // Step 3
      // V = 0.250(Gu^1.150)*H^(1.012)*exp(2.320/alder)
      let estimatedStandVolume;
      // Step 4
      let estimatedStandVolumeM3HAAString;

      let content =
        `<h3 style="color: black; text-align: center;">${activeOverlayNames[0]}</h3>` + // Add the layer name as the title with black color and centered alignment
        '<table style="margin-bottom: 10px; border-collapse: collapse; border: 1px solid black;">'; // Add margin-bottom and border styles
      content += `<tr style="border: 1px solid black;"><td style="padding: 5px; border: 1px solid black;">ID</td><td style="padding: 5px; border: 1px solid black; font-weight: bold">${values.teig_best_nr}</td></tr>`; // Add the ID row
      for (const key in values) {
        // Exclude the ID from the loop
        if (desiredAttributes[key] && key !== 'teig_best_nr') {
          let value = values[key];
          if (key === 'arealm2') {
            const arealm2 = parseInt(value) / 1000;
            value = formatNumber(arealm2, 'nb-NO', 2); // Format with the decimal
          }
          if (key === 'bonitet_beskrivelse') {
            value = value.substring(value.indexOf(' ') + 1); // Remove the first part and keep only the number
          }
          // To ignore the generated polygon (features) with only DN (not useful) values to be shown.
          if (key !== 'DN' && key !== 'areal') {
            content += `<tr style="border: 1px solid black;"><td style="padding: 5px; border: 1px solid black;">${desiredAttributes[key]}</td><td style="padding: 5px; border: 1px solid black; font-weight: bold">${value}</td></tr>`; // Add padding-right and border styles
          }
        }
      }

      // Add the additional row if hogstkl_verdi is 4 or 5
      if (values.hogstkl_verdi === '4' || values.hogstkl_verdi === '5') {
        if (granCSVData.length > 0 || furuCSVData.length > 0) {
          let csvData;
          if (values.bontre_beskrivelse === SPECIES.GRAN) {
            csvData = granCSVData;
          } else if (values.bontre_beskrivelse === SPECIES.FURU) {
            csvData = furuCSVData;
          } else {
            // TODO: There are also other species e.g. Bjørk / lauv from ID:1-36
            csvData = granCSVData;
          }

          // Calculating Step 1 and 2
          if (csvData) {
            const { estimatedHeightCSV, crossSectionAreaCalc } =
              calculateEstimatedHeightAndCrossSectionArea(values, csvData);
            estimatedHeightString = estimatedHeightCSV;
            crossSectionArea = crossSectionAreaCalc;
          }
          // Calculating Step 3
          // V = 0.250(G^1.150)*H^(1.012)*exp(2.320/alder)
          estimatedStandVolume =
            0.25 *
            Math.pow(crossSectionArea, 1.15) *
            Math.pow(
              parseFloat(estimatedHeightString.replace(',', '.')),
              1.012
            ) *
            Math.exp(2.32 / parseInt(values.alder));
          console.log('V: ', estimatedStandVolume);

          // Step 4:
          // SV_in_bestand_249 = arealm2/10000*249 = 11391*249/10000 = 283.636
          estimatedStandVolumeM3HAAString =
            (parseInt(values.arealm2) / 10000) * estimatedStandVolume;
          console.log('SV: ', estimatedStandVolumeM3HAAString);
        }
        const { totalVolume, speciesPrice } = calculteSpeciesBasedPrice(
          values.bontre_beskrivelse,
          estimatedStandVolumeM3HAAString
        );

        // Showing the tree density volume per stand
        content += `<tr style="border: 1px solid black;"><td style="padding: 5px; border: 1px solid black;">Tømmervolum</td><td style="padding: 5px; border: 1px solid black;"><span style="font-weight: bold">${formatNumber(estimatedStandVolumeM3HAAString, 'nb-NO', 1)}</span> m^3</td></tr>`;
        // Calculating the estimatedStandVolume per decare (daa)
        content += `<tr style="border: 1px solid black;"><td style="padding: 5px; border: 1px solid black;">Tømmertetthet</td><td style="padding: 5px; border: 1px solid black;"><span style="font-weight: bold">${formatNumber(estimatedStandVolume / 10, 'nb-NO', 1)}</span> m^3/daa</td></tr>`;
        // The price of the timber for a species
        content += `<tr style="border: 1px solid black;"><td style="padding: 5px; border: 1px solid black;">Forv. gj.sn pris per m^3</td><td style="padding: 5px; border: 1px solid black;"><span style="font-weight: bold">${formatNumber(speciesPrice, 'nb-NO', 0)}</span> kr</td></tr>`;
        // We rae showing the total volume
        content += `<tr style="border: 1px solid black;"><td style="padding: 5px; border: 1px solid black;">Forv. brutto verdi</td><td style="padding: 5px; border: 1px solid black;"><span style="font-weight: bold">${formatNumber(totalVolume, 'nb-NO', 0)}</span> kr</td></tr>`;
      }

      content += '</table>';

      L.popup({ interactive: true })
        // .setLatLng([e.latlng.lat, e.latlng.lng])
        .setLatLng(e.latlng)
        .setContent(content)
        .openOn(map);
    }
  };

  const isPointInsidePolygon = (point, polygon) => {
    const turfPoint = turf.point([point.lng, point.lat]);
    const turfPolygon = turf.multiPolygon(polygon);
    return turf.booleanPointInPolygon(turfPoint, turfPolygon);
  };
  const calculateBoundingBox = (map) => {
    const CRS = map.options.crs.code;
    const size = map.getSize();
    const bounds = map.getBounds();
    const southWest = map.options.crs.project(bounds.getSouthWest());
    const northEast = map.options.crs.project(bounds.getNorthEast());
    const BBOX = [southWest.x, southWest.y, northEast.x, northEast.y].join(',');
    return { CRS, size, BBOX };
  };
  useMapEvents({
    zoom: async (e) => {
      let flag = false;
      setZoomLevel(map.getZoom());
      if (map.getZoom() > HIDE_POLYGON_ZOOM_LEVEL) {
        flag = true;
      }
      setActiveOverlay((prevOverlay) => ({
        ...prevOverlay,
        Hogstklasser: flag,
      }));
    },
    click: async (e) => {
      // Handle Clicks on Mads Forest
      setClickedOnLine(madsTeig.features[0].properties.DN === 99);
      if (!clickedOnLine && activeOverlay['Hogstklasser']) {
        // The WMS expects the Query params to follow certain patterns. After
        // analysing how QGIS made the WMS call, reverse enginnered the call
        // and here we are building one of those params, i.e. BBOX, size.x, size.y and the CRS
        const { CRS, size, BBOX } = calculateBoundingBox(map);

        // By default we are closing all the popups, in case there are any opens
        //  an then we will show the pop up after the new call to the WMS and once
        // the data are fetched.
        map.closePopup();

        // Check if the click is within the coordinates of a GeoJSON
        // In this case I am passing in the Mad's forest Teig Polygon
        const forests = [madsTeig, bjoernTeig, knutTeig, akselTeig];
        const forestName = selectedForest.name;
        const clickedForest = forests.find(
          (forest) => forest.name === forestName
        );
        if (
          clickedForest &&
          isPointInsidePolygon(
            e.latlng,
            clickedForest.features[0].geometry.coordinates
          )
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
          const url = `https://wms.nibio.no/cgi-bin/skogbruksplan?${new URLSearchParams(params).toString()}`;
          const response = await fetch(url);
          const data = await response.text();
          const format = new WMSGetFeatureInfo();
          const features = format.readFeatures(data);
          handleSkogbrukWMSFeatures(e, features, map);
        }
      }
    },
    overlayadd: async (e) => {
      if (activeOverlay['Hogstklasser']) {
        // Wait for the next render cycle to ensure the layer control has been updated

        setActiveOverlay((prevOverlay) => ({
          ...prevOverlay,
          Hogstklasser: true,
        }));
      }
      setActiveOverlay((prevOverlay) => ({
        ...prevOverlay,
        [e.name]: true,
      }));
    },
    overlayremove: async (e) => {
      if (activeOverlay['Hogstklasser']) {
        map.closePopup();
        setActiveFeatures([]);
      }
      if (activeOverlay['Hogstklasser'] && e.name === 'Hogstklasser') {
        // Wait for the next render cycle to ensure the layer control has been updated
        !(zoomLevel <= HIDE_POLYGON_ZOOM_LEVEL) &&
          setActiveOverlay((prevOverlay) => ({
            ...prevOverlay,
            Hogstklasser: false,
          }));
      }
      !(zoomLevel <= HIDE_POLYGON_ZOOM_LEVEL) &&
        setActiveOverlay((prevOverlay) => ({
          ...prevOverlay,
          [e.name]: false,
        }));
    },
  });

  return null;
}
