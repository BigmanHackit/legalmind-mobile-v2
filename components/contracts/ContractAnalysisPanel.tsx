// components/contracts/ContractAnalysisPanel.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  X,
  Sparkles,
  CheckCircle,
  Download,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  AlertCircle,
  XCircle,
  TrendingUp,
  Clock,
  Info,
} from 'lucide-react-native';

interface Props {
  analysis: any;
  contract: any;
  onClose: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export const ContractAnalysisPanel = ({
  analysis,
  onClose,
  onRegenerate,
  isRegenerating,
}: Props) => {
  const [showAllTerms, setShowAllTerms] = useState(false);
  const [expandedTab, setExpandedTab] = useState<string>('summary');

  const getRiskLevel = (score: number) => {
    if (score >= 0.8) return 'High Risk';
    if (score >= 0.6) return 'Medium Risk';
    return 'Low Risk';
  };

  const getRiskColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskBadge = (risk: string) => {
    const colors: Record<string, string> = {
      VERY_LOW: 'bg-green-100',
      LOW: 'bg-blue-100',
      MEDIUM: 'bg-yellow-100',
      HIGH: 'bg-orange-100',
      CRITICAL: 'bg-red-100',
    };
    return colors[risk] || 'bg-gray-100';
  };

  const getArrayLength = (value: any): number => {
    return Array.isArray(value) ? value.length : 0;
  };

  const displayedTerms = showAllTerms
    ? analysis.terms
    : analysis.terms?.slice(0, 5);

  if (!analysis) return null;

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <View className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 bg-[#6A9113]/10 dark:bg-[#6A9113]/20 rounded-lg items-center justify-center mr-3">
              <Sparkles size={20} color="#6A9113" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                Contract Analysis
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                Risk Assessment
              </Text>
            </View>
          </View>
          <View className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full mr-2">
            <Text className="text-xs font-medium text-green-700 dark:text-green-400">
              {(analysis.confidence * 100).toFixed(1)}%
            </Text>
          </View>
          <TouchableOpacity
            onPress={onRegenerate}
            disabled={isRegenerating}
            className="border border-gray-300 dark:border-slate-700 px-3 py-2 rounded-lg mr-2"
          >
            <Sparkles size={16} color="#6A9113" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Risk Assessment Summary */}
        <View className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 mb-4">
          <Text className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Risk Assessment Summary
          </Text>

          {/* Risk Score Display */}
          <View className="items-center border rounded-lg py-6 mb-4">
            <Text className={`text-5xl font-bold mb-2 ${getRiskColor(analysis.overallRiskScore)}`}>
              {Math.round(analysis.overallRiskScore * 100)}/100
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {getRiskLevel(analysis.overallRiskScore)}
            </Text>
          </View>

          {/* Metadata */}
          <View className="space-y-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <TrendingUp size={16} color="#6B7280" />
                <Text className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                  Confidence Score
                </Text>
              </View>
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                {(analysis.confidence * 100).toFixed(0)}%
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Clock size={16} color="#6B7280" />
                <Text className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                  Processing Time
                </Text>
              </View>
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                {analysis.processingTime}s
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Info size={16} color="#6B7280" />
                <Text className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                  Analysis ID
                </Text>
              </View>
              <Text className="text-xs font-mono text-gray-900 dark:text-white">
                {analysis.id?.slice(-8)}
              </Text>
            </View>
          </View>

          {/* Issue Counts */}
          <View className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
            <View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  High Risk Issues
                </Text>
                <Text className="text-sm font-semibold text-red-600">
                  {getArrayLength(analysis.redFlags)} found
                </Text>
              </View>
              <View className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <View
                  className="h-full bg-red-500"
                  style={{
                    width: `${Math.min(getArrayLength(analysis.redFlags) * 25, 100)}%`,
                  }}
                />
              </View>
            </View>

            <View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Medium Risk Issues
                </Text>
                <Text className="text-sm font-semibold text-yellow-600">
                  {getArrayLength(analysis.unfavorableTerms)} found
                </Text>
              </View>
              <View className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <View
                  className="h-full bg-yellow-500"
                  style={{
                    width: `${Math.min(getArrayLength(analysis.unfavorableTerms) * 25, 100)}%`,
                  }}
                />
              </View>
            </View>

            <View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Ambiguous Terms
                </Text>
                <Text className="text-sm font-semibold text-orange-600">
                  {getArrayLength(analysis.ambiguousTerms)} found
                </Text>
              </View>
              <View className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <View
                  className="h-full bg-orange-500"
                  style={{
                    width: `${Math.min(getArrayLength(analysis.ambiguousTerms) * 25, 100)}%`,
                  }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Executive Summary */}
        <View className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 mb-4">
          <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
            Executive Summary
          </Text>
          <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {analysis.executiveSummary}
          </Text>
        </View>

        {/* Key Findings */}
        {analysis.keyFindings && (
          <View className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 mb-4">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Key Findings
            </Text>
            <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {analysis.keyFindings}
            </Text>
          </View>
        )}

        {/* Expandable Sections */}
        {/* Red Flags */}
        <View className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 mb-4">
          <TouchableOpacity
            onPress={() => setExpandedTab(expandedTab === 'redflags' ? '' : 'redflags')}
            className="p-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1">
              <ShieldAlert size={20} color="#EF4444" />
              <Text className="text-base font-semibold text-gray-900 dark:text-white ml-2">
                Red Flags ({getArrayLength(analysis.redFlags)})
              </Text>
            </View>
            {expandedTab === 'redflags' ? (
              <ChevronUp size={20} color="#6B7280" />
            ) : (
              <ChevronDown size={20} color="#6B7280" />
            )}
          </TouchableOpacity>

          {expandedTab === 'redflags' && (
            <View className="px-4 pb-4">
              {getArrayLength(analysis.redFlags) > 0 ? (
                analysis.redFlags.map((flag: string, index: number) => (
                  <View
                    key={index}
                    className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-r mb-2"
                  >
                    <View className="flex-row items-start">
                      <ShieldAlert size={16} color="#EF4444" style={{ marginTop: 2, marginRight: 8 }} />
                      <Text className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                        {flag}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View className="py-8 items-center">
                  <CheckCircle size={48} color="#10B981" />
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    No critical red flags identified
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Unfavorable Terms */}
        <View className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 mb-4">
          <TouchableOpacity
            onPress={() => setExpandedTab(expandedTab === 'unfavorable' ? '' : 'unfavorable')}
            className="p-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1">
              <XCircle size={20} color="#F59E0B" />
              <Text className="text-base font-semibold text-gray-900 dark:text-white ml-2">
                Unfavorable Terms ({getArrayLength(analysis.unfavorableTerms)})
              </Text>
            </View>
            {expandedTab === 'unfavorable' ? (
              <ChevronUp size={20} color="#6B7280" />
            ) : (
              <ChevronDown size={20} color="#6B7280" />
            )}
          </TouchableOpacity>

          {expandedTab === 'unfavorable' && (
            <View className="px-4 pb-4">
              {getArrayLength(analysis.unfavorableTerms) > 0 ? (
                analysis.unfavorableTerms.map((term: any, index: number) => (
                  <View key={index} className="border rounded-lg p-3 mb-2">
                    <View className="flex-row items-start justify-between mb-2">
                      <Text className="flex-1 font-semibold text-gray-900 dark:text-white text-sm">
                        {term.title?.replace(/\*\*/g, '')}
                      </Text>
                      <View className={`px-2 py-1 rounded ${getRiskBadge(term.risk)}`}>
                        <Text className="text-xs font-medium">{term.risk}</Text>
                      </View>
                    </View>
                    <Text className="text-sm text-gray-700 dark:text-gray-300">
                      {term.explanation}
                    </Text>
                  </View>
                ))
              ) : (
                <View className="py-8 items-center">
                  <Info size={48} color="#6B7280" />
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    No unfavorable terms identified
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Ambiguous Terms */}
        <View className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 mb-4">
          <TouchableOpacity
            onPress={() => setExpandedTab(expandedTab === 'ambiguous' ? '' : 'ambiguous')}
            className="p-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1">
              <AlertCircle size={20} color="#F59E0B" />
              <Text className="text-base font-semibold text-gray-900 dark:text-white ml-2">
                Ambiguous Terms ({getArrayLength(analysis.ambiguousTerms)})
              </Text>
            </View>
            {expandedTab === 'ambiguous' ? (
              <ChevronUp size={20} color="#6B7280" />
            ) : (
              <ChevronDown size={20} color="#6B7280" />
            )}
          </TouchableOpacity>

          {expandedTab === 'ambiguous' && (
            <View className="px-4 pb-4">
              {getArrayLength(analysis.ambiguousTerms) > 0 ? (
                analysis.ambiguousTerms.map((term: any, index: number) => (
                  <View
                    key={index}
                    className="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-r mb-2"
                  >
                    <View className="flex-row items-start">
                      <AlertCircle size={16} color="#F59E0B" style={{ marginTop: 2, marginRight: 8 }} />
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                          {term.title?.replace(/\*\*/g, '')}
                        </Text>
                        <Text className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {term.concern}
                        </Text>
                        {term.suggestion && (
                          <View className="bg-white dark:bg-slate-800 rounded p-2 mt-1">
                            <Text className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                              Suggestion:
                            </Text>
                            <Text className="text-xs text-gray-700 dark:text-gray-300">
                              {term.suggestion}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View className="py-8 items-center">
                  <CheckCircle size={48} color="#10B981" />
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    No ambiguous terms identified
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Recommendations */}
        {getArrayLength(analysis.recommendations) > 0 && (
          <View className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 mb-4">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Recommendations
            </Text>
            {analysis.recommendations.map((rec: any, index: number) => (
              <View
                key={index}
                className="flex-row items-start border rounded-lg p-3 mb-2"
              >
                <View
                  className={`px-2 py-1 rounded mr-2 ${
                    rec.priority === 'HIGH'
                      ? 'bg-red-100'
                      : rec.priority === 'MEDIUM'
                      ? 'bg-yellow-100'
                      : 'bg-blue-100'
                  }`}
                >
                  <Text className="text-xs font-medium">{rec.priority}</Text>
                </View>
                <Text className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                  {rec.suggestion}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Terms Summary */}
        {getArrayLength(analysis.terms) > 0 && (
          <View className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 mb-4">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              All Terms Summary
            </Text>
            {displayedTerms?.map((term: any) => (
              <View key={term.id} className="border rounded-lg p-3 mb-2">
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="flex-1 font-medium text-gray-900 dark:text-white text-sm mr-2">
                    {term.title?.replace(/\*\*/g, '')}
                  </Text>
                  <View className={`px-2 py-1 rounded ${getRiskBadge(term.riskLevel)}`}>
                    <Text className="text-xs font-medium">{term.riskLevel}</Text>
                  </View>
                </View>
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  {term.explanation}
                </Text>
              </View>
            ))}

            {getArrayLength(analysis.terms) > 5 && (
              <TouchableOpacity
                onPress={() => setShowAllTerms(!showAllTerms)}
                className="border border-gray-300 dark:border-slate-700 py-2 rounded-lg flex-row items-center justify-center mt-2"
              >
                {showAllTerms ? (
                  <>
                    <ChevronUp size={16} color="#6B7280" />
                    <Text className="text-sm text-gray-900 dark:text-white ml-2">
                      Hide
                    </Text>
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} color="#6B7280" />
                    <Text className="text-sm text-gray-900 dark:text-white ml-2">
                      +{getArrayLength(analysis.terms) - 5} more terms
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Timestamp */}
        <View className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4">
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            Analysis created: {new Date(analysis.createdAt).toLocaleString()}
          </Text>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 p-4">
        <View className="flex-row gap-2">
          <TouchableOpacity className="flex-1 border border-gray-300 dark:border-slate-700 py-3 rounded-lg flex-row items-center justify-center">
            <Download size={18} color="#6A9113" />
            <Text className="text-gray-900 dark:text-white font-medium ml-2">
              Export PDF
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-[#6A9113] py-3 rounded-lg flex-row items-center justify-center">
            <CheckCircle size={18} color="white" />
            <Text className="text-white font-medium ml-2">Mark Reviewed</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};