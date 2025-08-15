import React from 'react';
import { Link } from 'react-router-dom';
import { Beaker, FileText, History, Book, BarChart2, Users, Layers, Settings, Clock, Lightbulb, Save, Printer } from 'lucide-react';
import { motion, useSpring, useTransform, MotionValue } from 'framer-motion';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard'; // Updated import

// Helper component for animating numbers
const AnimatedNumber = ({ value }: { value: number }) => {
  const spring = useSpring(0, { stiffness: 100, damping: 10 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  React.useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
};

const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType, label: string, value: number, color: string }) => (
  <motion.div
    className="bg-card p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
    whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
  >
    <div className={`p-3 rounded-full bg-${color}-100`}>
      <Icon className={`h-7 w-7 text-${color}-600`} />
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-800">
        <AnimatedNumber value={value} />
      </p>
    </div>
  </motion.div>
);

const ActionCard = ({ icon: Icon, title, description, path, color }: { icon: React.ElementType, title: string, description: string, path: string, color: string }) => (
  <Link to={path}>
    <motion.div
      className="bg-card p-6 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col transform transition-all duration-300 hover:scale-[1.01] hover:shadow-md"
      whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full bg-${color}-100`}> {/* Applied consistent styling */}
          <Icon className={`h-6 w-6 text-${color}-600`} /> {/* Applied consistent styling */}
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="mt-4 text-gray-500 text-sm flex-1">{description}</p>
      <div className={`mt-4 text-sm font-semibold text-${color}-600`}>
        Proceed &rarr;
      </div>
    </motion.div>
  </Link>
);

const RecentActivityItem = ({ icon: Icon, title, description, time, color }: { icon: React.ElementType, title: string, description: string, time: string, color: string }) => (
  <motion.div
    className="flex items-start space-x-4 p-4 bg-card rounded-lg border border-gray-200 shadow-sm transform transition-all duration-300 hover:scale-[1.01] hover:shadow-md"
    whileHover={{ x: 5 }}
  >
    <div className={`p-3 rounded-full bg-${color}-100`}> {/* Applied consistent styling */}
      <Icon className={`h-5 w-5 text-${color}-600`} /> {/* Applied consistent styling */}
    </div>
    <div className="flex-1">
      <p className="font-medium text-gray-800">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <span className="text-xs text-gray-400">{time}</span>
  </motion.div>
);

const QuickTipCard = ({ icon: Icon, title, description, color }: { icon: React.ElementType, title: string, description: string, color: string }) => (
  <motion.div
    className="bg-card p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col transform transition-all duration-300 hover:scale-[1.01] hover:shadow-md"
    whileHover={{ y: -3, boxShadow: "0 5px 10px -2px rgba(0, 0, 0, 0.05)" }}
  >
    <div className="flex items-center space-x-3">
      <div className={`p-3 rounded-full bg-${color}-100`}> {/* Applied consistent styling */}
        <Icon className={`h-5 w-5 text-${color}-600`} /> {/* Applied consistent styling */}
      </div>
      <h3 className="text-md font-semibold text-gray-800">{title}</h3>
    </div>
    <p className="mt-3 text-gray-500 text-sm">{description}</p>
  </motion.div>
);

export function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // Slightly faster stagger
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const recentActivities = [
    { icon: Beaker, title: 'New Recipe Saved', description: 'Recipe for "Cotton Reactive Red"', time: '2 hours ago', color: 'blue' },
    { icon: FileText, title: 'Invoice Generated', description: 'Proforma Invoice #2023001', time: 'Yesterday', color: 'orange' },
    { icon: History, title: 'Batch Completed', description: 'Batch ID: B-789 for Denim', time: '3 days ago', color: 'purple' },
    { icon: Book, title: 'Recipe Updated', description: 'Updated "Polyester Disperse Black"', time: '1 week ago', color: 'green' },
  ];

  const quickTips = [
    { icon: Lightbulb, title: 'Optimize Dyeing', description: 'Use the calculator to fine-tune chemical ratios for better color consistency.', color: 'yellow' },
    { icon: Lightbulb, title: 'Track History', description: 'Regularly review your dyeing history to identify trends and areas for improvement.', color: 'teal' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back!</h1>
          <p className="text-gray-600 mt-1">Here's a summary of your textile processing activities.</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <StatCard icon={Layers} label="Active Batches" value={12} color="blue" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard icon={Book} label="Saved Recipes" value={58} color="green" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard icon={Users} label="Clients" value={34} color="purple" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard icon={BarChart2} label="Reports Generated" value={122} color="orange" />
          </motion.div>
        </motion.div>

        {/* Performance Overview Charts */}
        <div className="mt-8">
          <motion.h2
            className="text-2xl font-semibold text-gray-700 mb-4"
            variants={itemVariants}
          >
            Performance Overview
          </motion.h2>
          <AnalyticsDashboard /> {/* Updated component */}
        </div>

        {/* Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <motion.h2
              className="text-2xl font-semibold text-gray-700 mb-4"
              variants={itemVariants}
            >
              Quick Actions
            </motion.h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <ActionCard
                  icon={Beaker}
                  title="Dyeing Calculator"
                  description="Calculate precise chemical quantities for your dyeing process."
                  path="/dyeing-calculator"
                  color="blue"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <ActionCard
                  icon={FileText}
                  title="Proforma Invoice"
                  description="Generate and manage proforma invoices for your dyeing orders."
                  path="/proforma-invoice"
                  color="orange"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <ActionCard
                  icon={Book}
                  title="Manage Recipes"
                  description="View, edit, and save your dyeing recipes for future use."
                  path="/manage-recipes"
                  color="green"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <ActionCard
                  icon={Printer}
                  title="Generate Reports"
                  description="Create detailed reports on production, chemical usage, and more."
                  path="/generate-reports"
                  color="red"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <ActionCard
                  icon={History}
                  title="View History"
                  description="Track and analyze your dyeing history for process optimization."
                  path="/history"
                  color="purple"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <ActionCard
                  icon={Settings}
                  title="Manage Settings"
                  description="Configure application settings and preferences."
                  path="/settings"
                  color="green" // Changed from 'gray' to 'green'
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Recent Activity & Quick Tips Sidebar */}
          <div className="lg:col-span-1 flex flex-col space-y-6">
            {/* Recent Activity */}
            <div>
              <motion.h2
                className="text-2xl font-semibold text-gray-700 mb-4"
                variants={itemVariants}
              >
                Recent Activity
              </motion.h2>
              <motion.div
                className="space-y-4"
                variants={containerVariants}
              >
                {recentActivities.map((activity, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <RecentActivityItem {...activity} />
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Quick Tips */}
            <div>
              <motion.h2
                className="text-2xl font-semibold text-gray-700 mb-4"
                variants={itemVariants}
              >
                Quick Tips
              </motion.h2>
              <motion.div
                className="space-y-4"
                variants={containerVariants}
              >
                {quickTips.map((tip, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <QuickTipCard {...tip} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
