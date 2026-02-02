
import Papa from 'papaparse';
import { productService } from '@/services/productService';

export const exportProductsToCSV = (products) => {
    const csvData = products.map(p => ({
        SKU: p.sku,
        Name: p.name,
        Category: p.category?.name || 'N/A',
        Unit: p.unit_type,
        'Cost Price': p.buying_price,
        'Selling Price': p.selling_price,
        Stock: p.stock_qty,
        'Min Alert': p.min_stock_alert
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_export_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const importProductsFromCSV = (file, businessId) => {
    return new Promise((resolve) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const rows = results.data;
                const success = [];
                const failed = [];
                const errors = [];

                if (rows.length === 0) {
                    resolve({ success: 0, failed: 0, errors: ["Empty CSV file"] });
                    return;
                }

                // Map CSV fields to internal schema
                const productsToCreate = [];
                
                rows.forEach((row, index) => {
                    // Basic validation
                    if (!row.Name || !row.SKU) {
                        failed.push({ row: index + 1, reason: "Missing Name or SKU" });
                        return;
                    }

                    productsToCreate.push({
                        name: row.Name,
                        sku: row.SKU,
                        unit_type: row.Unit || 'pcs',
                        buying_price: parseFloat(row['Cost Price']) || 0,
                        selling_price: parseFloat(row['Selling Price']) || 0,
                        stock_qty: parseInt(row.Stock) || 0,
                        min_stock_alert: parseInt(row['Min Alert']) || 5,
                        // Note: Category matching by name would be complex, assuming default or handling separately
                        // For MVP CSV import, we might skip category linkage or require exact ID
                    });
                });

                if (productsToCreate.length > 0) {
                    try {
                        await productService.bulkCreateProducts(businessId, productsToCreate);
                        resolve({ success: productsToCreate.length, failed: failed.length, errors });
                    } catch (err) {
                        resolve({ success: 0, failed: rows.length, errors: [err.message] });
                    }
                } else {
                    resolve({ success: 0, failed: failed.length, errors });
                }
            },
            error: (err) => {
                resolve({ success: 0, failed: 0, errors: [err.message] });
            }
        });
    });
};
