import { USING_MOCK_API } from '../api'

// Shown only while the simulated backend is switched on. It disappears by
// itself the moment you set VITE_USE_MOCK_API=false, because it reads the same
// variable the API layer does.
//
// Leave this in. A deployment that quietly pretends to have a server is the
// difference between a deliberate staging site and a submission hoping nobody
// checks.
export default function DemoNotice() {
  if (!USING_MOCK_API) return null

  return (
    <div
      role="status"
      className="max-w-5xl mx-auto mt-4 px-6"
    >
      <div className="bg-accent/30 border border-accent text-ink text-small rounded-lg px-4 py-3">
        <strong>Demo mode.</strong> This deployment exists to show the interface.
        It runs on a <strong>simulated backend</strong>: everything you add is
        stored in your own browser, is shared with nobody, and disappears when you
        clear your browsing data. There is no server and no database behind this
        page. The full version runs against an Express API and a PostgreSQL
        database, deployed separately. See the README.
      </div>
    </div>
  )
}
