import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";
import { useToast } from "@/hooks/use-toast";
import { Star, Mail } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Rating {
  id: string;
  stars: number;
  comment: string | null;
  created_at: string;
  rater_user_id: string;
  profiles: {
    full_name: string | null;
    email: string;
  };
}

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    checkAuth();
    if (userId) {
      fetchProfile();
      fetchRatings();
    }
  }, [userId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const fetchProfile = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    if (!data) {
      toast({
        title: "Erreur",
        description: "Profil introuvable",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setProfile(data);
    setLoading(false);
  };

  const fetchRatings = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("ratings")
      .select(`
        *,
        profiles!ratings_rater_user_id_fkey (
          full_name,
          email
        )
      `)
      .eq("rated_user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching ratings:", error);
      return;
    }

    if (data && data.length > 0) {
      setRatings(data);
      const avg = data.reduce((sum, rating) => sum + rating.stars, 0) / data.length;
      setAverageRating(avg);

      // Check if current user has already rated
      if (currentUserId) {
        const userHasRated = data.some(rating => rating.rater_user_id === currentUserId);
        setHasRated(userHasRated);
      }
    }
  };

  const handleSubmitRating = async () => {
    if (!currentUserId || !userId) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour évaluer",
        variant: "destructive",
      });
      return;
    }

    if (currentUserId === userId) {
      toast({
        title: "Erreur",
        description: "Vous ne pouvez pas vous auto-évaluer",
        variant: "destructive",
      });
      return;
    }

    if (ratingValue === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une note",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from("ratings")
      .insert({
        rater_user_id: currentUserId,
        rated_user_id: userId,
        stars: ratingValue,
        comment: comment || null,
        claim_id: null, // NULL for direct profile ratings (not based on claims)
      });

    if (error) {
      // Handle duplicate rating error
      if (error.code === '23505') {
        toast({
          title: "Erreur",
          description: "Vous avez déjà évalué cet utilisateur",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'envoyer l'évaluation",
          variant: "destructive",
        });
      }
      console.error(error);
    } else {
      toast({
        title: "Succès",
        description: "Évaluation envoyée avec succès",
      });
      setRatingValue(0);
      setComment("");
      fetchRatings();
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <Avatar className="w-32 h-32 mx-auto mb-4">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-4xl">
                {profile.full_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl">{profile.full_name || "Utilisateur"}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2 text-base">
              <Mail className="w-4 h-4" />
              {profile.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Réputation</h3>
              {ratings.length > 0 ? (
                <div className="flex items-center justify-center gap-2">
                  <StarRating rating={averageRating} size="lg" />
                  <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({ratings.length} évaluation{ratings.length > 1 ? 's' : ''})</span>
                </div>
              ) : (
                <p className="text-muted-foreground">Aucune évaluation pour le moment</p>
              )}
            </div>
          </CardContent>
        </Card>

        {currentUserId && currentUserId !== userId && !hasRated && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Évaluer cet utilisateur</CardTitle>
              <CardDescription>Partagez votre expérience avec cet utilisateur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Note</label>
                <StarRating
                  rating={ratingValue}
                  interactive
                  onRatingChange={setRatingValue}
                  size="lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Commentaire (optionnel)</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Partagez votre expérience..."
                  rows={4}
                />
              </div>
              <Button
                onClick={handleSubmitRating}
                disabled={submitting || ratingValue === 0}
                className="w-full"
              >
                {submitting ? "Envoi..." : "Envoyer l'évaluation"}
              </Button>
            </CardContent>
          </Card>
        )}

        {hasRated && currentUserId !== userId && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Vous avez déjà évalué cet utilisateur</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Évaluations reçues</CardTitle>
          </CardHeader>
          <CardContent>
            {ratings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucune évaluation pour le moment</p>
            ) : (
              <div className="space-y-4">
                {ratings.map((rating) => (
                  <div key={rating.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating rating={rating.stars} size="sm" />
                      <span className="text-sm text-muted-foreground">
                        par {rating.profiles.full_name || rating.profiles.email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(rating.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    {rating.comment && (
                      <p className="text-sm mt-2">{rating.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
