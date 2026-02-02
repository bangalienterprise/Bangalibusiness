import React from 'react';

const ReceiptPreview = ({ settings, transaction = null }) => {
    if (!settings) return null;

    const { general_info, invoice, sales_tax } = settings;
    const currency = sales_tax?.currency_symbol || '৳';
    
    // Sample Data if no transaction provided
    const items = transaction?.items || [
        { name: "Sample Product 1", quantity: 2, price: 500, total: 1000 },
        { name: "Sample Product 2", quantity: 1, price: 1200, total: 1200 },
    ];
    
    const subtotal = transaction?.subtotal || 2200;
    const discount = transaction?.discount || 0;
    const tax = transaction?.tax || 0;
    const total = transaction?.total || 2200;
    const date = transaction?.date || new Date().toLocaleString();
    const id = transaction?.id || `${invoice?.invoice_prefix || 'INV-'}${invoice?.invoice_start || 1000}`;

    const paperWidth = invoice?.paper_size === 'Thermal' ? '300px' : '100%';
    const fontSize = invoice?.paper_size === 'Thermal' ? '12px' : '14px';

    return (
        <div className="bg-white text-black p-4 shadow-md mx-auto" style={{ width: paperWidth, fontSize }}>
            {/* Header */}
            <div className="text-center mb-4">
                {invoice?.show_logo && general_info?.logo_url && (
                    <img src={general_info.logo_url} alt="Logo" className="h-12 mx-auto mb-2" />
                )}
                <h2 className="font-bold text-lg uppercase">{general_info?.store_name}</h2>
                {invoice?.show_address && <p className="text-xs text-gray-600">{general_info?.address}</p>}
                {invoice?.show_phone && <p className="text-xs text-gray-600">{general_info?.phone}</p>}
                {invoice?.show_email && <p className="text-xs text-gray-600">{general_info?.email}</p>}
                <div className="border-b-2 border-dashed border-gray-300 my-2"></div>
                <p className="text-xs text-gray-500">{invoice?.header_text}</p>
            </div>

            {/* Meta */}
            <div className="flex justify-between text-xs mb-2">
                <span>Inv: {id}</span>
                <span>{date}</span>
            </div>

            {/* Items */}
            <table className="w-full text-xs mb-4">
                <thead>
                    <tr className="border-b border-gray-300">
                        <th className="text-left py-1">Item</th>
                        <th className="text-center py-1">Qty</th>
                        <th className="text-right py-1">Price</th>
                        <th className="text-right py-1">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, i) => (
                        <tr key={i} className="border-b border-gray-100">
                            <td className="py-1">{item.name}</td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-right">{currency}{item.price}</td>
                            <td className="text-right">{currency}{item.total || (item.price * item.quantity)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="space-y-1 text-xs border-t border-gray-300 pt-2">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{currency}{subtotal}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between text-gray-600">
                        <span>Discount:</span>
                        <span>-{currency}{discount}</span>
                    </div>
                )}
                {settings.sales_tax?.enable_tax && (
                    <div className="flex justify-between text-gray-600">
                        <span>Tax ({settings.sales_tax.tax_rate}%):</span>
                        <span>{currency}{tax.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-sm border-t border-gray-300 pt-1 mt-1">
                    <span>Total:</span>
                    <span>{currency}{total}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 text-xs text-gray-500">
                <p>{invoice?.footer_text}</p>
                <p className="mt-2 text-[10px]">Powered by Bangali Enterprise</p>
            </div>
        </div>
    );
};

export default ReceiptPreview;