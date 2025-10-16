import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PostCard } from "@/components/PostCard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Search, Sparkles, Users, Zap } from "lucide-react";
import campusHero from "@/assets/campus-hero.png";

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-primary/30 dark:from-background/90 dark:via-background/80"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
          <div className="max-w-3xl">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold backdrop-blur-sm">
                  {t('home.hero.badge')}
                </span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-primary">
                {t('home.hero.title')}
              </h1>
              <p className="text-xl text-foreground/80 max-w-2xl">
                {t('home.hero.subtitle')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => navigate("/create")}
                  size="lg"
                  className="btn-hero text-lg px-8 shadow-xl"
                >
                  {t('home.hero.publish')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  onClick={() => navigate("/search")}
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 rounded-xl border-2 border-primary text-primary hover:bg-primary/10 backdrop-blur-sm shadow-lg"
                >
                  <Search className="mr-2 w-5 h-5" />
                  {t('home.hero.search')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30 dark:bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3 group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                100%
              </h3>
              <p className="text-foreground/70 font-medium text-lg">{t('home.stats.free')}</p>
            </div>
            <div className="space-y-3 group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary via-secondary to-primary flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('home.stats.community')}
              </h3>
              <p className="text-foreground/70 font-medium text-lg">{t('home.stats.communityDesc')}</p>
            </div>
            <div className="space-y-3 group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent via-accent to-primary flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('home.stats.easy')}
              </h3>
              <p className="text-foreground/70 font-medium text-lg">{t('home.stats.easyDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">{t('home.recent.title')}</h2>
              <p className="text-muted-foreground">{t('home.recent.subtitle')}</p>
            </div>
            <Button
              onClick={() => navigate("/search")}
              variant="outline"
              className="rounded-xl"
            >
              {t('home.recent.viewAll')}
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
              <p className="text-muted-foreground">{t('home.recent.empty')}</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
