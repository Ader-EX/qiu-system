"use client"
import {useState, useCallback} from 'react';
import toast from 'react-hot-toast';

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

    const printInvoice = useCallback(async (
        invoiceService: InvoiceService,
        invoiceId: number,
        invoiceNumber: string,
        options: PrintInvoiceOptions = {}
    ) => {
        const {
            autoClose = true,
            printDelay = 250,
            customStyles = '',
            windowFeatures = 'width=800,height=600,scrollbars=yes,resizable=yes'
        } = options;

        setIsPrinting(true);

        try {
            const html = await invoiceService.getInvoice(invoiceId);

            if (!html || html.trim().length === 0) {
                toast.error("Invoice data tidak ditemukan");
                return;
            }

            // Open in new window
            const printWindow = window.open('', '_blank', windowFeatures);

            if (!printWindow) {
                toast.error("Gagal membuka invoice. Pastikan popup tidak diblokir.");
                return;
            }

            const defaultStyles = `
                @media screen {
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px; 
                        line-height: 1.6;
                        color: #333;
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
                    .print-header {
                        display: block;
                        text-align: center;
                        margin-bottom: 20px;
                        padding-bottom: 10px;
                        border-bottom: 2px solid #333;
                    }
                    .print-button {
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        cursor: pointer;
                        border-radius: 4px;
                        font-size: 14px;
                        margin: 10px 5px;
                    }
                    .print-button:hover {
                        background: #0056b3;
                    }
                    .close-button {
                        background: #6c757d;
                    }
                    .close-button:hover {
                        background: #545b62;
                    }
                }
                
                @media print {
                    body { margin: 0; }
                    @page { 
                        margin: 0.5in; 
                        size: A4;
                    }
                    .print-controls, .no-print {
                        display: none !important;
                    }
                    .print-header {
                        border-bottom: 2px solid #333;
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
                    <div class="print-controls no-print" style="text-align: center; margin-bottom: 20px;">
                        <button class="print-button" onclick="window.print()">
                            🖨️ Print Invoice
                        </button>
                        <button class="print-button close-button" onclick="window.close()">
                            ✖️ Close
                        </button>
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
    }, []);

    // Simple print function (original behavior)
    const simplePrint = useCallback(async (
        invoiceService: InvoiceService,
        invoiceId: number,
        invoiceNumber: string
    ) => {
        return printInvoice(invoiceService, invoiceId, invoiceNumber, {
            autoClose: true,
            printDelay: 250
        });
    }, [printInvoice]);

    // Advanced print with custom options
    const advancedPrint = useCallback(async (
        invoiceService: InvoiceService,
        invoiceId: number,
        invoiceNumber: string,
        options: PrintInvoiceOptions
    ) => {
        return printInvoice(invoiceService, invoiceId, invoiceNumber, options);
    }, [printInvoice]);

    // Preview only (no auto-print)
    const previewInvoice = useCallback(async (
        invoiceService: InvoiceService,
        invoiceId: number,
        invoiceNumber: string
    ) => {
        return printInvoice(invoiceService, invoiceId, invoiceNumber, {
            autoClose: false,
            printDelay: 0
        });
    }, [printInvoice]);

    return {
        printInvoice,
        simplePrint,
        advancedPrint,
        previewInvoice,
        isPrinting
    };
};