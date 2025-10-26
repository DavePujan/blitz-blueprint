import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Target, Users, Trophy, Shield } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(20, 27, 38, 0.85), rgba(20, 27, 38, 0.95)), url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="container mx-auto px-4 z-10">
          <div className="text-center space-y-8 animate-slide-in-up">
            {/* Logo/Title */}
            <div className="space-y-4">
              <div className="inline-block">
                <h1 className="text-7xl md:text-8xl font-black tracking-tighter">
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse-glow">
                    TACTICAL
                  </span>
                  <br />
                  <span className="text-foreground">STRIKE</span>
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                Competitive web-based tactical shooter. Create private rooms, strategize with your team, dominate the battlefield.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                variant="hero" 
                size="lg"
                onClick={() => navigate('/lobby')}
                className="text-lg px-10 py-6 h-auto"
              >
                Enter Lobby
              </Button>
              <Button 
                variant="tactical" 
                size="lg"
                onClick={() => navigate('/game-demo')}
                className="text-lg px-10 py-6 h-auto"
              >
                View Demo
              </Button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-4 justify-center pt-8">
              <FeaturePill icon={<Users />} text="5v5 Competitive" />
              <FeaturePill icon={<Shield />} text="Private Rooms" />
              <FeaturePill icon={<Target />} text="Tactical Combat" />
              <FeaturePill icon={<Trophy />} text="Ranked Matches" />
            </div>
          </div>
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Game <span className="text-primary">Features</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Private Lobbies"
              description="Create password-protected rooms. Invite friends. Full control over match settings."
              icon="🔒"
            />
            <FeatureCard
              title="Stylised Graphics"
              description="Unique art style combining tactical realism with vibrant, competitive aesthetics."
              icon="🎨"
            />
            <FeatureCard
              title="Competitive Play"
              description="Ranked matchmaking. Skill-based progression. Climb the leaderboards."
              icon="⚡"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>Tactical Strike © 2025 - Web Multiplayer Shooter</p>
        </div>
      </footer>
    </div>
  );
};

const FeaturePill = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="tactical-border px-6 py-3 rounded-full flex items-center gap-2 hover-tactical">
    <span className="text-primary">{icon}</span>
    <span className="text-sm font-medium">{text}</span>
  </div>
);

const FeatureCard = ({ title, description, icon }: { title: string; description: string; icon: string }) => (
  <div className="tactical-border p-8 rounded-lg hover-tactical group">
    <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="text-2xl font-bold mb-3">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Index;
