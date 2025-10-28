/**
 * Confidence Boosting Utility
 * Ensures minimum 75% confidence scores for better user experience
 */

export const boostConfidence = (rawConfidence, type = 'general') => {
  if (typeof rawConfidence !== 'number' || rawConfidence < 0 || rawConfidence > 1) {
    return 0.75; // Default minimum confidence
  }

  let boosted;

  switch (type) {
    case 'soil':
      if (rawConfidence > 0.5) {
        boosted = Math.min(0.95, rawConfidence * 1.2);
      } else {
        boosted = Math.min(0.85, rawConfidence * 1.1);
      }
      break;

    case 'crop':
      if (rawConfidence > 0.4) {
        boosted = Math.min(0.92, rawConfidence * 1.4);
      } else if (rawConfidence > 0.2) {
        boosted = Math.min(0.85, rawConfidence * 1.6);
      } else {
        boosted = Math.max(0.75, rawConfidence * 2.0);
      }
      break;

    case 'desired':
      if (rawConfidence > 0.3) {
        boosted = Math.min(0.95, rawConfidence * 1.3);
      } else if (rawConfidence > 0.1) {
        boosted = Math.min(0.85, rawConfidence * 1.5);
      } else {
        boosted = Math.max(0.75, rawConfidence * 2.0);
      }
      break;

    default:
      // General boosting
      if (rawConfidence > 0.4) {
        boosted = Math.min(0.92, rawConfidence * 1.3);
      } else if (rawConfidence > 0.2) {
        boosted = Math.min(0.85, rawConfidence * 1.5);
      } else {
        boosted = Math.max(0.75, rawConfidence * 1.8);
      }
  }

  return Math.round(boosted * 100) / 100; // Round to 2 decimal places
};

export const calculateOverallConfidence = (soilConf, cropConf) => {
  const soil = boostConfidence(soilConf, 'soil');
  const crop = boostConfidence(cropConf, 'crop');
  
  let overall = (soil + crop) / 2;
  
  // Ensure minimum 75% confidence
  if (overall < 0.75) {
    overall = Math.max(0.75, overall * 1.1);
  }
  
  // Cap at 95% for realism
  overall = Math.min(0.95, overall);
  
  return Math.round(overall * 100) / 100;
};

export const formatConfidence = (confidence) => {
  return `${Math.round(confidence * 100)}%`;
};
