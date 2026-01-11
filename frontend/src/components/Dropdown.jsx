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
            menu: `border-purple-100`,
            item: `hover:bg-purple-50`,
            itemActive: `text-purple-600 bg-purple-50/50`,
            itemInactive: `text-gray-700`
        },
        default: {
            button: `bg-white text-gray-900 border border-gray-300 hover:border-indigo-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`,
            text: `font-normal`,
            icon: `text-gray-500`,
            menu: `border-gray-100`,
            item: `hover:bg-indigo-50`,
            itemActive: `text-indigo-600 bg-indigo-50/50`,
            itemInactive: `text-gray-700`
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
                className={`absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border overflow-hidden transition-all duration-200 origin-top z-50
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
                                <Check className={`w-4 h-4 flex-shrink-0 ${variant === 'glass' ? 'text-purple-600' : 'text-indigo-600'}`} />
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
