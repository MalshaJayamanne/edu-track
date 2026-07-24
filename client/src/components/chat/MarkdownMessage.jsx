import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownMessage({ text }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => (
          <ul className="list-disc pl-5 mb-2 space-y-1 marker:text-indigo-400">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 mb-2 space-y-1 marker:text-indigo-500 marker:font-semibold">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        h1: ({ children }) => (
          <h1 className="text-base font-bold text-slate-900 dark:text-white mt-3 mb-1.5 first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1.5 first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2 mb-1 first:mt-0">
            {children}
          </h3>
        ),
        pre: ({ children }) => (
          <pre className="bg-slate-900 text-slate-100 rounded-xl p-3 my-2 text-[13px] font-mono overflow-x-auto border border-slate-800">
            {children}
          </pre>
        ),
        code: ({ children, className }) => {
          const isBlock = Boolean(className);
          return isBlock ? (
            <code className="font-mono text-slate-100">{children}</code>
          ) : (
            <code className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md text-[13px] font-mono dark:bg-indigo-950/40 dark:text-indigo-300">
              {children}
            </code>
          );
        },
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-indigo-400 pl-3 my-2 text-slate-500 dark:text-slate-400 italic">
            {children}
          </blockquote>
        ),
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="my-3 border-slate-200 dark:border-slate-700" />,
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="min-w-full text-[13px] border-collapse">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-left font-semibold text-slate-700 dark:text-slate-200">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-slate-200 dark:border-slate-700 px-2 py-1 text-slate-700 dark:text-slate-300">
            {children}
          </td>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}