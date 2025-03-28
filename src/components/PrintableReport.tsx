import React from 'react';
import type { DyeingFormData, ChemicalItem } from '../types';

interface PrintableReportProps {
  data: DyeingFormData;
  chemicalItems: ChemicalItem[];
}

export const PrintableReport = React.forwardRef<HTMLDivElement, PrintableReportProps>(
  ({ data, chemicalItems }, ref) => {
    const totalCost = chemicalItems.reduce((sum, item) => sum + (item.costing ?? 0), 0);

    // Updated formatQty to use kg, gm, mg and work with the qty object
    const formatQtyDisplay = (qtyObj: { kg: number | null; gm: number | null; mg: number | null; }) => {
      return {
        kg: qtyObj.kg !== null ? qtyObj.kg.toFixed(0) : 'N/A',
        gm: qtyObj.gm !== null ? qtyObj.gm.toFixed(0) : 'N/A',
        mg: qtyObj.mg !== null ? qtyObj.mg.toFixed(0) : 'N/A',
      };
    };

    // Define border style centrally
    const borderStyle = "border border-gray-400 px-1 py-0.5"; // Changed border-black to border-gray-400
    const headerCellStyle = `${borderStyle} text-center`; // Default center align for headers
    const dataCellStyle = `${borderStyle} text-center`; // Default center align for data cells

    return (
      <div ref={ref} className="p-8 bg-white text-black text-xs flex flex-col min-h-[1050px]">
        <div className="flex-grow">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold">Lantabur Apparels Ltd. (Dyeing)</h1>
            <p className="text-[10px] text-gray-600">Kewa, Boherar chala, Gila Beraeed, Sreepur, Gazipur</p>
            <div className="inline-block mt-2">
              <h2 className="text-lg font-semibold bg-gray-300 rounded-md px-4 py-1">
                Dyes & Chemicals Requisition Form
              </h2>
            </div>
          </div>

          {/* Buyer and Order Details */}
          <table className={`w-full mb-4 border-collapse ${borderStyle}`}> {/* Apply border style */}
            <colgroup>
              <col style={{ width: '16.66%' }} />
              <col style={{ width: '16.66%' }} />
              <col style={{ width: '16.66%' }} />
              <col style={{ width: '16.66%' }} />
              <col style={{ width: '16.66%' }} />
              <col style={{ width: '16.66%' }} />
            </colgroup>
            <tbody>
              <tr>
                <td className={`${dataCellStyle} font-semibold`}>Buyer Name</td>
                <td className={dataCellStyle}>{data.buyer || 'N/A'}</td>
                <td className={`${dataCellStyle} font-semibold`}>Order Name</td>
                <td className={dataCellStyle}>{data.orderNo || 'N/A'}</td>
                <td className={`${dataCellStyle} font-semibold`}>Batch No</td>
                <td className={dataCellStyle}>{data.batchNo || 'N/A'}</td>
              </tr>
              <tr>
                <td className={`${dataCellStyle} font-semibold`}>Fabric Qty</td>
                <td className={dataCellStyle}>{data.fabricQty || 'N/A'}</td>
                <td className={`${dataCellStyle} font-semibold`}>Batch Qty</td>
                <td className={dataCellStyle}>{data.batchQty || 'N/A'}</td>
                <td className={dataCellStyle}></td> {/* Empty cells */}
                <td className={dataCellStyle}></td>
              </tr>
            </tbody>
          </table>

          {/* Requisition Details */}
          <table className={`w-full mb-4 border-collapse ${borderStyle}`}> {/* Apply border style */}
            <colgroup>
              <col style={{ width: '16.66%' }} />
              <col style={{ width: '16.66%' }} />
              <col style={{ width: '16.66%' }} />
              <col style={{ width: '16.66%' }} />
              <col style={{ width: '16.66%' }} />
              <col style={{ width: '16.66%' }} />
            </colgroup>
            <tbody>
              <tr>
                <td className={`${dataCellStyle} font-semibold`}>Req. No:</td>
                <td className={dataCellStyle}>{data.reqId}</td>
                <td className={`${dataCellStyle} font-semibold`}>Date</td>
                <td className={dataCellStyle}>{new Date(data.reqDate).toLocaleDateString()}</td>
                <td className={`${dataCellStyle} font-semibold`}>M/C No.</td>
                <td className={dataCellStyle}>{data.machineNo || 'N/A'}</td>
              </tr>
              <tr>
                <td className={`${dataCellStyle} font-semibold`}>Color</td>
                <td className={dataCellStyle}>{data.color || 'N/A'}</td>
                <td className={`${dataCellStyle} font-semibold`}>Lab Dip No</td>
                <td className={dataCellStyle}>{data.labDipNo || 'N/A'}</td>
                <td className={`${dataCellStyle} font-semibold`}>Fabric Type</td>
                <td className={dataCellStyle}>{data.fabricType || 'N/A'}</td>
              </tr>
              <tr>
                <td className={`${dataCellStyle} font-semibold`}>Dyeing Type</td>
                <td className={dataCellStyle}>{data.dyingType || 'N/A'}</td>
                <td className={`${dataCellStyle} font-semibold`}>Color Group</td>
                <td className={dataCellStyle}>{data.colorGroup || 'N/A'}</td>
                <td className={`${dataCellStyle} font-semibold`}>GSM</td>
                <td className={dataCellStyle}>{data.gsm || 'N/A'}</td>
              </tr>
              <tr>
                <td className={`${dataCellStyle} font-semibold`}>Product Mode</td>
                <td className={dataCellStyle}>{data.productMode}</td>
                <td className={`${dataCellStyle} font-semibold`}>Work Order</td>
                <td className={dataCellStyle}>{data.workOrder || 'N/A'}</td>
                <td className={`${dataCellStyle} font-semibold`}>Total Water (L)</td>
                <td className={dataCellStyle}>{data.totalWater?.toFixed(2) ?? 'N/A'}</td>
              </tr>
               <tr>
                <td className={`${dataCellStyle} font-semibold`}>Fabric Wt (kg)</td>
                <td className={dataCellStyle}>{data.fabricWeight?.toFixed(2) ?? 'N/A'}</td>
                <td className={`${dataCellStyle} font-semibold`}>Liquor Ratio</td>
                <td className={dataCellStyle}>1:{data.liquorRatio?.toFixed(2) ?? 'N/A'}</td>
                <td className={`${dataCellStyle} font-semibold`}>Composition</td>
                <td className={dataCellStyle}>{data.composition || 'N/A'}</td>
              </tr>
            </tbody>
          </table>

          {/* Chemical Items Table */}
          <table className={`w-full border-collapse ${borderStyle} mb-4`}> {/* Apply border style */}
            <colgroup>
              <col style={{ width: '10%' }} /> {/* Item Type */}
              <col style={{ width: '15%' }} /> {/* Item Name */}
              <col style={{ width: '10%' }} /> {/* Lot No */}
              <col style={{ width: '10%' }} /> {/* Dosing */}
              <col style={{ width: '10%' }} /> {/* Shade */}
              <col style={{ width: '8%' }} />  {/* Qty kg */}
              <col style={{ width: '8%' }} />  {/* Qty gm */}
              <col style={{ width: '8%' }} />  {/* Qty mg */}
              <col style={{ width: '10%' }} /> {/* Unit Price */}
              <col style={{ width: '11%' }} /> {/* Costing */}
            </colgroup>
            <thead>
              <tr className="bg-gray-100">
                <th className={headerCellStyle} rowSpan={2}>Item Type</th>
                <th className={headerCellStyle} rowSpan={2}>Item Name</th>
                <th className={headerCellStyle} rowSpan={2}>Lot No</th>
                <th className={headerCellStyle} rowSpan={2}>Dosing (g/l)</th>
                <th className={headerCellStyle} rowSpan={2}>Shade (%)</th>
                <th colSpan={3} className={headerCellStyle}>Qty</th>
                <th className={headerCellStyle} rowSpan={2}>Unit Price</th>
                <th className={headerCellStyle} rowSpan={2}>Costing</th>
              </tr>
              <tr className="bg-gray-100">
                <th className={headerCellStyle}>kg</th>
                <th className={headerCellStyle}>gm</th>
                <th className={headerCellStyle}>mg</th>
              </tr>
            </thead>
            <tbody>
              {chemicalItems.map((item, index) => {
                const { kg, gm, mg } = formatQtyDisplay(item.qty);
                return (
                  <tr key={index} style={{ fontWeight: item.highlight ? 'bold' : 'normal' }}>
                    <td className={dataCellStyle}>{item.itemType || 'N/A'}</td>
                    {/* Override default center alignment for Item Name */}
                    <td className={`${borderStyle} text-left`}>{item.itemName || 'N/A'}</td>
                    <td className={dataCellStyle}>{item.lotNo || 'N/A'}</td>
                    {/* Keep Dosing and Shade right-aligned */}
                    <td className={`${borderStyle} text-right`}>{item.dosing !== null ? item.dosing.toFixed(2) : ''}</td>
                    <td className={`${borderStyle} text-right`}>{item.shade !== null ? item.shade.toFixed(2) : ''}</td>
                    {/* Use default center alignment for Qty, Unit Price, Costing */}
                    <td className={dataCellStyle}>{kg}</td>
                    <td className={dataCellStyle}>{gm}</td>
                    <td className={dataCellStyle}>{mg}</td>
                    <td className={dataCellStyle}>{item.unitPrice !== null ? item.unitPrice.toFixed(2) : ''}</td>
                    <td className={dataCellStyle}>{item.costing !== null ? item.costing.toFixed(2) : 'N/A'}</td>
                  </tr>
                );
              })}
              {/* Empty rows */}
              {Array.from({ length: Math.max(0, 10 - chemicalItems.length) }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td className={`${dataCellStyle} h-5`}></td> {/* Fixed height */}
                  <td className={dataCellStyle}></td>
                  <td className={dataCellStyle}></td>
                  <td className={dataCellStyle}></td>
                  <td className={dataCellStyle}></td>
                  <td className={dataCellStyle}></td>
                  <td className={dataCellStyle}></td>
                  <td className={dataCellStyle}></td>
                  <td className={dataCellStyle}></td>
                  <td className={dataCellStyle}></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100">
                {/* Span 9 columns (0-8) for the label, align right */}
                <td colSpan={9} className={`${borderStyle} text-right font-bold`}>Total Cost:</td>
                {/* Place the total cost value in the 10th column (index 9), align center */}
                <td className={`${borderStyle} text-center font-bold`}>{totalCost.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div> {/* End Main Content Area */}

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-4">
          <div className="text-center">
            {/* Changed border-black to border-gray-400 */}
            <div className="border-t border-gray-400 pt-1 mx-4">
              <p className="font-semibold">Prepared By</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-1 mx-4">
              <p className="font-semibold">Checked By</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-1 mx-4">
              <p className="font-semibold">Approved By</p>
            </div>
          </div>
        </div>
      </div> // End Flex Container
    );
  }
);

PrintableReport.displayName = 'PrintableReport';
