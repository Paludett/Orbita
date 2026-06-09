/* eslint-disable @typescript-eslint/no-require-imports */
const React = require("react");

const FILTERED = new Set([
  "initial", "animate", "exit", "transition", "variants",
  "whileHover", "whileTap", "whileFocus", "layout",
  "layoutId", "drag", "dragConstraints",
]);

const cache = new Map();

const motion = new Proxy(
  {},
  {
    get(_, tag) {
      if (!cache.has(tag)) {
        cache.set(tag, function MotionComponent({ children, ...props }) {
          const filtered = {};
          for (const [k, v] of Object.entries(props)) {
            if (!FILTERED.has(k)) filtered[k] = v;
          }
          return React.createElement(tag, filtered, children);
        });
      }
      return cache.get(tag);
    },
  }
);

function AnimatePresence({ children }) {
  return children;
}

module.exports = { motion, AnimatePresence };
