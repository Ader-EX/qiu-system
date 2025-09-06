"use client";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";

interface PrintInvoiceOptions {
  autoClose?: boolean;
  printDelay?: number;
  customStyles?: string;
  windowFeatures?: string;
}

interface InvoiceService {
  getInvoice: (id: number) => Promise<string>;
}

export const usePrintInvoice = () => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const printInvoice = useCallback(
    async (
      invoiceService: InvoiceService,
      invoiceId: number,
      invoiceNumber: string,
      options: PrintInvoiceOptions = {}
    ) => {
      const {
        autoClose = true,
        printDelay = 250,
        customStyles = "",
        windowFeatures = "width=800,height=600,scrollbars=yes,resizable=yes",
      } = options;

      setIsPrinting(true);

      try {
        const html = await invoiceService.getInvoice(invoiceId);

        if (!html || html.trim().length === 0) {
          toast.error("Invoice data tidak ditemukan");
          return;
        }

        // Open in new window
        const printWindow = window.open("", "_blank", windowFeatures);

        if (!printWindow) {
          toast.error("Gagal membuka invoice. Pastikan popup tidak diblokir.");
          return;
        }

        const defaultStyles = `
    @media screen {
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
        }
        h1, h2, h3 { color: #333; }
        table { 
            border-collapse: collapse; 
            width: 100%; 
            margin: 15px 0;
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 12px 8px; 
            text-align: left; 
        }
        th { 
            background-color: #f8f9fa; 
            font-weight: bold; 
        }
        .invoice-content {
            background: white;
            margin: 0;
            padding: 20px;
        }
        .print-header {

            display: hidden;
            justify-content: space-between;
            align-items: center;
            background: white;
            padding: 16px 24px;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 0;
        }
        .invoice-title {
            font-size: 20px;
            font-weight: 500;
            color: #111827;
            margin: 0;
        }
        .button-group {
            display: flex;
            gap: 8px;
        }
        .print-button {
            background: #f97316;
            color: white;
            border: none;
            padding: 8px 16px;
            cursor: pointer;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .print-button:hover {
            background: #ea580c;
        }
        .close-button {
            background: #6b7280;
            border: 1px solid #d1d5db;
        }
        .close-button:hover {
            background: #4b5563;
        }
    }
    
    @media print {
        body { 
            margin: 0; 
            width: 210mm !important;
            max-width: 210mm !important;
            background: white !important;
        }
        @page { 
            margin: 10mm 15mm; 
            size: A4 portrait;
        }
        .print-controls, .no-print, .print-header {
            display: none !important;
        }
        .invoice-content {
            margin: 0 !important;
            padding: 0 !important;
        }
        table {
            page-break-inside: avoid;
            width: 100% !important;
            table-layout: fixed;
        }
        * {
            box-sizing: border-box;
        }
        /* Hide URL and date from print header/footer */
        @page {
            margin-top: 0;
            margin-bottom: 0;
        }
    }
`;

        const fullHTML = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoiceNumber}</title>
        <style>
            ${defaultStyles}
            ${customStyles}
        </style>
    </head>
    <body>
        <div class="invoice-content">
            ${html}
        </div>
        
        <script>
            // Auto-print functionality
            let autoPrint = ${autoClose};
            let printDelay = ${printDelay};
            
            window.addEventListener('load', function() {
                // Set a proper document title
                document.title = 'Invoice ${invoiceNumber}';
                
                if (autoPrint) {
                    setTimeout(function() {
                        window.print();
                        
                        // Close after printing (with delay for print dialog)
                        setTimeout(function() {
                            window.close();
                        }, 1000);
                    }, printDelay);
                }
            });
            
            // Handle print dialog close
            window.addEventListener('afterprint', function() {
                if (autoPrint) {
                    setTimeout(function() {
                        window.close();
                    }, 500);
                }
            });
            
            // Additional print settings to hide headers/footers
            window.addEventListener('beforeprint', function() {
                document.title = '';
            });
        </script>
    </body>
    </html>
`;

        printWindow.document.write(fullHTML);
        printWindow.document.close();

        toast.success("Invoice berhasil dibuka untuk dicetak!");
      } catch (error) {
        console.error("Failed to print invoice:", error);
        toast.error("Gagal membuka invoice untuk dicetak.");
      } finally {
        setIsPrinting(false);
      }
    },
    []
  );

  // NEW: Download invoice as PDF/HTML
  const downloadInvoice = useCallback(
    async (
      invoiceService: InvoiceService,
      invoiceId: number,
      invoiceNumber: string,
      format: "pdf" | "html" = "pdf"
    ) => {
      setIsDownloading(true);

      try {
        const html = await invoiceService.getInvoice(invoiceId);

        if (!html || html.trim().length === 0) {
          toast.error("Invoice data tidak ditemukan");
          return;
        }

        if (format === "html") {
          // Download as HTML file
          const printStyles = `
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                line-height: 1.6;
                color: #333;
              }
              table { 
                border-collapse: collapse; 
                width: 100%; 
                margin: 15px 0;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left; 
              }
              th { 
                background-color: #f2f2f2; 
                font-weight: bold; 
              }
              @media print {
                body { margin: 0; }
                @page { 
                  margin: 15mm; 
                  size: A4 portrait;
                }
              }
            </style>
          `;

          const fullHTML = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoiceNumber}</title>
    ${printStyles}
</head>
<body>
    ${html}
</body>
</html>`;

          const blob = new Blob([fullHTML], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `invoice-${invoiceNumber}.html`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          toast.success("Invoice berhasil didownload sebagai HTML!");
        } else {
          // Open in new window with auto-print for PDF download
          const printWindow = window.open("", "_blank", "width=800,height=600");

          if (!printWindow) {
            toast.error(
              "Gagal membuka invoice. Pastikan popup tidak diblokir."
            );
            return;
          }

          const printStyles = `
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                line-height: 1.6;
                color: #333;
              }
              table { 
                border-collapse: collapse; 
                width: 100%; 
                margin: 15px 0;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left; 
              }
              th { 
                background-color: #f2f2f2; 
                font-weight: bold; 
              }
              @media print {
                body { margin: 0; }
                @page { 
                  margin: 15mm; 
                  size: A4 portrait;
                }
              }
              .download-header {
                background: #f8f9fa;
                padding: 15px;
                text-align: center;
                border-bottom: 1px solid #ddd;
                margin-bottom: 20px;
              }
              @media print {
                .download-header { display: none; }
              }
            </style>
          `;

          const fullHTML = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoiceNumber}</title>
    ${printStyles}
</head>
<body>
    ${html}
    <script>
      // Set proper title and auto-trigger print dialog
      document.title = 'Invoice ${invoiceNumber}';
      
      setTimeout(function() {
        // Clear title before printing to avoid showing in header
        document.title = '';
        window.print();
      }, 500);
    </script>
</body>
</html>`;

          printWindow.document.write(fullHTML);
          printWindow.document.close();

          toast.success("Invoice terbuka untuk download PDF!");
        }
      } catch (error) {
        console.error("Failed to download invoice:", error);
        toast.error("Gagal download invoice.");
      } finally {
        setIsDownloading(false);
      }
    },
    []
  );

  // Simple print function (original behavior)
  const simplePrint = useCallback(
    async (
      invoiceService: InvoiceService,
      invoiceId: number,
      invoiceNumber: string
    ) => {
      return printInvoice(invoiceService, invoiceId, invoiceNumber, {
        autoClose: true,
        printDelay: 250,
      });
    },
    [printInvoice]
  );

  // Advanced print with custom options
  const advancedPrint = useCallback(
    async (
      invoiceService: InvoiceService,
      invoiceId: number,
      invoiceNumber: string,
      options: PrintInvoiceOptions
    ) => {
      return printInvoice(invoiceService, invoiceId, invoiceNumber, options);
    },
    [printInvoice]
  );

  // Preview only (no auto-print)
  const previewInvoice = useCallback(
    async (
      invoiceService: InvoiceService,
      invoiceId: number,
      invoiceNumber: string
    ) => {
      return printInvoice(invoiceService, invoiceId, invoiceNumber, {
        autoClose: false,
        printDelay: 0,
      });
    },
    [printInvoice]
  );

  return {
    printInvoice,
    simplePrint,
    advancedPrint,
    previewInvoice,
    downloadInvoice,
    isPrinting,
    isDownloading,
  };
};
