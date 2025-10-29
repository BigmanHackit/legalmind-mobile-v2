// components/cases/CaseAnalysisPanel.tsx
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
  Scale,
  FileText,
} from 'lucide-react-native';
import { Analysis } from '../../lib/types';

interface Props {
  analysis: Analysis | null;
  onClose: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export const CaseAnalysisPanel = ({
  analysis,
  onClose,
  onRegenerate,
  isRegenerating,
}: Props) => {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    issues: true,
    rules: false,
    application: false,
    conclusion: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

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
                Legal Analysis
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                IRAC Methodology
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
        {/* Quick Stats */}
        <View className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 mb-4">
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-[#6A9113]">
                {analysis.issues?.primary?.length || 0}
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                Issues
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-[#6A9113]">
                {Array.isArray(analysis.rules?.statutes)
                  ? analysis.rules.statutes.length
                  : 0}
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                Statutes
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-[#6A9113]">
                {analysis.rules?.precedents?.length || 0}
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                Precedents
              </Text>
            </View>
          </View>
        </View>

        {/* IRAC Analysis */}
        <View className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 mb-4">
          {/* Issues Section */}
          <TouchableOpacity
            onPress={() => toggleSection('issues')}
            className="p-4 flex-row items-center justify-between border-b border-gray-200 dark:border-slate-800"
          >
            <View className="flex-row items-center flex-1">
              <View className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mr-3">
                <Text className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  I
                </Text>
              </View>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                Issues
              </Text>
            </View>
            {expandedSections.issues ? (
              <ChevronUp size={20} color="#6B7280" />
            ) : (
              <ChevronDown size={20} color="#6B7280" />
            )}
          </TouchableOpacity>

          {expandedSections.issues && analysis.issues?.primary && (
            <View className="p-4">
              <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Primary Issues
              </Text>
              {analysis.issues.primary.map((issue, index) => (
                <View
                  key={index}
                  className="flex-row p-3 bg-gray-50 dark:bg-slate-800 rounded-lg mb-2"
                >
                  <CheckCircle
                    size={16}
                    color="#6A9113"
                    style={{ marginTop: 2, marginRight: 8 }}
                  />
                  <Text className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                    {issue}
                  </Text>
                </View>
              ))}

              {analysis.issues.secondary &&
                analysis.issues.secondary.length > 0 && (
                  <>
                    <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3 mt-4">
                      Secondary Issues
                    </Text>
                    {analysis.issues.secondary.map((issue, index) => (
                      <View
                        key={index}
                        className="flex-row p-3 bg-gray-50 dark:bg-slate-800 rounded-lg mb-2"
                      >
                        <CheckCircle
                          size={16}
                          color="#3B82F6"
                          style={{ marginTop: 2, marginRight: 8 }}
                        />
                        <Text className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                          {issue}
                        </Text>
                      </View>
                    ))}
                  </>
                )}
            </View>
          )}

          {/* Rules Section */}
          <TouchableOpacity
            onPress={() => toggleSection('rules')}
            className="p-4 flex-row items-center justify-between border-b border-gray-200 dark:border-slate-800"
          >
            <View className="flex-row items-center flex-1">
              <View className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full items-center justify-center mr-3">
                <Text className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  R
                </Text>
              </View>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                Rules
              </Text>
            </View>
            {expandedSections.rules ? (
              <ChevronUp size={20} color="#6B7280" />
            ) : (
              <ChevronDown size={20} color="#6B7280" />
            )}
          </TouchableOpacity>

          {expandedSections.rules && (
            <View className="p-4">
              {analysis.rules?.statutes &&
                Array.isArray(analysis.rules.statutes) &&
                analysis.rules.statutes.length > 0 && (
                  <>
                    <View className="flex-row items-center mb-3">
                      <Scale size={16} color="#6A9113" />
                      <Text className="text-sm font-semibold text-gray-900 dark:text-white ml-2">
                        Relevant Statutes
                      </Text>
                    </View>
                    {analysis.rules.statutes.map((statute: any, index: number) => (
                      <View
                        key={index}
                        className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-500/30 mb-3"
                      >
                        <View className="flex-row items-start justify-between mb-2">
                          <Text className="text-sm font-medium text-amber-900 dark:text-amber-300 flex-1">
                            {statute.section}
                          </Text>
                          <View className="bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded-full ml-2">
                            <Text className="text-xs text-amber-700 dark:text-amber-400">
                              {(statute.relevance * 100).toFixed(0)}%
                            </Text>
                          </View>
                        </View>
                        <Text className="text-xs text-amber-800 dark:text-amber-400">
                          {statute.application}
                        </Text>
                      </View>
                    ))}
                  </>
                )}

              {analysis.rules?.principles &&
                analysis.rules.principles.length > 0 && (
                  <>
                    <View className="flex-row items-center mb-3 mt-4">
                      <FileText size={16} color="#A855F7" />
                      <Text className="text-sm font-semibold text-gray-900 dark:text-white ml-2">
                        Legal Principles
                      </Text>
                    </View>
                    {analysis.rules.principles.map((principle, index) => (
                      <View
                        key={index}
                        className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-500/30 mb-2"
                      >
                        <Text className="text-sm text-purple-800 dark:text-purple-300">
                          {principle}
                        </Text>
                      </View>
                    ))}
                  </>
                )}

              {analysis.rules?.precedents &&
                analysis.rules.precedents.length > 0 && (
                  <>
                    <View className="flex-row items-center mb-3 mt-4">
                      <CheckCircle size={16} color="#10B981" />
                      <Text className="text-sm font-semibold text-gray-900 dark:text-white ml-2">
                        Case Precedents
                      </Text>
                    </View>
                    {analysis.rules.precedents.map((precedent, index) => (
                      <View
                        key={index}
                        className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-500/30 mb-2"
                      >
                        <Text className="text-sm text-emerald-800 dark:text-emerald-300">
                          {precedent}
                        </Text>
                      </View>
                    ))}
                  </>
                )}
            </View>
          )}

          {/* Application Section */}
          <TouchableOpacity
            onPress={() => toggleSection('application')}
            className="p-4 flex-row items-center justify-between border-b border-gray-200 dark:border-slate-800"
          >
            <View className="flex-row items-center flex-1">
              <View className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full items-center justify-center mr-3">
                <Text className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  A
                </Text>
              </View>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                Application
              </Text>
            </View>
            {expandedSections.application ? (
              <ChevronUp size={20} color="#6B7280" />
            ) : (
              <ChevronDown size={20} color="#6B7280" />
            )}
          </TouchableOpacity>

          {expandedSections.application && (
            <View className="p-4">
              {analysis.application ? (
                <View className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {analysis.application}
                  </Text>
                </View>
              ) : (
                <View className="py-4">
                  <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    No application analysis available
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Conclusion Section */}
          <TouchableOpacity
            onPress={() => toggleSection('conclusion')}
            className="p-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1">
              <View className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mr-3">
                <Text className="text-sm font-bold text-green-600 dark:text-green-400">
                  C
                </Text>
              </View>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                Conclusion
              </Text>
            </View>
            {expandedSections.conclusion ? (
              <ChevronUp size={20} color="#6B7280" />
            ) : (
              <ChevronDown size={20} color="#6B7280" />
            )}
          </TouchableOpacity>

          {expandedSections.conclusion && (
            <View className="p-4 pt-0">
              {analysis.conclusion ? (
                <View className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {analysis.conclusion}
                  </Text>
                </View>
              ) : (
                <View className="py-4">
                  <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    No conclusion available
                  </Text>
                </View>
              )}
            </View>
          )}
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