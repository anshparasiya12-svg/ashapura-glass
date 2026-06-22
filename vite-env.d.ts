@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 210 20% 98%;
    --foreground: 220 30% 10%;

    --card: 0 0% 100%;
    --card-foreground: 220 30% 10%;

    --popover: 0 0% 100%;
    --popover-foreground: 220 30% 10%;

    /* Primary: Teal 600 */
    --primary: 173 80% 25%;
    --primary-foreground: 0 0% 100%;

    /* Secondary: Teal 500 */
    --secondary: 171 77% 40%;
    --secondary-foreground: 0 0% 100%;

    --muted: 210 20% 94%;
    --muted-foreground: 220 15% 45%;

    --accent: 173 80% 95%;
    --accent-foreground: 173 80% 25%;

    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 173 80% 25%;

    --radius: 0.75rem;
  }

  .dark {
    --background: 220 30% 5%;
    --foreground: 210 20% 98%;

    --card: 220 30% 7%;
    --card-foreground: 210 20% 98%;

    --popover: 220 30% 7%;
    --popover-foreground: 210 20% 98%;

    --primary: 171 77% 40%;
    --primary-foreground: 0 0% 100%;

    --secondary: 173 80% 25%;
    --secondary-foreground: 0 0% 100%;

    --muted: 220 20% 15%;
    --muted-foreground: 210 15% 65%;

    --accent: 173 80% 15%;
    --accent-foreground: 171 77% 40%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 20% 98%;

    --border: 220 20% 15%;
    --input: 220 20% 15%;
    --ring: 171 77% 40%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background-image: radial-gradient(circle at top right, rgba(20,184,166,0.05) 0%, transparent 40%),
                      radial-gradient(circle at bottom left, rgba(15,118,110,0.05) 0%, transparent 40%);
    background-attachment: fixed;
  }
}

@layer components {
  .input {
    @apply w-full border border-input rounded-md px-3 py-2 text-sm bg-card text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all;
  }
  
  .glass-input {
    @apply w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all;
  }
}

@media print {
  body {
    background: none !important;
    background-color: white !important;
    color: black !important;
  }
  
  .no-print {
    display: none !important;
  }
  
  /* Force cards to be solid white when printing to PDF to avoid transparent layering issues */
  .print-mode, .print-mode * {
    color: black !important;
  }
  
  .print-mode .bg-card {
    background-color: white !important;
    border: 1px solid #e2e8f0 !important;
  }
  
  .print-mode svg {
    background-color: white !important;
  }
}

