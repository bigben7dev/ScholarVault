import { motion } from "framer-motion";
import { BookOpen, Users, Shield, Zap } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            About ScholarVault
          </h1>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
            ScholarVault is a global, open repository of academic resources
            built by students, for students. Our mission is to eliminate the
            chaos of scattered lecture notes, expired links, and locked‑down
            course materials by providing a single, searchable, permanent home
            for every document you need to succeed.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {[
            {
              icon: BookOpen,
              title: "Universal Access",
              desc: "No institutional silos. Any student, anywhere, can search and contribute — for free.",
            },
            {
              icon: Shield,
              title: "Secure & Permanent",
              desc: "All files are stored in a private, encrypted cloud with time‑limited signed URLs. No more dead links.",
            },
            {
              icon: Zap,
              title: "Lightning Search",
              desc: "Full‑text search across course codes, titles, and descriptions returns results in milliseconds.",
            },
            {
              icon: Users,
              title: "Community Driven",
              desc: "Maintained by students who upload and moderate content, keeping the vault clean and relevant.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <Icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-3" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
