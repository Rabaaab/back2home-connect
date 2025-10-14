import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface PostCardProps {
  post: {
    id: string;
    type: "lost" | "found";
    title: string;
    description: string;
    category: string;
    date_occurred: string;
    location?: string;
    images: string[];
    is_resolved: boolean;
    created_at: string;
    profiles?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export const PostCard = ({ post }: PostCardProps) => {
  const navigate = useNavigate();
  
  const categoryLabels: Record<string, string> = {
    electronics: "Électronique",
    clothing: "Vêtements",
    books: "Livres",
    keys: "Clés",
    bags: "Sacs",
    documents: "Documents",
    other: "Autre",
  };

  const firstImage = post.images?.[0];

  return (
    <Card
      onClick={() => navigate(`/post/${post.id}`)}
      className="overflow-hidden cursor-pointer card-hover shadow-[var(--shadow-card)]"
    >
      {firstImage && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            src={firstImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start gap-2 mb-2">
          <Badge
            className={`${
              post.type === "lost" ? "badge-lost" : "badge-found"
            } rounded-full px-3`}
          >
            {post.type === "lost" ? "Perdu" : "Trouvé"}
          </Badge>
          <Badge variant="outline" className="rounded-full px-3">
            {categoryLabels[post.category]}
          </Badge>
          {post.is_resolved && (
            <Badge className="bg-pink text-pink-foreground rounded-full px-3 ml-auto">
              Résolu
            </Badge>
          )}
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {post.description}
        </p>
        
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>
              {format(new Date(post.date_occurred), "d MMMM yyyy", { locale: fr })}
            </span>
          </div>
          {post.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">{post.location}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
