import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Bell, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Notification {
  id: string;
  post_id: string;
  claimer_id: string;
  message: string;
  status: string;
  created_at: string;
  post_title: string;
  claimer_name: string;
  claimer_email: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    checkAuthAndFetchNotifications();
  }, []);

  const checkAuthAndFetchNotifications = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    fetchNotifications(session.user.id);
  };

  const fetchNotifications = async (userId: string) => {
    try {
      // Récupérer les claims pour les posts de l'utilisateur
      const { data: claims, error } = await supabase
        .from("claims")
        .select(`
          id,
          post_id,
          claimer_id,
          message,
          status,
          created_at,
          posts!inner(title, user_id),
          profiles!claims_claimer_id_fkey(full_name, email)
        `)
        .eq("posts.user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedNotifications = claims?.map((claim: any) => ({
        id: claim.id,
        post_id: claim.post_id,
        claimer_id: claim.claimer_id,
        message: claim.message,
        status: claim.status,
        created_at: claim.created_at,
        post_title: claim.posts.title,
        claimer_name: claim.profiles?.full_name || "Utilisateur",
        claimer_email: claim.profiles?.email || "",
      })) || [];

      setNotifications(formattedNotifications);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les notifications",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (claimId: string, newStatus: "accepted" | "rejected") => {
    try {
      const { error } = await supabase
        .from("claims")
        .update({ status: newStatus })
        .eq("id", claimId);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `La demande a été ${newStatus === "accepted" ? "acceptée" : "refusée"}`,
      });

      // Recharger les notifications
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetchNotifications(session.user.id);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" /> En attente</Badge>;
      case "accepted":
        return <Badge variant="default" className="gap-1 bg-green-500"><CheckCircle2 className="w-3 h-3" /> Acceptée</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Refusée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Il y a moins d'une heure";
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Notifications</h1>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chargement des notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune notification pour le moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          Nouvelle demande pour "{notification.post_title}"
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {formatDate(notification.created_at)}
                        </CardDescription>
                      </div>
                      {getStatusBadge(notification.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-1">De: {notification.claimer_name}</p>
                        <p className="text-sm text-muted-foreground mb-2">{notification.claimer_email}</p>
                        <p className="text-sm bg-muted p-3 rounded-lg">{notification.message}</p>
                      </div>
                      
                      {notification.status === "pending" && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleUpdateStatus(notification.id, "accepted")}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Accepter
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleUpdateStatus(notification.id, "rejected")}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Refuser
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/post/${notification.post_id}`)}
                          >
                            Voir la publication
                          </Button>
                        </div>
                      )}
                      
                      {notification.status !== "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/post/${notification.post_id}`)}
                        >
                          Voir la publication
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
