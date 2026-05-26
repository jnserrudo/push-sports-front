import React from 'react';
import { ChevronDown } from 'lucide-react';

const Accordion = ({ 
    isOpen, 
    onToggle, 
    title, 
    subtitle, 
    icon: Icon, 
    color = 'blue',
    badge,
    children 
}) => {
    const colorClasses = {
        blue: {
            header: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800',
            title: 'text-blue-900 dark:text-blue-300',
            subtitle: 'text-blue-600 dark:text-blue-400',
            content: 'bg-blue-50/30 dark:bg-blue-900/10',
            border: 'border-blue-300 dark:border-blue-800'
        },
        cyan: {
            header: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-400 dark:border-cyan-800',
            title: 'text-cyan-900 dark:text-cyan-300',
            subtitle: 'text-cyan-600 dark:text-cyan-400',
            content: 'bg-gradient-to-br from-cyan-50/80 dark:from-cyan-900/20 to-green-50/30 dark:to-green-900/10',
            border: 'border-cyan-400 dark:border-cyan-800'
        }
    };
    
    const classes = colorClasses[color];
    
    return (
        <div className={`border-2 rounded-xl overflow-hidden transition-all ${classes.header}`}>
            <button
                type="button"
                onClick={onToggle}
                className="w-full p-4 flex items-center justify-between hover:opacity-80 transition-opacity"
            >
                <div className="flex items-center gap-3">
                    <Icon size={24} className={classes.title} />
                    <div className="text-left">
                        <h3 className={`text-sm font-black uppercase tracking-wider ${classes.title}`}>
                            {title}
                        </h3>
                        <p className={`text-xs font-bold ${classes.subtitle}`}>
                            {subtitle}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {badge}
                    <ChevronDown 
                        size={20} 
                        className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${classes.title}`}
                    />
                </div>
            </button>
            
            {isOpen && (
                <div className={`p-4 border-t-2 ${classes.border} ${classes.content} animate-in fade-in slide-in-from-top-2 duration-200`}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default Accordion;
