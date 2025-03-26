import React from 'react';
import { Link } from 'react-router-dom';
import { Beaker, Calculator, Settings2, History, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Textile Processing</span>
              <span className="block text-blue-600">Management System</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Streamline your textile processing operations with our comprehensive suite of tools.
              Calculate dye recipes, manage inventory, and generate reports with ease.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Dyeing Calculator */}
          <Link to="/dyeing-calculator" className="group">
            <div className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-blue-100 p-3">
                  <Beaker className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Dyeing Calculator</h3>
              </div>
              <p className="mt-4 text-gray-500">
                Calculate precise chemical quantities for your dyeing process with our advanced calculator.
              </p>
            </div>
          </Link>

          {/* Recipe Management */}
          <div className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-green-100 p-3">
                <Calculator className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Recipe Management</h3>
            </div>
            <p className="mt-4 text-gray-500">
              Store and manage your dyeing recipes in a centralized database.
            </p>
          </div>

          {/* History Tracking */}
          <Link to="/history" className="group">
            <div className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-purple-100 p-3">
                  <History className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">History Tracking</h3>
              </div>
              <p className="mt-4 text-gray-500">
                Track and analyze your dyeing history for better process optimization.
              </p>
            </div>
          </Link>

          {/* Proforma Invoice */}
          <Link to="/proforma-invoice" className="group">
            <div className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-orange-100 p-3">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Proforma Invoice</h3>
              </div>
              <p className="mt-4 text-gray-500">
                Generate proforma invoices for your dyeing orders.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 mt-12">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to optimize your dyeing process?
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              Get started with our comprehensive suite of tools.
            </p>
            <div className="mt-8">
              <Link to="/dyeing-calculator">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
