import { useLoaderData, Link, useNavigate, useLocation } from "react-router";
import { sankaApi } from "../lib/sankaClient";

export async function loader({ params }: { params: { slug: string } }) {
  try {
    const data = await sankaApi.getBatchDetail(params.slug);
    return { batch: data };
  } catch (error) {
    console.error("Batch load error:", error);
    throw new Response("Not Found", { status: 404 });
  }
}

export default function BatchPage() {
  const { batch } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const location = useLocation();

  if (!batch) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <h1 className="text-2xl font-mono text-accent">DATA BATCH TIDAK DITEMUKAN</h1>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 animate-fade-in-up">
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row gap-6 justify-between sm:items-end mb-12">
        <div>
          <button 
            onClick={() => {
              if (location.state?.fromDetail && window.history?.state?.idx > 0) {
                navigate(-1);
              } else {
                navigate(`/anime/${batch.animeId}`, { replace: true });
              }
            }}
            className="inline-flex items-center gap-2 text-foreground/60 hover:text-accent font-mono text-xs font-bold tracking-widest uppercase transition-colors mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            KEMBALI KE {batch.title}
          </button>
          <div className="flex items-center gap-4">
            <div className="h-8 w-2 bg-accent"></div>
            <h1 className="text-3xl sm:text-4xl font-display text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(255,59,59,0.3)]">
              DOWNLOAD BATCH
            </h1>
          </div>
        </div>
        
        <div className="bg-surface border-2 border-surface-soft px-4 py-2 font-mono text-xs text-foreground/70 uppercase tracking-widest shadow-[2px_2px_0px_rgba(46,78,78,0.5)]">
          STATUS: {batch.status || 'READY'}
        </div>
      </div>
      
      {/* Anime Info Snippet */}
      <div className="bg-black border-2 border-surface-soft p-6 mb-12 flex flex-col sm:flex-row gap-6 relative shadow-[6px_6px_0px_rgba(46,78,78,0.5)]">
        <div className="absolute inset-0 crt-scanline pointer-events-none opacity-10"></div>
        
        {batch.poster && (
          <img 
            src={batch.poster} 
            alt={batch.title} 
            className="w-32 sm:w-48 object-cover border-2 border-surface-soft"
          />
        )}
        
        <div className="flex flex-col gap-4 justify-center relative z-10">
          <h2 className="text-2xl text-accent font-display uppercase tracking-widest">{batch.title}</h2>
          <div className="flex flex-wrap gap-2">
            <span className="font-mono text-[10px] uppercase bg-surface text-foreground/80 px-2 py-1 border border-surface-soft">
              {batch.episodes} EPISODES
            </span>
            {batch.score && (
              <span className="font-mono text-[10px] uppercase bg-surface text-foreground/80 px-2 py-1 border border-surface-soft text-yellow-400">
                ★ {batch.score}
              </span>
            )}
            {batch.duration && (
              <span className="font-mono text-[10px] uppercase bg-surface text-foreground/80 px-2 py-1 border border-surface-soft">
                {batch.duration}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Batch Links List */}
      <div className="flex flex-col gap-12 relative z-10">
        {batch.downloadUrl?.formats?.length > 0 ? (
          batch.downloadUrl.formats.map((format: any, idx: number) => (
            <div key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-6 w-1 bg-accent"></div>
                <h3 className="text-xl text-foreground font-display uppercase tracking-widest">{format.title}</h3>
                <div className="h-[1px] flex-grow bg-surface-soft ml-4"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {format.qualities?.map((quality: any, qIdx: number) => (
                  <div key={qIdx} className="bg-surface border-2 border-surface-soft p-5 shadow-[4px_4px_0px_rgba(46,78,78,0.3)] transition-all hover:border-accent hover:shadow-[6px_6px_0px_rgba(255,59,59,0.2)]">
                    <div className="flex justify-between items-start mb-6 pb-4 border-b border-surface-soft flex-col sm:flex-row gap-2">
                       <div>
                         <span className="font-mono font-bold text-white uppercase text-lg block">FULL BATCH {quality.title}</span>
                         <span className="font-mono text-[10px] text-foreground/50 uppercase tracking-widest mt-1 block">* Semua episode dalam 1 file</span>
                       </div>
                       <span className="font-mono text-xs text-accent border border-accent/30 bg-accent/10 px-3 py-1.5 shadow-[2px_2px_0px_rgba(255,59,59,0.3)]">{quality.size}</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {quality.urls?.map((url: any, uIdx: number) => (
                        <a 
                          key={uIdx} 
                          href={url.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="bg-background text-foreground hover:text-white border-2 border-surface-soft hover:border-accent hover:bg-accent px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.5)] hover:shadow-[4px_4px_0px_rgba(255,59,59,0.4)] hover:-translate-y-0.5"
                        >
                          {url.title}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-surface border-2 border-surface-soft border-dashed p-12 text-center text-foreground/50 font-mono uppercase tracking-widest">
            TIDAK ADA LINK DOWNLOAD YANG TERSEDIA SAAT INI.
          </div>
        )}
      </div>
    </div>
  );
}
