import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Página no encontrada</p>
        <a 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-lg shadow-elegant hover:shadow-glow transition-all transform hover:scale-105"
        >
          Volver al Inicio
        </a>
      </div>
    </div>
  );
};

export default NotFound;
