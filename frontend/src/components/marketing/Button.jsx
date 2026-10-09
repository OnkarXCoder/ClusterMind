const VARIANTS = {
  primary: 'dm-btn-primary',
  secondary: 'dm-btn-outline',
  danger: 'dm-btn-danger',
  ghost: 'dm-btn-ghost',
}

const SIZES = {
  sm: 'dm-btn-sm',
  md: '',
  lg: '',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  icon: Icon,
  ...props
}) {
  return (
    <button
      type={type}
      className={`dm-btn ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon style={{ flexShrink: 0, width: size === 'sm' ? 14 : 16, height: size === 'sm' ? 14 : 16 }} />}
      <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{children}</span>
    </button>
  )
}
