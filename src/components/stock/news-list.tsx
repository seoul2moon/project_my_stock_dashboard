import type { NewsItem } from "@/lib/types/stock";

export function NewsList({ news }: { news: NewsItem[] }) {
  if (news.length === 0) {
    return <p className="py-6 text-center text-sm text-neutral-500">뉴스가 없습니다.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-900">
      {news.map((item) => (
        <li key={item.id} className="py-3">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-medium hover:underline"
          >
            {item.title}
          </a>
          <p className="mt-1 text-xs text-neutral-500">
            {item.source} · {new Date(item.publishedAt).toLocaleString("ko-KR")}
          </p>
        </li>
      ))}
    </ul>
  );
}
