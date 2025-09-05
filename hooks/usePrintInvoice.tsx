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
            display: flex;
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
        <div class="print-header no-print">
            <h1 class="invoice-title">Invoice</h1>
            <div class="button-group">
                <button class="print-button" onclick="window.print()">
                    📥 Download
                </button>
                <button class="print-button close-button" onclick="window.close()">
                    ✖️ Close
                </button>
            </div>
        </div>
        
        <div class="invoice-content">
            ${html}
        </div>
        
        <script>
            // Auto-print functionality
            let autoPrint = ${autoClose};
            let printDelay = ${printDelay};
            
            window.addEventListener('load', function() {
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
    isPrinting,
  };
};
