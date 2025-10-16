import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PostCard } from "@/components/PostCard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Search, Package2, Heart } from "lucide-react";
import campusHero from "@/assets/campus-hero.png";

export default function Home() {
  const navigate = useNavigate();
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentPosts();
  }, []);

  const fetchRecentPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*, profiles(full_name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(6);
    
    setRecentPosts(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[600px] flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${campusHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-primary/30"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
          <div className="max-w-3xl">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium backdrop-blur-sm">
                  Plateforme UEMF
                </span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-primary">
                Retrouvez vos objets perdus facilement
              </h1>
              <p className="text-xl text-foreground/80 max-w-2xl">
                La communauté étudiante de l'UEMF s'entraide pour retrouver les objets perdus. Publiez, recherchez, et redonnez le sourire!
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => navigate("/create")}
                  size="lg"
                  className="btn-hero text-lg px-8 shadow-xl"
                >
                  Publier un objet
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  onClick={() => navigate("/search")}
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 rounded-xl border-2 border-primary text-primary hover:bg-primary/10 bg-white/80 backdrop-blur-sm shadow-lg"
                >
                  <Search className="mr-2 w-5 h-5" />
                  Rechercher
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto shadow-lg">
                <Package2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                100%
              </h3>
              <p className="text-muted-foreground">Gratuit</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center mx-auto shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Communauté
              </h3>
              <p className="text-muted-foreground">Étudiants UEMF</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center mx-auto shadow-lg">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Facile
              </h3>
              <p className="text-muted-foreground">Recherche simple</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Publications récentes</h2>
              <p className="text-muted-foreground">Découvrez les derniers objets perdus et trouvés</p>
            </div>
            <Button
              onClick={() => navigate("/search")}
              variant="outline"
              className="rounded-xl"
            >
              Voir tout
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucune publication pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
