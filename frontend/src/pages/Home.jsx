import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

// Local images from the home folder (using public paths)
const HERO_IMG = "/images/home/home-bg.jpg";
const IMG_SOIL = "/images/home/soil classifier.jpg";
const IMG_CROPS = "/images/home/crop recomdation.jpg";
const IMG_COMMERCE = "/images/home/marketplace.jpg";
const IMG_FARMING = "/images/home/home-bg.jpg"; // Using home-bg as fallback for farming

export default function Home() {
const { user } = useAuth();

const container = {
hidden: { opacity: 0 },
show: {
opacity: 1,
transition: { staggerChildren: 0.15, delayChildren: 0.1 }
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
        className="max-w-7xl mx-auto px-4 py-8 space-y-16" 
        variants={container} 
        initial="hidden" 
        animate="show"
      >
        {/* Hero Section */}
<motion.section
variants={fadeUp}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl border border-green-200"
        >
          <div className="grid lg:grid-cols-2 gap-0 min-h-[500px]">
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <motion.div
                variants={slideIn}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  <span>🌱</span>
                  <span>AI-Powered Agriculture</span>
                </div>

                <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
                  {user ? (
                    <>
                      Welcome back,
                      <span className="text-green-600 block">{user.username}!</span>
                    </>
                  ) : (
                    <>
                      Welcome to
                      <span className="text-green-600 block">AgroNova</span>
                    </>
                  )}
                </h1>

                <p className="text-lg text-gray-700 max-w-2xl leading-relaxed">
                  AI-powered soil analysis and smart crop recommendations, integrated with a comprehensive seed marketplace for sustainable farming success.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/soil" 
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 text-white px-6 py-3 font-semibold hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <span>🔬</span>
<span>Start Soil Analysis</span>
                  </Link>
                  <Link 
                    to="/ecommerce" 
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-green-600 px-6 py-3 font-semibold hover:bg-green-50 border-2 border-green-200 hover:border-green-300 transition-all duration-300"
                  >
                    <span>🛒</span>
                    <span>Browse Products</span>
</Link>
                </div>
</motion.div>
</div>

            <div className="relative min-h-[300px] lg:min-h-full">
              <img 
                src={HERO_IMG} 
                alt="Agricultural fields and farming" 
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-green-50/80 to-transparent" />
              
              {/* Floating Stats */}
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="text-xs text-gray-600">AI Accuracy</div>
                </div>
              </div>
</div>
</div>
</motion.section>

        {/* Features Section */}
        <motion.section 
          id="features" 
          variants={fadeUp}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AgroNova?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform combines cutting-edge AI technology with practical farming solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                title: "AI Soil Classifier", 
                desc: "Advanced machine learning analyzes your soil's pH, NPK levels, and climate conditions to provide accurate soil classification with confidence scores.", 
                img: IMG_SOIL,
                icon: "🔬",
                features: ["pH Analysis", "NPK Testing", "Climate Integration"]
              },
              { 
                title: "Smart Crop Recommendations", 
                desc: "Get personalized crop suggestions based on your soil type, climate, and farming goals with detailed growing guides and alternatives.", 
                img: IMG_CROPS,
                icon: "🌾",
                features: ["Personalized Suggestions", "Growing Guides", "Alternative Options"]
              },
              { 
                title: "Integrated Marketplace", 
                desc: "Access a curated selection of high-quality seeds and agricultural products, filtered by soil suitability and recommended crops.", 
                img: IMG_COMMERCE,
                icon: "🛒",
                features: ["Quality Seeds", "Soil-Filtered", "Expert Curation"]
              },
            ].map((feature, index) => (
<motion.div
                key={feature.title}
variants={fadeUp}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02, 
                  transition: { type: "spring", stiffness: 300, damping: 20 } 
                }}
                className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={feature.img} 
                    alt={feature.title}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute top-4 left-4 text-3xl">{feature.icon}</div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{feature.desc}</p>
                  
                  <div className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-green-600">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        <span>{item}</span>
                      </div>
                    ))}
</div>
</div>
</motion.div>
))}
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section 
          variants={fadeUp}
          className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 lg:p-12 text-white"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Farmers Helped" },
              { number: "95%", label: "Accuracy Rate" },
              { number: "50+", label: "Crop Varieties" },
              { number: "24/7", label: "AI Support" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="space-y-2"
              >
                <div className="text-3xl lg:text-4xl font-bold">{stat.number}</div>
                <div className="text-green-100 text-sm lg:text-base">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          variants={fadeUp} 
          className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100"
        >
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Ready to Transform Your Farming?
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join thousands of farmers who are already using AI-powered insights to maximize their crop yields and farming efficiency.
              </p>
</div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/soil" 
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 text-white px-8 py-4 font-semibold hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span>🚀</span>
                <span>Start Your Analysis</span>
              </Link>
              <Link 
                to="/products" 
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 text-gray-800 px-8 py-4 font-semibold hover:bg-gray-200 border border-gray-200 transition-all duration-300"
              >
                <span>🌱</span>
                <span>Browse Seeds</span>
</Link>
            </div>
          </div>
</motion.section>
</motion.div>
    </div>
);
}