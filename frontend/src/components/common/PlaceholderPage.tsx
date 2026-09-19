import { Construction } from 'lucide-react';

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 flex flex-col items-center justify-center h-full min-h-[60vh]">
      <div className="bg-primary/10 p-6 rounded-full mb-4">
        <Construction className="w-16 h-16 text-primary" />
      </div>
      <h1 className="text-3xl font-bold text-foreground text-center">
        {title}
      </h1>
      <p className="text-muted-foreground text-center max-w-[400px]">
        This page is currently under development. Please check back later as we continue to build out the dashboard features!
      </p>
    </div>
  );
}
