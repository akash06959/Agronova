import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const navState = location.state;
    if (navState && navState.result) {
      setResult(navState.result);
      try { 
        sessionStorage.setItem('agronova_results_state', JSON.stringify(navState)); 
      } catch (_) {}
      setHydrated(true);
      return;
    }
    try {
      const raw = sessionStorage.getItem('agronova_results_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        setResult(parsed.result);
      }
    } catch (_) {}
    setHydrated(true);
  }, [location.state]);

  const handleBack = () => {
    navigate("/soil");
  };

  const handleCropClick = (cropName) => {
    const cropKey = String(cropName || '').toLowerCase().replace(/\s+/g, "-");
    navigate(`/products?category=${encodeURIComponent(cropKey)}`);
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading analysis results...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Analysis Results Found</h2>
          <p className="text-gray-600 mb-8">Please run a soil analysis first.</p>
            <button 
              onClick={handleBack} 
            className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700"
            >
              Run Analysis
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 -mx-4 -my-4 px-4 py-8">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-green-200/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      <motion.div 
        className="max-w-7xl mx-auto space-y-8 relative" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-6 py-3 rounded-full text-base font-bold mb-4 shadow-lg shadow-green-200/50">
            <span className="text-2xl">✅</span>
            <span>Analysis Complete</span>
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Soil Analysis Results
          </h1>
          <p className="text-gray-600 text-lg">Detailed insights for your soil health</p>
        </motion.div>

        {/* Back Button */}
        <div className="flex justify-center">
          <motion.button 
            onClick={handleBack} 
            className="px-6 py-3 rounded-xl bg-white text-gray-700 text-base font-semibold border-2 border-gray-200 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>←</span> Back to Analysis
          </motion.button>
        </div>

        {/* Crop Recommendations at Top */}
          <motion.div 
          className="bg-white rounded-2xl shadow-xl border-2 border-green-100 p-8 hover:shadow-2xl hover:border-green-300 transition-all duration-300 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <span className="text-2xl">🌾</span>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900">Suitable Crops</h3>
          </div>
          <div className="space-y-5">
            {/* Primary Crop */}
            <motion.div 
              className="bg-gradient-to-r from-emerald-100 via-green-100 to-teal-100 rounded-2xl p-6 border-2 border-green-200 shadow-lg relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/30 to-transparent rounded-full blur-2xl"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-3xl">⭐</span> <span className="capitalize">{result.crop_recommendation?.primary_crop || 'No recommendation'}</span>
                      </h4>
                    <p className="text-base text-gray-600 font-semibold">Primary Recommendation</p>
                    </div>
                <div className="text-right">
                  <span className="px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg font-bold block mb-3 shadow-lg">
                    {Number((result.crop_recommendation?.confidence || 0) * 100).toFixed(1)}%
                      </span>
                  <motion.button 
                    onClick={() => handleCropClick(result.crop_recommendation?.primary_crop)} 
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-base font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Shop Seeds →
                  </motion.button>
        </div>
      </div>
            </motion.div>

              {/* Alternative Crops */}
            {(result.crop_recommendation?.alternative_crops || []).length > 0 && (
                <div>
                <h4 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🔀</span>
                  Alternative Options
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {result.crop_recommendation.alternative_crops.map((crop, index) => (
                    <motion.div 
                        key={index} 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:shadow-lg transition-all"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <span className="text-base font-bold text-gray-900 capitalize">{crop}</span>
                      <motion.button 
                        onClick={() => handleCropClick(crop)} 
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold hover:from-green-600 hover:to-emerald-600 shadow-md"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        Shop
                      </motion.button>
                    </motion.div>
                    ))}
          </div>
        </div>
              )}
            </div>
          </motion.div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Soil Analysis Card */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl border-2 border-green-100 p-8 hover:shadow-2xl hover:border-green-300 transition-all duration-300"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">Soil Analysis</h3>
            </div>
                  <div className="space-y-4">
              <motion.div 
                className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-base text-gray-800 font-bold flex items-center gap-2">
                  <span className="text-blue-500">📌</span>
                  Soil Type
                </span>
                <span className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold shadow-lg">
                  {result.soil_analysis?.soil_type || 'N/A'}
                </span>
              </motion.div>
              <motion.div 
                className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl hover:shadow-md transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-base text-gray-800 font-bold flex items-center gap-2">
                  <span className="text-green-500">💚</span>
                  Soil Health
                </span>
                <span className="px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold shadow-lg">
                  {result.soil_analysis?.soil_health || 'N/A'}
                </span>
              </motion.div>
              <motion.div 
                className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl hover:shadow-md transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-base text-gray-800 font-bold flex items-center gap-2">
                  <span className="text-purple-500">⚗️</span>
                  pH Status
                      </span>
                <span className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold shadow-lg">
                  {result.soil_analysis?.ph_status || 'N/A'}
                      </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Nutrient Values Card */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl border-2 border-green-100 p-8 hover:shadow-2xl hover:border-green-300 transition-all duration-300"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">Nutrient Values</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(result.soil_analysis?.nutrient_analysis || {}).length > 0 ? (
                Object.entries(result.soil_analysis.nutrient_analysis).map(([key, value], index) => (
                  <motion.div 
                    key={key} 
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 rounded-xl hover:shadow-md transition-all border border-green-100"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="text-base text-gray-800 font-bold uppercase flex items-center gap-2">
                      <span className="text-emerald-600">🌱</span>
                      {key}
                    </span>
                    <span className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold shadow-lg">
                      {String(value)}
                    </span>
                  </motion.div>
                ))
              ) : (
                <>
                  {result.input_data?.N && (
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-green-100 hover:shadow-md transition-all">
                      <span className="text-base text-gray-800 font-bold">Nitrogen (N)</span>
                      <span className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold shadow-lg">
                        {result.input_data.N}
                    </span>
            </div>
                  )}
                  {result.input_data?.P && (
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-green-100 hover:shadow-md transition-all">
                      <span className="text-base text-gray-800 font-bold">Phosphorus (P)</span>
                      <span className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold shadow-lg">
                        {result.input_data.P}
                        </span>
          </div>
                  )}
                  {result.input_data?.K && (
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-green-100 hover:shadow-md transition-all">
                      <span className="text-base text-gray-800 font-bold">Potassium (K)</span>
                      <span className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold shadow-lg">
                        {result.input_data.K}
                        </span>
                      </div>
                  )}
                </>
              )}
        </div>
          </motion.div>
        </div>

        {/* Confidence Summary */}
          <motion.div 
          className="bg-gradient-to-r from-green-100 via-emerald-50 to-teal-50 rounded-2xl border-2 border-green-200 p-8 shadow-xl relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
          <div className="absolute inset-0 bg-gradient-to-r from-green-200/20 to-emerald-200/20"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <span className="text-3xl">🎯</span>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-gray-800">Overall Confidence</span>
                <p className="text-gray-600 text-sm">Analysis Quality Score</p>
        </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white text-3xl font-black shadow-2xl animate-pulse">
                {Number((result.overall_confidence || 0) * 100).toFixed(1)}%
              </span>
            </div>
            </div>
          </motion.div>
    </motion.div>
    </div>
  );
}

