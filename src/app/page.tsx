'use client'
import Header from "../components/reusables/Header";
import Footer from '../components/reusables/Footer'
import Landing from "@/components/Landing";
export default function LandingPage() {

  return (
    <div className="flex flex-col min-h-screen select-none caret-transparent">
      <Header htmlFor="user"/>
       <Landing/>
      <Footer htmlFor="user"/>
    </div>
  );
}
