import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [currentStep, setCurrentStep] = useState('browse'); // browse, detail, upload, processing, results
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [processedImages, setProcessedImages] = useState([]);

  // Mock catalog data with the images from vision expert
  const catalogs = [
    {
      id: 1,
      title: "Oversized T-Shirts",
      description: "Casual oversized tee photoshoot styles",
      category: "casual",
      images: [
        "https://images.pexels.com/photos/7657856/pexels-photo-7657856.jpeg",
        "https://images.pexels.com/photos/7659342/pexels-photo-7659342.jpeg",
        "https://images.pexels.com/photos/7277960/pexels-photo-7277960.jpeg"
      ],
      thumbnail: "https://images.pexels.com/photos/7657856/pexels-photo-7657856.jpeg"
    },
    {
      id: 2,
      title: "Hoodies & Streetwear",
      description: "Urban streetwear photoshoot collection",
      category: "streetwear",
      images: [
        "https://images.pexels.com/photos/7945745/pexels-photo-7945745.jpeg",
        "https://images.pexels.com/photos/30623846/pexels-photo-30623846.jpeg",
        "https://images.unsplash.com/photo-1512977141980-8cc662e38a0c"
      ],
      thumbnail: "https://images.pexels.com/photos/7945745/pexels-photo-7945745.jpeg"
    },
    {
      id: 3,
      title: "Dark Streetwear",
      description: "Edgy dark style photoshoot collection",
      category: "streetwear",
      images: [
        "https://images.pexels.com/photos/32275955/pexels-photo-32275955.jpeg",
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b",
        "https://images.unsplash.com/photo-1514866726862-0f081731e63f"
      ],
      thumbnail: "https://images.pexels.com/photos/32275955/pexels-photo-32275955.jpeg"
    },
    {
      id: 4,
      title: "Casual Collection",
      description: "Relaxed casual wear photoshoot styles",
      category: "casual",
      images: [
        "https://images.pexels.com/photos/7277960/pexels-photo-7277960.jpeg",
        "https://images.unsplash.com/photo-1512977141980-8cc662e38a0c",
        "https://images.pexels.com/photos/7659342/pexels-photo-7659342.jpeg"
      ],
      thumbnail: "https://images.pexels.com/photos/7277960/pexels-photo-7277960.jpeg"
    }
  ];

  const categories = ["all", "casual", "streetwear"];
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredCatalogs = selectedCategory === "all" 
    ? catalogs 
    : catalogs.filter(cat => cat.category === selectedCategory);

  const handleCatalogSelect = (catalog) => {
    setSelectedCatalog(catalog);
    setCurrentStep('detail');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const startProcessing = () => {
    setCurrentStep('processing');
    
    // Mock processing time
    setTimeout(() => {
      // Generate mock processed images (using the catalog images as "processed" results)
      const mockProcessedImages = selectedCatalog.images.map((img, index) => ({
        id: index,
        url: img,
        downloadUrl: img // In real app, this would be the processed image
      }));
      setProcessedImages(mockProcessedImages);
      setCurrentStep('results');
    }, 3000);
  };

  const resetApp = () => {
    setCurrentStep('browse');
    setSelectedCatalog(null);
    setUploadedImage(null);
    setProcessedImages([]);
    setSelectedCategory('all');
  };

  const downloadImage = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai-photoshoot-result.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Catalog Browse View
  if (currentStep === 'browse') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        {/* Header */}
        <div className="container mx-auto px-6 py-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              AI Photoshoot Studio
            </h1>
            <p className="text-xl text-purple-200 max-w-2xl mx-auto">
              Transform your products with professional AI-powered photoshoot styles. Choose a catalog that matches your vision.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-full p-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full mx-1 transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-purple-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {filteredCatalogs.map((catalog) => (
              <div
                key={catalog.id}
                className="group cursor-pointer"
                onClick={() => handleCatalogSelect(catalog)}
              >
                <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-white/20">
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={catalog.thumbnail}
                      alt={catalog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white mb-2">{catalog.title}</h3>
                      <p className="text-purple-200 text-sm">{catalog.description}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-300 text-sm font-medium">
                        {catalog.images.length} Styles Available
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCatalogSelect(catalog);
                        }}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:shadow-lg"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Catalog Detail View (when a catalog is selected)
  if (currentStep === 'catalog' && selectedCatalog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="container mx-auto px-6 py-8">
          {/* Back Button */}
          <button
            onClick={() => setSelectedCatalog(null)}
            className="mb-6 text-purple-300 hover:text-white transition-colors duration-300 flex items-center"
          >
            ← Back to Catalogs
          </button>

          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">{selectedCatalog.title}</h2>
            <p className="text-xl text-purple-200">{selectedCatalog.description}</p>
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-6xl mx-auto">
            {selectedCatalog.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Style ${index + 1}`}
                  className="w-full h-80 object-cover rounded-xl hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>

          {/* Next Button */}
          <div className="text-center">
            <button
              onClick={() => setCurrentStep('upload')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-12 py-4 rounded-full text-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              Continue with this Catalog →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Upload View
  if (currentStep === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="container mx-auto px-6 py-8">
          {/* Back Button */}
          <button
            onClick={() => setCurrentStep('catalog')}
            className="mb-6 text-purple-300 hover:text-white transition-colors duration-300 flex items-center"
          >
            ← Back to Catalog
          </button>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Upload Your Product</h2>
              <p className="text-xl text-purple-200">
                Upload a high-quality image of your product for the AI photoshoot
              </p>
            </div>

            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-purple-400 rounded-2xl p-12 text-center hover:border-purple-300 transition-colors duration-300 bg-white/5 backdrop-blur-md"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {uploadedImage ? (
                <div className="relative">
                  <img
                    src={uploadedImage}
                    alt="Uploaded product"
                    className="max-w-md max-h-80 mx-auto rounded-xl shadow-lg"
                  />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors duration-300"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-6xl text-purple-300 mb-4">📷</div>
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    Drop your product image here
                  </h3>
                  <p className="text-purple-200 mb-6">
                    or click to browse files
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:shadow-lg inline-block"
                  >
                    Choose File
                  </label>
                </div>
              )}
            </div>

            {/* Submit Button */}
            {uploadedImage && (
              <div className="text-center mt-8">
                <button
                  onClick={startProcessing}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-12 py-4 rounded-full text-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  Start AI Photoshoot ✨
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Processing View
  if (currentStep === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto">
              <div className="absolute inset-0 border-4 border-purple-300 rounded-full animate-spin border-t-transparent"></div>
              <div className="absolute inset-2 border-4 border-pink-300 rounded-full animate-spin border-t-transparent" style={{animationDirection: 'reverse'}}></div>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Creating Magic ✨</h2>
          <p className="text-xl text-purple-200 mb-8">
            Our AI is processing your product with the selected catalog...
          </p>
          <div className="max-w-md mx-auto bg-white/10 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Results View
  if (currentStep === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Your AI Photoshoot Results ✨</h2>
            <p className="text-xl text-purple-200">
              Download your professional product images below
            </p>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
            {processedImages.map((image) => (
              <div key={image.id} className="group relative">
                <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden hover:bg-white/20 transition-all duration-300">
                  <img
                    src={image.url}
                    alt={`Result ${image.id + 1}`}
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={() => downloadImage(image.downloadUrl)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:shadow-lg"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="text-center space-x-4">
            <button
              onClick={resetApp}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:shadow-lg"
            >
              Try Another Photoshoot
            </button>
            <button
              onClick={() => {
                processedImages.forEach(image => downloadImage(image.downloadUrl));
              }}
              className="bg-white/20 backdrop-blur-md text-white px-8 py-3 rounded-full hover:bg-white/30 transition-all duration-300 border border-white/30"
            >
              Download All
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default App;