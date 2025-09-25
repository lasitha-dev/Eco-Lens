/**
 * Sustainability Calculator Utility
 * Calculates real-time sustainability scores based on product metrics
 */

// Packaging type scoring weights
const PACKAGING_SCORES = {
  'minimal': 100,
  'paper': 80,
  'biodegradable': 90,
  'plastic': 20,
};

// Manufacturing process scoring weights
const MANUFACTURING_SCORES = {
  'sustainable': 100,
  'renewable-energy': 85,
  'conventional': 40,
};

// Score calculation weights (must sum to 100%)
const SCORE_WEIGHTS = {
  materialsScore: 0.25,        // 25%
  carbonFootprint: 0.20,       // 20% (inverse relationship)
  packagingType: 0.15,         // 15%
  manufacturingProcess: 0.15,  // 15%
  productLifespan: 0.10,       // 10%
  recyclablePercentage: 0.10,  // 10%
  biodegradablePercentage: 0.05, // 5%
};

// Grade thresholds
const GRADE_THRESHOLDS = {
  A: 85,
  B: 70,
  C: 55,
  D: 40,
  E: 25,
  F: 0,
};

/**
 * Calculate sustainability score based on eco metrics
 * @param {Object} ecoMetrics - The eco metrics object
 * @returns {number} Calculated sustainability score (0-100)
 */
export const calculateSustainabilityScore = (ecoMetrics) => {
  if (!ecoMetrics) return 0;

  const {
    materialsScore = 0,
    carbonFootprint = 0,
    packagingType = 'plastic',
    manufacturingProcess = 'conventional',
    productLifespan = 1,
    recyclablePercentage = 0,
    biodegradablePercentage = 0,
  } = ecoMetrics;

  // Materials score (0-100, higher is better)
  const materialsComponent = Math.min(100, Math.max(0, materialsScore)) * SCORE_WEIGHTS.materialsScore;

  // Carbon footprint (inverse relationship - lower is better)
  // Normalize carbon footprint: 0kg = 100 points, 10kg+ = 0 points
  const carbonScore = Math.max(0, 100 - (carbonFootprint * 10));
  const carbonComponent = carbonScore * SCORE_WEIGHTS.carbonFootprint;

  // Packaging type score
  const packagingScore = PACKAGING_SCORES[packagingType] || PACKAGING_SCORES.plastic;
  const packagingComponent = packagingScore * SCORE_WEIGHTS.packagingType;

  // Manufacturing process score
  const manufacturingScore = MANUFACTURING_SCORES[manufacturingProcess] || MANUFACTURING_SCORES.conventional;
  const manufacturingComponent = manufacturingScore * SCORE_WEIGHTS.manufacturingProcess;

  // Product lifespan (normalize to 0-100 scale, max at 120 months = 10 years)
  const lifespanScore = Math.min(100, (productLifespan / 120) * 100);
  const lifespanComponent = lifespanScore * SCORE_WEIGHTS.productLifespan;

  // Recyclable percentage (0-100)
  const recyclableComponent = Math.min(100, Math.max(0, recyclablePercentage)) * SCORE_WEIGHTS.recyclablePercentage;

  // Biodegradable percentage (0-100)
  const biodegradableComponent = Math.min(100, Math.max(0, biodegradablePercentage)) * SCORE_WEIGHTS.biodegradablePercentage;

  // Calculate total score
  const totalScore = 
    materialsComponent +
    carbonComponent +
    packagingComponent +
    manufacturingComponent +
    lifespanComponent +
    recyclableComponent +
    biodegradableComponent;

  return Math.round(Math.min(100, Math.max(0, totalScore)));
};

/**
 * Calculate sustainability grade based on score
 * @param {number} score - Sustainability score (0-100)
 * @returns {string} Grade (A-F)
 */
export const calculateSustainabilityGrade = (score) => {
  if (score >= GRADE_THRESHOLDS.A) return 'A';
  if (score >= GRADE_THRESHOLDS.B) return 'B';
  if (score >= GRADE_THRESHOLDS.C) return 'C';
  if (score >= GRADE_THRESHOLDS.D) return 'D';
  if (score >= GRADE_THRESHOLDS.E) return 'E';
  return 'F';
};

/**
 * Get color for sustainability grade
 * @param {string} grade - Sustainability grade (A-F)
 * @returns {string} Color hex code
 */
export const getGradeColor = (grade) => {
  const gradeColors = {
    'A': '#4CAF50',  // Green
    'B': '#8BC34A',  // Light Green
    'C': '#CDDC39',  // Lime
    'D': '#FFEB3B',  // Yellow
    'E': '#FF9800',  // Orange
    'F': '#F44336',  // Red
  };
  return gradeColors[grade] || '#757575';
};

/**
 * Get description for sustainability grade
 * @param {string} grade - Sustainability grade (A-F)
 * @returns {string} Grade description
 */
export const getGradeDescription = (grade) => {
  const descriptions = {
    'A': 'Excellent eco-friendly choice',
    'B': 'Very good environmental impact',
    'C': 'Moderate environmental impact',
    'D': 'Below average sustainability',
    'E': 'Poor environmental choice',
    'F': 'Very poor sustainability',
  };
  return descriptions[grade] || 'Unknown';
};

/**
 * Get detailed score breakdown
 * @param {Object} ecoMetrics - The eco metrics object
 * @returns {Object} Detailed breakdown of score components
 */
export const getScoreBreakdown = (ecoMetrics) => {
  if (!ecoMetrics) return {};

  const {
    materialsScore = 0,
    carbonFootprint = 0,
    packagingType = 'plastic',
    manufacturingProcess = 'conventional',
    productLifespan = 1,
    recyclablePercentage = 0,
    biodegradablePercentage = 0,
  } = ecoMetrics;

  const materialsComponent = Math.min(100, Math.max(0, materialsScore)) * SCORE_WEIGHTS.materialsScore;
  const carbonScore = Math.max(0, 100 - (carbonFootprint * 10));
  const carbonComponent = carbonScore * SCORE_WEIGHTS.carbonFootprint;
  const packagingScore = PACKAGING_SCORES[packagingType] || PACKAGING_SCORES.plastic;
  const packagingComponent = packagingScore * SCORE_WEIGHTS.packagingType;
  const manufacturingScore = MANUFACTURING_SCORES[manufacturingProcess] || MANUFACTURING_SCORES.conventional;
  const manufacturingComponent = manufacturingScore * SCORE_WEIGHTS.manufacturingProcess;
  const lifespanScore = Math.min(100, (productLifespan / 120) * 100);
  const lifespanComponent = lifespanScore * SCORE_WEIGHTS.productLifespan;
  const recyclableComponent = Math.min(100, Math.max(0, recyclablePercentage)) * SCORE_WEIGHTS.recyclablePercentage;
  const biodegradableComponent = Math.min(100, Math.max(0, biodegradablePercentage)) * SCORE_WEIGHTS.biodegradablePercentage;

  return {
    materials: {
      score: Math.round(materialsComponent),
      percentage: Math.round(materialsScore),
      weight: SCORE_WEIGHTS.materialsScore * 100,
    },
    carbon: {
      score: Math.round(carbonComponent),
      value: carbonFootprint,
      normalizedScore: Math.round(carbonScore),
      weight: SCORE_WEIGHTS.carbonFootprint * 100,
    },
    packaging: {
      score: Math.round(packagingComponent),
      type: packagingType,
      baseScore: packagingScore,
      weight: SCORE_WEIGHTS.packagingType * 100,
    },
    manufacturing: {
      score: Math.round(manufacturingComponent),
      process: manufacturingProcess,
      baseScore: manufacturingScore,
      weight: SCORE_WEIGHTS.manufacturingProcess * 100,
    },
    lifespan: {
      score: Math.round(lifespanComponent),
      months: productLifespan,
      normalizedScore: Math.round(lifespanScore),
      weight: SCORE_WEIGHTS.productLifespan * 100,
    },
    recyclable: {
      score: Math.round(recyclableComponent),
      percentage: recyclablePercentage,
      weight: SCORE_WEIGHTS.recyclablePercentage * 100,
    },
    biodegradable: {
      score: Math.round(biodegradableComponent),
      percentage: biodegradablePercentage,
      weight: SCORE_WEIGHTS.biodegradablePercentage * 100,
    },
  };
};

/**
 * Validate eco metrics data
 * @param {Object} ecoMetrics - The eco metrics object to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateEcoMetrics = (ecoMetrics) => {
  const errors = [];

  if (!ecoMetrics) {
    return { isValid: false, errors: ['Eco metrics object is required'] };
  }

  // Materials score validation
  if (typeof ecoMetrics.materialsScore !== 'number' || 
      ecoMetrics.materialsScore < 0 || 
      ecoMetrics.materialsScore > 100) {
    errors.push('Materials score must be a number between 0 and 100');
  }

  // Carbon footprint validation
  if (typeof ecoMetrics.carbonFootprint !== 'number' || 
      ecoMetrics.carbonFootprint < 0) {
    errors.push('Carbon footprint must be a positive number');
  }

  // Packaging type validation
  if (!Object.keys(PACKAGING_SCORES).includes(ecoMetrics.packagingType)) {
    errors.push('Invalid packaging type. Must be one of: minimal, paper, biodegradable, plastic');
  }

  // Manufacturing process validation
  if (!Object.keys(MANUFACTURING_SCORES).includes(ecoMetrics.manufacturingProcess)) {
    errors.push('Invalid manufacturing process. Must be one of: sustainable, renewable-energy, conventional');
  }

  // Product lifespan validation
  if (typeof ecoMetrics.productLifespan !== 'number' || 
      ecoMetrics.productLifespan <= 0) {
    errors.push('Product lifespan must be a positive number (in months)');
  }

  // Recyclable percentage validation
  if (typeof ecoMetrics.recyclablePercentage !== 'number' || 
      ecoMetrics.recyclablePercentage < 0 || 
      ecoMetrics.recyclablePercentage > 100) {
    errors.push('Recyclable percentage must be a number between 0 and 100');
  }

  // Biodegradable percentage validation
  if (typeof ecoMetrics.biodegradablePercentage !== 'number' || 
      ecoMetrics.biodegradablePercentage < 0 || 
      ecoMetrics.biodegradablePercentage > 100) {
    errors.push('Biodegradable percentage must be a number between 0 and 100');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  calculateSustainabilityScore,
  calculateSustainabilityGrade,
  getGradeColor,
  getGradeDescription,
  getScoreBreakdown,
  validateEcoMetrics,
  PACKAGING_SCORES,
  MANUFACTURING_SCORES,
  SCORE_WEIGHTS,
  GRADE_THRESHOLDS,
};
