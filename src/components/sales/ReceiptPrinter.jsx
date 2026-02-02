import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Printer, Share2 } from 'lucide-react';
import ReceiptPreview from './ReceiptPreview';

const ReceiptPrinter = ({ settings, transaction, onClose, open }) => {
    const printRef = useRef();

    const handlePrint = () => {
        const content = printRef.current;
        const printWindow = window.open('', '', 'width=600,height=800');
        
        // Inject styles
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Receipt</title>
                    <style>
                        body { font-family: 'Courier New', Courier, monospace; }
                        .receipt-container { width: 100%; max-width: 400px; margin: 0 auto; }
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .font-bold { font-weight: bold; }
                        .text-xs { font-size: 12px; }
                        .w-full { width: 100%; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { padding: 4px 0; }
                        .border-b { border-bottom: 1px solid #ddd; }
                        .border-dashed { border-bottom: 1px dashed #999; }
                        .my-2 { margin: 8px 0; }
                        .mb-4 { margin-bottom: 16px; }
                        .text-gray-500 { color: #6b7280; }
                    </style>
                </head>
                <body>
                    <div class="receipt-container">
                        ${content.innerHTML}
                    </div>
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
            if (onClose) onClose();
        }, 250);
    };

    // Enhance Receipt Preview to show commission if needed (though usually receipt to CUSTOMER doesn't show commission, 
    // but the task asks: "Display commission calculation in receipt body". I will assume this is for internal record or user wants it.)
    // Actually, normally commission is hidden from customer. But as per "Task 10: Display commission in receipt", I will add it.
    
    // We need to inject commission info into the receipt preview component. 
    // Since ReceiptPreview might not handle it directly, we can wrap or modify it. 
    // Best approach: modify ReceiptPreview if we could, but here I'll just rely on what is passed or append it.
    
    // Note: I cannot modify ReceiptPreview in this same response block as I didn't plan for it in the file list, 
    // but I can modify the `transaction` object passed to it to include commission info if ReceiptPreview supports arbitrary fields 
    // or if I rewrite ReceiptPreview entirely here. 
    // Actually, ReceiptPreview is provided in codebase but not large, I can overwrite it or just assume I edited it.
    // The prompt explicitly said "Update ReceiptPrinter.jsx". I will add the commission display logic inside ReceiptPreview if possible 
    // OR create a custom preview here if ReceiptPreview is too rigid.
    // However, looking at ReceiptPreview provided code (from previous turn), it displays `items`, `subtotal`, `total`, etc.
    // It doesn't have a slot for commission.
    
    // I will rewrite ReceiptPrinter to *include* a modified version of the preview content or 
    // I will just modify the ReceiptPreview component file as well. I'll modify ReceiptPreview too.

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-white text-black">
                <DialogHeader>
                    <DialogTitle>Receipt Preview</DialogTitle>
                </DialogHeader>
                
                <div className="bg-gray-100 p-4 rounded-md overflow-y-auto max-h-[60vh] flex justify-center">
                    <div ref={printRef} className="bg-white p-4 shadow-sm w-full">
                         <ReceiptPreview settings={settings} transaction={transaction} />
                         {/* Inject Commission Info for Print if requested */}
                         {transaction?.commission_amount > 0 && (
                             <div className="mt-4 pt-2 border-t border-dashed border-gray-300 text-xs text-center text-gray-500">
                                 Internal: Commission {settings?.sales_tax?.currency_symbol}{parseFloat(transaction.commission_amount).toFixed(2)} ({transaction.commission_percentage}%)
                             </div>
                         )}
                    </div>
                </div>

                <DialogFooter className="flex sm:justify-between gap-2">
                   <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1 border-slate-300">
                            <Share2 className="h-4 w-4" /> Email
                        </Button>
                   </div>
                   <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white gap-1">
                        <Printer className="h-4 w-4" /> Print
                   </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ReceiptPrinter;