import { Link } from "react-router-dom";

const IndexMinimal = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#040458] via-[#040458] to-[#faa51a]">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <div className="flex justify-center mb-8">
            <img 
              src="/Otic icon@2x.png" 
              alt="Otic Business Logo" 
              className="h-20 w-20"
            />
          </div>
          
          <h1 className="text-5xl font-bold mb-6">
            Welcome to <span className="text-[#faa51a]">Otic Business</span>
          </h1>
          
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Your complete business management solution for inventory, sales, and accounting.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signin" 
              className="bg-[#faa51a] hover:bg-[#faa51a]/90 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              Sign In
            </Link>
            
            <Link 
              to="/signup" 
              className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors border border-white/30"
            >
              Sign Up
            </Link>
            
            <Link 
              to="/simple-test" 
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              Test Page
            </Link>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">POS System</h3>
              <p className="text-white/80">Complete point of sale with barcode scanning and receipt generation.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Inventory Management</h3>
              <p className="text-white/80">Track stock levels, manage suppliers, and get low stock alerts.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Accounting Integration</h3>
              <p className="text-white/80">Seamless integration with QuickBooks and other accounting software.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexMinimal;
