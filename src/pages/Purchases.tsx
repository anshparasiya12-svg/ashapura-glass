import { ShoppingCart } from "lucide-react";
const Purchases = () => (
  <div>
    <h1 className="text-2xl font-bold text-foreground mb-6">Purchases</h1>
    <div className="bg-card border border-border rounded-xl p-12 text-center">
      <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
      <p className="font-medium text-foreground">Purchase management arriving in Phase 4</p>
    </div>
  </div>
);
export default Purchases;
