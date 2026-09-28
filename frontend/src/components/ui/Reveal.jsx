import { useInView } from '@hooks/useInView'

export default function Reveal({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
  threshold = 0.14,
  style,
  ...props
}) {
  const [ref, inView] = useInView(threshold)
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'is-visible' : ''} ${className}`.trim()}
      style={{ ...style, ...(delay ? { transitionDelay: `${delay}ms` } : null) }}
      {...props}
    >
      {children}
    </Tag>
  )
}
