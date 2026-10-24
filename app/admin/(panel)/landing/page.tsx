import { ListScreen } from "@/components/admin/ListScreen";
/** Service and location landing pages: Pages with the landing flag, listed on their own like a separate content type. */
export default function Page() { return <ListScreen key="landing" collection="pages" kind="landing" />; }
