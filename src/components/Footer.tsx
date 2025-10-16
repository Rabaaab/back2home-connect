import { Link } from "react-router-dom";
import back2meLogo from "@/assets/back2me-logo.png";

export const Footer = () => {
  return (
    <footer className="border-t mt-16 bg-gradient-to-b from-background to-muted/30 dark:from-background dark:to-muted/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <div className="bg-background dark:bg-card rounded-lg p-3 inline-block">
                <img 
                  src={back2meLogo} 
                  alt="Back2Me Logo" 
                  className="h-24 w-auto transition-transform group-hover:scale-105" 
                />
              </div>
            </Link>
            <p className="text-muted-foreground dark:text-muted-foreground max-w-md">
              La plateforme d'objets trouvés de l'UEMF. Retrouvez vos affaires perdues ou aidez quelqu'un à récupérer les siennes.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground dark:text-foreground">Navigation</h3>
            <ul className="space-y-2 text-muted-foreground dark:text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-primary transition-colors">
                  Rechercher
                </Link>
              </li>
              <li>
                <Link to="/create" className="hover:text-primary transition-colors">
                  Publier
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground dark:text-foreground">Aide</h3>
            <ul className="space-y-2 text-muted-foreground dark:text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  À propos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-muted-foreground dark:text-muted-foreground">
          <p>&copy; 2025 Back2Me - UEMF. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};
