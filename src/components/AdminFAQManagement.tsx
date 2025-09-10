import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Crown,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Clock,
  AlertTriangle
} from 'lucide-react';
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

const AdminFAQManagement = () => {
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [questions, setQuestions] = useState<FAQQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<FAQQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<FAQQuestion | null>(null);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    category_id: '',
    question: '',
    answer: '',
    tier_required: '',
    feature_name: '',
    page_location: '',
    usage_instructions: '',
    keywords: '',
    is_active: true
  });

  const tiers = [
    { value: 'none', label: 'All Tiers' },
    { value: 'free_trial', label: 'Free Trial' },
    { value: 'start_smart', label: 'Start Smart' },
    { value: 'grow_intelligence', label: 'Grow with Intelligence' },
    { value: 'enterprise_advantage', label: 'Enterprise Advantage' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [searchQuery, selectedCategory, questions]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('FAQ data loading timeout, using fallback data');
        setCategories(getFallbackCategories());
        setQuestions(getFallbackQuestions());
        setLoading(false);
      }, 10000); // 10 second timeout
      
      try {
        // Load categories with timeout
        const categoriesPromise = supabase
          .from('faq_categories')
          .select('*')
          .order('sort_order');

        const categoriesResult = await Promise.race([
          categoriesPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Categories timeout')), 5000))
        ]) as any;

        if (categoriesResult.error) {
          console.error('Error loading categories:', categoriesResult.error);
          setCategories(getFallbackCategories());
        } else {
          setCategories(categoriesResult.data || []);
        }

        // Load questions with timeout
        const questionsPromise = supabase
          .from('faq_questions')
          .select('*')
          .order('created_at', { ascending: false });

        const questionsResult = await Promise.race([
          questionsPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Questions timeout')), 5000))
        ]) as any;

        if (questionsResult.error) {
          console.error('Error loading questions:', questionsResult.error);
          setQuestions(getFallbackQuestions());
        } else {
          setQuestions(questionsResult.data || []);
        }
        
        clearTimeout(timeoutId);
      } catch (networkError) {
        console.error('Network error loading FAQ data:', networkError);
        setCategories(getFallbackCategories());
        setQuestions(getFallbackQuestions());
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Error loading FAQ data:', error);
      setCategories(getFallbackCategories());
      setQuestions(getFallbackQuestions());
    } finally {
      setLoading(false);
    }
  };

  // Fallback data for admin FAQ management
  const getFallbackCategories = (): FAQCategory[] => [
    { id: '1', name: 'Getting Started', description: 'Basic setup questions', sort_order: 1 },
    { id: '2', name: 'POS System', description: 'Point of Sale questions', sort_order: 2 },
    { id: '3', name: 'Inventory Management', description: 'Inventory questions', sort_order: 3 },
    { id: '4', name: 'Analytics & Reports', description: 'Analytics questions', sort_order: 4 },
    { id: '5', name: 'User Management', description: 'User account questions', sort_order: 5 },
    { id: '6', name: 'Billing & Subscriptions', description: 'Billing questions', sort_order: 6 }
  ];

  const getFallbackQuestions = (): FAQQuestion[] => [
    {
      id: '1',
      category_id: '1',
      question: 'How do I create my account?',
      answer: 'To create your account, click "Get Started" on the homepage, select "Business Account", fill in your details, and verify your email. You can start with a 14-day free trial.',
      tier_required: 'free_trial',
      feature_name: 'Account Creation',
      page_location: '/user-type',
      usage_instructions: '1. Go to homepage 2. Click "Get Started" 3. Select "Business Account" 4. Fill in details 5. Verify email',
      keywords: ['account', 'signup', 'register', 'create', 'getting started'],
      is_active: true,
      view_count: 0,
      helpful_count: 0,
      not_helpful_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      category_id: '1',
      question: 'What is included in the free trial?',
      answer: 'The free trial includes full access to all features: POS system, inventory management, AI analytics, multi-user access (up to 3 users), all payment methods, and priority support.',
      tier_required: 'free_trial',
      feature_name: 'Free Trial',
      page_location: '/pricing',
      usage_instructions: 'All features are available during the 14-day free trial period with no credit card required.',
      keywords: ['trial', 'free', 'features', 'included', '14 days'],
      is_active: true,
      view_count: 0,
      helpful_count: 0,
      not_helpful_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      category_id: '2',
      question: 'How do I process a sale?',
      answer: 'To process a sale: 1. Go to the POS page 2. Scan or search for products 3. Add quantities 4. Select payment method 5. Complete the transaction. Receipts are automatically generated.',
      tier_required: 'free_trial',
      feature_name: 'POS System',
      page_location: '/pos',
      usage_instructions: 'Navigate to POS → Scan/Search products → Add to cart → Select payment → Complete sale',
      keywords: ['pos', 'sale', 'transaction', 'payment', 'receipt'],
      is_active: true,
      view_count: 0,
      helpful_count: 0,
      not_helpful_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const filterQuestions = () => {
    let filtered = questions;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => q.category_id === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(query) ||
        q.answer.toLowerCase().includes(query) ||
        q.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    setFilteredQuestions(filtered);
  };

  const resetForm = () => {
    setFormData({
      category_id: '',
      question: '',
      answer: '',
      tier_required: 'none',
      feature_name: '',
      page_location: '',
      usage_instructions: '',
      keywords: '',
      is_active: true
    });
  };

  const handleAddQuestion = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditQuestion = (question: FAQQuestion) => {
    setFormData({
      category_id: question.category_id,
      question: question.question,
      answer: question.answer,
      tier_required: question.tier_required || 'none',
      feature_name: question.feature_name || '',
      page_location: question.page_location || '',
      usage_instructions: question.usage_instructions || '',
      keywords: question.keywords.join(', '),
      is_active: question.is_active
    });
    setSelectedQuestion(question);
    setIsEditDialogOpen(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setDeleteQuestionId(questionId);
    setIsDeleteDialogOpen(true);
  };

  const submitQuestion = async () => {
    try {
      const questionData = {
        ...formData,
        tier_required: formData.tier_required === 'none' ? null : formData.tier_required,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
      };

      if (selectedQuestion) {
        // Update existing question
        const { error } = await supabase
          .from('faq_questions')
          .update(questionData)
          .eq('id', selectedQuestion.id);

        if (error) {
          console.error('Error updating question:', error);
          toast.error('Failed to update question. Check console for details.');
          return;
        }
        toast.success('Question updated successfully');
      } else {
        // Add new question
        const { error } = await supabase
          .from('faq_questions')
          .insert([questionData]);

        if (error) {
          console.error('Error adding question:', error);
          toast.error('Failed to add question. Check console for details.');
          return;
        }
        toast.success('Question added successfully');
      }

      await loadData();
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Failed to save question. Check console for details.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteQuestionId) return;

    try {
      const { error } = await supabase
        .from('faq_questions')
        .delete()
        .eq('id', deleteQuestionId);

      if (error) throw error;
      toast.success('Question deleted successfully');
      await loadData();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteQuestionId(null);
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
    if (!tier || tier === 'none') return 'All Tiers';
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
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#040458]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#040458]">FAQ Management</h2>
          <p className="text-gray-600">Manage frequently asked questions and answers</p>
        </div>
        <Button onClick={handleAddQuestion} className="bg-[#040458] hover:bg-[#faa51a] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Questions</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <Card key={question.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-[#040458] mb-2">{question.question}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{question.answer}</p>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-3">
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
                    <Badge variant={question.is_active ? "default" : "secondary"} className="text-xs">
                      {question.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{question.view_count} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{question.helpful_count} helpful</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(question.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditQuestion(question)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredQuestions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No questions found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Question Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedQuestion ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
            <DialogDescription>
              {selectedQuestion ? 'Update the question and answer details' : 'Create a new FAQ question and answer'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="category_id">Category</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) => setFormData({...formData, question: e.target.value})}
                placeholder="Enter the question..."
              />
            </div>

            <div>
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={(e) => setFormData({...formData, answer: e.target.value})}
                placeholder="Enter the answer..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tier_required">Tier Required</Label>
                <Select value={formData.tier_required} onValueChange={(value) => setFormData({...formData, tier_required: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiers.map((tier) => (
                      <SelectItem key={tier.value} value={tier.value}>
                        {tier.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="feature_name">Feature Name</Label>
                <Input
                  id="feature_name"
                  value={formData.feature_name}
                  onChange={(e) => setFormData({...formData, feature_name: e.target.value})}
                  placeholder="e.g., POS System"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="page_location">Page Location</Label>
              <Input
                id="page_location"
                value={formData.page_location}
                onChange={(e) => setFormData({...formData, page_location: e.target.value})}
                placeholder="e.g., /pos, /inventory"
              />
            </div>

            <div>
              <Label htmlFor="usage_instructions">Usage Instructions</Label>
              <Textarea
                id="usage_instructions"
                value={formData.usage_instructions}
                onChange={(e) => setFormData({...formData, usage_instructions: e.target.value})}
                placeholder="Step-by-step instructions..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                placeholder="e.g., pos, sale, transaction, payment"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setIsEditDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={submitQuestion} className="bg-[#040458] hover:bg-[#faa51a] text-white">
              {selectedQuestion ? 'Update Question' : 'Add Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Delete Question</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFAQManagement;
