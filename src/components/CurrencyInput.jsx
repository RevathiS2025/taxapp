import { useState, useEffect, useRef } from 'react'

function formatIN(n) {
  return new Intl.NumberFormat('en-IN').format(n)
}

export default function CurrencyInput({
  value,
  onChange,
  placeholder,
  id,
  className = '',
  autoFocus = false,
}) {
  const [display, setDisplay] = useState(value != null ? formatIN(value) : '')
  const inputRef = useRef(null)

  useEffect(() => {
    const displayNum = display.replace(/[^0-9]/g, '')
      ? parseInt(display.replace(/[^0-9]/g, ''), 10)
      : null
    if (value !== displayNum) {
      setDisplay(value != null ? formatIN(value) : '')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handleChange = (e) => {
    const input = e.target
    const cursorPos = input.selectionStart
    const rawValue = input.value

    const digitsBefore = rawValue.slice(0, cursorPos).replace(/[^0-9]/g, '').length

    const digits = rawValue.replace(/[^0-9]/g, '')
    if (digits === '') {
      setDisplay('')
      onChange(null)
      return
    }

    const num = parseInt(digits, 10)
    const formatted = formatIN(num)
    setDisplay(formatted)
    onChange(num)

    requestAnimationFrame(() => {
      if (!inputRef.current) return
      if (digitsBefore === 0) {
        inputRef.current.setSelectionRange(0, 0)
        return
      }
      let count = 0
      let newPos = formatted.length
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) {
          count++
          if (count === digitsBefore) {
            newPos = i + 1
            break
          }
        }
      }
      inputRef.current.setSelectionRange(newPos, newPos)
    })
  }

  return (
    <div className="relative">
      <span
        className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 dark:text-gray-400 font-medium select-none pointer-events-none"
        aria-hidden="true"
      >
        ₹
      </span>
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full h-[52px] pl-8 pr-4 border-[1.5px] border-neutral-300 dark:border-gray-600 rounded-lg text-neutral-900 dark:text-white bg-white dark:bg-gray-700 font-medium placeholder:text-neutral-300 dark:placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors ${className}`}
      />
    </div>
  )
}
