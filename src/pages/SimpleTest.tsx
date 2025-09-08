const SimpleTest = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#040458] mb-4">Simple Test Page</h1>
        <p className="text-lg text-gray-600 mb-8">This page should load immediately without any authentication.</p>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ If you can see this, the basic routing is working!
        </div>
      </div>
    </div>
  )
}

export default SimpleTest

