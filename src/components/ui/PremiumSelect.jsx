import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PremiumSelect: A high-end replacement for the native <select>
 * Features: Searchable, Max-height, Premium styling, Mobile friendly.
 * 
 * @param {Object} props
 * @param {Array} props.options - [{ value, label, icon: Icon, subtitle }]
 * @param {string|number} props.value - Current selected value
 * @param {Function} props.onChange - (value) => void
 * @param {string} props.placeholder - Text to show when empty
 * @param {boolean} props.searchable - Enable internal search
 * @param {React.ElementType} props.icon - Icon for the left side
 * @param {string} props.className - Extra styles for the container
 * @param {boolean} props.disabled - Disable the select
 * @param {string} props.maxHeight - Max height for the dropdown (default: 300px)
 */
const PremiumSelect = ({
    options = [],
    value,
    onChange,
    placeholder = "Seleccionar...",
    searchable = true,
    icon: Icon,
    className = "",
    disabled = false,
    maxHeight = "300px"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef(null);

    // Filtered options based on search
    const filteredOptions = useMemo(() => {
        if (!searchTerm.trim()) return options;
        return options.filter(opt => 
            opt.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            opt.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(opt.value)?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    // Current selected option
    const selectedOption = useMemo(() => 
        options.find(opt => String(opt.value) === String(value))
    , [options, value]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        if (disabled) return;
        onChange(option.value);
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <div 
            ref={containerRef} 
            className={`relative w-full ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {/* Main Trigger Button */}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between px-4 py-3 
                    bg-white dark:bg-gray-800 border-2 rounded-xl transition-all duration-300 cursor-pointer
                    ${isOpen ? 'border-brand-cyan shadow-[0_0_15px_rgba(0,194,255,0.15)]' : 'border-neutral-100 dark:border-gray-700 hover:border-neutral-300 dark:hover:border-gray-600'}
                `}
            >
                <div className="flex items-center gap-3 min-w-0">
                    {Icon && <Icon size={16} className={`${isOpen ? 'text-brand-cyan' : 'text-neutral-400 dark:text-gray-500'} transition-colors flex-shrink-0`} />}
                    <div className="flex flex-col min-w-0">
                        {selectedOption ? (
                            <>
                                <span className="text-sm font-bold text-black dark:text-white uppercase truncate tracking-widest">
                                    {selectedOption.label}
                                </span>
                                {selectedOption.subtitle && (
                                    <span className="text-[9px] font-bold text-neutral-400 dark:text-gray-500 uppercase truncate">
                                        {selectedOption.subtitle}
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="text-sm font-bold text-neutral-400 dark:text-gray-500 uppercase tracking-widest truncate">
                                {placeholder}
                            </span>
                        )}
                    </div>
                </div>
                <ChevronDown 
                    size={16} 
                    className={`text-neutral-400 dark:text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-cyan' : ''}`} 
                />
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-[100] w-full bg-white dark:bg-gray-800 border border-neutral-100 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden mt-1"
                        style={{ top: '100%' }}
                    >
                        {/* Search Bar */}
                        {searchable && (
                            <div className="p-3 border-b border-neutral-50 dark:border-gray-700 bg-neutral-50/50 dark:bg-gray-900/50">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-gray-500" />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="BUSCAR..."
                                        className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-lg text-[10px] font-black uppercase tracking-widest text-black dark:text-white focus:outline-none focus:border-brand-cyan transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    {searchTerm && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setSearchTerm(""); }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-gray-500 hover:text-black dark:hover:text-white"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Options List */}
                        <div 
                            className="overflow-y-auto custom-scrollbar"
                            style={{ maxHeight }}
                        >
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt, index) => {
                                    const isSelected = String(opt.value) === String(value);
                                    return (
                                        <div
                                            key={opt.value || index}
                                            onClick={() => handleSelect(opt)}
                                            className={`
                                                flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200
                                                ${isSelected ? 'bg-brand-cyan/5 border-l-4 border-brand-cyan' : 'hover:bg-neutral-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent'}
                                            `}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {opt.icon && <opt.icon size={14} className={isSelected ? 'text-brand-cyan' : 'text-neutral-400 dark:text-gray-500'} />}
                                                <div className="flex flex-col min-w-0">
                                                    <span className={`text-[11px] font-black uppercase tracking-widest truncate ${isSelected ? 'text-brand-cyan' : 'text-black dark:text-white'}`}>
                                                        {opt.label}
                                                    </span>
                                                    {opt.subtitle && (
                                                        <span className="text-[9px] font-bold text-neutral-400 dark:text-gray-500 uppercase truncate">
                                                            {opt.subtitle}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {isSelected && <Check size={14} className="text-brand-cyan flex-shrink-0" />}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-8 text-center flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-neutral-50 dark:bg-gray-700 flex items-center justify-center">
                                        <Search size={14} className="text-neutral-300 dark:text-gray-500" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-gray-500">Sin resultados</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PremiumSelect;
