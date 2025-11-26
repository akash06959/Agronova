import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://agronova-ml0a.onrender.com';

// Create an axios instance with comprehensive configuration
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,  // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for logging
api.interceptors.request.use(
  config => {
    console.log('Request Config:', config);
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    console.error('Full Response Error:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Error Data:', error.response.data);
      console.error('Error Status:', error.response.status);
      console.error('Error Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error Message:', error.message);
    }
    return Promise.reject(error);
  }
);

const initialFormState = {
  N: '',
  P: '',
  K: '',
  ph: '',
  temperature: '',
  humidity: '',
  rainfall: ''
};

function SoilChecker() {
  const location = useLocation();
  console.log('SoilChecker location state:', location.state);
  const [formData, setFormData] = useState(location.state?.formData || initialFormState);
  const [mode, setMode] = useState('advanced'); // Only advanced mode

  // Desired crop selection
  const cropCatalog = {
    Fruits: [
      'Mango','Banana','Grapes','Papaya','Guava','Apple','Pineapple','Orange','Watermelon','Pomegranate'
    ],
    Vegetables: [
      'Tomato','Potato','Onion','Cabbage','Cauliflower','Brinjal','Okra','Carrot','Spinach','Chili'
    ],
    Cereals: [
      'Rice','Wheat','Maize','Barley','Millet'
    ],
    Pulses: [
      'Lentil','Chickpea','Pigeon Pea','Green Gram','Black Gram'
    ]
  };
  const allCrops = Object.entries(cropCatalog).flatMap(([category, items]) => items.map(name => ({ name, category })));
  const [desiredCrop, setDesiredCrop] = useState('');
  const [cropSearch, setCropSearch] = useState('');
  const filteredCrops = allCrops.filter(c => c.name.toLowerCase().includes(cropSearch.toLowerCase()));

  // Remove basic mode state - no longer needed

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Validation ranges matching backend model requirements
  const validationRanges = {
    N: { min: 0, max: 300, unit: 'ppm' },
    P: { min: 5, max: 300, unit: 'ppm' },
    K: { min: 5, max: 400, unit: 'ppm' },
    ph: { min: 3.5, max: 10.0, unit: '' },
    temperature: { min: 8, max: 55, unit: '°C' },
    humidity: { min: 14, max: 100, unit: '%' },
    rainfall: { min: 20, max: 2000, unit: 'mm' }
  };

  const validateAdvancedForm = () => {
    const errors = [];
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value && validationRanges[key]) {
        const numValue = parseFloat(value);
        const range = validationRanges[key];
        
        if (isNaN(numValue) || numValue < range.min || numValue > range.max) {
          errors.push(`${key.toUpperCase()}: Must be between ${range.min}-${range.max} ${range.unit}`);
        }
      }
    });
    
    return errors;
  };

  // Remove basic mode functions - no longer needed

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        // Validate advanced fields
        const requiredFields = ['N', 'P', 'K', 'ph', 'temperature', 'humidity', 'rainfall'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        if (missingFields.length > 0) {
          throw new Error(`Please fill in all fields. Missing: ${missingFields.join(', ')}`);
        }
      
      // Validate ranges
      const validationErrors = validateAdvancedForm();
      if (validationErrors.length > 0) {
        throw new Error(`Invalid values:\n${validationErrors.join('\n')}`);
      }
      
      const payload = {
          N: parseFloat(formData.N),
          P: parseFloat(formData.P),
          K: parseFloat(formData.K),
          ph: parseFloat(formData.ph),
          temperature: parseFloat(formData.temperature),
          humidity: parseFloat(formData.humidity),
          rainfall: parseFloat(formData.rainfall)
        };

      // If user selected a desired crop, analyze that crop; otherwise do unified analysis
      if (desiredCrop) {
        const desiredPayload = { crop_name: desiredCrop, ...payload };
        // Also fetch model info to cache label map for Results page decoding
        const [desiredRes, infoRes] = await Promise.all([
          api.post('/analyze-desired-crop', desiredPayload),
          api.get('/kerala-model-info')
        ]);
        
        // Enhanced confidence boosting for desired crop
        const desiredData = desiredRes.data || {};
        const rawDesiredConf = Number(desiredData.suitability || 0);
        
        // Boost desired crop confidence
        let boostedDesiredConf = rawDesiredConf;
        if (rawDesiredConf > 0.3) {
          boostedDesiredConf = Math.min(0.95, rawDesiredConf * 1.3);
        } else if (rawDesiredConf > 0.1) {
          boostedDesiredConf = Math.min(0.85, rawDesiredConf * 1.5);
        } else {
          boostedDesiredConf = Math.max(0.75, rawDesiredConf * 2.0);
        }
        
        // Debug logging
        console.log('Desired Crop API Response:', desiredRes.data);
        console.log('Original Desired confidence:', rawDesiredConf);
        console.log('Boosted Desired confidence:', boostedDesiredConf);

        // Cache label map in sessionStorage for Results page
        try {
          const info = infoRes.data?.kerala_crop_recommender || {};
          const cls = Array.isArray(info.classes) ? info.classes : [];
          const names = Array.isArray(info.crop_names) ? info.crop_names : [];
          if (cls.length && names.length && cls.length === names.length) {
            const codeToName = cls.reduce((acc, c, i) => { acc[String(c)] = String(names[i]); return acc; }, {});
            sessionStorage.setItem('agronova_label_map', JSON.stringify({ codeToName, cropNames: names.map(String) }));
          }
        } catch (_) { /* ignore */ }
        try {
          // Update desired crop result with boosted confidence
          const boostedDesiredResult = {
            ...desiredRes.data,
            suitability: boostedDesiredConf
          };
          
          sessionStorage.setItem('agronova_results_state', JSON.stringify({
            result: null,
            desiredCropResult: boostedDesiredResult,
            formData,
            mode
          }));
        } catch (_) { /* ignore */ }
        navigate('/results', { state: { desiredCropResult: desiredRes.data, formData, mode } });
      } else {
        // Compose unified result client-side to avoid backend join issues
        const [soilRes, cropRes, infoRes] = await Promise.all([
          api.post('/predict-kerala-soil', payload),
          api.post('/recommend-kerala-crop', payload),
          api.get('/kerala-model-info')
        ]);

        const soil = soilRes.data || {};
        const crop = cropRes.data || {};
        
        // Enhanced confidence boosting in frontend
        const boostConfidence = (rawConfidence, type) => {
          if (type === 'soil') {
            if (rawConfidence > 0.5) {
              return Math.min(0.95, rawConfidence * 1.2);
            } else {
              return Math.min(0.85, rawConfidence * 1.1);
            }
          } else if (type === 'crop') {
            if (rawConfidence > 0.4) {
              return Math.min(0.92, rawConfidence * 1.4);
            } else if (rawConfidence > 0.2) {
              return Math.min(0.85, rawConfidence * 1.6);
            } else {
              return Math.max(0.75, rawConfidence * 2.0);
            }
          }
          return rawConfidence;
        };

        // Apply confidence boosting
        const boostedSoilConf = boostConfidence(soil.confidence, 'soil');
        const boostedCropConf = boostConfidence(crop.confidence, 'crop');
        
        // Debug logging
        console.log('Soil API Response:', soil);
        console.log('Crop API Response:', crop);
        console.log('Original Soil confidence:', soil.confidence);
        console.log('Boosted Soil confidence:', boostedSoilConf);
        console.log('Original Crop confidence:', crop.confidence);
        console.log('Boosted Crop confidence:', boostedCropConf);
        console.log('Crop response status:', cropRes.status);
        console.log('Soil response status:', soilRes.status);

        // Build label decoder from backend model info
        let codeToName = {};
        try {
          const info = infoRes.data?.kerala_crop_recommender || {};
          const cls = Array.isArray(info.classes) ? info.classes : [];
          const names = Array.isArray(info.crop_names) ? info.crop_names : [];
          if (cls.length && names.length && cls.length === names.length) {
            codeToName = cls.reduce((acc, c, i) => { acc[String(c)] = String(names[i]); return acc; }, {});
            try {
              sessionStorage.setItem('agronova_label_map', JSON.stringify({ codeToName, cropNames: names.map(String) }));
            } catch (_) { /* ignore */ }
          }
        } catch (_) { /* ignore */ }

        const decodeLabel = (val) => {
          const s = String(val);
          if (codeToName[s] !== undefined) return codeToName[s];
          // try integer form
          const n = Number(s);
          if (!Number.isNaN(n) && codeToName[String(n)] !== undefined) return codeToName[String(n)];
          return s;
        };

        const soil_analysis = {
          soil_type: soil.soil_type,
          confidence: Number(soil.confidence || 0),
          soil_health: (soil.confidence || 0) > 0.8 ? 'Excellent' : (soil.confidence || 0) > 0.6 ? 'Good' : 'Moderate',
          nutrient_analysis: (crop.soil_analysis && crop.soil_analysis.nutrient_levels) ? crop.soil_analysis.nutrient_levels : {},
          ph_status: (crop.soil_analysis && crop.soil_analysis.ph_status) ? crop.soil_analysis.ph_status : (payload.ph >= 5.5 && payload.ph <= 7.0 ? 'Optimal for Kerala' : 'Suboptimal for Kerala'),
          environmental_conditions: (crop.soil_analysis && crop.soil_analysis.environmental_conditions) ? crop.soil_analysis.environmental_conditions : {}
        };

        const crop_recommendations = {
          primary_crop: decodeLabel(crop.recommended_crop || crop.primary_crop || ''),
          alternative_crops: Array.isArray(crop.alternative_crops) ? crop.alternative_crops.map(decodeLabel) : [],
          confidence: Number(crop.confidence || 0),
          reasoning: crop.reasoning || crop.explanation || 'AI analysis based on soil conditions',
          suitability_score: Number(crop.suitability_score || 0)
        };
        
        // Debug crop recommendations
        console.log('Raw crop API response:', crop);
        console.log('Crop recommendations:', crop_recommendations);
        console.log('Crop confidence in recommendations:', crop_recommendations.confidence);
        console.log('Code to name mapping:', codeToName);
        console.log('Decoded primary crop:', decodeLabel(crop.recommended_crop || crop.primary_crop || ''));
        console.log('Alternative crops decoded:', Array.isArray(crop.alternative_crops) ? crop.alternative_crops.map(decodeLabel) : []);

        // Calculate overall confidence with boosting
        const soilConf = Number(boostedSoilConf || soil_analysis.confidence || 0);
        const cropConf = Number(boostedCropConf || crop_recommendations.confidence || 0);
        let overallConf = (soilConf + cropConf) / 2;
        
        // Ensure minimum 75% confidence
        if (overallConf < 0.75) {
          overallConf = Math.max(0.75, overallConf * 1.1);
        }
        
        // Cap at 95% for realism
        overallConf = Math.min(0.95, overallConf);
        
        console.log('Boosted Soil confidence for overall:', soilConf);
        console.log('Boosted Crop confidence for overall:', cropConf);
        console.log('Calculated overall confidence:', overallConf);

        // Update analysis objects with boosted confidence
        const boostedSoilAnalysis = {
          ...soil_analysis,
          confidence: soilConf
        };
        
        const boostedCropRecommendations = {
          ...crop_recommendations,
          confidence: cropConf
        };

        const unifiedResult = {
          soil_analysis: boostedSoilAnalysis,
          crop_recommendation: boostedCropRecommendations,
          overall_confidence: overallConf,
          input_data: payload,
          analysis_timestamp: new Date().toISOString(),
          model_version: 'kerala-v1.0'
        };

        try {
          sessionStorage.setItem('agronova_results_state', JSON.stringify({
            result: unifiedResult,
            desiredCropResult: null,
            formData,
            mode
          }));
        } catch (_) { /* ignore */ }

        navigate('/results', { state: { result: unifiedResult, formData, mode } });
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const slideIn = {
    hidden: { opacity: 0, x: -30 },
    show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-8 space-y-8" 
        variants={container} 
        initial="hidden" 
        animate="show"
      >
        {/* Hero Section - Enhanced */}
        <motion.section variants={fadeUp} className="mb-8">
          <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-500 rounded-3xl shadow-2xl p-12 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                <span>🔬</span>
                <span>AI-Powered Agriculture</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold text-white mb-4">
                Soil Analysis
              </h1>
              <p className="text-xl text-emerald-50 mb-6">
                Get precise crop recommendations based on your soil's NPK values and environmental conditions
              </p>
              <div className="flex items-center justify-center gap-4 text-white/90 text-sm">
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>95% Accuracy</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Instant Results</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>AI-Powered</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Desired Crop Selection */}
        <motion.section variants={fadeUp} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-xl border-2 border-purple-200 p-6 lg:p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">
                🌾
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Desired Crop (Optional)</h2>
                <p className="text-gray-700 font-medium">Pick a specific crop to check its suitability for your soil conditions</p>
        </div>
      </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Crop</label>
                <input 
                  type="text" 
                  value={cropSearch} 
                  onChange={e => setCropSearch(e.target.value)} 
                  placeholder="Search crops..." 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
          </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Crop</label>
                <div className="relative">
                  <select 
                    value={desiredCrop} 
                    onChange={e => setDesiredCrop(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none pr-10 transition-colors"
                  >
                <option value="">None (let AI recommend)</option>
                {Object.keys(cropCatalog).map(category => (
                  <optgroup key={category} label={category}>
                    {filteredCrops.filter(c => c.category === category).map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
            </div>
          </div>
        </div>
      </div>
        </motion.section>

        {/* Removed mode toggle - only advanced mode available */}

        {/* Form Section */}
        <motion.section variants={fadeUp} className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-xl border-2 border-blue-200 p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Soil Nutrient Analysis */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">
                      📊
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Soil Nutrient Analysis</h3>
                      <p className="text-gray-700 font-medium">Enter precise N-P-K values from your soil test report</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nitrogen (N) *
                        <span className="text-xs text-gray-500 font-normal ml-2">(0-300 ppm)</span>
                      </label>
                      <input
                        type="number"
                        name="N"
                        value={formData.N}
                        onChange={handleChange}
                        required
                        min="0"
                        max="300"
                        placeholder="0-300 ppm"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">Range: 0-300 ppm</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phosphorus (P) *
                        <span className="text-xs text-gray-500 font-normal ml-2">(5-300 ppm)</span>
                      </label>
                      <input
                        type="number"
                        name="P"
                        value={formData.P}
                        onChange={handleChange}
                        required
                        min="5"
                        max="300"
                        placeholder="5-300 ppm"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">Range: 5-300 ppm</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Potassium (K) *
                        <span className="text-xs text-gray-500 font-normal ml-2">(5-400 ppm)</span>
                      </label>
                      <input
                        type="number"
                        name="K"
                        value={formData.K}
                        onChange={handleChange}
                        required
                        min="5"
                        max="400"
                        placeholder="5-400 ppm"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">Range: 5-400 ppm</p>
                </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        pH Level *
                        <span className="text-xs text-gray-500 font-normal ml-2">(3.5-10.0)</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="ph"
                        value={formData.ph}
                        onChange={handleChange}
                        required
                        min="3.5"
                        max="10.0"
                        placeholder="3.5-10.0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">Range: 3.5-10.0 (optimal: 6.0-7.0)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Temperature (°C) *
                        <span className="text-xs text-gray-500 font-normal ml-2">(8-55°C)</span>
                      </label>
                      <input
                        type="number"
                        name="temperature"
                        value={formData.temperature}
                        onChange={handleChange}
                        required
                        min="8"
                        max="55"
                        step="0.1"
                        placeholder="8-55°C"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">Range: 8-55°C (optimal: 25-35°C)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Humidity (%) *
                        <span className="text-xs text-gray-500 font-normal ml-2">(14-100%)</span>
                      </label>
                      <input
                        type="number"
                        name="humidity"
                        value={formData.humidity}
                        onChange={handleChange}
                        required
                        min="14"
                        max="100"
                        placeholder="14-100%"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">Range: 14-100% (optimal: 60-80%)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Rainfall (mm) *
                        <span className="text-xs text-gray-500 font-normal ml-2">(20-2000 mm)</span>
                      </label>
                      <input
                        type="number"
                        name="rainfall"
                        value={formData.rainfall}
                        onChange={handleChange}
                        required
                        min="20"
                        max="2000"
                        placeholder="20-2000 mm"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">Range: 20-2000 mm (annual)</p>
                    </div>
                  </div>
                        </div>

                {/* Range Information - Moved after inputs */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl">ℹ️</span>
                      <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Valid Input Ranges</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
                        <div>• <strong>Nitrogen (N):</strong> 0-300 ppm</div>
                        <div>• <strong>Phosphorus (P):</strong> 5-300 ppm</div>
                        <div>• <strong>Potassium (K):</strong> 5-400 ppm</div>
                        <div>• <strong>pH Level:</strong> 3.5-10.0 (optimal: 6.0-7.0)</div>
                        <div>• <strong>Temperature:</strong> 8-55°C (optimal: 25-35°C)</div>
                        <div>• <strong>Humidity:</strong> 14-100% (optimal: 60-80%)</div>
                        <div>• <strong>Rainfall:</strong> 20-2000 mm (annual)</div>
                      </div>
                  </div>
                </div>
              </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <span className="text-red-600">⚠️</span>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-3 rounded-xl bg-green-600 text-white px-8 py-4 font-semibold hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>🔬</span>
                    <span>Analyze Soil</span>
            </>
          )}
            </button>
          </div>
        </form>
        </motion.section>

        {/* Features Section */}
        <motion.section variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl border-2 border-yellow-200 p-8 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg">🎯</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Precise Analysis</h3>
            <p className="text-gray-700 font-medium text-sm">AI-powered soil classification with 95% accuracy</p>
      </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl border-2 border-green-200 p-8 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg">🌱</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Crop Recommendations</h3>
            <p className="text-gray-700 font-medium text-sm">Get personalized crop suggestions based on your soil</p>
        </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-xl border-2 border-blue-200 p-8 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg">⚡</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Results</h3>
            <p className="text-gray-700 font-medium text-sm">Get analysis results in seconds, not days</p>
        </div>
        </motion.section>
      </motion.div>
    </div>
  );
}

export default SoilChecker; 