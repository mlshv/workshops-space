import { useEffect, useRef } from 'react'

export default function useWhenChanged(
  callback: (value: unknown, prevValue: unknown) => void,
  value: unknown,
  comparator = valuesAreEqual,
) {
  const firstRun = useRef(true)
  const prevValue = useRef(value)

  useEffect(() => {
    if (firstRun.current) {
      // First run
      firstRun.current = false
    } else {
      // Not first run
      if (!comparator(value, prevValue.current)) {
        callback(value, prevValue.current)
      }
      prevValue.current = value
    }
  }, [value])
}

function valuesAreEqual(valueA: unknown, valueB: unknown) {
  if (Array.isArray(valueA) && Array.isArray(valueB)) {
    if (valueA.length != valueB.length) {
      return false
    }
    for (var i = 0; i < valueA.length; i++) {
      if (valueA[i] != valueB[i]) {
        return false
      }
    }
    return true
  }

  return valueA == valueB
}
