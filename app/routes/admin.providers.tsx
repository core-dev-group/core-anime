import { redis } from "~/lib/cache/redis";
import { providerPriority } from "~/lib/providers/registry";
import { Form, useFetcher } from "react-router";

export async function loader() {
  const allProviders = providerPriority.home;
  
  const statuses = await Promise.all(
    allProviders.map(async (name) => {
      const isDown = await redis.get(`health:status:${name}`);
      const failsCount = await redis.get(`health:fail:${name}`);
      
      return {
        name,
        status: isDown === "unhealthy" ? "Down" : "Healthy",
        fails: failsCount ? parseInt(failsCount, 10) : 0,
      };
    })
  );
  
  return { providers: statuses };
}

export async function action({ request }: any) {
  const formData = await request.formData();
  const providerName = formData.get("providerName");
  
  if (providerName && typeof providerName === "string") {
    // Reset status
    await redis.del(`health:status:${providerName}`);
    await redis.del(`health:fail:${providerName}`);
  }
  
  return { success: true };
}

export function meta() {
  return [
    { title: "Admin Dashboard - Provider Health | CoreAnime" },
  ];
}

type ProviderStatus = {
  name: string;
  status: string;
  fails: number;
};

export default function AdminProviders({ loaderData }: any) {
  const providers = loaderData.providers as ProviderStatus[];
  const fetcher = useFetcher();

  return (
    <div className="w-full bg-background min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8 border-b border-surface-soft pb-6">
          <h1 className="text-3xl font-black text-foreground mb-2">Provider Health Dashboard</h1>
          <p className="text-foreground/60">
            Monitor status source anime secara real-time. Sistem Circuit Breaker otomatis memblokir provider yang gagal 3x berturut-turut.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {providers.map((p) => (
            <div 
              key={p.name} 
              className={`glass-card p-5 rounded-xl border flex flex-col justify-between ${
                p.status === "Healthy" 
                  ? "border-surface-soft hover:border-accent/50" 
                  : "border-red-500/50 bg-red-900/10"
              } transition-colors`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-foreground capitalize">{p.name}</h3>
                  <span className="relative flex h-3 w-3">
                    {p.status === "Healthy" ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                      </>
                    ) : (
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    )}
                  </span>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/50">Status</span>
                    <span className={`font-semibold ${p.status === "Healthy" ? "text-accent" : "text-red-400"}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/50">Error Count</span>
                    <span className="text-foreground">{p.fails} / 3</span>
                  </div>
                </div>
              </div>

              <fetcher.Form method="post">
                <input type="hidden" name="providerName" value={p.name} />
                <button
                  type="submit"
                  disabled={p.status === "Healthy" && p.fails === 0}
                  className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all ${
                    p.status === "Healthy" && p.fails === 0
                      ? "bg-surface-soft text-foreground/30 cursor-not-allowed"
                      : "bg-surface-soft hover:bg-surface border border-surface-soft hover:border-accent text-foreground hover:text-accent shadow-sm"
                  }`}
                >
                  Reset Status
                </button>
              </fetcher.Form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
