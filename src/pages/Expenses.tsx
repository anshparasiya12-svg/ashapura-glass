import { Receipt } from "lucide-react";
const Expenses = () => (
  <div>
    <h1 className="text-2xl font-bold text-foreground mb-6">Expenses</h1>
    <div className="bg-card border border-border rounded-xl p-12 text-center">
      <Receipt className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
      <p className="font-medium text-foreground">Expense tracking arriving in Phase 5</p>
    </div>
  </div>
);
export default Expenses;
