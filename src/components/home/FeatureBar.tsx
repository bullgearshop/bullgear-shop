import React from 'react';
import { ShieldCheck, Cog, Truck, Headphones } from 'lucide-react';

export function FeatureBar() {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Premium Quality',
      subtitle: 'Built to last',
    },
    {
      icon: Cog,
      title: 'Wide Compatibility',
      subtitle: 'Fits major 4x4 models',
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      subtitle: 'Across India',
    },
    {
      icon: Headphones,
      title: 'Expert Support',
      subtitle: 'Always here to help',
    },
  ];

  return (
    <section className="bg-[#0e1117] border-b border-[#1b202c] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="flex items-center gap-3.5 p-3 sm:p-4 rounded-xl bg-[#131620] border border-[#202636] hover:border-[#e51b24]/40 transition-colors"
              >
                <div className="p-2.5 sm:p-3 rounded-lg bg-[#e51b24]/15 text-[#e51b24] shrink-0">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
                    {feat.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
                    {feat.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
