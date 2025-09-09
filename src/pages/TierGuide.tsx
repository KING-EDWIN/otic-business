import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, CheckCircle, Star, Building2, Users, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  tier_weights: { [key: string]: number };
  order_index: number;
}

const TierGuide = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState<{
    tier: string;
    confidence: number;
    reasons: string[];
  } | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('tier_questions')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
      // Fallback questions if database is not available
      setQuestions([
        {
          id: '1',
          question_text: 'How many employees does your business have?',
          question_type: 'multiple_choice',
          options: ['1-5', '6-20', '21-50', '51-100', '100+'],
          tier_weights: { basic: 0.8, standard: 0.6, premium: 0.2 },
          order_index: 1
        },
        {
          id: '2',
          question_text: 'What is your monthly revenue in UGX?',
          question_type: 'multiple_choice',
          options: ['Under 1M', '1M-5M', '5M-20M', '20M-50M', '50M+'],
          tier_weights: { basic: 0.9, standard: 0.7, premium: 0.3 },
          order_index: 2
        },
        {
          id: '3',
          question_text: 'How many locations do you operate from?',
          question_type: 'multiple_choice',
          options: ['1 location', '2-3 locations', '4-10 locations', '10+ locations'],
          tier_weights: { basic: 0.9, standard: 0.6, premium: 0.2 },
          order_index: 3
        },
        {
          id: '4',
          question_text: 'Do you need multi-user access?',
          question_type: 'multiple_choice',
          options: ['No, just me', '2-5 users', '6-20 users', '20+ users'],
          tier_weights: { basic: 0.2, standard: 0.7, premium: 0.9 },
          order_index: 4
        },
        {
          id: '5',
          question_text: 'Do you need advanced reporting and analytics?',
          question_type: 'multiple_choice',
          options: ['Basic reports only', 'Standard reports', 'Advanced analytics', 'AI-powered insights'],
          tier_weights: { basic: 0.8, standard: 0.6, premium: 0.3 },
          order_index: 5
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateRecommendation();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      navigate(-1);
    }
  };

  const calculateRecommendation = () => {
    const tierScores = { basic: 0, standard: 0, premium: 0 };
    const totalQuestions = questions.length;

    questions.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        const optionIndex = question.options.indexOf(answer);
        if (optionIndex !== -1) {
          // Simple scoring based on option index and tier weights
          const weight = question.tier_weights;
          Object.keys(tierScores).forEach(tier => {
            tierScores[tier] += weight[tier] || 0;
          });
        }
      }
    });

    // Find the tier with highest score
    const recommendedTier = Object.keys(tierScores).reduce((a, b) => 
      tierScores[a] > tierScores[b] ? a : b
    );

    const confidence = Math.min(95, Math.max(60, tierScores[recommendedTier] * 20));

    const reasons = getRecommendationReasons(recommendedTier, answers);

    setRecommendation({
      tier: recommendedTier,
      confidence: confidence,
      reasons: reasons
    });
  };

  const getRecommendationReasons = (tier: string, answers: { [key: string]: string }) => {
    const reasons = [];
    
    if (tier === 'basic') {
      reasons.push('Perfect for small businesses with basic needs');
      if (answers['1'] === '1-5') reasons.push('Ideal team size for Start Smart');
      if (answers['2'] === 'Under 1M') reasons.push('Matches your current revenue level');
    } else if (tier === 'standard') {
      reasons.push('Great for growing businesses with multiple users');
      if (answers['4']?.includes('2-5 users')) reasons.push('Supports your team size perfectly');
      if (answers['5']?.includes('Standard reports')) reasons.push('Includes the reporting features you need');
    } else {
      reasons.push('Perfect for established businesses with complex needs');
      if (answers['1']?.includes('21+')) reasons.push('Supports your larger team size');
      if (answers['3']?.includes('2+ locations')) reasons.push('Handles multiple locations');
    }

    return reasons;
  };

  const getTierDisplayName = (tier: string) => {
    const names = {
      basic: 'Start Smart',
      standard: 'Grow with Intelligence',
      premium: 'Enterprise Advantage'
    };
    return names[tier] || tier;
  };

  const getTierPrice = (tier: string) => {
    const prices = {
      basic: '1,000,000 UGX',
      standard: '3,000,000 UGX',
      premium: '5,000,000 UGX'
    };
    return prices[tier] || 'Contact us';
  };

  const handleContinueWithRecommendation = () => {
    navigate('/payments', {
      state: {
        selectedTier: getTierDisplayName(recommendation?.tier || 'basic'),
        tierDetails: {
          name: getTierDisplayName(recommendation?.tier || 'basic'),
          price: getTierPrice(recommendation?.tier || 'basic'),
          period: 'Per Month'
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#040458] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (recommendation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src="/Otic icon@2x.png" 
                  alt="Otic Business Logo" 
                  className="h-10 w-10"
                />
                <div>
                  <h1 className="text-2xl font-bold text-[#040458]">Your Recommendation</h1>
                  <p className="text-gray-600">Based on your answers</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Recommendation Card */}
          <Card className="mb-8 border-2 border-[#faa51a]">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-[#040458]">
                We Recommend: {getTierDisplayName(recommendation.tier)}
              </CardTitle>
              <CardDescription className="text-xl">
                {recommendation.confidence}% match for your business needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#faa51a] mb-2">
                  {getTierPrice(recommendation.tier)}
                </div>
                <div className="text-gray-600">Per Month</div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-[#040458]">Why this plan is perfect for you:</h3>
                <ul className="space-y-2">
                  {recommendation.reasons.map((reason, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleContinueWithRecommendation}
                  className="bg-[#040458] hover:bg-[#faa51a] text-white text-lg px-8 py-6"
                >
                  Continue with {getTierDisplayName(recommendation.tier)}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/tier-selection')}
                  className="border-[#040458] text-[#040458] hover:bg-[#040458] hover:text-white text-lg px-8 py-6"
                >
                  View All Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/Otic icon@2x.png" 
                alt="Otic Business Logo" 
                className="h-10 w-10"
              />
              <div>
                <h1 className="text-2xl font-bold text-[#040458]">Plan Recommendation</h1>
                <p className="text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleBack} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-6 w-6 text-[#040458]" />
                <span className="text-sm font-medium text-[#040458]">Business Assessment</span>
              </div>
              <div className="text-sm text-gray-500">
                {currentQuestionIndex + 1} / {questions.length}
              </div>
            </div>
            <CardTitle className="text-2xl text-[#040458]">
              {currentQuestion?.question_text}
            </CardTitle>
            <CardDescription>
              This helps us recommend the perfect plan for your business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={answers[currentQuestion?.id] || ''}
              onValueChange={(value) => handleAnswer(currentQuestion?.id || '', value)}
              className="space-y-4"
            >
              {currentQuestion?.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-[#faa51a] hover:bg-orange-50 cursor-pointer transition-colors">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-gray-700">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!answers[currentQuestion?.id]}
                className="bg-[#040458] hover:bg-[#faa51a] text-white flex items-center space-x-2"
              >
                <span>{currentQuestionIndex === questions.length - 1 ? 'Get Recommendation' : 'Next'}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#040458] to-[#faa51a] h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TierGuide;
