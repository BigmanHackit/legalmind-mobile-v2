import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { useTheme } from "../../../lib/providers/ThemeProvider";
import {
  Sparkles,
  FileText,
  Download,
  Copy,
  RefreshCw,
  Upload,
  XCircle,
  X,
} from "lucide-react-native";
import { casesApi } from "../../../lib/api/cases";
import { analysisApi } from "../../../lib/api/analysis";
import { jurisdictionsApi } from "../../../lib/api/jurisdictions";
import { Analysis, Case, Jurisdiction } from "../../../lib/types";
import * as Clipboard from "expo-clipboard";

export default function IracGeneratorScreen() {
  const { activeTheme } = useTheme();
  const isDark = activeTheme === "dark";

  const [activeTab, setActiveTab] = useState<"create" | "analysis">("create");
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [loadingJurisdictions, setLoadingJurisdictions] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const [caseData, setCaseData] = useState({
    title: "",
    facts: "",
    caseType: "" as Case["caseType"],
    priority: "MEDIUM" as Case["priority"],
    jurisdictionId: "",
    isPublic: false,
    tags: [] as string[],
  });

  const [createdCase, setCreatedCase] = useState<Case | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadJurisdictions();
  }, []);

  const loadJurisdictions = async () => {
    try {
      setLoadingJurisdictions(true);
      const response = await jurisdictionsApi.getJurisdictions({ limit: 100 });
      setJurisdictions(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load jurisdictions");
    } finally {
      setLoadingJurisdictions(false);
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setUploadedFile(file);
        if (!caseData.title) {
          setCaseData((prev) => ({
            ...prev,
            title: file.name.replace(/\.[^/.]+$/, ""),
          }));
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const handleCreateCase = async () => {
    if (uploadedFile) {
      if (!caseData.title || !caseData.jurisdictionId || !caseData.caseType) {
        Alert.alert(
          "Error",
          "Please fill in title, jurisdiction, and case type"
        );
        return;
      }

      setIsUploading(true);

      try {
        const result = await casesApi.uploadCaseFile({
          file: uploadedFile,
          jurisdictionId: caseData.jurisdictionId,
          title: caseData.title,
          caseType: caseData.caseType,
          priority: caseData.priority,
          isPublic: caseData.isPublic,
          tags: caseData.tags,
        });

        setCreatedCase(result);
        Alert.alert("Success", "Case file uploaded successfully!");
        setActiveTab("analysis");
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to upload case file");
      } finally {
        setIsUploading(false);
      }
      return;
    }

    if (
      !caseData.title ||
      !caseData.facts ||
      !caseData.jurisdictionId ||
      !caseData.caseType
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setIsUploading(true);

    try {
      const newCase = await casesApi.createCase({
        title: caseData.title,
        facts: caseData.facts,
        caseType: caseData.caseType,
        priority: caseData.priority,
        jurisdictionId: caseData.jurisdictionId,
        isPublic: caseData.isPublic,
        tags: caseData.tags,
      });

      setCreatedCase(newCase);
      Alert.alert("Success", "Case created successfully!");
      setActiveTab("analysis");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create case");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateAnalysis = async () => {
    if (!createdCase?.id) {
      Alert.alert("Error", "Please create a case first");
      return;
    }

    setIsGenerating(true);

    try {
      const newAnalysis = await analysisApi.createAnalysis({
        caseId: createdCase.id,
        analysisType: "FULL",
        methodology: "IRAC",
      });

      setAnalysis(newAnalysis);
      Alert.alert("Success", "IRAC analysis generated successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to generate analysis");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateAnalysis = async () => {
    if (!analysis?.id) return;

    setIsGenerating(true);

    try {
      const regenerated = await analysisApi.regenerateAnalysis(analysis.id);
      setAnalysis(regenerated);
      Alert.alert("Success", "Analysis regenerated successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to regenerate analysis");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, section: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", `${section} copied to clipboard`);
  };

  const copyAll = async () => {
    if (!analysis) return;

    const issuesText = analysis.issues
      ? `Primary Issues:\n${
          analysis.issues.primary?.join("\n") || ""
        }\n\nSecondary Issues:\n${analysis.issues.secondary?.join("\n") || ""}`
      : "";

    const rulesText = analysis.rules
      ? `Principles:\n${
          analysis.rules.principles?.join("\n") || ""
        }\n\nStatutes:\n${
          Array.isArray(analysis.rules.statutes)
            ? analysis.rules.statutes
                .map((s) => (typeof s === "string" ? s : s.application))
                .join("\n")
            : ""
        }`
      : "";

    const fullText = `ISSUE:\n${issuesText}\n\nRULE:\n${rulesText}\n\nAPPLICATION:\n${analysis.application}\n\nCONCLUSION:\n${analysis.conclusion}`;

    await Clipboard.setStringAsync(fullText);
    Alert.alert("Copied", "Full IRAC analysis copied to clipboard");
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;

    const newTags = tagInput
      .split(/[,;.\|\n]+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0 && !caseData.tags.includes(tag));

    if (newTags.length > 0) {
      setCaseData({ ...caseData, tags: [...caseData.tags, ...newTags] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCaseData({
      ...caseData,
      tags: caseData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const isFormValid = () => {
    if (uploadedFile) {
      return !!(caseData.title && caseData.jurisdictionId && caseData.caseType);
    }
    return !!(
      caseData.title &&
      caseData.facts &&
      caseData.jurisdictionId &&
      caseData.caseType
    );
  };

  const formatFileSize = (bytes: number): string => {
    const kb = bytes / 1024;
    const mb = kb / 1024;
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-[#141517]" : "bg-gray-50"}`}
    >
      <ScrollView className="flex-1">
        <View className="px-6 py-8">
          {/* Header */}
          <View className="flex-row items-center gap-3 mb-6">
            <View className="bg-[#6A9113]/20 p-2 rounded-lg">
              <Sparkles size={24} color="#6A9113" />
            </View>
            <View>
              <Text
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                IRAC Generator
              </Text>
              <Text
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                AI-powered legal analysis
              </Text>
            </View>
          </View>

          {/* Tab Selector */}
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity
              onPress={() => setActiveTab("create")}
              className={`flex-1 py-3 px-4 rounded-xl flex-row items-center justify-center gap-2 ${
                activeTab === "create"
                  ? "bg-[#6A9113]"
                  : isDark
                  ? "bg-gray-800"
                  : "bg-white"
              }`}
            >
              <FileText
                size={18}
                color={activeTab === "create" ? "#FFFFFF" : "#6A9113"}
              />
              <Text
                className={`font-semibold ${
                  activeTab === "create" ? "text-white" : "text-[#6A9113]"
                }`}
              >
                Create Case
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("analysis")}
              disabled={!createdCase}
              className={`flex-1 py-3 px-4 rounded-xl flex-row items-center justify-center gap-2 ${
                activeTab === "analysis"
                  ? "bg-[#6A9113]"
                  : !createdCase
                  ? "bg-gray-400"
                  : isDark
                  ? "bg-gray-800"
                  : "bg-white"
              }`}
            >
              <Sparkles
                size={18}
                color={activeTab === "analysis" ? "#FFFFFF" : "#6A9113"}
              />
              <Text
                className={`font-semibold ${
                  activeTab === "analysis" ? "text-white" : "text-[#6A9113]"
                }`}
              >
                Analysis
              </Text>
            </TouchableOpacity>
          </View>

          {/* Create Case Tab */}
          {activeTab === "create" && (
            <View className="space-y-6">
              <View
                className={`p-6 rounded-2xl ${
                  isDark ? "bg-gray-800" : "bg-white"
                }`}
              >
                <Text
                  className={`text-lg font-bold mb-4 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Case Information
                </Text>

                {/* Case Title */}
                <Text
                  className={`text-sm font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Case Title <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  placeholder="e.g., Smith v. Jones Property Dispute"
                  placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                  value={caseData.title}
                  onChangeText={(text) =>
                    setCaseData({ ...caseData, title: text })
                  }
                  className={`p-4 rounded-xl mb-4 ${
                    isDark
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-gray-50 text-gray-900 border-gray-200"
                  } border`}
                />

                {/* Note: Add Select/Picker components for Jurisdiction, Case Type, and Priority here */}

                {/* Tags Input */}
                <Text
                  className={`text-sm font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Tags (Optional)
                </Text>
                <View className="flex-row gap-2 mb-2">
                  <TextInput
                    placeholder="Add tags"
                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                    value={tagInput}
                    onChangeText={setTagInput}
                    onSubmitEditing={handleAddTag}
                    className={`flex-1 p-4 rounded-xl ${
                      isDark
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-gray-50 text-gray-900 border-gray-200"
                    } border`}
                  />
                  <TouchableOpacity
                    onPress={handleAddTag}
                    className="bg-[#6A9113] px-6 rounded-xl items-center justify-center"
                  >
                    <Text className="text-white font-semibold">Add</Text>
                  </TouchableOpacity>
                </View>

                {/* Tags Display */}
                {caseData.tags.length > 0 && (
                  <View className="flex-row flex-wrap gap-2 mb-4">
                    {caseData.tags.map((tag, idx) => (
                      <View
                        key={idx}
                        className={`flex-row items-center gap-1 px-3 py-1 rounded-full ${
                          isDark ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      >
                        <Text
                          className={`text-sm ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {tag}
                        </Text>
                        <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                          <X size={14} color={isDark ? "#FFFFFF" : "#000000"} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Visibility Toggle */}
                <Text
                  className={`text-sm font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Visibility
                </Text>
                <View className="flex-row gap-4 mb-4">
                  <TouchableOpacity
                    onPress={() =>
                      setCaseData({ ...caseData, isPublic: false })
                    }
                    className="flex-row items-center gap-2"
                  >
                    <View
                      className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                        !caseData.isPublic
                          ? "border-[#6A9113] bg-[#6A9113]"
                          : isDark
                          ? "border-gray-600"
                          : "border-gray-300"
                      }`}
                    >
                      {!caseData.isPublic && (
                        <View className="w-2.5 h-2.5 rounded-full bg-white" />
                      )}
                    </View>
                    <Text
                      className={isDark ? "text-gray-300" : "text-gray-700"}
                    >
                      Private
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setCaseData({ ...caseData, isPublic: true })}
                    className="flex-row items-center gap-2"
                  >
                    <View
                      className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                        caseData.isPublic
                          ? "border-[#6A9113] bg-[#6A9113]"
                          : isDark
                          ? "border-gray-600"
                          : "border-gray-300"
                      }`}
                    >
                      {caseData.isPublic && (
                        <View className="w-2.5 h-2.5 rounded-full bg-white" />
                      )}
                    </View>
                    <Text
                      className={isDark ? "text-gray-300" : "text-gray-700"}
                    >
                      Public
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* File Upload */}
                <Text
                  className={`text-sm font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Upload Case File (Optional)
                </Text>
                <TouchableOpacity
                  onPress={handleFilePick}
                  disabled={!!uploadedFile}
                  className={`border-2 border-dashed rounded-xl p-6 items-center mb-4 ${
                    isDark ? "border-gray-600" : "border-gray-300"
                  }`}
                >
                  {uploadedFile ? (
                    <>
                      <FileText size={40} color="#6A9113" />
                      <Text
                        className={`mt-2 font-medium ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {uploadedFile.name}
                      </Text>
                      <Text
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {formatFileSize(uploadedFile.size)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setUploadedFile(null)}
                        className="mt-2 py-2 px-4 bg-red-100 rounded-lg"
                      >
                        <Text className="text-red-700 font-medium text-sm">
                          Remove
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Upload
                        size={40}
                        color={isDark ? "#6B7280" : "#9CA3AF"}
                      />
                      <Text
                        className={`mt-2 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Tap to upload case file
                      </Text>
                      <Text
                        className={`text-xs mt-1 ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        PDF, DOC, DOCX, TXT (Max 10MB)
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Or Divider */}
                <Text
                  className={`text-center text-sm my-4 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  OR ENTER MANUALLY
                </Text>

                {/* Case Facts */}
                <Text
                  className={`text-sm font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Case Facts{" "}
                  {!uploadedFile && <Text className="text-red-500">*</Text>}
                </Text>
                <TextInput
                  placeholder="Enter the detailed facts of the case..."
                  placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                  multiline
                  numberOfLines={10}
                  value={caseData.facts}
                  onChangeText={(text) =>
                    setCaseData({ ...caseData, facts: text })
                  }
                  editable={!uploadedFile}
                  className={`p-4 rounded-xl min-h-[250px] ${
                    isDark
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-gray-50 text-gray-900 border-gray-200"
                  } border`}
                  textAlignVertical="top"
                />

                {/* Create Button */}
                <TouchableOpacity
                  onPress={handleCreateCase}
                  disabled={isUploading || !isFormValid()}
                  className={`mt-6 py-4 px-6 rounded-xl flex-row items-center justify-center ${
                    isUploading || !isFormValid()
                      ? "bg-gray-400"
                      : "bg-[#6A9113]"
                  }`}
                >
                  {isUploading ? (
                    <>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text className="text-white font-semibold ml-2">
                        {uploadedFile ? "Uploading..." : "Creating..."}
                      </Text>
                    </>
                  ) : (
                    <>
                      <FileText size={20} color="#FFFFFF" />
                      <Text className="text-white font-semibold ml-2">
                        {uploadedFile ? "Upload & Create Case" : "Create Case"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Tips */}
                <View className="mt-4 p-4 bg-[#6A9113]/10 border border-[#6A9113]/30 rounded-xl">
                  <Text
                    className={`text-xs font-semibold mb-2 ${
                      isDark ? "text-[#6A9113]" : "text-[#141517]"
                    }`}
                  >
                    Tips for Better Results:
                  </Text>
                  <Text
                    className={`text-xs ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    • Include all relevant facts and dates{"\n"}• Mention
                    applicable laws or regulations{"\n"}• Describe relationships
                    between parties{"\n"}• Note any precedents or similar cases
                  </Text>
                </View>
              </View>

              {/* Case Preview */}
              {createdCase && (
                <View
                  className={`p-6 rounded-2xl ${
                    isDark ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <View className="flex-row items-center gap-2 mb-4">
                    <FileText size={20} color="#6A9113" />
                    <Text
                      className={`text-lg font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Case Created
                    </Text>
                  </View>

                  <View className="space-y-3">
                    <View>
                      <Text
                        className={`text-xs font-medium mb-1 ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Title
                      </Text>
                      <Text className={isDark ? "text-white" : "text-gray-900"}>
                        {createdCase.title}
                      </Text>
                    </View>

                    <View>
                      <Text
                        className={`text-xs font-medium mb-1 ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Type
                      </Text>
                      <View className="bg-[#6A9113]/20 self-start px-3 py-1 rounded-full">
                        <Text className="text-[#6A9113] text-xs font-medium">
                          {createdCase.caseType}
                        </Text>
                      </View>
                    </View>

                    <View>
                      <Text
                        className={`text-xs font-medium mb-1 ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Status
                      </Text>
                      <View
                        className={`self-start px-3 py-1 rounded-full ${
                          createdCase.status === "COMPLETED"
                            ? "bg-green-100"
                            : createdCase.status === "ANALYZING"
                            ? "bg-blue-100"
                            : "bg-yellow-100"
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            createdCase.status === "COMPLETED"
                              ? "text-green-700"
                              : createdCase.status === "ANALYZING"
                              ? "text-blue-700"
                              : "text-yellow-700"
                          }`}
                        >
                          {createdCase.status.replace("_", " ")}
                        </Text>
                      </View>
                    </View>

                    {createdCase.tags && createdCase.tags.length > 0 && (
                      <View>
                        <Text
                          className={`text-xs font-medium mb-2 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Tags
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                          {createdCase.tags.map((tag, idx) => (
                            <View
                              key={idx}
                              className={`px-3 py-1 rounded-full ${
                                isDark ? "bg-gray-700" : "bg-gray-200"
                              }`}
                            >
                              <Text
                                className={`text-xs ${
                                  isDark ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {tag}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => setActiveTab("analysis")}
                    className="mt-6 py-3 px-6 bg-[#6A9113] rounded-xl items-center"
                  >
                    <Text className="text-white font-semibold">
                      Proceed to Analysis
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Analysis Tab */}
          {activeTab === "analysis" && (
            <View className="space-y-6">
              {!analysis ? (
                <View
                  className={`p-6 rounded-2xl ${
                    isDark ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <View className="items-center py-8">
                    <Sparkles size={64} color="#6A9113" />
                    <Text
                      className={`text-xl font-bold mt-4 mb-2 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Ready for Analysis
                    </Text>
                    <Text
                      className={`text-center mb-6 ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Generate AI-powered IRAC analysis for your case
                    </Text>
                    <TouchableOpacity
                      onPress={handleGenerateAnalysis}
                      disabled={isGenerating}
                      className={`py-4 px-8 rounded-xl flex-row items-center ${
                        isGenerating ? "bg-gray-400" : "bg-[#6A9113]"
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <ActivityIndicator size="small" color="#FFFFFF" />
                          <Text className="text-white font-semibold ml-2">
                            Generating...
                          </Text>
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} color="#FFFFFF" />
                          <Text className="text-white font-semibold ml-2">
                            Generate IRAC Analysis
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  {/* Header Actions */}
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center gap-2">
                      <Text
                        className={`text-lg font-bold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        IRAC Analysis
                      </Text>
                      <View className="bg-[#6A9113] px-3 py-1 rounded-full">
                        <Text className="text-white text-xs font-medium">
                          {(analysis.confidence * 100).toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row gap-2 mb-4">
                    <TouchableOpacity
                      onPress={handleRegenerateAnalysis}
                      disabled={isGenerating}
                      className={`flex-1 py-3 px-4 rounded-xl border flex-row items-center justify-center gap-2 ${
                        isDark ? "border-gray-600" : "border-gray-300"
                      }`}
                    >
                      <RefreshCw
                        size={16}
                        color={isDark ? "#FFFFFF" : "#000000"}
                      />
                      <Text
                        className={`font-medium ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Regenerate
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={copyAll}
                      className={`flex-1 py-3 px-4 rounded-xl border flex-row items-center justify-center gap-2 ${
                        isDark ? "border-gray-600" : "border-gray-300"
                      }`}
                    >
                      <Copy size={16} color={isDark ? "#FFFFFF" : "#000000"} />
                      <Text
                        className={`font-medium ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Copy All
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Issues Section */}
                  <View
                    className={`p-6 rounded-2xl mb-4 ${
                      isDark ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-row items-center gap-3">
                        <View className="bg-[#6A9113]/20 px-3 py-1 rounded-lg">
                          <Text className="text-[#6A9113] font-bold text-lg">
                            I
                          </Text>
                        </View>
                        <View>
                          <Text
                            className={`text-lg font-bold ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            Issues Identified
                          </Text>
                          <Text
                            className={`text-xs ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            Legal questions to be resolved
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          copyToClipboard(
                            JSON.stringify(analysis.issues),
                            "Issues"
                          )
                        }
                      >
                        <Copy
                          size={20}
                          color={isDark ? "#9CA3AF" : "#6B7280"}
                        />
                      </TouchableOpacity>
                    </View>

                    {analysis.issues?.primary &&
                      analysis.issues.primary.length > 0 && (
                        <View className="mb-4">
                          <Text
                            className={`text-sm font-semibold mb-2 ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Primary Issues ({analysis.issues.primary.length})
                          </Text>
                          {analysis.issues.primary.map((issue, idx) => (
                            <View key={idx} className="flex-row gap-2 mb-2">
                              <View className="w-1.5 h-1.5 bg-[#6A9113] rounded-full mt-2" />
                              <Text
                                className={`flex-1 text-sm ${
                                  isDark ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                {issue}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                    {analysis.issues?.secondary &&
                      analysis.issues.secondary.length > 0 && (
                        <View>
                          <Text
                            className={`text-sm font-semibold mb-2 ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Secondary Issues ({analysis.issues.secondary.length}
                            )
                          </Text>
                          {analysis.issues.secondary.map((issue, idx) => (
                            <View key={idx} className="flex-row gap-2 mb-2">
                              <View className="w-1.5 h-1.5 bg-[#6A9113]/60 rounded-full mt-2" />
                              <Text
                                className={`flex-1 text-sm ${
                                  isDark ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                {issue}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                  </View>

                  {/* Rules Section */}
                  <View
                    className={`p-6 rounded-2xl mb-4 ${
                      isDark ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-row items-center gap-3">
                        <View className="bg-[#6A9113]/20 px-3 py-1 rounded-lg">
                          <Text className="text-[#6A9113] font-bold text-lg">
                            R
                          </Text>
                        </View>
                        <View>
                          <Text
                            className={`text-lg font-bold ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            Applicable Rules
                          </Text>
                          <Text
                            className={`text-xs ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            Laws and legal principles
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          copyToClipboard(
                            JSON.stringify(analysis.rules),
                            "Rules"
                          )
                        }
                      >
                        <Copy
                          size={20}
                          color={isDark ? "#9CA3AF" : "#6B7280"}
                        />
                      </TouchableOpacity>
                    </View>

                    {analysis.rules?.principles &&
                      analysis.rules.principles.length > 0 && (
                        <View className="mb-4">
                          <Text
                            className={`text-sm font-semibold mb-2 ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Legal Principles
                          </Text>
                          {analysis.rules.principles.map((principle, idx) => (
                            <View
                              key={idx}
                              className="p-3 mb-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-500/30"
                            >
                              <Text
                                className={`text-sm ${
                                  isDark ? "text-purple-300" : "text-purple-800"
                                }`}
                              >
                                {principle}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                    {analysis.rules?.statutes &&
                      analysis.rules.statutes.length > 0 && (
                        <View className="mb-4">
                          <Text
                            className={`text-sm font-semibold mb-2 ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Relevant Statutes
                          </Text>
                          {(Array.isArray(analysis.rules.statutes)
                            ? analysis.rules.statutes
                            : []
                          ).map((statute: any, idx: number) => (
                            <View
                              key={idx}
                              className="p-3 mb-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-500/30"
                            >
                              <Text
                                className={`text-sm ${
                                  isDark ? "text-amber-300" : "text-amber-800"
                                }`}
                              >
                                {typeof statute === "string"
                                  ? statute
                                  : statute.application}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                    {analysis.rules?.precedents &&
                      analysis.rules.precedents.length > 0 && (
                        <View>
                          <Text
                            className={`text-sm font-semibold mb-2 ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Case Precedents
                          </Text>
                          {analysis.rules.precedents.map((precedent, idx) => (
                            <View
                              key={idx}
                              className="p-3 mb-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-500/30"
                            >
                              <Text
                                className={`text-sm ${
                                  isDark
                                    ? "text-emerald-300"
                                    : "text-emerald-800"
                                }`}
                              >
                                {precedent}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                  </View>

                  {/* Application Section */}
                  <View
                    className={`p-6 rounded-2xl mb-4 ${
                      isDark ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-row items-center gap-3">
                        <View className="bg-[#6A9113]/20 px-3 py-1 rounded-lg">
                          <Text className="text-[#6A9113] font-bold text-lg">
                            A
                          </Text>
                        </View>
                        <View>
                          <Text
                            className={`text-lg font-bold ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            Application to Facts
                          </Text>
                          <Text
                            className={`text-xs ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            Applying rule to facts
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          copyToClipboard(analysis.application, "Application")
                        }
                      >
                        <Copy
                          size={20}
                          color={isDark ? "#9CA3AF" : "#6B7280"}
                        />
                      </TouchableOpacity>
                    </View>

                    <View
                      className={`p-4 rounded-lg ${
                        isDark ? "bg-gray-700" : "bg-gray-50"
                      }`}
                    >
                      <Text
                        className={`text-sm leading-6 ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {analysis.application}
                      </Text>
                    </View>
                  </View>

                  {/* Conclusion Section */}
                  <View
                    className={`p-6 rounded-2xl ${
                      isDark ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-row items-center gap-3">
                        <View className="bg-[#6A9113]/20 px-3 py-1 rounded-lg">
                          <Text className="text-[#6A9113] font-bold text-lg">
                            C
                          </Text>
                        </View>
                        <View>
                          <Text
                            className={`text-lg font-bold ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            Conclusion
                          </Text>
                          <Text
                            className={`text-xs ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            Resolution of legal issue
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          copyToClipboard(analysis.conclusion, "Conclusion")
                        }
                      >
                        <Copy
                          size={20}
                          color={isDark ? "#9CA3AF" : "#6B7280"}
                        />
                      </TouchableOpacity>
                    </View>

                    <View
                      className={`p-4 rounded-lg ${
                        isDark ? "bg-gray-700" : "bg-gray-50"
                      }`}
                    >
                      <Text
                        className={`text-sm leading-6 ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {analysis.conclusion}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
