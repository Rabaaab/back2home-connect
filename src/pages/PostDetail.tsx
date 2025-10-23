import React, { useEffect, useState } from "react";
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
import { StarRating } from "@/components/StarRating";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [claimMessage, setClaimMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<any[]>([]);
  const [ratingDialog, setRatingDialog] = useState<{ open: boolean; claimId: string; userId: string } | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ownerRating, setOwnerRating] = useState({ average: 0, count: 0 });

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
    
    // Fetch claims if user is the post owner
    if (data) {
      fetchClaims(data.user_id);
      // Fetch owner's rating
      fetchOwnerRating(data.user_id);
    }
  };

  const fetchOwnerRating = async (userId: string) => {
    const { data: ratings } = await supabase
      .from("ratings")
      .select("stars")
      .eq("rated_user_id", userId);

    if (ratings && ratings.length > 0) {
      const total = ratings.reduce((sum, r) => sum + r.stars, 0);
      setOwnerRating({
        average: total / ratings.length,
        count: ratings.length
      });
    }
  };

  const fetchClaims = async (postOwnerId: string) => {
    const session = await supabase.auth.getSession();
    const currentUserId = session.data.session?.user?.id;
    
    if (currentUserId === postOwnerId) {
      // Owner view: see all claims
      const { data } = await supabase
        .from("claims")
        .select("*, profiles(full_name, avatar_url, email), ratings(*)")
        .eq("post_id", id)
        .order("created_at", { ascending: false });
      setClaims(data || []);
    } else if (currentUserId) {
      // Claimer view: see only their claims
      const { data } = await supabase
        .from("claims")
        .select("*, profiles(full_name, avatar_url, email), ratings(*)")
        .eq("post_id", id)
        .eq("claimer_id", currentUserId)
        .order("created_at", { ascending: false });
      setClaims(data || []);
    }
  };
  
  const handleRateUser = async () => {
    if (!ratingDialog || selectedRating === 0) return;

    const { error } = await supabase.from("ratings").insert({
      claim_id: ratingDialog.claimId,
      rated_user_id: ratingDialog.userId,
      rater_user_id: user?.id,
      stars: selectedRating,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } else {
      toast({
        title: "Évaluation envoyée",
        description: "Merci pour votre feedback !",
      });
      setRatingDialog(null);
      setSelectedRating(0);
      if (post) fetchClaims(post.user_id);
    }
  };

  const handleClaim = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Get current user profile
    const { data: claimerProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

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
      // Send email notification to post owner
      try {
        await supabase.functions.invoke('send-claim-notification', {
          body: {
            ownerEmail: post.profiles.email,
            ownerName: post.profiles.full_name || "Utilisateur",
            claimerName: claimerProfile?.full_name || "Utilisateur",
            claimerEmail: claimerProfile?.email || user.email,
            postTitle: post.title,
            message: claimMessage,
          },
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't show error to user, claim was still created
      }

      toast({
        title: "Demande envoyée!",
        description: "Le propriétaire a reçu votre demande par email.",
      });
      setClaimMessage("");
      // Refresh claims
      if (post) fetchClaims(post.user_id);
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
                <div className="flex-1">
                  <p className="font-medium">{post.profiles?.full_name || "Utilisateur"}</p>
                  <p className="text-sm text-muted-foreground">{post.profiles?.email}</p>
                  {ownerRating.count > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={ownerRating.average} size="sm" />
                      <span className="text-xs text-muted-foreground">
                        ({ownerRating.count} avis)
                      </span>
                    </div>
                  )}
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

          {isOwner && claims.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Réclamations reçues ({claims.length})
              </h3>
              <div className="space-y-4">
                {claims.map((claim: any) => {
                  const hasRated = claim.ratings && claim.ratings.length > 0;
                  const canRate = !isOwner && user?.id === claim.claimer_id && !hasRated;
                  
                  return (
                    <div key={claim.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={claim.profiles?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                            {claim.profiles?.full_name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{claim.profiles?.full_name || "Utilisateur"}</p>
                          <p className="text-sm text-muted-foreground">{claim.profiles?.email}</p>
                        </div>
                        <Badge variant={claim.status === "pending" ? "secondary" : "default"}>
                          {claim.status === "pending" ? "En attente" : claim.status === "approved" ? "Approuvé" : "Rejeté"}
                        </Badge>
                      </div>
                      <p className="text-sm bg-muted p-3 rounded">{claim.message}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(claim.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                        </p>
                        {canRate && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRatingDialog({ 
                              open: true, 
                              claimId: claim.id, 
                              userId: post.user_id 
                            })}
                          >
                            Évaluer le propriétaire
                          </Button>
                        )}
                        {hasRated && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Votre évaluation:</span>
                            <StarRating rating={claim.ratings[0].stars} size="sm" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>

      <Footer />
      
      {/* Rating Dialog */}
      <Dialog open={ratingDialog?.open || false} onOpenChange={(open) => !open && setRatingDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Évaluer le propriétaire</DialogTitle>
            <DialogDescription>
              Comment s'est passée votre conversation avec le propriétaire ?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">Cliquez sur les étoiles pour évaluer</p>
              <StarRating 
                rating={selectedRating} 
                size="lg" 
                interactive 
                onRatingChange={setSelectedRating}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setRatingDialog(null)}>
                Annuler
              </Button>
              <Button 
                className="flex-1 btn-hero" 
                onClick={handleRateUser}
                disabled={selectedRating === 0}
              >
                Envoyer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
