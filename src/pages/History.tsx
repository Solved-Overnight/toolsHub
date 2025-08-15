import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Recipe } from '../types';

export function History() {
  const [searchTerm, setSearchTerm] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('recipes');
    return saved ? JSON.parse(saved) : [];
  });

  const filteredRecipes = recipes.filter(recipe => {
    const searchLower = searchTerm.toLowerCase();
    return (
      recipe.formData.reqId.toLowerCase().includes(searchLower) ||
      recipe.formData.batchNo.toLowerCase().includes(searchLower) ||
      recipe.formData.buyer.toLowerCase().includes(searchLower) ||
      recipe.formData.orderNo.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recipe History</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by Req ID, Batch, Buyer, Order..."
            className="pl-10 pr-4 py-2 border rounded-lg w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Req ID: {recipe.formData.reqId}</h3>
                <p className="text-sm text-gray-500">
                  Created: {new Date(recipe.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p>Batch: {recipe.formData.batchNo}</p>
                <p>Buyer: {recipe.formData.buyer}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Recipe Details</h4>
                <p>Project: {recipe.formData.project}</p>
                <p>Color: {recipe.formData.color}</p>
                <p>Fabric Type: {recipe.formData.fabricType}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Process Details</h4>
                <p>Machine No: {recipe.formData.machineNo}</p>
                <p>Fabric Weight: {recipe.formData.fabricWeight} kg</p>
                <p>Total Water: {recipe.formData.totalWater} L</p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-2">Chemical Items</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Item</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-right">Dosing</th>
                      <th className="px-4 py-2 text-right">Shade</th>
                      <th className="px-4 py-2 text-right">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipe.chemicalItems.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{item.itemName}</td>
                        <td className="px-4 py-2">{item.itemType}</td>
                        <td className="px-4 py-2 text-right">{item.dosing ?? '-'}</td>
                        <td className="px-4 py-2 text-right">{item.shade ?? '-'}</td>
                        <td className="px-4 py-2 text-right">
                          {item.qty.kg} kg {item.qty.gm} g {item.qty.mg} mg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}

        {filteredRecipes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No recipes found matching your search.' : 'No recipes saved yet.'}
          </div>
        )}
      </div>
    </div>
  );
}
