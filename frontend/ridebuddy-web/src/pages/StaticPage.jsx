import { motion } from "framer-motion";

function StaticPage({ title, lastUpdated, sections }) {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-brandDark dark:via-slate-900 dark:to-brandDark">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black mb-4">{title}</h1>
          {lastUpdated && (
            <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">
              Last Updated: {lastUpdated}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 md:p-12 rounded-[3rem] border border-slate-200/50 dark:border-white/10"
        >
          <div className="space-y-12">
            {sections.map((section, idx) => (
              <section key={idx}>
                {section.heading && (
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {idx + 1}
                    </span>
                    {section.heading}
                  </h2>
                )}
                <div className="text-slate-600 dark:text-slate-400 leading-relaxed space-y-4">
                  {section.content.map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default StaticPage;
