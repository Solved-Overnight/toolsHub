import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Trash2, GripVertical, Check } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import pdfMake from 'pdfmake/build/pdfmake';

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerAddress: string;
  items: {
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export function ProformaInvoice() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: '',
    date: '',
    customerName: '',
    customerAddress: '',
    items: [{ name: '', description: '', quantity: 0, unitPrice: 0 }],
  });

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadPdfFonts = async () => {
      const pdfFonts = await import('pdfmake/build/vfs_fonts');
      pdfMake.vfs = pdfFonts.vfs;
    };

    loadPdfFonts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceData({ ...invoiceData, [name]: value });
  };

  const handleAddItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { name: '', description: '', quantity: 0, unitPrice: 0 }],
    });
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...invoiceData.items];
    newItems[index][field] = value;
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = [...invoiceData.items];
    newItems.splice(index, 1);
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const handleGenerateInvoice = () => {
    generateInvoicePDF();
  };

  const handleClear = () => {
    // Implement clear form logic here
    console.log('Clearing form data');
  };

  const handleSave = () => {
    // Implement save logic here
    console.log('Saving invoice data');
  };

  const calculateTotalPrice = (item: { quantity: number; unitPrice: number }) => {
    return item.quantity * item.unitPrice;
  };

  const calculateTotalInvoicePrice = () => {
    return invoiceData.items.reduce((sum, item) => sum + calculateTotalPrice(item), 0);
  };

  const handleOnDragStart = (result: any) => {
    setDraggingIndex(result.source.index);
  };

  const handleOnDragEnd = (result: any) => {
    setDraggingIndex(null);
    if (!result.destination) return;

    const items = Array.from(invoiceData.items);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setInvoiceData({ ...invoiceData, items: items });
  };

  const generateInvoicePDF = () => {
    const documentDefinition: any = {
      content: [
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text: 'Your Company Name',
                  style: 'header',
                  alignment: 'center',
                  margin: [0, 20, 0, 10],
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
        {
          columns: [
            {
              stack: [
                {
                  image: 'logo', // Add your logo here
                  width: 100,
                  alignment: 'left',
                },
                { text: 'Your Company Address', style: 'subheader' },
                { text: 'Your Contact Details', style: 'subheader' },
              ],
            },
            {
              stack: [
                { text: 'PAGE', style: 'label' },
                { text: 'DATE', style: 'label' },
                { text: 'DATE OF EXPIRY', style: 'label' },
                { text: 'ESTIMATE NO.', style: 'label' },
                { text: 'CUSTOMER ID', style: 'label' },
              ],
              alignment: 'right',
            },
          ],
          margin: [0, 0, 0, 20],
        },
        {
          columns: [
            [
              { text: 'BILL TO', style: 'sectionHeader' },
              { text: `Contact Name: ${invoiceData.customerName}`, style: 'content' },
              { text: 'Client Company Name:', style: 'content' },
              { text: `Address: ${invoiceData.customerAddress}`, style: 'content' },
              { text: 'Phone:', style: 'content' },
              { text: 'Email:', style: 'content' },
            ],
            [
              { text: 'SHIP TO', style: 'sectionHeader' },
              { text: 'Name / Dept:', style: 'content' },
              { text: 'Client Company Name:', style: 'content' },
              { text: 'Address:', style: 'content' },
              { text: 'Phone:', style: 'content' },
            ],
          ],
          margin: [0, 0, 0, 20],
        },
        {
          text: 'SHIPMENT INFORMATION',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [
                { text: 'P.O. #:', style: 'content' },
                { text: 'Mode of Transportation:', style: 'content' },
                { text: 'Currency:', style: 'content' },
                { text: 'Carrier:', style: 'content' },
              ],
              [
                { text: 'Est. Ship Date:', style: 'content' },
                { text: 'Transportation Terms:', style: 'content' },
                { text: 'Number of Packages:', style: 'content' },
                { text: 'Est. Gross Weight:', style: 'content' },
              ],
            ],
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 20],
        },
        {
          text: 'ITEM DETAILS',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            headerRows: 1,
            widths: ['15%', '35%', '10%', '15%', '10%', '15%'],
            body: [
              [
                { text: 'ITEM PART #', style: 'tableHeader' },
                { text: 'DESCRIPTION', style: 'tableHeader' },
                { text: 'QTY', style: 'tableHeader' },
                { text: 'UNIT PRICE', style: 'tableHeader' },
                { text: 'SALES TAX', style: 'tableHeader' },
                { text: 'TOTAL', style: 'tableHeader' },
              ],
              ...invoiceData.items.map(item => [
                { text: item.name, style: 'content' },
                { text: item.description, style: 'content' },
                { text: item.quantity.toString(), style: 'content' },
                { text: item.unitPrice.toString(), style: 'content' },
                { text: '0.00', style: 'content' },
                { text: calculateTotalPrice(item).toFixed(2), style: 'content' },
              ]),
            ],
          },
          margin: [0, 0, 0, 20],
        },
        {
          text: 'SPECIAL NOTES, TERMS OF SALE',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10],
        },
        {
          text: '_________________________________________________________________________',
          style: 'content',
          margin: [0, 0, 0, 20],
        },
        {
          table: {
            widths: ['60%', '40%'],
            body: [
              [
                { text: '' },
                {
                  text: `Subtotal: $${calculateTotalInvoicePrice().toFixed(2)}\nSubtotal Less Discount: $0.00\nTax Rate: 0.00%\nTotal Tax: $0.00\nShipping/Handling: $0.00\nInsurance: $0.00\nQuote Total: $${calculateTotalInvoicePrice().toFixed(2)}`,
                  alignment: 'right',
                  style: 'content',
                },
              ],
            ],
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 20],
        },
        {
          text: 'I declare that the above information is true and correct to the best of my knowledge.',
          style: 'content',
          margin: [0, 0, 0, 20],
        },
        {
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                { text: 'Signature: ______________', style: 'content' },
                { text: 'Date: ______________', style: 'content' },
              ],
            ],
          },
          layout: 'noBorders',
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          color: '#333333',
        },
        subheader: {
          fontSize: 12,
          margin: [0, 10, 0, 5],
          color: '#666666',
        },
        label: {
          fontSize: 10,
          bold: true,
          margin: [0, 5, 0, 5],
          color: '#333333',
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          color: '#003366',
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'white',
          fillColor: '#003366',
        },
        content: {
          fontSize: 10,
          color: '#333333',
        },
      },
      images: {
        logo: 'data:image/png;base64,...', // Add your base64 logo here
      },
    };

    // Generate the PDF blob
    pdfMake.createPdf(documentDefinition).getBlob((blob) => {
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);

      // Open the URL in a new tab
      window.open(url, '_blank');

      // Revoke the URL after opening it
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Proforma Invoice Generator</h1>

      {/* Invoice Details Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Invoice Number</label>
          <input
            type="text"
            name="invoiceNumber"
            value={invoiceData.invoiceNumber}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Date</label>
          <input
            type="date"
            name="date"
            value={invoiceData.date}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Customer Name</label>
          <input
            type="text"
            name="customerName"
            value={invoiceData.customerName}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Customer Address</label>
          <textarea
            name="customerAddress"
            value={invoiceData.customerAddress}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-medium">Items</h2>
          <Button variant="secondary" onClick={handleAddItem}>
            Add Item
          </Button>
        </div>
        <DragDropContext onDragStart={handleOnDragStart} onDragEnd={handleOnDragEnd}>
          <table className="min-w-full border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-200 px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="border border-slate-200 px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider" style={{ width: '40%' }}>Description</th>
                <th className="border border-slate-200 px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider" style={{ width: '6%' }}>Quantity</th>
                <th className="border border-slate-200 px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider" style={{ width: '8%' }}>Unit Price</th>
                <th className="border border-slate-200 px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider" style={{ width: '8%' }}>Total Price</th>
                <th className="border border-slate-200 px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider" style={{ width: '10%' }}>Actions</th>
              </tr>
            </thead>
            <Droppable droppableId="items">
              {(provided) => (
                <tbody {...provided.droppableProps} ref={provided.innerRef}>
                  {invoiceData.items.map((item, index) => (
                    <Draggable key={index} draggableId={`item-${index}`} index={index}>
                      {(provided) => (
                        <tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={draggingIndex === index ? 'bg-blue-100' : ''}
                        >
                          <td className="border border-slate-200 px-4 py-2 text-center">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                              className="w-full border-0 rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-center"
                            />
                          </td>
                          <td className="border border-slate-200 px-4 py-2 text-center" style={{ width: '40%' }}>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              className="w-full border-0 rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-center"
                            />
                          </td>
                          <td className="border border-slate-200 px-4 py-2 text-center" style={{ width: '6%' }}>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                              className="w-full border-0 rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-center"
                            />
                          </td>
                          <td className="border border-slate-200 px-4 py-2 text-center" style={{ width: '8%' }}>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                              className="w-full border-0 rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-center"
                            />
                          </td>
                          <td className="border border-slate-200 px-4 py-2 text-center" style={{ width: '8%' }}>
                            {calculateTotalPrice(item)}
                          </td>
                          <td className="border border-slate-200 px-4 py-2 text-center" style={{ width: '10%' }}>
                            <div className="flex items-center justify-center">
                              <Button variant="ghost" size="sm" {...provided.dragHandleProps}>
                                <GripVertical className="h-4 w-4" />
                              </Button>
                              <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-500" />
                              <Button variant="ghost" size="sm" onClick={() => removeItem(index)} className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </tbody>
              )}
            </Droppable>
          </table>
        </DragDropContext>
      </div>

      {/* Generate Invoice Button */}
      <div className="flex justify-end space-x-2">
        <Button variant="secondary" onClick={handleClear}>
          Clear
        </Button>
        <Button variant="secondary" onClick={handleSave}>
          Save
        </Button>
        <Button onClick={handleGenerateInvoice}>Generate Invoice</Button>
      </div>
    </div>
  );
}
