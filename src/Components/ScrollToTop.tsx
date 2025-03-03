import React, { useMemo, useCallback, useEffect, useReducer } from 'react'

// Reducer
type State = {
  isVisible: boolean
  progress: number
}

type Action = { type: 'scrolling'; payload: { visible: boolean; offset: number } }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'scrolling':
      return {
        isVisible: action.payload.visible,
        progress: action.payload.offset
      }

    default:
      return state
  }
}

export interface ScrollToTopProps {
  size?: number
  offsetTop?: number
  bgColor?: string
  strokeWidth?: number
  strokeFillColor?: string
  strokeEmptyColor?: string
  symbol?: string
  symbolSize?: number
  symbolColor?: string
  /**
   * `onScrolling` Callback function that is triggered while scrolling with `value` passed
   */
  onScrolling?: (offsetTop: number) => void
  /**
   * `onScrollEnd` Callback function that is triggered when scroll is ended
   */
  onScrollEnd?: () => void
  className?: string
  style?: React.CSSProperties
}

export const ScrollToTop = ({
  size = 50,
  offsetTop = 100,
  bgColor = 'rgb(0 0 0 / 75%)',
  strokeWidth = 4,
  strokeFillColor = 'rgb(0 0 0 / 50%)',
  strokeEmptyColor = 'rgb(200 200 200 / 85%)',
  symbol = '⮙',
  symbolSize = 20,
  symbolColor = '#fff',
  onScrolling,
  onScrollEnd,
  className = 'to-top-progress',
  style
}: ScrollToTopProps) => {
  const center = useMemo(() => size / 2, [size])
  const radius = useMemo(() => size / 2 - strokeWidth / 2, [size, strokeWidth])
  const dasharray = useMemo(() => Math.PI * radius * 2, [radius])

  const [{ isVisible, progress }, dispatch] = useReducer(reducer, {
    isVisible: false,
    progress: dasharray
  })

  const scrollListener = useCallback(() => {
    const { clientHeight, scrollHeight, scrollTop } = document.documentElement
    const percentage = scrollTop / (scrollHeight - clientHeight)

    if (percentage === 1) if (onScrollEnd) onScrollEnd()
    if (onScrolling) onScrolling(scrollTop)

    dispatch({
      type: 'scrolling',
      payload: {
        visible: scrollTop > offsetTop,
        offset: dasharray - dasharray * percentage
      }
    })
  }, [offsetTop, dasharray, onScrolling, onScrollEnd])

  useEffect(() => {
    window.addEventListener('scroll', scrollListener)

    return () => window.removeEventListener('scroll', scrollListener)
  }, [scrollListener])

  const scrollToTop = () => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    })
  }

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        bottom: 15,
        right: 15,
        visibility: isVisible ? 'visible' : 'hidden',
        opacity: isVisible ? 1 : 0,
        transition: 'visibility .3s linear, opacity .3s linear',
        cursor: 'pointer',
        userSelect: 'none',
        ...style
      }}
      onClick={scrollToTop}
      role='button'
      tabIndex={0}
      aria-hidden='true'
    >
      <svg
        style={{
          display: 'block',
          transform: 'rotate(-90deg)'
        }}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        focusable='false'
      >
        {/* Background */}
        <circle fill={bgColor} stroke={strokeEmptyColor} strokeWidth={strokeWidth} r={radius} cx={center} cy={center} />
        {/* Progress */}
        <circle
          style={{
            transition: 'stroke-dashoffset 0.3s linear'
          }}
          fill='none'
          stroke={strokeFillColor}
          strokeWidth={strokeWidth}
          r={radius}
          cx={center}
          cy={center}
          strokeDasharray={dasharray}
          strokeDashoffset={progress}
        />
        {/* Symbol inside */}
        <text
          x={center}
          y={center}
          textAnchor='middle'
          dominantBaseline='middle'
          transform={`rotate(90, ${center}, ${center})`}
          fill={symbolColor}
          fontSize={symbolSize}
        >
          {symbol}
        </text>
      </svg>
    </div>
  )
}
