'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from '@/i18n/navigation';
import {
  ChevronRight,
  Flame,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category } from '@csz/types';

// ── animation presets ───────────────────────────────────────
const springTransition = { type: 'spring' as const, stiffness: 400, damping: 30 };
const softSpring = { type: 'spring' as const, stiffness: 300, damping: 28, mass: 0.8 };

const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: softSpring,
  },
};

const expandVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  },
  expanded: {
    height: 'auto' as const,
    opacity: 1,
    transition: { duration: 0.3, ease: [0, 0, 0.2, 1] as [number, number, number, number] },
  },
};

const childStagger = {
  collapsed: {},
  expanded: {
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.05,
    },
  },
};

const childItem = {
  collapsed: { opacity: 0, x: -8, transition: { duration: 0.15 } },
  expanded: { opacity: 1, x: 0, transition: softSpring },
};

// ── grandchild reveal ───────────────────────────────────────
const grandchildStagger = {
  collapsed: {},
  expanded: {
    transition: {
      staggerChildren: 0.025,
      delayChildren: 0.03,
    },
  },
};

const grandchildItem = {
  collapsed: { opacity: 0, y: 4, transition: { duration: 0.1 } },
  expanded: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 500, damping: 30 } },
};

// ── components ──────────────────────────────────────────────

function GrandchildList({ children }: { children: Category[] }) {
  return (
    <motion.div
      variants={grandchildStagger}
      initial="collapsed"
      animate="expanded"
      className="ml-7 mt-0.5 mb-1 border-l border-amber-100 pl-2.5"
    >
      {children.map((gc) => (
        <motion.div key={gc._id} variants={grandchildItem}>
          <Link
            href={`/kategoriak/${gc.slug}`}
            className="group/gc flex items-center gap-1.5 py-1 px-1.5 text-[11px] text-gray-400 rounded hover:text-amber-500 hover:bg-amber-50/50 transition-colors"
          >
            <span className="w-1 h-1 rounded-full bg-gray-300 group-hover/gc:bg-amber-400 transition-colors flex-shrink-0" />
            {gc.name}
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}

function ChildList({ children: childCats }: { children: Category[] }) {
  const [expandedChild, setExpandedChild] = useState<string | null>(null);

  return (
    <motion.div
      variants={childStagger}
      initial="collapsed"
      animate="expanded"
      className="mt-0.5 mb-1"
    >
      {childCats.map((child) => {
        const hasGrandchildren = child.children && child.children.length > 0;
        const isExpanded = expandedChild === child._id;

        return (
          <motion.div key={child._id} variants={childItem}>
            <div className="flex items-center ml-3">
              <Link
                href={`/kategoriak/${child.slug}`}
                className="group/child flex-1 flex items-center gap-2 py-1.5 px-2 text-[12px] font-medium text-gray-600 rounded hover:text-amber-600 hover:bg-amber-50/60 transition-colors"
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-amber-300 flex-shrink-0"
                  whileHover={{ scale: 1.5 }}
                  transition={springTransition}
                />
                <span className="flex-1 truncate">{child.name}</span>
              </Link>
              {hasGrandchildren && (
                <motion.button
                  onClick={() => setExpandedChild(isExpanded ? null : child._id)}
                  className="p-1 mr-1 text-gray-300 hover:text-amber-500 transition-colors rounded hover:bg-amber-50/60"
                  whileTap={{ scale: 0.85 }}
                  aria-label={isExpanded ? 'Bezárás' : 'Megnyitás'}
                >
                  <motion.span
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={springTransition}
                    className="block"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </motion.span>
                </motion.button>
              )}
            </div>

            {/* Grandchildren */}
            <AnimatePresence>
              {hasGrandchildren && isExpanded && (
                <motion.div
                  key={`gc-${child._id}`}
                  variants={expandVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="overflow-hidden"
                >
                  <GrandchildList children={child.children!} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function CategoryRow({
  category,
  isExpanded,
  onToggle,
}: {
  category: Category;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const hasChildren = category.children && category.children.length > 0;

  return (
    <motion.div variants={itemVariants}>
      {/* Row */}
      <div className="relative flex items-center">
        {/* Animated indicator bar */}
        <motion.span
          className="absolute left-0 top-1/2 w-[3px] rounded-r-full bg-amber-400"
          initial={false}
          animate={{
            height: isExpanded ? 20 : 0,
            y: '-50%',
            opacity: isExpanded ? 1 : 0,
          }}
          transition={springTransition}
        />

        <Link
          href={`/kategoriak/${category.slug}`}
          className={cn(
            'group flex-1 flex items-center gap-2.5 py-2.5 pl-4 pr-1 text-[13px] font-medium rounded-r-lg transition-colors',
            isExpanded
              ? 'text-amber-600 bg-amber-50/70'
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50',
          )}
        >
          <motion.div
            className="flex-shrink-0"
            whileHover={{ rotate: 15, scale: 1.15 }}
            transition={springTransition}
          >
            <Flame
              className={cn(
                'h-4 w-4 transition-colors',
                isExpanded ? 'text-amber-500' : 'text-gray-400 group-hover:text-gray-500',
              )}
            />
          </motion.div>
          <span className="flex-1 truncate">{category.name}</span>
        </Link>

        {hasChildren && (
          <motion.button
            onClick={onToggle}
            className={cn(
              'flex items-center justify-center w-8 h-8 mr-1 rounded-lg transition-colors',
              isExpanded
                ? 'text-amber-500 hover:bg-amber-100/60'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
            )}
            whileTap={{ scale: 0.85 }}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Bezárás' : 'Megnyitás'}
          >
            <motion.span
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={springTransition}
              className="block"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </motion.span>
          </motion.button>
        )}
      </div>

      {/* Expandable children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            key={`children-${category._id}`}
            variants={expandVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="overflow-hidden"
          >
            <ChildList children={category.children!} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── main sidebar ────────────────────────────────────────────

export function HeroCategorySidebar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchTree() {
      try {
        const res = await fetch(`${window.location.origin}/api/categories?tree=1`);
        if (res.ok) {
          const data: { data: Category[] } = await res.json();
          setCategories(data.data || []);
        }
      } catch (e) {
        console.error('Failed to fetch category tree:', e);
      } finally {
        setLoaded(true);
      }
    }
    fetchTree();
  }, []);

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Kategóriák
        </h3>
      </div>

      {/* Scrollable category list */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1 scrollbar-hide">
        {!loaded ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-8 rounded-md bg-gray-100 animate-pulse"
                style={{ width: `${70 + Math.random() * 30}%` }}
              />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="show"
          >
            {categories.map((cat) => (
              <CategoryRow
                key={cat._id}
                category={cat}
                isExpanded={expandedId === cat._id}
                onToggle={() =>
                  setExpandedId((prev) => (prev === cat._id ? null : cat._id))
                }
              />
            ))}
          </motion.div>
        ) : (
          <p className="p-4 text-sm text-gray-400">Nincs kategória</p>
        )}
      </div>

      {/* Footer link */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40">
        <Link
          href="/kategoriak"
          className="group flex items-center justify-between text-xs font-medium text-amber-500 hover:text-amber-600 transition-colors"
        >
          Összes kategória
          <motion.span
            className="inline-block"
            whileHover={{ x: 3 }}
            transition={springTransition}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </motion.span>
        </Link>
      </div>
    </div>
  );
}
