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
            header: 'bg-blue-50 border-blue-300',
            title: 'text-blue-900',
            subtitle: 'text-blue-600',
            content: 'bg-blue-50/30',
            border: 'border-blue-300'
        },
        cyan: {
            header: 'bg-cyan-50 border-cyan-400',
            title: 'text-cyan-900',
            subtitle: 'text-cyan-600',
            content: 'bg-gradient-to-br from-cyan-50/80 to-green-50/30',
            border: 'border-cyan-400'
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
