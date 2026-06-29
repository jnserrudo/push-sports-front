import React from 'react';
import { motion } from 'framer-motion';

const Tabs = ({ tabs, activeTab, onChange }) => {
    return (
        <div className="flex gap-2 border-b border-neutral-200 dark:border-gray-700 mb-6">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`
                        relative px-4 py-3 text-sm font-bold uppercase tracking-widest
                        transition-all duration-200 flex items-center gap-2
                        ${activeTab === tab.id
                            ? 'text-black dark:text-white'
                            : 'text-neutral-400 dark:text-gray-500 hover:text-neutral-600 dark:hover:text-gray-400'
                        }
                    `}
                >
                    {tab.icon && <tab.icon size={16} strokeWidth={2.5} />}
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-brand-cyan"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                    )}
                </button>
            ))}
        </div>
    );
};

export default Tabs;
