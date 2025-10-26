import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Package } from "lucide-react";
import { z } from "zod";

const validEstablishments = ['eps', 'eidia', 'emadu', 'fshs', 'ebs', 'iesjp', 'fep', 'eib', 'fem', 'femd', 'fsits'];

const authSchema = z.object({
  email: z.string()
    .email("Email invalide")
    .refine(
      (email) => {
        const emailPattern = /@([a-z]+)\.ueuromed\.org$/i;
        const match = email.match(emailPattern);
        return match && validEstablishments.includes(match[1].toLowerCase());
      },
      { message: "Email invalide. Utilisez votre email universitaire (@eps, @eidia, @emadu, @fshs, @ebs, @iesjp, @fep, @eib, @fem, @femd, ou @fsits.ueuromed.org)" }
    ),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  fullName: z.string().min(2, "Le nom doit contenir au moins 2 caractères").optional(),
});

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("signup") === "true");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validationData = isSignUp 
        ? { email, password, fullName }
        : { email, password };
      
      authSchema.parse(validationData);

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        toast({
          title: "Inscription réussie!",
          description: "Vous pouvez maintenant vous connecter.",
        });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Connexion réussie!",
          description: "Bienvenue sur Back2Me.",
        });
        navigate("/");
      }
    } catch (error: any) {
      const errorMessage = !isSignUp && (error.message?.includes('Invalid') || error.message?.includes('Email') || error.message?.includes('Password'))
        ? "Email ou mot de passe incorrect"
        : error.message || "Une erreur est survenue.";
      
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto shadow-lg">
            <Package className="w-10 h-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Back2Me
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {isSignUp ? "Créer votre compte UEMF" : "Connectez-vous à votre compte"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  placeholder="Votre nom"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email universitaire</Label>
              <Input
                id="email"
                type="email"
                placeholder="nom.prenom@etab.ueuromed.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full btn-hero"
              disabled={loading}
            >
              {loading ? "Chargement..." : isSignUp ? "S'inscrire" : "Se connecter"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary"
            >
              {isSignUp
                ? "Vous avez déjà un compte? Connectez-vous"
                : "Pas encore de compte? Inscrivez-vous"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
