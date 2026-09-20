import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Temporary diagnostic entry point. Any error while loading or running the app
// is shown in a box at the bottom of the page. The box sits OUTSIDE React's
// root element, so it never interferes with the game. Once things work you can
// restore your original main.jsx.

const root = document.getElementById('root')

let box = null
let count = 0

function describe(err) {
  if (!err) return 'Unknown error'
  return err.stack || err.message || String(err)
}

function showError(title, err) {
  const text = describe(err)
  // Browsers fire this harmless event all the time; it isn't a real error.
  if (text.includes('ResizeObserver loop')) return
  console.error(title, err)

  if (!box) {
    box = document.createElement('div')
    Object.assign(box.style, {
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      maxHeight: '45vh',
      overflow: 'auto',
      zIndex: 99999,
      background: '#1a0f0f',
      color: '#ff8a8a',
      font: '13px/1.4 monospace',
      borderTop: '2px solid #ff8a8a',
      padding: '8px 12px',
    })
    const close = document.createElement('button')
    close.textContent = 'Dismiss'
    close.onclick = () => {
      box.remove()
      box = null
    }
    box.append(close)
    document.body.append(box)
  }
  if (count++ >= 5) return // don't flood the screen
  const pre = document.createElement('pre')
  pre.style.cssText = 'white-space:pre-wrap;margin:8px 0 0'
  pre.textContent = `${title}\n${text}`
  box.append(pre)
}

class Boundary extends React.Component {
  state = { error: null }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error) {
    showError('Render error', error)
  }
  render() {
    if (this.state.error) return null
    return this.props.children
  }
}

window.addEventListener('error', (e) => showError('Uncaught error', e.error || e.message))
window.addEventListener('unhandledrejection', (e) => showError('Unhandled promise rejection', e.reason))

import('./App.jsx')
  .then(({ default: App }) => {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <Boundary>
          <App />
        </Boundary>
      </React.StrictMode>,
    )
  })
  .catch((err) => showError('Failed to load App.jsx or something it imports', err))