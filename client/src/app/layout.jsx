import './globals.css'
import Navbar from './components/Navbar/Navbar' // <-- 1. Import the Navbar

export const metadata = {
  title: 'Aqua Alert',
  description: 'A machine learning-powered flood prediction application.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}