import React, { useState } from 'react';
import { Filter, Eye, MapPin, Clock, Layers, Sparkles, X, ArrowRight } from 'lucide-react';
import { PORTFOLIO_PROJECTS, PortfolioProject } from '../data/portfolioData.js';

interface PortfolioViewProps {
  onSelectProjectToEnquire: (project: PortfolioProject) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({ onSelectProjectToEnquire }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeProject, setActiveProject] = useState<PortfolioProject | null>(null);

  const categories = [
    'ALL',
    'Weddings & Mandap',
    'Receptions',
    'Haldi & Sangeet',
    'Engagements',
    'Baby Shower & Birthdays'
  ];

  const filteredProjects = selectedCategory === 'ALL'
    ? PORTFOLIO_PROJECTS
    : PORTFOLIO_PROJECTS.filter(p => p.category === selectedCategory);

  return (
    <div className="bg-[#F6F0E4] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold text-[#8D5962] tracking-widest uppercase mb-2">
            Curated Visual Gallery
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#18251F] font-normal leading-tight">
            Celebration Portfolio & Staging Architecture
          </h2>
          <p className="mt-3 text-sm text-[#18251F]/70 leading-relaxed">
            Explore our artisanal mandaps, reception stages, and traditional celebration setups across Davangere. All concept demonstrations are explicitly designated to maintain full transparency.
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 border-b border-[#D8B77A]/20">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#18251F] text-[#F6F0E4] shadow-sm'
                  : 'bg-white/80 hover:bg-white text-[#18251F]/70 border border-neutral-200'
              }`}
            >
              {cat === 'ALL' ? 'All Celebrations' : cat}
            </button>
          ))}
        </div>

        {/* Portfolio Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-[#D8B77A]/30 overflow-hidden flex flex-col justify-between group hover:shadow-lg transition-all"
            >
              <div>
                {/* Image Container with Hover Zoom */}
                <div className="relative aspect-4/3 overflow-hidden bg-neutral-900">
                  <img
                    src={project.image}
                    alt={`${project.title} - Sutra Events Davangere`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Category & Style unboxed tag */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white/90">
                    <span className="font-medium">{project.category}</span>
                    <span className="text-[11px] text-[#D8B77A] font-serif italic">{project.style}</span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 space-y-3">
                  <h3 className="font-serif text-xl sm:text-2xl text-[#18251F] group-hover:text-[#8D5962] transition-colors">
                    {project.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <MapPin className="w-3.5 h-3.5 text-[#D8B77A] shrink-0" />
                    <span className="truncate">{project.location}</span>
                  </div>

                  <p className="text-xs text-[#18251F]/75 leading-relaxed line-clamp-2">
                    {project.description}
                  </p>

                  {/* Demonstration Label */}
                  {project.demonstrationNotice && (
                    <div className="pt-2 text-[10px] text-neutral-500 italic">
                      * {project.demonstrationNotice}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 pb-6 pt-3 border-t border-neutral-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveProject(project)}
                  className="text-xs font-semibold text-[#18251F] hover:text-[#8D5962] flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Design</span>
                </button>

                <button
                  onClick={() => onSelectProjectToEnquire(project)}
                  className="px-3.5 py-1.5 bg-[#D8B77A] hover:bg-[#c9a667] text-[#18251F] text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Book Similar
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* PROJECT INSPECTION MODAL */}
      {activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-[#D8B77A] shadow-2xl relative">
            
            <button
              onClick={() => setActiveProject(null)}
              aria-label="Close design inspection"
              className="absolute top-4 right-4 z-10 p-2 bg-black/60 text-white rounded-full hover:bg-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Image */}
            <div className="relative aspect-16/9 bg-neutral-900">
              <img
                src={activeProject.image}
                alt={activeProject.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Modal Details */}
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#8D5962] font-semibold uppercase tracking-wider">
                  <span>{activeProject.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeProject.style}</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#18251F] mt-1">
                  {activeProject.title}
                </h3>
                <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D8B77A]" />
                  <span>{activeProject.location}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#18251F]/80 leading-relaxed border-t border-neutral-100 pt-4">
                {activeProject.description}
              </p>

              {/* Elements & Palettes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-[#F6F0E4]/50 border border-[#D8B77A]/30 text-xs">
                <div>
                  <h4 className="font-semibold text-[#18251F] uppercase tracking-wider text-[11px] mb-2">
                    Key Staging Elements
                  </h4>
                  <ul className="space-y-1 text-neutral-700">
                    {activeProject.elements.map((el, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#D8B77A] rounded-full" />
                        <span>{el}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-[#18251F] uppercase tracking-wider text-[11px]">
                      Color Harmony
                    </h4>
                    <span className="text-neutral-700 mt-0.5 block">{activeProject.palette}</span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#18251F] uppercase tracking-wider text-[11px]">
                      Execution Buffer
                    </h4>
                    <span className="text-neutral-700 mt-0.5 block">{activeProject.durationSetup}</span>
                  </div>
                </div>
              </div>

              {activeProject.demonstrationNotice && (
                <div className="text-[11px] text-neutral-500 italic p-3 bg-neutral-50 border border-neutral-200">
                  Transparency Notice: {activeProject.demonstrationNotice}
                </div>
              )}

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-4">
                <button
                  onClick={() => setActiveProject(null)}
                  className="px-4 py-2 border border-neutral-300 text-xs text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    onSelectProjectToEnquire(activeProject);
                    setActiveProject(null);
                  }}
                  className="px-6 py-2.5 bg-[#D8B77A] hover:bg-[#c9a667] text-[#18251F] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Request Quotation for This Aesthetic
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
