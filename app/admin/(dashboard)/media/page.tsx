import { AdminHeader } from "@/components/admin/admin-ui";
import { MediaLibrary } from "@/components/admin/media-library";

export default function AdminMediaPage() {
  return (
    <div>
      <AdminHeader
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Catalog" }, { label: "Media" }]}
        title="Media"
        description="Every image used on the site. Upload once, then pick it from any image field in the admin."
      />
      <MediaLibrary />
    </div>
  );
}
