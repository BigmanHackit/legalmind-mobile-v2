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
import {
  ArrowLeft,
  Shield,
  FileText,
  Sparkles,
  Download,
  Users,
} from 'lucide-react-native';
import { contractsApi } from '../../../lib/api/contract';
import { ContractAnalysisPanel } from '../../../components/contracts/ContractAnalysisPanel';

interface Props {
  route: { params: { contractId: string } };
  navigation: any;
}

export default function ContractDetailScreen({ route, navigation }: Props) {
  const { contractId } = route.params;
  const [contractData, setContractData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);

  const loadContractData = useCallback(async () => {
    try {
      setIsLoading(true);
      const contractResponse = await contractsApi.getById(contractId);
      setContractData(contractResponse);

      if (contractResponse.analysis) {
        try {
          const analysisResponse = await contractsApi.getContractAnalysis(
            contractId
          );
          setAnalysis(analysisResponse);
        } catch (analysisError) {
          console.error('Failed to load existing analysis:', analysisError);
          setAnalysis(null);
        }
      } else {
        setAnalysis(null);
      }
    } catch (error) {
      console.error('Failed to load contract data:', error);
      Alert.alert('Error', 'Failed to load contract details');
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    loadContractData();
  }, [loadContractData]);

  const startAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      const newAnalysis = await contractsApi.analyzeContract(contractId, {
        userPosition: 'neutral',
      });

      setAnalysis(newAnalysis);
      const updatedContract = await contractsApi.getById(contractId);
      setContractData(updatedContract);
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
      const regeneratedAnalysis = await contractsApi.analyzeContract(
        contractId,
        { userPosition: 'neutral' }
      );
      setAnalysis(regeneratedAnalysis);

      const updatedContract = await contractsApi.getById(contractId);
      setContractData(updatedContract);
      Alert.alert('Success', 'Analysis regenerated successfully');
    } catch (error) {
      console.error('Failed to regenerate analysis:', error);
      Alert.alert('Error', 'Failed to regenerate analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = async () => {
    if (!contractId) return;

    try {
      const blob = await contractsApi.exportAnalysis(contractId, 'pdf');
      Alert.alert('Success', 'Report downloaded!');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to download report');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      COMPLETED: 'bg-green-100 dark:bg-green-900/30',
      ANALYZING: 'bg-blue-100 dark:bg-blue-900/30',
      PENDING_ANALYSIS: 'bg-yellow-100 dark:bg-yellow-900/30',
      DRAFT: 'bg-gray-100 dark:bg-gray-900/30',
      UNDER_REVIEW: 'bg-orange-100 dark:bg-orange-900/30',
      APPROVED: 'bg-green-100 dark:bg-green-900/30',
      EXECUTED: 'bg-purple-100 dark:bg-purple-900/30',
      TERMINATED: 'bg-red-100 dark:bg-red-900/30',
    };
    return colors[status] || 'bg-gray-100';
  };

  const getContractTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      EMPLOYMENT: 'bg-blue-100 dark:bg-blue-900/30',
      SERVICE_AGREEMENT: 'bg-purple-100 dark:bg-purple-900/30',
      PARTNERSHIP: 'bg-green-100 dark:bg-green-900/30',
      LEASE_RENTAL: 'bg-orange-100 dark:bg-orange-900/30',
    };
    return colors[type] || 'bg-gray-100';
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#6A9113" />
      </View>
    );
  }

  if (!contractData) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-slate-950 p-4">
        <View className="bg-white dark:bg-slate-900 rounded-lg p-4 mb-4">
          <Text className="text-gray-900 dark:text-white text-center mb-4">
            Contract not found or you don't have access to view it.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="border border-gray-300 dark:border-slate-700 p-3 rounded-lg flex-row items-center justify-center"
        >
          <ArrowLeft size={20} color="#6A9113" />
          <Text className="text-gray-900 dark:text-white ml-2 font-medium">
            Back to Contracts
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isDrafted =
    contractData.status === 'COMPLETED' && contractData.draftingPrompt;
  const isVetted =
    contractData.status === 'COMPLETED' && !contractData.draftingPrompt;
  const showStartAnalysisButton =
    contractData.status === 'PENDING_ANALYSIS' && !analysis;

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
            {contractData.title}
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
          <View className={`px-2 py-1 rounded-full ${getStatusColor(contractData.status)}`}>
            <Text className="text-xs font-medium">
              {contractData.status.replace(/_/g, ' ')}
            </Text>
          </View>
          <View className={`px-2 py-1 rounded-full ${getContractTypeColor(contractData.contractType)}`}>
            <Text className="text-xs font-medium">
              {contractData.contractType.replace(/_/g, ' ')}
            </Text>
          </View>
          {isDrafted && (
            <View className="bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full flex-row items-center">
              <Sparkles size={12} color="#A855F7" />
              <Text className="text-xs font-medium ml-1">AI Drafted</Text>
            </View>
          )}
          {isVetted && analysis && (
            <View className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full flex-row items-center">
              <Shield size={12} color="#3B82F6" />
              <Text className="text-xs font-medium ml-1">Vetted</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Contract Overview */}
        <View className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Contract Overview
          </Text>

          <View className="space-y-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Type
              </Text>
              <Text className="text-sm font-medium text-gray-900 dark:text-white">
                {contractData.contractType.replace(/_/g, ' ')}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Status
              </Text>
              <View className={`px-2 py-1 rounded-full ${getStatusColor(contractData.status)}`}>
                <Text className="text-xs font-medium">
                  {contractData.status.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Created
              </Text>
              <Text className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(contractData.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Version
              </Text>
              <Text className="text-sm font-medium text-gray-900 dark:text-white">
                v{contractData.version}
              </Text>
            </View>

            {contractData.jurisdiction && (
              <View className="pt-2 border-t border-gray-200 dark:border-slate-700">
                <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Jurisdiction
                </Text>
                <Text className="text-sm font-medium text-gray-900 dark:text-white">
                  {contractData.jurisdiction.name},{' '}
                  {contractData.jurisdiction.country}
                </Text>
              </View>
            )}

            {contractData.parties && contractData.parties.length > 0 && (
              <View className="pt-2 border-t border-gray-200 dark:border-slate-700">
                <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Parties
                </Text>
                {contractData.parties.map((party: any) => (
                  <View key={party.id} className="flex-row items-center mb-2">
                    <Users size={16} color="#6B7280" />
                    <Text className="text-sm font-medium text-gray-900 dark:text-white ml-2">
                      {party.name}
                    </Text>
                    <View className="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded ml-2">
                      <Text className="text-xs">
                        {party.role.replace(/_/g, ' ')}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {contractData.content && (
              <View className="pt-2 border-t border-gray-200 dark:border-slate-700">
                <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Contract Content
                </Text>
                <ScrollView
                  className="max-h-60 bg-gray-50 dark:bg-slate-800 rounded-lg p-3"
                  nestedScrollEnabled
                >
                  <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {contractData.content}
                  </Text>
                </ScrollView>
              </View>
            )}
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
                Our AI is analyzing the contract for risks and issues...
              </Text>
            </View>
          </View>
        )}

        {showStartAnalysisButton && !isAnalyzing && (
          <View className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6">
            <View className="items-center">
              <View className="w-16 h-16 bg-[#6A9113]/10 dark:bg-[#6A9113]/20 rounded-full items-center justify-center mb-4">
                <Shield size={32} color="#6A9113" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Ready for Analysis
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                This contract is ready for AI-powered risk analysis.
              </Text>
              <TouchableOpacity
                onPress={startAnalysis}
                disabled={isAnalyzing}
                className="bg-[#6A9113] px-6 py-3 rounded-lg flex-row items-center"
              >
                <Shield size={18} color="white" />
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
                <Shield size={32} color="#3B82F6" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Analysis Complete
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                Contract analysis completed with{' '}
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

        {analysis && (
          <View className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 mb-4">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Analysis Stats
            </Text>
            <View className="space-y-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Risk Score
                </Text>
                <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                  {Math.round(analysis.overallRiskScore * 100)}/100
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Confidence
                </Text>
                <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                  {(analysis.confidence * 100).toFixed(1)}%
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Red Flags
                </Text>
                <Text className="text-sm font-semibold text-red-600">
                  {Array.isArray(analysis.redFlags)
                    ? analysis.redFlags.length
                    : 0}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Terms Analyzed
                </Text>
                <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                  {Array.isArray(analysis.terms) ? analysis.terms.length : 0}
                </Text>
              </View>
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
        <ContractAnalysisPanel
          analysis={analysis}
          contract={contractData}
          onClose={() => setShowAnalysisPanel(false)}
          onRegenerate={handleRegenerateAnalysis}
          isRegenerating={isAnalyzing}
        />
      </Modal>
    </View>
  );
};