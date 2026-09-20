import sign from '../assets/GUI.png'

export default function Box({ children, className = '' }) {
  return (
    <div
      className={`gui-box ${className}`}
      style={{ backgroundImage: `url("${sign}")` }}
    >
      {children}
    </div>
  )
}