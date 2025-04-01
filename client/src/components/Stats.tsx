import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

interface StatItemProps {
  value: string;
  label: string;
  delay: number;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
    >
      <h3 className="font-darker font-bold text-4xl md:text-5xl mb-2 gradient-text">
        {value.includes('+') ? (
          <>
            <CountUp end={parseInt(value)} />+
          </>
        ) : (
          <CountUp end={parseFloat(value)} decimals={value.includes('.') ? 1 : 0} />
        )}
      </h3>
      <p className="text-gray-600">{label}</p>
    </motion.div>
  );
};

const Stats: React.FC = () => {
  const stats = [
    { value: '12K+', label: 'Happy Customers', delay: 0 },
    { value: '150+', label: 'Premium Vehicles', delay: 0.1 },
    { value: '50+', label: 'Pickup Locations', delay: 0.2 },
    { value: '4.9', label: 'Average Rating', delay: 0.3 },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <StatItem key={index} value={stat.value} label={stat.label} delay={stat.delay} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
