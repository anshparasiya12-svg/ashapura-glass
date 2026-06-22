import { Link } from "react-router-dom";
import { Home, ArrowLeft, Zap } from "lucide-react";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
    {/* Background blobs */}
    <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl animate-blob" />
    <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-blob" style={{ animationDelay: "3s" }} />

    <div className="text-center px-4 animate-fade-in-up relative z-10">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg">
          <Zap className="h-7 w-7 text-white" />
        </div>
      </div>

      {/* 404 */}
      <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-teal-500 to-emerald-400 mb-2 font-display">
        404
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2 font-display">Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div className="flex items-center justify-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-teal-500/25 transition-all duration-200"
        >
          <Home className="h-4 w-4" /> Go Home
        </Link>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 bg-card border border-border text-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-muted transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
      </div>
    </div>
  </div>
);

export default NotFound;
