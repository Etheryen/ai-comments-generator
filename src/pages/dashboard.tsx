import { type LayoutProps } from "~/components/layout";
import { useProtectedPage } from "~/utils/useProtectedPage";

export function getStaticProps() {
  return {
    props: {
      layout: {
        title: "Dashboard",
        description: "Dashboard of the Ai Comments Generator app",
      } as LayoutProps,
    },
  };
}

export default function Dashboard() {
  const { isUnauthed } = useProtectedPage();
  if (isUnauthed) return null;

  return <div className="text-8xl text-white">dawdaw</div>;
}
