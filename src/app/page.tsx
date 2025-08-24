import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bot, Users, Map } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">Outplann</Link>
        <nav>
          <Button asChild>
            <Link href="/plan">Get Started</Link>
          </Button>
        </nav>
      </header>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container text-center py-20 sm:py-32">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold max-w-4xl mx-auto !leading-tight tracking-tight">
            Stop Planning, Start Exploring. Your AI Guide Awaits.
          </h1>
          <p className="max-w-2xl mx-auto mt-6 text-lg text-muted-foreground">
            Outplann instantly creates personalized itineraries based on your vibe, powered by AI and refined by a community of explorers.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/plan">Spark Your First Itinerary</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="container pb-20 sm:pb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center p-6">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">AI-Powered Spark</h3>
              <p className="text-muted-foreground mt-2">
                Tell us your mood and interests. Our AI instantly generates a unique, tailored plan just for you.
              </p>
            </div>
            <div className="flex flex-col items-center p-6">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Community-Guided Paths</h3>
              <p className="text-muted-foreground mt-2">
                Explore itineraries and favorite spots shared by a community of real travelers.
              </p>
            </div>
            <div className="flex flex-col items-center p-6">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Map className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Seamless Planning</h3>
              <p className="text-muted-foreground mt-2">
                Visualize your trip on an interactive map and easily adjust your plans on the fly.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}