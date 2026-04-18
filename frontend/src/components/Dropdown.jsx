import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export default function Dropdown({
    value,
    onChange,
    options = [],
    placeholder = 'Select',
    variant = 'default',
    className = '',
    name = '',
    icon = null,
    ...props
}) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Normalize options to { value, label } format
    const normalizedOptions = options.map(opt => {
        if (typeof opt === 'object' && opt !== null) {
            return { value: opt.value, label: opt.label || opt.name || opt.value }
        }
        return { value: opt, label: opt }
    })

    const selectedOption = normalizedOptions.find(opt => String(opt.value) === String(value))

    // Styles based on variant
    const styles = {
        glass: {
            button: `bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/30 focus:border-white`,
            text: `font-semibold`,
            icon: `text-white`,
            menu: `bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl shadow-xl`,
            item: `hover:bg-white/10 py-3`,
            itemActive: `text-white bg-white/20 font-bold`,
            itemInactive: `text-white/70`
        },
        dark: {
            button: `bg-[#151313] text-white border-none hover:bg-slate-900 focus:ring-4 focus:ring-black/10`,
            text: `font-black uppercase tracking-widest text-[11px]`,
            icon: `text-[#ff5734]`,
            menu: `bg-[#151313] border border-white/10 rounded-[1.5rem] shadow-2xl`,
            item: `hover:bg-white/10 py-4 px-6`,
            itemActive: `text-[#ff5734] bg-white/5 font-black`,
            itemInactive: `text-white/60`
        },
        'premium-light': {
            button: `bg-white text-slate-800 border border-slate-100 hover:border-slate-200 hover:shadow-sm focus:ring-4 focus:ring-slate-100`,
            text: `font-black uppercase tracking-widest text-[11px]`,
            icon: `text-[#ff5734]`,
            menu: `bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl shadow-slate-200/50`,
            item: `hover:bg-slate-50 py-4 px-6`,
            itemActive: `text-[#ff5734] bg-slate-50 font-black`,
            itemInactive: `text-slate-500`
        },
        default: {
            button: `bg-white text-slate-900 border border-slate-300 hover:border-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900`,
            text: `font-medium`,
            icon: `text-slate-500`,
            menu: `bg-white border border-slate-200 rounded-xl shadow-xl`,
            item: `hover:bg-slate-100 py-3`,
            itemActive: `text-slate-900 bg-slate-100 font-bold`,
            itemInactive: `text-slate-600`
        }
    }

    const currentStyle = styles[variant] || styles.default

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all outline-none ${currentStyle.button}`}
            >
                <div className="flex items-center gap-2 truncate">
                    {icon && <span className={currentStyle.icon}>{icon}</span>}
                    <span className={`block truncate ${currentStyle.text}`}>
                        {selectedOption ? selectedOption.label : <span className="text-gray-400">{placeholder}</span>}
                    </span>
                </div>
                <ChevronDown
                    className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-200 flex-shrink-0 ${currentStyle.icon} ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <div
                className={`absolute top-full left-0 right-0 mt-2 overflow-hidden transition-all duration-200 origin-top z-50
        ${currentStyle.menu}
        ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
            >
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    {normalizedOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                // Simulate standard event object for compatibility with form handlers
                                if (onChange) {
                                    onChange({
                                        target: {
                                            name: name,
                                            value: option.value
                                        }
                                    })
                                }
                                setIsOpen(false)
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 text-sm md:text-base transition-colors text-left ${currentStyle.item} ${String(value) === String(option.value) ? currentStyle.itemActive : currentStyle.itemInactive}`}
                        >
                            <span className="truncate">{option.label}</span>
                            {String(value) === String(option.value) && (
                                <Check className={`w-4 h-4 flex-shrink-0 ${variant === 'glass' ? 'text-slate-900' : 'text-slate-900'}`} />
                            )}
                        </button>
                    ))}
                    {normalizedOptions.length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">No options</div>
                    )}
                </div>
            </div>
        </div>
    )
}
