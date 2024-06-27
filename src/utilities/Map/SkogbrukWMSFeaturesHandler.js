import {
  calculateFeatInfoHKTotals,
  convertAndformatTheStringArealM2ToDAA,
  createMISButton,
  formatNumber,
  generateHKPopupContent,
  openHKPopupWithContent,
} from './utililtyFunctions';

export const SkogbrukWMSFeaturesHandler = (
  e,
  features,
  map,
  multi,
  MISFeature,
  bestandFeatInfos
) => {
  const sumObj = {
    title: 'Bestand',
    isMIS: MISFeature && MISFeature.length > 0,
  };
  if (sumObj.isMIS) sumObj.title = 'MIS Bestand';

  const totals = calculateFeatInfoHKTotals(features, bestandFeatInfos);
  sumObj.carbon_stored = formatNumber(
    totals.totalCarbonStored / 1000,
    'nb-NO',
    2
  );
  sumObj.carbon_captured_next_year = formatNumber(
    totals.totalCarbonCapturedNextYear / 1000,
    'nb-NO',
    2
  );
  sumObj.arealDAA = convertAndformatTheStringArealM2ToDAA(totals.totalArealM2);
  sumObj.standVolumeWMSDensityPerHectareMads =
    totals.standVolumeWMSDensityPerHectareMads;
  sumObj.standVolumeMads = totals.standVolumeMads;
  sumObj.speciesPriceMads = totals.speciesPriceMads;
  sumObj.totalESTGrossValueMads = totals.totalESTGrossValueMads;

  const content = generateHKPopupContent(
    sumObj,
    features,
    multi,
    bestandFeatInfos
  );
  let popupContentDiv = document.createElement('div');
  popupContentDiv.className = 'mis-popup-content';
  popupContentDiv.innerHTML = content;
  if (sumObj.isMIS) {
    popupContentDiv = createMISButton(popupContentDiv, MISFeature, e, map);
  }

  openHKPopupWithContent(popupContentDiv, e, map);
};

export default SkogbrukWMSFeaturesHandler;
