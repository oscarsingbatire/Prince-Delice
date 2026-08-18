import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    // If it's a DOM removeChild error (often caused by browser extensions like Google Translate), auto reload once
    if (error.message && (error.message.includes("removeChild") || error.message.includes("Node"))) {
      const reloadedKey = "prince_delice_reload_count";
      const count = parseInt(sessionStorage.getItem(reloadedKey) || "0", 10);
      if (count < 2) {
        sessionStorage.setItem(reloadedKey, (count + 1).toString());
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-[#FDFBF7]">
          <div className="flex flex-col items-center w-full max-w-xl p-8 bg-white rounded-2xl shadow-xl border border-[#EADBC8] text-center">
            <div className="w-16 h-16 bg-[#FEF3C7] rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={32} className="text-[#D97706]" />
            </div>

            <h2 className="text-2xl font-serif font-bold text-[#1E3F20] mb-2">Prince Délice - Actualisation requise</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Une interférence d'affichage (souvent due à une extension de traduction du navigateur mobile) a nécessité une pause. Veuillez actualiser la page pour reprendre vos achats en toute fluidité.
            </p>

            <div className="p-3 w-full rounded bg-[#FDFBF7] border border-[#EADBC8] overflow-auto mb-6 text-left max-h-32">
              <pre className="text-xs text-muted-foreground whitespace-break-spaces">
                {this.state.error?.message || "Erreur de synchronisation DOM"}
              </pre>
            </div>

            <button
              onClick={() => {
                sessionStorage.clear();
                window.location.href = "/";
              }}
              className={cn(
                "flex items-center justify-center gap-2 px-6 py-3 rounded-xl w-full",
                "bg-[#1E3F20] text-white font-medium",
                "hover:bg-[#152e17] transition cursor-pointer shadow-md"
              )}
            >
              <RotateCcw size={18} />
              Actualiser la boutique Prince Délice
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
