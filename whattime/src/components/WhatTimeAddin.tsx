import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Clock,
  Users,
  Plus,
  X,
  Calendar,
  ChevronLeft,
  CheckCircle2,
  Send,
  Trash2,
  Save,
  Mail,
  AlertCircle,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
}

interface TimeRange {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
}

interface Participant {
  id: string;
  email: string;
  isKey: boolean;
}

interface Group {
  id: string;
  name: string;
  participants: Participant[];
}

// Environment detection
const isDevelopment = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Backend URL configuration
const getBackendUrl = () => {
  if (isDevelopment) {
    return "http://localhost:8000";
  } else {
    return "/api/backend";
  }
};

// Debug function to send logs to backend
const debugLog = async (message: string, data?: any, level: "info" | "error" | "warn" = "info") => {
  // Only log important events in production, everything in development
  const isDevelopment = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  // Skip verbose logs in production
  if (
    !isDevelopment &&
    level === "info" &&
    (message.includes("Office.onReady") ||
      message.includes("Setting user data") ||
      message.includes("Extracted email") ||
      message.includes("Fetch response received"))
  ) {
    return;
  }

  try {
    const debugPayload = {
      timestamp: new Date().toISOString(),
      message: message,
      data: data || null,
      location: "React Component",
      level: level,
    };

    await fetch(`${getBackendUrl()}/api/debug`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(debugPayload),
    });
  } catch (error) {
    // Fallback to console if backend debug fails
    console.log(`🔍 REACT ${level.toUpperCase()}:`, message, data);
  }
};

export function WhatTimeAddin() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const initializeAddIn = async () => {
    try {
      await debugLog("Office Add-in initializing");

      await Office.onReady((info) => {
        if (info.host === Office.HostType.Outlook) {
          debugLog("Office Add-in ready in Outlook");
        }
      });

      await authenticateUser();
      await debugLog("Office Add-in initialization completed successfully");
    } catch (error) {
      await debugLog("Office Add-in initialization failed", { error: error.message }, "error");
      setError("Failed to initialize add-in");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeAddIn();
  }, []); // Empty dependency array - only run once

  // Only log successful authentication completion, not every render
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && accessToken) {
      debugLog("User authentication completed", {
        userId: user.id,
        userEmail: user.email,
        hasAccessToken: !!accessToken,
      });
    }
  }, [isLoading, isAuthenticated, user?.id, !!accessToken]); // Only specific dependencies

  const authenticateUser = async () => {
    try {
      const isDevelopment = window.location.hostname === "localhost" || window.location.hostname.includes("ngrok");

      if (isDevelopment) {
        await debugLog("Using development mode authentication");
        await handleSSOFallback();
      } else {
        await debugLog("Using production SSO authentication");
        try {
          const accessToken = await getAccessTokenAsync();
          const graphData = await getUserProfileFromGraph(accessToken);
          await handleSSOSuccess(graphData);
        } catch (ssoError) {
          await debugLog("SSO failed, using fallback", { error: ssoError.message }, "warn");
          await handleSSOFallback();
        }
      }
    } catch (error) {
      await debugLog("Authentication failed", { error: error.message }, "error");
      setError("Authentication failed");
    }
  };

  const getAccessTokenAsync = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      Office.auth
        .getAccessToken({
          allowSignInPrompt: true,
          allowConsentPrompt: true,
          forMSGraphAccess: true,
        })
        .then((token) => {
          resolve(token);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const getUserProfileFromGraph = async (accessToken: string): Promise<any> => {
    const response = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user profile: ${response.status}`);
    }

    return await response.json();
  };

  const handleSSOFallback = async (): Promise<void> => {
    const userProfile = Office.context.mailbox.userProfile;

    if (userProfile && userProfile.emailAddress) {
      const basicUserData = {
        id: userProfile.emailAddress,
        email: userProfile.emailAddress,
        mail: userProfile.emailAddress,
        userPrincipalName: userProfile.emailAddress,
        displayName: userProfile.displayName,
        givenName: userProfile.displayName.split(" ")[0] || "User",
        surname: userProfile.displayName.split(" ").slice(1).join(" ") || "",
      };

      await handleSSOSuccess(basicUserData);
    } else {
      throw new Error("No authentication method available");
    }
  };

  const handleSSOSuccess = async (graphData: any): Promise<void> => {
    try {
      await debugLog("Processing user authentication", { userEmail: graphData.email || graphData.mail });

      const result = await authenticateWithBackend(graphData);

      if (result.success) {
        const userData = result.data.user;
        const token = result.data.accessToken;

        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.displayName,
        });
        setAccessToken(token);
        setIsAuthenticated(true);

        // Store tokens for future API calls
        localStorage.setItem("whattime_access_token", token);
        if (result.data.refreshToken) {
          localStorage.setItem("whattime_refresh_token", result.data.refreshToken);
        }

        await debugLog("Authentication successful", { userId: userData.id });
      } else {
        throw new Error(result.message || "Authentication failed");
      }
    } catch (error) {
      await debugLog("Authentication processing failed", { error: error.message }, "error");
      setError("Failed to authenticate with backend");
    }
  };

  const authenticateWithBackend = async (graphData: any): Promise<any> => {
    try {
      const email = graphData.email || graphData.mail || graphData.userPrincipalName;

      const profilePayload = {
        profile: {
          id: graphData.id || email,
          email: email,
          displayName: graphData.displayName,
          firstName: graphData.givenName || graphData.firstName,
          lastName: graphData.surname || graphData.lastName,
        },
      };

      const response = await fetch(`${getBackendUrl()}/api/auth/microsoft/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profilePayload),
      });

      if (!response.ok) {
        throw new Error(`Backend authentication failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      await debugLog("Backend authentication request failed", { error: error.message }, "error");
      throw error;
    }
  };

  // Remove debug logging from render functions
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading WhatTime...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="mb-4">⚠️ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to use WhatTime</p>
          <button onClick={authenticateUser} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Main application render - no debug logging here
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">WhatTime</h1>
            <span className="text-sm text-gray-600">Welcome, {user.name}</span>
          </div>
        </div>
      </header>

      <main className="p-4">
        <MainApplication user={user} accessToken={accessToken} />
      </main>
    </div>
  );
}

// Main Application Component
function MainApplication({ user, accessToken }: { user: User; accessToken: string | null }) {
  const [currentView, setCurrentView] = useState<"create" | "pending" | "upcoming">("create");

  return (
    <div className="flex flex-col h-full">
      {/* Navigation Tabs */}
      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)} className="mb-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content Area */}
      <div className="flex-1">
        <Tabs value={currentView}>
          <TabsContent value="create">
            <CreateMeetingView user={user} accessToken={accessToken} />
          </TabsContent>
          <TabsContent value="pending">
            <PendingMeetingsView user={user} accessToken={accessToken} />
          </TabsContent>
          <TabsContent value="upcoming">
            <UpcomingMeetingsView user={user} accessToken={accessToken} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CreateMeetingView({ user, accessToken }: { user: User; accessToken: string | null }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("30");
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([
    {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "17:00",
      isAllDay: false,
    },
  ]);
  const [groups, setGroups] = useState<Group[]>([
    {
      id: crypto.randomUUID(),
      name: "Team",
      participants: [{ id: crypto.randomUUID(), email: "", isKey: true }],
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Remove debug logging from these functions and only log the actual form submission
  const addTimeRange = () => {
    setTimeRanges([
      ...timeRanges,
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split("T")[0],
        startTime: "09:00",
        endTime: "17:00",
        isAllDay: false,
      },
    ]);
  };

  const removeTimeRange = (id: string) => {
    setTimeRanges(timeRanges.filter((range) => range.id !== id));
  };

  const updateTimeRange = (id: string, field: keyof TimeRange, value: string | boolean) => {
    setTimeRanges(timeRanges.map((range) => (range.id === id ? { ...range, [field]: value } : range)));
  };

  const addParticipant = (groupId: string) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              participants: [
                ...group.participants,
                {
                  id: crypto.randomUUID(),
                  email: "",
                  isKey: false,
                },
              ],
            }
          : group,
      ),
    );
  };

  const removeParticipant = (groupId: string, participantId: string) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId
          ? { ...group, participants: group.participants.filter((p) => p.id !== participantId) }
          : group,
      ),
    );
  };

  const updateParticipant = (groupId: string, participantId: string, email: string) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              participants: group.participants.map((p) => (p.id === participantId ? { ...p, email } : p)),
            }
          : group,
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setSubmitStatus({ type: "error", message: "Please enter a meeting title" });
      return;
    }

    if (timeRanges.length === 0) {
      setSubmitStatus({ type: "error", message: "Please add at least one time range" });
      return;
    }

    if (groups.every((group) => group.participants.length === 0)) {
      setSubmitStatus({ type: "error", message: "Please add at least one participant" });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await debugLog("Creating meeting request", {
        title,
        location,
        duration,
        participantCount: groups.reduce((total, group) => total + group.participants.length, 0),
        timeRangeCount: timeRanges.length,
      });

      const backendUrl = getBackendUrl();

      // Prepare the meeting data to match backend API expectations
      const meetingData = {
        title,
        location, // Backend expects 'location' for description
        duration: parseInt(duration),
        timezone: timeZone, // Backend expects 'timezone' not 'timeZone'
        timeRanges: timeRanges.map((range) => ({
          // Backend expects 'timeRanges' not 'preferredTimes'
          date: range.date,
          startTime: range.startTime,
          endTime: range.endTime,
          isAllDay: range.isAllDay,
        })),
        groups: groups.map((group) => ({
          // Backend expects 'groups' structure
          id: group.id,
          name: group.name,
          participants: group.participants
            .filter((p) => p.email.trim() !== "")
            .map((p) => ({
              id: p.id,
              email: p.email.trim(),
              isKey: p.isKey,
            })),
        })),
      };

      const response = await fetch(`${backendUrl}/api/meetings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(meetingData),
      });

      if (response.ok) {
        const result = await response.json();
        await debugLog("Meeting created successfully", { meetingId: result.data.meeting.id });

        setSubmitStatus({
          type: "success",
          message: `Meeting "${title}" created successfully! Meeting ID: ${result.data.meeting.id}`,
        });

        // Reset form
        setTitle("");
        setLocation("");
        setDuration("30");
        setTimeZone("et");
        setTimeRanges([{ id: Date.now().toString(), date: "", startTime: "", endTime: "", isAllDay: false }]);
        setGroups([
          {
            id: Date.now().toString(),
            name: "Participants",
            participants: [{ id: Date.now().toString(), email: "", isKey: false }],
          },
        ]);
      } else {
        const errorResult = await response.json();
        await debugLog("Meeting creation failed", { error: errorResult.message }, "error");
        setSubmitStatus({
          type: "error",
          message: errorResult.message || "Failed to create meeting",
        });
      }
    } catch (error) {
      await debugLog("Meeting creation error", { error: error.message }, "error");
      setSubmitStatus({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Submit Status Display */}
        {submitStatus && (
          <div
            className={`p-4 rounded-lg border ${
              submitStatus.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {submitStatus.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="text-sm font-medium">{submitStatus.message}</span>
            </div>
          </div>
        )}

        {/* Meeting Details */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Meeting Details</h3>

          <div>
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter meeting title"
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Meeting room, video call, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="duration">Duration *</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timezone">Timezone *</Label>
              <Select value={timeZone} onValueChange={setTimeZone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="et">Eastern Time</SelectItem>
                  <SelectItem value="ct">Central Time</SelectItem>
                  <SelectItem value="mt">Mountain Time</SelectItem>
                  <SelectItem value="pt">Pacific Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Time Ranges */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Available Time Ranges *</h3>
            <Button type="button" onClick={addTimeRange} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Time Range
            </Button>
          </div>

          {timeRanges.map((range) => (
            <div key={range.id} className="flex items-center gap-2 p-3 border rounded-lg">
              <Input
                type="date"
                value={range.date}
                onChange={(e) => updateTimeRange(range.id, "date", e.target.value)}
                className="flex-1"
                required
              />
              <Input
                type="time"
                value={range.startTime}
                onChange={(e) => updateTimeRange(range.id, "startTime", e.target.value)}
                className="flex-1"
                required
              />
              <Input
                type="time"
                value={range.endTime}
                onChange={(e) => updateTimeRange(range.id, "endTime", e.target.value)}
                className="flex-1"
                required
              />
              {timeRanges.length > 1 && (
                <Button type="button" onClick={() => removeTimeRange(range.id)} size="sm" variant="ghost">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Participants */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Participants *</h3>

          {groups.map((group) => (
            <div key={group.id} className="space-y-2">
              {group.participants.map((participant) => (
                <div key={participant.id} className="flex items-center gap-2">
                  <Input
                    type="email"
                    value={participant.email}
                    onChange={(e) => updateParticipant(group.id, participant.id, e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1"
                    required
                  />
                  <Button type="button" onClick={() => addParticipant(group.id)} size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                  {group.participants.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeParticipant(group.id, participant.id)}
                      size="sm"
                      variant="ghost"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Creating Meeting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Create Meeting Request
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

function PendingMeetingsView({ user, accessToken }: { user: User; accessToken: string | null }) {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingMeetings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${getBackendUrl()}/api/meetings?status=pending`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        try {
          const result = await response.json();
          await debugLog("Pending meetings response received", {
            hasData: !!result.data,
            hasMeetings: !!result.data?.meetings,
            meetingsCount: result.data?.meetings?.length || 0,
          });
          setMeetings(result.data.meetings || []);
        } catch (parseError) {
          await debugLog("Failed to parse pending meetings response", { error: parseError.message }, "error");
          setError("Failed to parse response data");
        }
      } else if (response.status === 401) {
        setError("Authentication expired. Please refresh the page.");
        await debugLog("Authentication expired for pending meetings", null, "warn");
      } else {
        const errorResult = await response.json();
        setError(errorResult.message || "Failed to load pending meetings");
        await debugLog("Failed to fetch pending meetings", { error: errorResult.message }, "error");
      }
    } catch (error) {
      setError("Network error. Please check your connection.");
      await debugLog("Network error fetching pending meetings", { error: error.message }, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchPendingMeetings();
    }
  }, [accessToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Clock className="h-6 w-6 animate-spin text-gray-400 mr-2" />
        <span className="text-gray-600">Loading pending meetings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Meetings</h3>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <Button onClick={fetchPendingMeetings} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Meetings</h3>
        <p className="text-sm text-gray-500">Meetings you've created will appear here while awaiting responses.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Pending Meetings ({meetings.length})</h3>
        <Button onClick={fetchPendingMeetings} variant="outline" size="sm">
          <Clock className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      {meetings.map((meeting) => (
        <div key={meeting.id} className="border rounded-lg p-4 bg-white">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-medium text-gray-900">{meeting.title}</h4>
              {meeting.description && <p className="text-sm text-gray-600 mt-1">{meeting.description}</p>}
            </div>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {meeting.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {meeting.duration} minutes
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {meeting.participantEmails?.length || 0} participants
            </div>
          </div>

          <div className="text-xs text-gray-500">Created {new Date(meeting.createdAt).toLocaleDateString()}</div>
        </div>
      ))}
    </div>
  );
}

function UpcomingMeetingsView({ user, accessToken }: { user: User; accessToken: string | null }) {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpcomingMeetings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${getBackendUrl()}/api/meetings?status=scheduled`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        try {
          const result = await response.json();
          await debugLog("Upcoming meetings response received", {
            hasData: !!result.data,
            hasMeetings: !!result.data?.meetings,
            meetingsCount: result.data?.meetings?.length || 0,
          });
          setMeetings(result.data.meetings || []);
        } catch (parseError) {
          await debugLog("Failed to parse upcoming meetings response", { error: parseError.message }, "error");
          setError("Failed to parse response data");
        }
      } else if (response.status === 401) {
        setError("Authentication expired. Please refresh the page.");
        await debugLog("Authentication expired for upcoming meetings", null, "warn");
      } else {
        const errorResult = await response.json();
        setError(errorResult.message || "Failed to load upcoming meetings");
        await debugLog("Failed to fetch upcoming meetings", { error: errorResult.message }, "error");
      }
    } catch (error) {
      setError("Network error. Please check your connection.");
      await debugLog("Network error fetching upcoming meetings", { error: error.message }, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchUpcomingMeetings();
    }
  }, [accessToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Calendar className="h-6 w-6 animate-spin text-gray-400 mr-2" />
        <span className="text-gray-600">Loading upcoming meetings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Meetings</h3>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <Button onClick={fetchUpcomingMeetings} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Meetings</h3>
        <p className="text-sm text-gray-500">Scheduled meetings will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Upcoming Meetings ({meetings.length})</h3>
        <Button onClick={fetchUpcomingMeetings} variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      {meetings.map((meeting) => (
        <div key={meeting.id} className="border rounded-lg p-4 bg-white">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-medium text-gray-900">{meeting.title}</h4>
              {meeting.description && <p className="text-sm text-gray-600 mt-1">{meeting.description}</p>}
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              {meeting.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {meeting.duration} minutes
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {meeting.participantEmails?.length || 0} participants
            </div>
          </div>

          {meeting.scheduledTime && (
            <div className="text-sm text-gray-600 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Scheduled: {new Date(meeting.scheduledTime).toLocaleString()}
            </div>
          )}

          {meeting.meetingLink && (
            <div className="text-sm">
              <a
                href={meeting.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Join Meeting
              </a>
            </div>
          )}

          <div className="text-xs text-gray-500 mt-2">Created {new Date(meeting.createdAt).toLocaleDateString()}</div>
        </div>
      ))}
    </div>
  );
}
