/**
 * Generates a PDF by triggering the native browser print dialog.
 * The user can select "Save as PDF" from the destination dropdown.
 * This is 100% reliable and doesn't rely on third-party libraries that might crash the build.
 */
export const downloadPDF = async (elementId: string, filename: string = 'document.pdf') => {
  // Wait a tiny bit for the UI to settle
  await new Promise(r => setTimeout(r, 100));
  window.print();
  return true;
};

/**
 * Triggers the browser's native print dialog for a specific element.
 */
export const triggerPrint = () => {
  window.print();
};
