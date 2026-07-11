export default function Footer() {
  return (
    <footer className="border-t border-line py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm">
            <span className="rounded bg-amber-deep/20 px-1.5 py-0.5 text-amber">[RDX]</span>
            <span className="ml-2 text-dim">min</span>
          </p>
          <p className="mt-3 max-w-sm text-xs leading-relaxed text-dim">
            Maximum signal. Minimum noise. A descendant of caveman and ponytail that added the
            axes they skipped — and published the benchmarks to prove it.
          </p>
          <p className="mt-3 text-xs text-dim/60">
            MIT · Jay Pokale · co-engineered with Claude, Codex &amp; Antigravity
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-dim">
          <a className="transition-colors hover:text-amber" href="https://github.com/JayPokale/RDXmin" target="_blank" rel="noopener noreferrer">
            github
          </a>
          <a className="transition-colors hover:text-amber" href="https://www.npmjs.com/package/rdxmin" target="_blank" rel="noopener noreferrer">
            npm
          </a>
          <a className="transition-colors hover:text-amber" href="https://github.com/JayPokale/RDXmin/tree/main/benchmarks" target="_blank" rel="noopener noreferrer">
            benchmarks
          </a>
          <a className="transition-colors hover:text-amber" href="https://github.com/JayPokale/RDXmin/blob/main/CHANGELOG.md" target="_blank" rel="noopener noreferrer">
            changelog
          </a>
          <a className="transition-colors hover:text-amber" href="https://github.com/JayPokale/RDXmin/issues" target="_blank" rel="noopener noreferrer">
            issues
          </a>
        </nav>
      </div>
    </footer>
  );
}
