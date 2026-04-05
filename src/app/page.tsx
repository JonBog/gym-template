import config from '../../gym.config'
import NavBar from '@/components/landing/NavBar'
import HeroSection from '@/components/landing/HeroSection'
import CoachSection from '@/components/landing/CoachSection'
import ServiciosSection from '@/components/landing/ServiciosSection'
import RutinasSection from '@/components/landing/RutinasSection'
import ContactoSection from '@/components/landing/ContactoSection'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar config={config} />
      <HeroSection config={config} />
      <CoachSection config={config} />
      <ServiciosSection config={config} />
      <RutinasSection />
      <ContactoSection config={config} />
      <Footer config={config} />
    </div>
  )
}
