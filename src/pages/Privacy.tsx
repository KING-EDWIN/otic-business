import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to terms page since both contain the same content
    navigate('/terms', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Terms & Conditions...</p>
      </div>
    </div>
  );
};

export default Privacy;
