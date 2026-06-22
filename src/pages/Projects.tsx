import { FolderKanban } from "lucide-react";
const Projects = () => (
  <div>
    <h1 className="text-2xl font-bold text-foreground mb-6">Projects</h1>
    <div className="bg-card border border-border rounded-xl p-12 text-center">
      <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
      <p className="font-medium text-foreground">Project hub arriving in Phase 6</p>
      <p className="text-sm text-muted-foreground mt-1">Customer · Quotations · Invoices · Work Orders · Photos · Deliveries</p>
    </div>
  </div>
);
export default Projects;
