import { Backdrop } from "./Backdrop";
import { JarvisProvider, useJarvis } from "./JarvisProvider";
import { MissionRail } from "./MissionRail";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { VoiceOrbitModal } from "./VoiceOrbitModal";
import { AgentsView } from "./views/AgentsView";
import { ConnectorsView } from "./views/ConnectorsView";
import { DashboardView } from "./views/DashboardView";
import { MemoryView } from "./views/MemoryView";
import { MissionControlView } from "./views/MissionControlView";
import { SettingsView } from "./views/SettingsView";
import { WorkflowsView } from "./views/WorkflowsView";

function Views() {
  const { view } = useJarvis();
  switch (view) {
    case "agents":
      return <AgentsView />;
    case "mission":
      return <MissionControlView />;
    case "memory":
      return <MemoryView />;
    case "connectors":
      return <ConnectorsView />;
    case "workflows":
      return <WorkflowsView />;
    case "settings":
      return <SettingsView />;
    default:
      return <DashboardView />;
  }
}

function Shell() {
  const {
    voiceModalOpen,
    setVoiceModalOpen,
    voiceListening,
    voiceThinking,
    voiceSpeaking,
    voiceTranscript,
    voiceLastSpoken,
    voiceAudioLevel,
    voiceError,
    toggleVoiceMic,
    interruptVoiceSpeech,
  } = useJarvis();

  return (
    <div className="relative z-10 flex min-h-screen flex-col gap-3 p-3 lg:h-screen">
      <TopBar />
      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
        <Sidebar />
        <main className="glass flex min-h-0 flex-1 flex-col rounded-2xl p-4 sm:p-5">
          <Views />
        </main>
        <MissionRail />
      </div>
      <VoiceOrbitModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        isListening={voiceListening}
        isThinking={voiceThinking}
        isSpeaking={voiceSpeaking}
        transcript={voiceTranscript}
        lastSpoken={voiceLastSpoken}
        audioLevel={voiceAudioLevel}
        error={voiceError}
        onToggleMic={toggleVoiceMic}
        onInterruptSpeech={interruptVoiceSpeech}
      />
    </div>
  );
}

export function JarvisApp() {
  return (
    <JarvisProvider>
      <Backdrop />
      <Shell />
    </JarvisProvider>
  );
}
