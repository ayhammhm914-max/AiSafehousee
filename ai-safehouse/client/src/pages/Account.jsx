import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { usePageTransition } from '../context/PageTransitionContext'
import api from '../lib/api'

function formatDate(value) {
  if (!value) return 'No activity yet'
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatRelativeDate(value) {
  if (!value) return 'Waiting for first action'
  const now = Date.now()
  const target = new Date(value).getTime()
  const diffDays = Math.max(0, Math.floor((now - target) / 86400000))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day ago'
  return `${diffDays} days ago`
}

export default function Account() {
  const { logout, user } = useAuth()
  const startTransition = usePageTransition()
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/account')
      .then(({ data }) => {
        if (!active) return
        setAccount(data)
        setError('')
      })
      .catch(err => {
        if (!active) return
        setError(err.response?.data?.error || 'Could not load account data right now.')
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const initials = useMemo(() => {
    const source = account?.profile?.name || account?.profile?.username || user?.name || user?.username || 'AI'
    return source
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase()
  }, [account, user])

  if (loading) {
    return (
      <section className="page-arrival min-h-[calc(100vh-113px)] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-slate-950/42 p-8 backdrop-blur-2xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-56 rounded-full bg-white/10" />
            <div className="h-28 rounded-[1.5rem] bg-white/8" />
            <div className="grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, index) => <div key={index} className="h-32 rounded-[1.5rem] bg-white/8" />)}
            </div>
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"><div className="h-96 rounded-[1.5rem] bg-white/8" /><div className="h-96 rounded-[1.5rem] bg-white/8" /></div>
          </div>
        </div>
      </section>
    )
  }

  if (error || !account) {
    return (
      <section className="page-arrival min-h-[calc(100vh-113px)] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-rose-400/20 bg-slate-950/52 p-8 text-center backdrop-blur-2xl">
          <p className="text-sm uppercase tracking-[0.35em] text-rose-300">Account Offline</p>
          <h2 className="mt-4 text-3xl font-black text-white">The account capsule did not load.</h2>
          <p className="mt-4 text-slate-300">{error || 'Something interrupted the request. Try again after restarting the backend.'}</p>
        </div>
      </section>
    )
  }

  const { profile, summary, recent_activity: recentActivity, recommended_tools: recommendedTools } = account
  const stats = [
    { label: 'Reviews Written', value: summary.total_reviews, description: 'How many tools this account already rated inside the Safehouse.' },
    { label: 'Average Rating Given', value: `${summary.average_rating_given}/5`, description: 'The overall score this user tends to give when reviewing tools.' },
    { label: 'Categories Explored', value: summary.explored_categories, description: 'Distinct categories this account has already touched.' },
    { label: 'Catalog Reach', value: `${summary.total_tools_in_catalog} tools`, description: `Across ${summary.total_categories_in_catalog} categories currently in the project database.` },
  ]

  return (
    <section className="page-arrival min-h-[calc(100vh-113px)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/42 p-6 shadow-[0_25px_70px_rgba(2,6,23,0.58)] backdrop-blur-2xl sm:p-8">
          <div className="account-shell-grid grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="account-profile-panel rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(2,6,23,0.42),rgba(167,139,250,0.12))] p-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="account-avatar relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-slate-950/48 text-4xl font-black text-cyan-100 shadow-[0_0_45px_rgba(34,211,238,0.18)]">
                  {profile.avatar_url ? <img src={profile.avatar_url} alt={profile.name} className="h-full w-full object-cover" /> : <span className="relative z-10">{initials}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-[0.38em] text-cyan-300/80">Safehouse Identity Capsule</p>
                  <h1 className="mt-3 bg-gradient-to-r from-cyan-200 via-sky-300 to-violet-300 bg-clip-text text-3xl font-black text-transparent sm:text-5xl">{profile.name || profile.username}</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">This account page turns the live secure user session into a visible profile capsule: who the user is, what tools they explored, and what the Safehouse should surface next.</p>
                  <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-200">
                    <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">{profile.email}</span>
                    <span className="rounded-full border border-cyan-400/15 bg-cyan-400/8 px-4 py-2">Favorite category: {profile.favorite_category}</span>
                    <span className="rounded-full border border-violet-400/15 bg-violet-400/8 px-4 py-2">Favorite tool: {profile.favorite_tool}</span>
                    {profile.providers?.map(provider => <span key={provider} className="rounded-full border border-emerald-400/15 bg-emerald-400/8 px-4 py-2 text-emerald-100">{provider}</span>)}
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/52 p-6">
              <p className="text-[11px] uppercase tracking-[0.35em] text-sky-300/80">Account Snapshot</p>
              <div className="mt-5 space-y-4 text-sm text-slate-300">
                <div className="rounded-[1.25rem] border border-white/8 bg-white/4 px-4 py-4"><p className="text-slate-400">Member since</p><p className="mt-2 text-lg font-semibold text-white">{formatDate(profile.created_at)}</p></div>
                <div className="rounded-[1.25rem] border border-white/8 bg-white/4 px-4 py-4"><p className="text-slate-400">Last activity</p><p className="mt-2 text-lg font-semibold text-white">{formatRelativeDate(profile.last_activity_at)}</p></div>
                <div className="rounded-[1.25rem] border border-white/8 bg-white/4 px-4 py-4"><p className="text-slate-400">Active providers</p><p className="mt-2 text-lg font-semibold text-white">{profile.providers?.join(', ') || 'local'}</p></div>
                <button type="button" onClick={async () => { await logout(); startTransition('/', 'cyan') }} className="w-full rounded-[1.25rem] border border-rose-400/18 bg-rose-400/10 px-4 py-3 font-semibold text-rose-100 transition hover:border-rose-300/32 hover:bg-rose-400/16">Logout</button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{stats.map(stat => <div key={stat.label} className="rounded-[1.6rem] border border-white/10 bg-slate-950/48 p-5 backdrop-blur-xl"><p className="text-[11px] uppercase tracking-[0.34em] text-slate-400">{stat.label}</p><p className="mt-4 text-3xl font-black text-white">{stat.value}</p><p className="mt-3 text-sm leading-6 text-slate-300">{stat.description}</p></div>)}</div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/46 p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-4"><div><p className="text-[11px] uppercase tracking-[0.35em] text-cyan-300/80">Recent Activity</p><h2 className="mt-2 text-2xl font-black text-white">Safehouse timeline</h2></div><span className="rounded-full border border-cyan-400/15 bg-cyan-400/8 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-200">{recentActivity.length} entries</span></div>
            <div className="mt-6 space-y-4">
              {recentActivity.length === 0 ? <div className="rounded-[1.5rem] border border-white/8 bg-white/4 p-5 text-slate-300">No recent actions yet. As soon as this user reviews tools, the account timeline will start filling up.</div> : recentActivity.map(activity => (
                <div key={activity.review_id} className="rounded-[1.5rem] border border-white/8 bg-white/4 p-5 transition hover:border-cyan-300/18 hover:bg-white/[0.055]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs uppercase tracking-[0.28em] text-slate-400">{activity.category_name}</p><h3 className="mt-2 text-xl font-bold text-white">{activity.model_name}</h3></div><div className="rounded-full border border-violet-400/15 bg-violet-400/8 px-4 py-2 text-sm font-semibold text-violet-100">Rated {activity.rating}/5</div></div>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{activity.comment || 'No comment was added for this review.'}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.25em] text-slate-400"><span>{formatDate(activity.created_at)}</span>{activity.website_url ? <a href={activity.website_url} target="_blank" rel="noreferrer" className="rounded-full border border-cyan-400/18 bg-cyan-400/8 px-3 py-1.5 text-cyan-200 transition hover:border-cyan-300/35 hover:bg-cyan-400/12">Open Tool</a> : null}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/46 p-6 backdrop-blur-2xl">
              <p className="text-[11px] uppercase tracking-[0.35em] text-violet-300/80">Recommended Next</p>
              <h2 className="mt-2 text-2xl font-black text-white">Tools to explore</h2>
              <div className="mt-5 space-y-4">{recommendedTools.map(tool => <a key={tool.model_id} href={tool.website_url || '#'} target="_blank" rel="noreferrer" className="block rounded-[1.4rem] border border-white/8 bg-white/4 p-4 transition hover:-translate-y-1 hover:border-violet-300/20 hover:bg-white/[0.055]"><div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.28em] text-slate-400">{tool.category_name}</p><h3 className="mt-2 text-lg font-semibold text-white">{tool.name}</h3></div><span className="rounded-full border border-cyan-400/15 bg-cyan-400/8 px-3 py-1 text-sm font-semibold text-cyan-100">{tool.avg_rating || 0}</span></div><p className="mt-3 text-sm leading-6 text-slate-300">{tool.description}</p><p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-400">{tool.is_free ? 'Free or Freemium' : 'Paid'}</p></a>)}</div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/46 p-6 backdrop-blur-2xl"><p className="text-[11px] uppercase tracking-[0.35em] text-sky-300/80">Account Purpose</p><h2 className="mt-2 text-2xl font-black text-white">What this page does now</h2><ul className="mt-5 space-y-3 text-sm leading-7 text-slate-300"><li>It reads the secure session user record from MySQL instead of using temporary browser storage.</li><li>It summarizes what this user already did inside the Safehouse catalog.</li><li>It is now protected, so only signed-in users can open this page.</li></ul></div>
          </div>
        </div>
      </div>
    </section>
  )
}
