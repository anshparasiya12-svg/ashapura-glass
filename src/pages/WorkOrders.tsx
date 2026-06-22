import { Hammer } from "lucide-react";
const WorkOrders = () => (
  <div>
    <h1 className="text-2xl font-bold text-foreground mb-6">Work Orders</h1>
    <div className="bg-card border border-border rounded-xl p-12 text-center">
      <Hammer className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
      <p className="font-medium text-foreground">Production tracking arriving in Phase 4</p>
      <p className="text-sm text-muted-foreground mt-1">Pending → Cutting → Grinding → Polishing → Tempering → Ready → Delivered</p>
    </div>
  </div>
);
export default WorkOrders;
