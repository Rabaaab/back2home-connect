import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PostCard } from "@/components/PostCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { Search as SearchIcon, Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";

export default function Search() {
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, selectedCategory, selectedType, searchQuery, startDate, endDate]);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*, profiles(full_name, avatar_url)")
      .order("created_at", { ascending: false });
    
    setPosts(data || []);
    setLoading(false);
  };

  const filterPosts = () => {
    let filtered = posts;

    if (selectedType !== "all") {
      filtered = filtered.filter((post) => post.type === selectedType);
    }

    if (selectedCategory) {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (startDate) {
      filtered = filtered.filter((post) => {
        const postDate = new Date(post.date_occurred);
        return postDate >= startDate;
      });
    }

    if (endDate) {
      filtered = filtered.filter((post) => {
        const postDate = new Date(post.date_occurred);
        return postDate <= endDate;
      });
    }

    setFilteredPosts(filtered);
  };

  const clearDateFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Rechercher
          </h1>
          <p className="text-muted-foreground">
            Trouvez les objets perdus ou trouvés sur le campus
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Rechercher par titre ou description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>

          <Tabs value={selectedType} onValueChange={setSelectedType}>
            <TabsList className="grid w-full max-w-md grid-cols-3 rounded-xl">
              <TabsTrigger value="all" className="rounded-xl">Tous</TabsTrigger>
              <TabsTrigger value="lost" className="rounded-xl">Perdus</TabsTrigger>
              <TabsTrigger value="found" className="rounded-xl">Trouvés</TabsTrigger>
            </TabsList>
          </Tabs>

          <div>
            <h3 className="font-semibold mb-3">Catégories</h3>
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Filtrer par date</h3>
              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearDateFilters}
                  className="h-8"
                >
                  <X className="w-4 h-4 mr-1" />
                  Effacer
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal rounded-xl"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy") : "Date début"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal rounded-xl"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy") : "Date fin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Aucun résultat</h3>
            <p className="text-muted-foreground">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
