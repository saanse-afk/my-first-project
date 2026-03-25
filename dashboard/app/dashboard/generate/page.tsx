import { Header } from '@/components/layout/header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScriptGenerator } from '@/components/generate/script-generator'
import { CaptionGenerator } from '@/components/generate/caption-generator'
import { HookGenerator } from '@/components/generate/hook-generator'

export default function GeneratePage() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Content Generator" subtitle="AI-powered content creation using your channel's performance data" />
      <div className="flex-1 p-6 overflow-auto">
        <Tabs defaultValue="script" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/5">
            <TabsTrigger value="script" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-white/50">
              Script
            </TabsTrigger>
            <TabsTrigger value="caption" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-white/50">
              Caption
            </TabsTrigger>
            <TabsTrigger value="hooks" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-white/50">
              Hooks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="script">
            <ScriptGenerator />
          </TabsContent>

          <TabsContent value="caption">
            <CaptionGenerator />
          </TabsContent>

          <TabsContent value="hooks">
            <HookGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
