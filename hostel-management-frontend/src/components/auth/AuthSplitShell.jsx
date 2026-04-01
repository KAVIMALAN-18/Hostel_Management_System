import { Link } from 'react-router-dom';

function CheckIcon({ className = 'h-3.5 w-3.5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    );
}

/**
 * Split layout: branded gradient hero (left / top on mobile) + form column.
 */
export default function AuthSplitShell({
    children,
    heroEyebrow = 'Secure portal',
    heroTitle,
    heroSubtitle,
    bullets = [],
    wide = false,
    alternateHref,
    alternateLabel,
    alternateCta,
}) {
    return (
        <div className="flex min-h-screen flex-col bg-slate-100 dark:bg-slate-900 lg:flex-row transition-colors">
            <aside className="auth-hero relative flex shrink-0 flex-col px-6 py-10 text-white sm:px-10 sm:py-12 lg:sticky lg:top-0 lg:h-screen lg:min-h-screen lg:w-[min(46%,32rem)] lg:overflow-y-auto lg:py-16">
                <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col lg:mx-0">
                    <div className="mb-8 flex items-center gap-3 lg:mb-12">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
                            H
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold uppercase tracking-wide text-sky-200/90">
                                {heroEyebrow}
                            </p>
                            <p className="truncate text-lg font-bold tracking-tight">Hostel MS</p>
                        </div>
                    </div>

                    <h1 className="mb-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-[1.75rem] xl:text-4xl">
                        {heroTitle}
                    </h1>
                    {heroSubtitle && (
                        <p className="mb-8 max-w-md text-sm leading-relaxed text-sky-100/90 sm:text-base lg:mb-10">
                            {heroSubtitle}
                        </p>
                    )}

                    {bullets.length > 0 && (
                        <ul className="mb-10 space-y-3.5 lg:mb-12">
                            {bullets.map((text) => (
                                <li key={text} className="flex items-start gap-3 text-sm text-white/95">
                                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                                        <CheckIcon className="h-3.5 w-3.5 text-emerald-300" />
                                    </span>
                                    <span className="pt-0.5 leading-snug">{text}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {alternateHref && (
                        <p className="mt-auto text-sm text-sky-100/90 lg:mt-0">
                            {alternateLabel}{' '}
                            <Link
                                to={alternateHref}
                                className="font-semibold text-white underline decoration-sky-300/80 underline-offset-2 transition-colors hover:decoration-white"
                            >
                                {alternateCta}
                            </Link>
                        </p>
                    )}

                    <p className="mt-8 hidden text-xs text-sky-200/45 lg:block">
                        Hostel Management System · v2.1.0
                    </p>
                </div>
            </aside>

            <main className="flex flex-1 flex-col justify-center px-4 pb-12 pt-2 sm:px-8 lg:px-10 lg:py-12 xl:px-14">
                <div className={`auth-shell-card mx-auto w-full ${wide ? 'max-w-xl' : 'max-w-md'}`}>
                    {children}
                </div>
            </main>
        </div>
    );
}
