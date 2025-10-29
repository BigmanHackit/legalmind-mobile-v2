import { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../../../lib/providers/ThemeProvider';
import {
  FileText,
  Upload,
  AlertTriangle,
  Download,
  Sparkles,
  XCircle,
  CheckCircle,
  AlertCircle,
  Info,
  ShieldAlert,
  Clock,
  TrendingUp,
  Scale,
} from 'lucide-react-native';
import { contractsApi } from '../../../lib/api/contract';
import { Contract, ContractAnalysis, ContractType, PartyRole } from '../../../lib/types';

export default function ContractToolsScreen() {
    const { activeTheme } = useTheme();
    const isDark = activeTheme === 'dark';
  
    const [activeTab, setActiveTab] = useState<'vet' | 'draft'>('vet');
    const [contractText, setContractText] = useState('');
    const [uploadedFile, setUploadedFile] = useState<any>(null);
    const [uploadedContract, setUploadedContract] = useState<Contract | null>(null);
    const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDrafting, setIsDrafting] = useState(false);
    const [draftedContract, setDraftedContract] = useState<Contract | null>(null);
  
    // Upload form state
    const [uploadForm, setUploadForm] = useState({
      title: '',
      contractType: '' as ContractType | '',
      jurisdictionId: '',
    });
  
    // Analysis form state
    const [analysisForm, setAnalysisForm] = useState({
      contractType: '' as ContractType | '',
      userPosition: 'neutral',
      focusAreas: [] as string[],
    });
  
    // Draft form state
    const [draftForm, setDraftForm] = useState({
      title: '',
      contractType: '' as ContractType | '',
      jurisdictionId: '',
      requirements: '',
      party1: '',
      party2: '',
      focusAreas: [] as string[],
    });
  
    const handleFilePick = async () => {
      if (!uploadForm.contractType) {
        Alert.alert('Error', 'Please select contract type first');
        return;
      }
  
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
          copyToCacheDirectory: true,
        });
  
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const file = result.assets[0];
          setUploadedFile(file);
          handleFileUpload(file);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to pick document');
      }
    };
  
    const handleFileUpload = async (file: any) => {
      setIsUploading(true);
  
      try {
        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          type: file.mimeType,
          name: file.name,
        } as any);
        
        if (uploadForm.title) formData.append('title', uploadForm.title);
        formData.append('contractType', uploadForm.contractType as string);
        if (uploadForm.jurisdictionId) formData.append('jurisdictionId', uploadForm.jurisdictionId);
  
        const contract = await contractsApi.uploadContract(file, {
          title: uploadForm.title || undefined,
          contractType: uploadForm.contractType as ContractType,
          jurisdictionId: uploadForm.jurisdictionId || undefined,
        });
  
        setUploadedContract(contract);
        setContractText(contract.content || '');
        Alert.alert('Success', 'Contract uploaded successfully!');
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to upload contract');
        setUploadedFile(null);
      } finally {
        setIsUploading(false);
      }
    };
  
    const handleVetContract = async () => {
      if (!uploadedContract?.id && !contractText.trim()) {
        Alert.alert('Error', 'Please upload or paste a contract first');
        return;
      }
  
      setIsAnalyzing(true);
  
      try {
        let contractId = uploadedContract?.id;
  
        if (!contractId && contractText.trim()) {
          const contract = await contractsApi.create({
            title: 'Pasted Contract',
            contractType: (analysisForm.contractType as ContractType) || 'OTHER',
            jurisdictionId: uploadForm.jurisdictionId || undefined,
            content: contractText,
          });
          contractId = contract.id;
          setUploadedContract(contract);
        }
  
        if (!contractId) {
          throw new Error('No contract to analyze');
        }
  
        const analysisResult = await contractsApi.analyzeContract(contractId, {
          contractType: (analysisForm.contractType as ContractType) || undefined,
          userPosition: analysisForm.userPosition,
          focusAreas: analysisForm.focusAreas.length > 0 ? analysisForm.focusAreas : undefined,
        });
  
        setAnalysis(analysisResult);
        Alert.alert('Success', 'Contract analysis complete!');
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Analysis failed');
      } finally {
        setIsAnalyzing(false);
      }
    };
  
    const handleDraftContract = async () => {
      if (!draftForm.title || !draftForm.contractType || !draftForm.requirements) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
  
      setIsDrafting(true);
  
      try {
        const parties = [];
        if (draftForm.party1) {
          parties.push({ role: 'PARTY_A' as PartyRole, name: draftForm.party1 });
        }
        if (draftForm.party2) {
          parties.push({ role: 'PARTY_B' as PartyRole, name: draftForm.party2 });
        }
  
        const contract = await contractsApi.draftContract({
          title: draftForm.title,
          contractType: draftForm.contractType as ContractType,
          jurisdictionId: draftForm.jurisdictionId,
          requirements: draftForm.requirements,
          parties,
          focusAreas: draftForm.focusAreas.length > 0 ? draftForm.focusAreas : undefined,
        });
  
        setDraftedContract(contract);
        Alert.alert('Success', 'Contract draft generated!');
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to generate contract');
      } finally {
        setIsDrafting(false);
      }
    };
  
    const getRiskColor = (score: number) => {
      if (score >= 80) return '#6A9113';
      if (score >= 60) return '#F59E0B';
      return '#EF4444';
    };
  
    const getRiskLevel = (score: number) => {
      if (score >= 80) return 'Low Risk';
      if (score >= 60) return 'Medium Risk';
      return 'High Risk';
    };
  
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#141517]' : 'bg-gray-50'}`}>
        <ScrollView className="flex-1">
          <View className="px-6 py-8">
            {/* Header */}
            <View className="flex-row items-center gap-3 mb-6">
              <View className="bg-[#6A9113]/20 p-2 rounded-lg">
                <FileText size={24} color="#6A9113" />
              </View>
              <View>
                <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Contract Tools
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Vet or draft legal documents
                </Text>
              </View>
            </View>
  
            {/* Tab Selector */}
            <View className="flex-row gap-3 mb-6">
              <TouchableOpacity
                onPress={() => setActiveTab('vet')}
                className={`flex-1 py-3 px-4 rounded-xl flex-row items-center justify-center gap-2 ${
                  activeTab === 'vet'
                    ? 'bg-[#6A9113]'
                    : isDark
                    ? 'bg-gray-800'
                    : 'bg-white'
                }`}
              >
                <AlertTriangle size={18} color={activeTab === 'vet' ? '#FFFFFF' : '#6A9113'} />
                <Text
                  className={`font-semibold ${
                    activeTab === 'vet' ? 'text-white' : 'text-[#6A9113]'
                  }`}
                >
                  Vet Contract
                </Text>
              </TouchableOpacity>
  
              <TouchableOpacity
                onPress={() => setActiveTab('draft')}
                className={`flex-1 py-3 px-4 rounded-xl flex-row items-center justify-center gap-2 ${
                  activeTab === 'draft'
                    ? 'bg-[#6A9113]'
                    : isDark
                    ? 'bg-gray-800'
                    : 'bg-white'
                }`}
              >
                <Sparkles size={18} color={activeTab === 'draft' ? '#FFFFFF' : '#6A9113'} />
                <Text
                  className={`font-semibold ${
                    activeTab === 'draft' ? 'text-white' : 'text-[#6A9113]'
                  }`}
                >
                  Draft Contract
                </Text>
              </TouchableOpacity>
            </View>
  
            {/* Vet Contract Tab */}
            {activeTab === 'vet' && (
              <View className="space-y-6">
                {/* Upload Section */}
                <View className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Upload or Paste Contract
                  </Text>
  
                  {/* Contract Type */}
                  <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Contract Type <Text className="text-red-500">*</Text>
                  </Text>
                  {/* Add your contract type picker here */}
  
                  {/* File Upload */}
                  <TouchableOpacity
                    onPress={handleFilePick}
                    className={`border-2 border-dashed rounded-xl p-8 items-center mt-4 ${
                      uploadForm.contractType
                        ? isDark
                          ? 'border-gray-600'
                          : 'border-gray-300'
                        : 'border-gray-200 bg-gray-100'
                    }`}
                  >
                    {isUploading ? (
                      <ActivityIndicator size="large" color="#6A9113" />
                    ) : uploadedFile ? (
                      <>
                        <FileText size={48} color="#6A9113" />
                        <Text className={`mt-3 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {uploadedFile.name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            setUploadedFile(null);
                            setUploadedContract(null);
                            setContractText('');
                          }}
                          className="mt-3 py-2 px-4 bg-red-100 rounded-lg"
                        >
                          <Text className="text-red-700 font-medium">Remove File</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <Upload size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
                        <Text className={`mt-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {uploadForm.contractType ? 'Tap to upload contract' : 'Select contract type first'}
                        </Text>
                        <Text className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          PDF, DOCX, TXT (Max 10MB)
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
  
                  {/* Or Paste Text */}
                  <Text className={`text-center text-sm my-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    OR PASTE TEXT
                  </Text>
  
                  <TextInput
                    placeholder="Paste your contract text here..."
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    multiline
                    numberOfLines={8}
                    value={contractText}
                    onChangeText={setContractText}
                    editable={!uploadedFile}
                    className={`p-4 rounded-xl min-h-[200px] ${
                      isDark
                        ? 'bg-gray-700 text-white border-gray-600'
                        : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border`}
                    textAlignVertical="top"
                  />
  
                  {/* Analyze Button */}
                  <TouchableOpacity
                    onPress={handleVetContract}
                    disabled={(!contractText.trim() && !uploadedContract) || isAnalyzing}
                    className={`mt-6 py-4 px-6 rounded-xl flex-row items-center justify-center ${
                      (!contractText.trim() && !uploadedContract) || isAnalyzing
                        ? 'bg-gray-400'
                        : 'bg-[#6A9113]'
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text className="text-white font-semibold ml-2">Analyzing...</Text>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={20} color="#FFFFFF" />
                        <Text className="text-white font-semibold ml-2">Analyze Contract</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
  
                {/* Analysis Results */}
                {analysis && (
                  <View className="space-y-4">
                    {/* Risk Score */}
                    <View className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                      <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Risk Assessment
                      </Text>
                      <View className="items-center py-4">
                        <Text
                          className="text-5xl font-bold mb-2"
                          style={{ color: getRiskColor(analysis.overallRiskScore * 100) }}
                        >
                          {Math.round(analysis.overallRiskScore * 100)}/100
                        </Text>
                        <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {getRiskLevel(analysis.overallRiskScore * 100)}
                        </Text>
                      </View>
                    </View>
  
                    {/* Executive Summary */}
                    <View className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                      <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Executive Summary
                      </Text>
                      <Text className={`leading-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {analysis.executiveSummary}
                      </Text>
                    </View>
  
                    {/* Red Flags */}
                    {analysis.redFlags && analysis.redFlags.length > 0 && (
                      <View className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Red Flags ({analysis.redFlags.length})
                        </Text>
                        {analysis.redFlags.map((flag, index) => (
                          <View
                            key={index}
                            className="flex-row gap-3 p-3 mb-2 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500"
                          >
                            <ShieldAlert size={20} color="#EF4444" />
                            <Text className="flex-1 text-sm text-gray-700 dark:text-gray-300">{flag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
  
            {/* Draft Contract Tab */}
            {activeTab === 'draft' && (
              <View className="space-y-6">
                {/* Draft Form */}
                <View className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Contract Details
                  </Text>
  
                  {/* Title */}
                  <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Contract Title <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    placeholder="e.g., Service Agreement"
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    value={draftForm.title}
                    onChangeText={(text) => setDraftForm({ ...draftForm, title: text })}
                    className={`p-4 rounded-xl mb-4 ${
                      isDark
                        ? 'bg-gray-700 text-white border-gray-600'
                        : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border`}
                  />
  
                  {/* Requirements */}
                  <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Requirements & Key Terms <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    placeholder="Describe the main terms, obligations, payment details..."
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    multiline
                    numberOfLines={8}
                    value={draftForm.requirements}
                    onChangeText={(text) => setDraftForm({ ...draftForm, requirements: text })}
                    className={`p-4 rounded-xl min-h-[200px] ${
                      isDark
                        ? 'bg-gray-700 text-white border-gray-600'
                        : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border`}
                    textAlignVertical="top"
                  />
  
                  {/* Generate Button */}
                  <TouchableOpacity
                    onPress={handleDraftContract}
                    disabled={isDrafting || !draftForm.title || !draftForm.requirements}
                    className={`mt-6 py-4 px-6 rounded-xl flex-row items-center justify-center ${
                      isDrafting || !draftForm.title || !draftForm.requirements
                        ? 'bg-gray-400'
                        : 'bg-[#6A9113]'
                    }`}
                  >
                    {isDrafting ? (
                      <>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text className="text-white font-semibold ml-2">Generating...</Text>
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} color="#FFFFFF" />
                        <Text className="text-white font-semibold ml-2">Generate Contract</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
  
                {/* Draft Preview */}
                {draftedContract && (
                  <View className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {draftedContract.title}
                    </Text>
                    <Text className={`leading-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {draftedContract.content}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }