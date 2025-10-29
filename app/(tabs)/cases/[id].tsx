import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { ArrowLeft, Play, FileText } from 'lucide-react-native';
import { casesApi } from '../../../lib/api/cases';
import { analysisApi } from '../../../lib/api/analysis';
import { Case, Analysis } from '../../../lib/types';
import { CaseAnalysisPanel } from '../../../components/cases/CaseAnalysisPanel';

interface Props {
  route: { params: { caseId: string } };
  navigation: any;
}

export default function CaseDetailScreen({ route, navigation }: Props) {
  const { caseId } = route.params;
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);

  const loadCaseData = useCallback(async () => {
    try {
      setIsLoading(true);
      const caseResponse = await casesApi.getCaseById(caseId);
      setCaseData(caseResponse);

      if (caseResponse.currentAnalysis?.id) {
        try {
          const analysisResponse = await analysisApi.getAnalysisById(
            caseResponse.currentAnalysis.id
          );
          setAnalysis(analysisResponse);
          setShowAnalysisPanel(false); // Don't auto-open on mobile
        } catch (analysisError) {
          console.error('Failed to load existing analysis:', analysisError);
          setAnalysis(null);
        }
      } else {
        setAnalysis(null);
      }
    } catch (error) {
      console.error('Failed to load case data:', error);
      Alert.alert('Error', 'Failed to load case details');
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadCaseData();
  }, [loadCaseData]);

  const startAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      const newAnalysis = await analysisApi.createAnalysis({
        caseId,
        analysisType: 'FULL',
        methodology: 'IRAC',
      });

      setAnalysis(newAnalysis);
      const updatedCase = await casesApi.getCaseById(caseId);
      setCaseData(updatedCase);
      Alert.alert('Success', 'Analysis started successfully');
    } catch (error) {
      console.error('Failed to start analysis:', error);
      Alert.alert('Error', 'Failed to start analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRegenerateAnalysis = async () => {
    if (!analysis) return;

    try {
      setIsAnalyzing(true);
      const regeneratedAnalysis = await analysisApi.regenerateAnalysis(
        analysis.id
      );
      setAnalysis(regeneratedAnalysis);

      const updatedCase = await casesApi.getCaseById(caseId);
      setCaseData(updatedCase);
      Alert.alert('Success', 'Analysis regenerated successfully');
    } catch (error) {
      console.error('Failed to regenerate analysis:', error);
      Alert.alert('Error', 'Failed to regenerate analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      COMPLETED: 'bg-green-100 dark:bg-green-900/30',
      ANALYZING: 'bg-blue-100 dark:bg-blue-900/30',
      PENDING: 'bg-yellow-100 dark:bg-yellow-900/30',
      REVIEW_REQUIRED: 'bg-orange-100 dark:bg-orange-900/30',
      FAILED: 'bg-red-100 dark:bg-red-900/30',
    };
    return colors[status] || 'bg-gray-100';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      URGENT: 'bg-red-100 dark:bg-red-900/30',
      HIGH: 'bg-orange-100 dark:bg-orange-900/30',
      MEDIUM: 'bg-yellow-100 dark:bg-yellow-900/30',
      LOW: 'bg-green-100 dark:bg-green-900/30',
    };
    return colors[priority] || 'bg-gray-100';
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#6A9113" />
      </View>
    );
  }

  if (!caseData) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-slate-950 p-4">
        <View className="bg-white dark:bg-slate-900 rounded-lg p-4 mb-4">
          <Text className="text-gray-900 dark:text-white text-center mb-4">
            Case not found or you don't have access to view it.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="border border-gray-300 dark:border-slate-700 p-3 rounded-lg flex-row items-center justify-center"
        >
          <ArrowLeft size={20} color="#6A9113" />
          <Text className="text-gray-900 dark:text-white ml-2 font-medium">
            Back to Cases
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const showStartAnalysisButton = !analysis && caseData?.status === 'PENDING';

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <View className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3"
          >
            <ArrowLeft size={24} color="#6A9113" />
          </TouchableOpacity>
          <Text
            className="text-lg font-bold text-gray-900 dark:text-white flex-1"
            numberOfLines={1}
          >
            {caseData.title}
          </Text>
          {analysis && (
            <TouchableOpacity
              onPress={() => setShowAnalysisPanel(true)}
              className="ml-2 bg-[#6A9113] px-3 py-2 rounded-lg"
            >
              <FileText size={18} color="white" />
            </TouchableOpacity>
          )}
        </View>
        <View className="flex-row mt-2 gap-2 flex-wrap">
          <View className={`px-2 py-1 rounded-full ${getStatusColor(caseData.status)}`}>
            <Text className="text-xs font-medium">
              {caseData.status.replace(/_/g, ' ')}
            </Text>
          </View>
          <View className={`px-2 py-1 rounded-full ${getPriorityColor(caseData.priority)}`}>
            <Text className="text-xs font-medium">{caseData.priority}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Case Overview */}
        <View className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Case Overview
          </Text>

          <View className="space-y-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Type
              </Text>
              <Text className="text-sm font-medium text-gray-900 dark:text-white">
                {caseData.caseType}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Priority
              </Text>
              <View className={`px-2 py-1 rounded-full ${getPriorityColor(caseData.priority)}`}>
                <Text className="text-xs font-medium">{caseData.priority}</Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Status
              </Text>
              <View className={`px-2 py-1 rounded-full ${getStatusColor(caseData.status)}`}>
                <Text className="text-xs font-medium">
                  {caseData.status.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Created
              </Text>
              <Text className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(caseData.createdAt).toLocaleDateString()}
              </Text>
            </View>

            {caseData.jurisdiction && (
              <View className="pt-2 border-t border-gray-200 dark:border-slate-700">
                <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Jurisdiction
                </Text>
                <Text className="text-sm font-medium text-gray-900 dark:text-white">
                  {caseData.jurisdiction.name}, {caseData.jurisdiction.country}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {caseData.jurisdiction.type}
                </Text>
              </View>
            )}

            <View className="pt-2 border-t border-gray-200 dark:border-slate-700">
              <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Case Facts
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {caseData.facts}
              </Text>
            </View>
          </View>
        </View>

        {/* Analysis Status Cards */}
        {isAnalyzing && (
          <View className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6">
            <View className="items-center">
              <ActivityIndicator size="large" color="#6A9113" />
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">
                Analysis in Progress
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Our AI is analyzing the case using IRAC methodology...
              </Text>
            </View>
          </View>
        )}

        {showStartAnalysisButton && !isAnalyzing && (
          <View className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6">
            <View className="items-center">
              <View className="w-16 h-16 bg-[#6A9113]/10 dark:bg-[#6A9113]/20 rounded-full items-center justify-center mb-4">
                <Play size={32} color="#6A9113" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Ready for Analysis
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                This case is ready for AI-powered legal analysis using the IRAC
                methodology.
              </Text>
              <TouchableOpacity
                onPress={startAnalysis}
                disabled={isAnalyzing}
                className="bg-[#6A9113] px-6 py-3 rounded-lg flex-row items-center"
              >
                <Play size={18} color="white" />
                <Text className="text-white font-semibold ml-2">
                  Start Analysis
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {analysis && !isAnalyzing && (
          <View className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6">
            <View className="items-center">
              <View className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mb-4">
                <FileText size={32} color="#3B82F6" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Analysis Complete
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                Legal analysis has been completed with{' '}
                {(analysis.confidence * 100).toFixed(1)}% confidence.
              </Text>
              <TouchableOpacity
                onPress={() => setShowAnalysisPanel(true)}
                className="bg-[#6A9113] px-6 py-3 rounded-lg flex-row items-center"
              >
                <FileText size={18} color="white" />
                <Text className="text-white font-semibold ml-2">
                  View Analysis
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Analysis Panel Modal */}
      <Modal
        visible={showAnalysisPanel}
        animationType="slide"
        onRequestClose={() => setShowAnalysisPanel(false)}
      >
        <CaseAnalysisPanel
          analysis={analysis}
          onClose={() => setShowAnalysisPanel(false)}
          onRegenerate={handleRegenerateAnalysis}
          isRegenerating={isAnalyzing}
        />
      </Modal>
    </View>
  );
};