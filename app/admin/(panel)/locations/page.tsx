import { requirePage } from "@/lib/auth";
import { LocationsAdmin } from "@/components/admin/LocationsAdmin";
export default async function Page() { await requirePage(); return <LocationsAdmin />; }
