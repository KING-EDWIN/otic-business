import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft, 
  Home, 
  HelpCircle,
  Crown,
  ExternalLink,
  Clock,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface FAQCategory {
  id: string;
  name: string;
  description: string;
  sort_order: number;
}

interface FAQQuestion {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  tier_required: string | null;
  feature_name: string | null;
  page_location: string | null;
  usage_instructions: string | null;
  keywords: string[];
  is_active: boolean;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
}

const FAQ = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [questions, setQuestions] = useState<FAQQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<FAQQuestion[]>([]);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(10);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Load FAQ data
  useEffect(() => {
    loadFAQData();
  }, []);

  // Filter questions based on search and category
  useEffect(() => {
    filterQuestions();
  }, [searchQuery, selectedCategory, questions]);

  const loadFAQData = async (page = 1) => {
    try {
      setLoading(true);
      
      // Load categories (cache these as they don't change often)
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('faq_categories')
        .select('*')
        .order('sort_order');

      if (categoriesError) {
        console.error('Error loading categories:', categoriesError);
        setCategories([]);
      } else {
        setCategories(categoriesData || []);
      }

      // Load questions with pagination
      const from = (page - 1) * questionsPerPage;
      const to = from + questionsPerPage - 1;

      const { data: questionsData, error: questionsError, count } = await supabase
        .from('faq_questions')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('view_count', { ascending: false }) // Show most viewed first
        .range(from, to);

      if (questionsError) {
        console.error('Error loading questions:', questionsError);
        setQuestions([]);
        setTotalQuestions(0);
      } else {
        setQuestions(questionsData || []);
        setTotalQuestions(count || 0);
      }
    } catch (error) {
      console.error('Error loading FAQ data:', error);
      toast.error('Failed to load FAQ data. Please check your connection and try again.');
      setCategories([]);
      setQuestions([]);
      setTotalQuestions(0);
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = questions;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(question => question.category_id === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(question => 
        question.question.toLowerCase().includes(query) ||
        question.answer.toLowerCase().includes(query) ||
        question.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    setFilteredQuestions(filtered);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setSearchLoading(true);

    // Log search query (only if user is authenticated)
    if (user && query.trim()) {
      try {
        await supabase
          .from('faq_search_logs')
          .insert({
            user_id: user.id,
            search_query: query,
            results_count: filteredQuestions.length
          });
      } catch (error) {
        console.error('Error logging search:', error);
        // Don't show error to user, just log it
      }
    }

    setSearchLoading(false);
  };

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
      // Increment view count
      incrementViewCount(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const incrementViewCount = async (questionId: string) => {
    try {
      const question = questions.find(q => q.id === questionId);
      if (question) {
        await supabase
          .from('faq_questions')
          .update({ view_count: question.view_count + 1 })
          .eq('id', questionId);
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
      // Don't show error to user, just log it
    }
  };

  const handleHelpful = async (questionId: string, isHelpful: boolean) => {
    try {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      const updateData = isHelpful 
        ? { helpful_count: question.helpful_count + 1 }
        : { not_helpful_count: question.not_helpful_count + 1 };

      await supabase
        .from('faq_questions')
        .update(updateData)
        .eq('id', questionId);

      // Update local state
      setQuestions(prev => prev.map(q => 
        q.id === questionId 
          ? { ...q, ...updateData }
          : q
      ));
    } catch (error) {
      console.error('Error updating helpful count:', error);
      // Don't show error to user, just log it
    }
  };

  const getTierColor = (tier: string | null) => {
    if (!tier) return 'bg-gray-100 text-gray-800';
    switch (tier) {
      case 'free_trial': return 'bg-blue-100 text-blue-800';
      case 'start_smart': return 'bg-green-100 text-green-800';
      case 'grow_intelligence': return 'bg-purple-100 text-purple-800';
      case 'enterprise_advantage': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierDisplayName = (tier: string | null) => {
    if (!tier) return 'All Tiers';
    switch (tier) {
      case 'free_trial': return 'Free Trial';
      case 'start_smart': return 'Start Smart';
      case 'grow_intelligence': return 'Grow with Intelligence';
      case 'enterprise_advantage': return 'Enterprise Advantage';
      default: return tier;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#040458]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div className="flex items-center space-x-3">
              <img 
                  src="/Layer 2.png" 
                  alt="Otic Business Logo" 
                  className="h-10 w-10 object-contain"
                />
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-[#040458]">Otic</span>
                  <span className="text-sm text-[#faa51a] -mt-1">Business</span>
                </div>
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex items-center space-x-2 ml-6">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-[#040458] hover:border-[#040458]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-[#040458] hover:border-[#040458]"
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden space-y-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-3">
              <img 
                  src="/Layer 2.png" 
                  alt="Otic Business Logo" 
                  className="h-8 w-8 object-contain"
                />
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-[#040458]">Otic</span>
                  <span className="text-xs text-[#faa51a] -mt-1">Business</span>
                </div>
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-[#040458] hover:border-[#040458] flex-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-[#040458] hover:border-[#040458] flex-1"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
            </div>
          </div>
          
          {/* Page Title */}
          <div className="mt-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#040458] flex items-center">
              <HelpCircle className="h-8 w-8 mr-3 text-[#faa51a]" />
              Frequently Asked Questions
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Find answers to common questions about Otic Business features and functionality
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search FAQs... (e.g., 'how to add products', 'POS system', 'inventory')"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-3 text-base border-2 border-gray-200 focus:border-[#040458] rounded-lg"
            />
            {searchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#040458]"></div>
              </div>
            )}
          </div>
        </div>

        {/* Categories and Questions */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs sm:text-sm">
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions found</h3>
                  <p className="text-gray-600">
                    {searchQuery ? 'Try a different search term' : 'No questions available for this category'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredQuestions.map((question) => (
                <Card key={question.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => toggleQuestion(question.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base sm:text-lg text-[#040458] hover:text-[#faa51a] transition-colors">
                          {question.question}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          {question.tier_required && (
                            <Badge className={`${getTierColor(question.tier_required)} text-xs`}>
                              <Crown className="h-3 w-3 mr-1" />
                              {getTierDisplayName(question.tier_required)}
                            </Badge>
                          )}
                          {question.feature_name && (
                            <Badge variant="outline" className="text-xs">
                              {question.feature_name}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {question.view_count} views
                          </span>
                        </div>
                      </div>
                      {expandedQuestions.has(question.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </CardHeader>
                  
                  {expandedQuestions.has(question.id) && (
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="prose prose-sm max-w-none">
                          <p className="text-gray-700 leading-relaxed">{question.answer}</p>
                        </div>
                        
                        {question.usage_instructions && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2">How to use:</h4>
                            <p className="text-blue-800 text-sm">{question.usage_instructions}</p>
                          </div>
                        )}
                        
                        {question.page_location && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <ExternalLink className="h-4 w-4" />
                            <span>Find this feature at: {question.page_location}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleHelpful(question.id, true)}
                              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                            >
                              <ThumbsUp className="h-4 w-4" />
                              <span>Helpful ({question.helpful_count})</span>
                            </button>
                            <button
                              onClick={() => handleHelpful(question.id, false)}
                              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                            >
                              <ThumbsDown className="h-4 w-4" />
                              <span>Not helpful ({question.not_helpful_count})</span>
                            </button>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>Updated {new Date(question.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Pagination Controls */}
        {totalQuestions > questionsPerPage && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * questionsPerPage) + 1} to {Math.min(currentPage * questionsPerPage, totalQuestions)} of {totalQuestions} questions
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                  loadFAQData(Math.max(1, currentPage - 1));
                }}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.ceil(totalQuestions / questionsPerPage) }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === Math.ceil(totalQuestions / questionsPerPage) || 
                    Math.abs(page - currentPage) <= 2
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setCurrentPage(page);
                          loadFAQData(page);
                        }}
                        className={currentPage === page ? "bg-[#040458] text-white" : ""}
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentPage(prev => Math.min(Math.ceil(totalQuestions / questionsPerPage), prev + 1));
                  loadFAQData(Math.min(Math.ceil(totalQuestions / questionsPerPage), currentPage + 1));
                }}
                disabled={currentPage >= Math.ceil(totalQuestions / questionsPerPage)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQ;
