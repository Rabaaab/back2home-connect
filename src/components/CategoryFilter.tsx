import { Button } from "@/components/ui/button";
import { Package, Shirt, BookOpen, Key, Briefcase, FileText, MoreHorizontal } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const categories = [
  { id: "electronics", label: "Électronique", icon: Package },
  { id: "clothing", label: "Vêtements", icon: Shirt },
  { id: "books", label: "Livres", icon: BookOpen },
  { id: "keys", label: "Clés", icon: Key },
  { id: "bags", label: "Sacs", icon: Briefcase },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "other", label: "Autre", icon: MoreHorizontal },
];

export const CategoryFilter = ({ selectedCategory, onSelectCategory }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        onClick={() => onSelectCategory(null)}
        className="rounded-full"
      >
        Tous
      </Button>
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => onSelectCategory(category.id)}
            className="rounded-full"
          >
            <Icon className="w-4 h-4 mr-2" />
            {category.label}
          </Button>
        );
      })}
    </div>
  );
};
