import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, User, Trash2, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [claimMessage, setClaimMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*, profiles(full_name, avatar_url, email)")
      .eq("id", id)
      .single();
    setPost(data);
    setLoading(false);
  };

  const handleClaim = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const { error } = await supabase.from("claims").insert([{
      post_id: id,
      claimer_id: user.id,
      message: claimMessage,
    }]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } else {
      toast({
        title: "Demande envoyée!",
        description: "Le propriétaire a reçu votre demande.",
      });
      setClaimMessage("");
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (!error) {
      toast({ title: "Publication supprimée" });
      navigate("/");
    }
  };

  if (loading) return null;
  if (!post) return <div>Post non trouvé</div>;

  const categoryLabels: Record<string, string> = {
    electronics: "Électronique",
    clothing: "Vêtements",
    books: "Livres",
    keys: "Clés",
    bags: "Sacs",
    documents: "Documents",
    other: "Autre",
  };

  const isOwner = user?.id === post.user_id;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="overflow-hidden shadow-lg">
            {post.images?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
                {post.images.map((img: string, i: number) => (
                  <img key={i} src={img} alt="" className="w-full h-64 object-cover rounded-lg" />
                ))}
              </div>
            )}
            
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex gap-2">
                    <Badge className={post.type === "lost" ? "badge-lost" : "badge-found"}>
                      {post.type === "lost" ? "Perdu" : "Trouvé"}
                    </Badge>
                    <Badge variant="outline">{categoryLabels[post.category]}</Badge>
                  </div>
                  <h1 className="text-3xl font-bold">{post.title}</h1>
                </div>
                {isOwner && (
                  <Button variant="destructive" size="icon" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <p className="text-lg">{post.description}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(post.date_occurred), "d MMMM yyyy", { locale: fr })}
                </div>
                {post.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {post.location}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <Avatar>
                  <AvatarImage src={post.profiles?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                    {post.profiles?.full_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{post.profiles?.full_name || "Utilisateur"}</p>
                  <p className="text-sm text-muted-foreground">{post.profiles?.email}</p>
                </div>
              </div>
            </div>
          </Card>

          {!isOwner && user && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Réclamer cet objet
              </h3>
              <Textarea
                placeholder="Décrivez pourquoi cet objet vous appartient..."
                value={claimMessage}
                onChange={(e) => setClaimMessage(e.target.value)}
                rows={4}
                className="mb-4"
              />
              <Button onClick={handleClaim} className="btn-hero">
                Envoyer la demande
              </Button>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
