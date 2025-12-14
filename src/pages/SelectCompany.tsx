import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';

const SelectCompany = () => {
  const navigate = useNavigate();
  const { setCompanyBySlug } = useCompany();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a company name or code');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, slug')
        .eq('is_active', true)
        .or(`slug.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;

      setSearchResults(data || []);
    } catch (err) {
      console.error('Search error:', err);
      toast.error('Failed to search companies');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCompany = async (slug: string) => {
    const success = await setCompanyBySlug(slug);
    if (success) {
      navigate('/auth');
    } else {
      toast.error('Failed to select company');
    }
  };

  const handleCreateCompany = () => {
    navigate('/register-company');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Find Your Company</CardTitle>
          <CardDescription>
            Enter your company name or code to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Company name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {hasSearched && (
            <div className="space-y-2">
              {searchResults.length > 0 ? (
                searchResults.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => handleSelectCompany(company.slug)}
                    className="w-full p-3 text-left rounded-lg border border-border hover:bg-accent transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <p className="text-sm text-muted-foreground">{company.slug}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No companies found</p>
                  <p className="text-sm mt-1">Try a different search or create a new company</p>
                </div>
              )}
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleCreateCompany}
          >
            <Plus className="h-4 w-4 mr-2" />
            Register New Company
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectCompany;
