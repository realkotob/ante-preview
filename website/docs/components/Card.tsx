import React from 'react'
import {
  Feather, Cpu, LockOpen, Zap, Terminal, Plug,
  Shapes, WifiOff, Network, TrendingUp, Code,
  Server, ScrollText, Globe, BookOpen, FlaskConical,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  'feather':     Feather,
  'microchip':   Cpu,
  'lock-open':   LockOpen,
  'bolt':        Zap,
  'terminal':    Terminal,
  'plug':        Plug,
  'shapes':      Shapes,
  'wifi-slash':  WifiOff,
  'sitemap':     Network,
  'chart-line':  TrendingUp,
  'code':        Code,
  'server':      Server,
  'scroll':      ScrollText,
  'globe':       Globe,
  'book':        BookOpen,
  'flask':       FlaskConical,
}

interface CardProps {
  title: string
  icon?: string
  href?: string
  children?: React.ReactNode
}

interface CardGroupProps {
  cols?: number
  children?: React.ReactNode
}

export function Card({ title, icon, href, children }: CardProps) {
  const Icon = icon ? iconMap[icon] : undefined

  const inner = (
    <div style={{
      border: '1px solid var(--vocs-color_border)',
      borderRadius: '10px',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      height: '100%',
      transition: 'border-color 0.15s, background 0.15s',
      background: 'var(--vocs-color_background)',
    }}>
      {Icon && (
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          background: 'color-mix(in srgb, var(--vocs-color_accentText) 12%, transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2px',
        }}>
          <Icon size={16} color="var(--vocs-color_accentText)" />
        </div>
      )}
      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--vocs-color_text)' }}>
        {title}
      </div>
      {children && (
        <div style={{ fontSize: '0.85rem', color: 'var(--vocs-color_text3)', lineHeight: 1.55 }}>
          {children}
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <a
        href={href}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
        onMouseEnter={(e) => {
          const div = e.currentTarget.firstChild as HTMLElement
          if (div) {
            div.style.borderColor = 'var(--vocs-color_accentText)'
            div.style.background = 'color-mix(in srgb, var(--vocs-color_accentText) 4%, var(--vocs-color_background))'
          }
        }}
        onMouseLeave={(e) => {
          const div = e.currentTarget.firstChild as HTMLElement
          if (div) {
            div.style.borderColor = 'var(--vocs-color_border)'
            div.style.background = 'var(--vocs-color_background)'
          }
        }}
      >
        {inner}
      </a>
    )
  }

  return <div style={{ height: '100%' }}>{inner}</div>
}

export function CardGroup({ cols = 2, children }: CardGroupProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gap: '12px',
      margin: '20px 0',
    }}>
      {children}
    </div>
  )
}
