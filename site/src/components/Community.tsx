import { getContributors, getRepoStats } from "@/lib/github";
import Reveal from "./Reveal";

export default async function Community() {
  const [stats, contributors] = await Promise.all([getRepoStats(), getContributors()]);

  return (
    <section className="mx-auto max-w-6xl px-5 py-28">
      <Reveal>
        <p className="text-xs tracking-[0.3em] text-amber uppercase">community</p>
        <h2
          className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Built in the open. Paid in stars.
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-5 md:grid-cols-[1fr_1.4fr]">
        <Reveal delay={0.1}>
          <div className="flex h-full flex-col justify-between rounded-xl border border-line bg-panel p-6">
            <div>
              <p className="text-6xl text-amber" style={{ fontFamily: "var(--font-display)" }}>
                {stats.stars.toLocaleString()}★
              </p>
              <p className="mt-2 text-xs text-dim">
                stars · {stats.forks.toLocaleString()} forks — live from the GitHub API, refreshed
                hourly. A star is the only payment a zero-dep MIT tool will ever ask for.
              </p>
            </div>
            <a
              href="https://github.com/JayPokale/RDXmin"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block rounded-lg border border-amber-deep bg-amber-deep/10 px-5 py-3 text-center text-sm text-amber transition-all hover:bg-amber-deep/20 hover:shadow-[0_0_32px_rgba(255,160,40,0.15)]"
            >
              star the repo →
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="h-full rounded-xl border border-line bg-panel p-6">
            <p className="text-[10px] tracking-widest text-dim uppercase">contributors — live</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {contributors.length > 0 ? (
                contributors.map((c) => (
                  <a
                    key={c.login}
                    href={c.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${c.login} · ${c.contributions} commits`}
                    className="group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${c.avatar_url}&s=96`}
                      alt={c.login}
                      loading="lazy"
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full border border-line grayscale transition-all group-hover:scale-110 group-hover:border-amber-deep group-hover:grayscale-0"
                    />
                  </a>
                ))
              ) : (
                <p className="text-xs text-dim">github.com/JayPokale/RDXmin/graphs/contributors</p>
              )}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-dim">
              Fix an issue, land a PR, or file a report good enough to fix itself — you show up
              here automatically. Co-engineered with Claude, Codex, and Antigravity; lineage
              (caveman, ponytail) credited in the prior-art table.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
